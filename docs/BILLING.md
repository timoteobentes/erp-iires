# Cobrança e Assinaturas — InfinitePay

> Decisão: **InfinitePay (CloudWalk)** como meio de pagamento.
> ⚠️ Esta decisão tem uma consequência arquitetural importante — leia a seção 1 antes de codar.

---

## 1. O que a InfinitePay é e o que ela não é

Verifiquei a documentação pública em 06/08/2026. Resumo:

### ✅ O que ela oferece

| Recurso | Situação |
|---|---|
| **Checkout Integrado** | ✅ Integração para desenvolvedores. Gera link de pagamento com checkout pronto. PIX ou crédito em até 12x. Reconhece Apple Pay / Google Pay. |
| **InfiniteTap** | ✅ Integração via deeplink — pagamento presencial por aproximação. Irrelevante para SaaS. |
| **PIX** | ✅ **Taxa zero** na venda |
| **Recebimento** | ✅ Na hora ou em 1 dia útil |
| **Custo fixo** | ✅ Zero. Sem mensalidade, sem aluguel. Só taxa por transação no cartão. |
| **Planos e Recorrências** | ⚠️ Existe — mas **só como produto de uso manual no app/web**, não como API |

### ❌ O que ela NÃO oferece

1. **Não existe API de assinaturas.** A página de desenvolvedores lista exatamente duas integrações: InfiniteTap e Checkout Integrado. Recorrência não está entre elas.
2. **Os pagamentos recorrentes não são automáticos.** A própria central de ajuda diz, literalmente: *"Os pagamentos não são automáticos. O cliente precisa acessar o link enviado e confirmar o pagamento."* Existe uma opção de débito automático no cartão, mas quem ativa é **o cliente**, no checkout, e é opt-in — você não controla nem garante.
3. **Não há cofre de cartão sob seu controle.** Você não tokeniza o cartão e não dispara a cobrança do próximo ciclo por conta própria.
4. **Sem proração, upgrade/downgrade ou dunning nativos.**
5. **Documentação de webhook não é pública.** A página de desenvolvedores manda falar com `parcerias@cloudwalk.io`.

### O que isso significa na prática

> **Você não vai integrar um gateway de assinatura. Você vai construir o motor de assinatura e usar a InfinitePay como trilho de pagamento.**

Isso não é necessariamente ruim — o modelo `Subscription` já ia viver no seu banco de qualquer forma. Mas muda o esforço da Fase 3: de "integrar SDK" para "escrever o ciclo de cobrança". Some **1 a 2 semanas** ao plano.

### O trade-off honesto

| | InfinitePay | Asaas / Iugu / Stripe |
|---|---|---|
| Custo fixo mensal | R$ 0 | R$ 0–99 + taxa |
| Taxa PIX | **Zero** | ~R$ 1,99 ou 0,99% por PIX |
| API de assinatura | ❌ você constrói | ✅ pronta |
| Renovação automática no cartão | ⚠️ depende do opt-in do cliente | ✅ garantida |
| Proração / dunning | ❌ você constrói | ✅ pronta |
| Churn involuntário | 🔴 **alto** (cliente precisa clicar todo mês) | 🟢 baixo |

Num plano de R$ 49,90, a taxa zero no PIX é dinheiro real: um Asaas levaria ~4% da sua receita bruta nesse plano. O custo é o churn involuntário — cliente que esquece de pagar e é suspenso não porque decidiu sair, mas porque não clicou no link.

### 📋 Antes de fechar — perguntar para `parcerias@cloudwalk.io`

- [ ] O Checkout Integrado tem **webhook de confirmação de pagamento**? Qual o payload, e há retry/assinatura?
- [ ] Existe API para **criar link de cobrança programaticamente**, ou só via app?
- [ ] Há endpoint de **consulta de status** de uma cobrança (para reconciliação/fallback do webhook)?
- [ ] A recorrência com débito automático no cartão pode ser **iniciada via API**?
- [ ] Qual a taxa efetiva para o seu volume, no crédito à vista e parcelado?

**Se não houver webhook, isso é bloqueante.** Sem confirmação automática de pagamento você não consegue liberar/suspender conta de forma confiável, e cai em conciliação manual — inviável a partir de ~30 clientes.

---

## 2. Arquitetura recomendada

### Princípio: abstrair o gateway desde o dia 1

O motor de cobrança é seu. A InfinitePay é um adaptador plugável. Isso custa umas 4 horas agora e evita uma reescrita se você precisar adicionar outro trilho depois (por exemplo, cartão recorrente de verdade para o plano Institucional).

```ts
// backend/src/core/billing/gateway.interface.ts
export interface PaymentGateway {
  readonly name: string;

  /** Cria uma cobrança avulsa e devolve a URL de checkout */
  createCharge(input: {
    organizationId: string;
    invoiceId: string;
    amount: Prisma.Decimal;
    description: string;
    dueDate: Date;
    methods: ('PIX' | 'CARD')[];
    payer: { name: string; document: string; email: string };
  }): Promise<{ externalId: string; checkoutUrl: string; pixCode?: string }>;

  /** Consulta status — fallback quando o webhook falha */
  getCharge(externalId: string): Promise<{ status: 'PENDING' | 'PAID' | 'CANCELED'; paidAt?: Date }>;

  /** Valida assinatura e normaliza o evento */
  parseWebhook(req: Request): Promise<NormalizedEvent | null>;
}
```

```
core/billing/
├── gateway.interface.ts
├── gateways/
│   └── infinitepay.gateway.ts     ← único por ora
├── billing-engine.service.ts       ← ⭐ o motor de recorrência
├── entitlements.service.ts
└── dunning.service.ts
```

### O motor de recorrência (o que você precisa escrever)

Um job diário. Nada sofisticado — mas precisa ser idempotente e observável.

```
Diariamente, às 06:00 (America/Manaus):

1. GERAR
   Para toda Subscription com status ACTIVE|TRIALING e
   currentPeriodEnd em D+5:
     → cria Invoice (PENDING, dueDate = currentPeriodEnd)
     → gateway.createCharge() → salva checkoutUrl e externalId
     → e-mail: "Sua renovação vence em 5 dias" + link

2. LEMBRAR
   Invoice PENDING com dueDate em D+2, D e D-3:
     → e-mail (e WhatsApp, se houver) com o link

3. COBRAR (dunning)
   Invoice vencida:
     D+1   → e-mail de aviso
     D+3   → banner de aviso dentro do sistema
     D+7   → status PAST_DUE, banner bloqueante
     D+10  → SUSPENDED: acesso somente leitura + exportação liberada
     D+30  → Organization.status = SUSPENDED, sistema bloqueado
     D+90  → exclusão definitiva (com 3 avisos prévios documentados)

4. RECONCILIAR
   Toda Invoice PENDING com mais de 1h e sem evento de webhook:
     → gateway.getCharge() e sincroniza
     (rede de segurança obrigatória enquanto o webhook não for confirmado)
```

> ⚠️ **Idempotência é obrigatória.** O job pode rodar duas vezes (deploy, retry, falha parcial). Use `@@unique([subscriptionId, periodStart])` em `Invoice` para que a segunda execução não gere cobrança duplicada. Cobrar o cliente duas vezes é o erro mais caro que esse sistema pode cometer.

### Webhook

```
POST /api/v1/webhooks/infinitepay
```
- Rota **fora** do `authenticate` e do `tenantContext` (usa `prismaGlobal`)
- Validar assinatura/HMAC. Se a InfinitePay não fornecer, restringir por IP e usar um token secreto na URL
- Gravar em `WebhookEvent` **antes** de processar; `@@unique([gateway, externalId])` garante idempotência
- Responder `200` rápido; processar em seguida
- Nunca confiar no valor que vem no payload — conferir contra a `Invoice` local

---

## 3. Ajustes de UX que essa escolha exige

Como a renovação **não** é automática, o produto precisa compensar:

1. **PIX como método padrão e recomendado.** Taxa zero para você, e é como esse público paga. Mostrar QR Code direto no sistema.
2. **Anual com destaque forte.** Com 2 meses grátis, o cliente clica **uma vez por ano** em vez de doze. Isso resolve o churn involuntário e melhora o caixa. Nessa arquitetura, empurrar o plano anual não é só upsell — é redução de risco operacional.
3. **Aviso dentro do sistema, não só por e-mail.** E-mail de instituto costuma ser caixa compartilhada e mal monitorada. Banner no topo a partir de D-5.
4. **Botão "Pagar agora" sempre visível** no menu de conta quando houver fatura em aberto.
5. **Nunca bloquear sem exportação disponível.** Mesmo em D+30, o botão de exportar dados continua funcionando. É questão de reputação e de LGPD.
6. **Boleto** não está no Checkout Integrado (só PIX e cartão). Institutos maiores e órgãos públicos às vezes **exigem** boleto ou empenho — para o plano Rede, previsto pagamento via fatura manual/transferência com baixa administrativa. Deixe a `Invoice` aceitar baixa manual por um admin da plataforma.

---

## 4. Modelo de dados — ajustes

Alterações em relação ao `schema-draft.prisma` original:

```prisma
model Subscription {
  // ...
  gateway           String  @default("infinitepay")
  gatewayCustomerId String?

  // não existe "assinatura" no gateway — o ciclo é nosso
  nextChargeAt      DateTime?
  lastChargedAt     DateTime?
  autoRenewEnabled  Boolean @default(false) // opt-in do cliente no cartão
}

model Invoice {
  // ...
  periodStart  DateTime
  periodEnd    DateTime
  externalId   String? @unique  // id da cobrança na InfinitePay
  checkoutUrl  String?
  pixCode      String? @db.Text
  method       String?          // PIX | CARD | MANUAL
  paidManually Boolean @default(false)
  paidById     String?          // admin da plataforma que deu baixa manual
  reminderSentAt DateTime[]

  @@unique([subscriptionId, periodStart])  // 🔴 antiduplicidade
}
```

---

## 5. Impacto no cronograma

A **Fase 3** do `PLANO_DE_ACAO.md` passa de 2 para **3–4 semanas**:

- [ ] Adaptador `InfinitePayGateway` + validação de webhook
- [ ] Motor de recorrência (job diário, idempotente)
- [ ] Job de reconciliação (fallback do webhook)
- [ ] Máquina de estados da assinatura + dunning
- [ ] Portal do assinante: faturas, PIX/QR Code, histórico, cancelamento
- [ ] Banners de aviso e bloqueio no app
- [ ] Baixa manual de fatura no console da plataforma
- [ ] Testes: renovação, atraso, upgrade com proração, webhook duplicado, cobrança duplicada

**Recomendação de sequência:** faça a Fase 3 **depois** do beta com 2–3 institutos. Nos primeiros meses, com menos de 10 clientes, cobrança manual por PIX funciona perfeitamente e você aprende como esse público realmente paga antes de automatizar em cima de suposições.
