# Planos e Preços

> Proposta para discussão. Preços em BRL, cobrança recorrente, PIX / boleto / cartão.

---

## 1. Lógica por trás da escada de preços

Você fixou o piso em **R$ 49,90**. Isso define o resto:

- Uma escada saudável de SaaS B2B no Brasil sobe de **2,5× a 3×** por degrau. Saltos maiores fazem o cliente travar no plano de baixo e ficar frustrado; menores não geram receita suficiente para justificar o suporte.
- R$ 49,90 → R$ 149,90 → R$ 399,90 → sob consulta.
- O plano de entrada **não é para dar lucro**. Ele existe para eliminar a objeção de preço, colocar o instituto para dentro e criar pressão natural de upgrade (usuários e projetos são os limites que apertam primeiro).

### Três eixos de limite — e só três

Mais de três eixos deixa a página de preços incompreensível.

| Eixo | Por quê | Como é medido |
|---|---|---|
| **Usuários** | Cresce junto com a organização; é o gatilho de upgrade mais natural | Memberships com status `ACTIVE` |
| **Recursos (features)** | Diferencia "organizar" de "prestar contas" | Flags de entitlement em banco |
| **Armazenamento** | Protege sua margem (é o custo variável real) | Soma de `Attachment.sizeBytes` |

Limites secundários (projetos ativos, cadastros de pessoas) existem só no Essencial, como proteção contra abuso.

❌ **Não medir por transação lançada.** Punir o cliente por usar o sistema é o jeito mais rápido de fazer ele parar de usar — e de perder o dado que sustenta a renovação.

---

## 2. Os planos

### 🌱 Essencial — R$ 49,90/mês (R$ 499/ano)
*Para institutos que ainda vivem em planilhas.*

- **3 usuários** · **5 projetos ativos** · **500 cadastros** · **2 GB**
- Cadastro institucional completo
- Grupos de acesso pré-definidos (Administrador, Diretor, Financeiro, Comercial, Projetos, Leitor)
- Pessoas & Rede: colaboradores, voluntários, doadores, parceiros
- Projetos com equipe e cronograma
- Financeiro: contas a pagar e a receber, categorias, fluxo de caixa
- Dashboard essencial
- Relatórios padrão em PDF e Excel
- Suporte por e-mail (48h úteis)

### 📊 Gestão — R$ 149,90/mês (R$ 1.499/ano) ⭐ *mais popular*
*Para quem presta contas a financiadores.*

Tudo do Essencial, mais:
- **15 usuários** · **50 projetos** · cadastros ilimitados · **20 GB**
- **Grupos de acesso personalizáveis** (permissões granulares)
- **Plano de contas** do terceiro setor + **centros de custo**
- **Financeiro por projeto** e prestação de contas por convênio/edital
- Orçamento previsto × realizado
- Parcelamento e lançamentos recorrentes
- Anexos e comprovantes vinculados
- Geração de documentos (termo de voluntariado, recibo de doação)
- Relatórios avançados + exportação agendada por e-mail
- Log de auditoria (90 dias)
- Suporte prioritário (24h úteis)

### 🏛️ Institucional — R$ 399,90/mês (R$ 3.999/ano)
*Para institutos com portfólio, núcleos ou programas.*

Tudo do Gestão, mais:
- **50 usuários** · tudo ilimitado · **100 GB**
- **Contextos institucionais / portfólio** (programas, empresas apoiadas, editais, convênios)
- Múltiplas unidades e visão consolidada
- **Portal público de transparência** (prestação de contas com domínio próprio)
- **White-label**: sua logo e sua cor no sistema
- **API + webhooks**
- **SSO** (Google Workspace / Microsoft) e 2FA obrigatório
- Importação assistida de dados
- Auditoria completa com retenção de 2 anos
- Suporte com SLA e gerente de conta

### 🌐 Rede — sob consulta
*Para federações, redes de institutos e aceleradoras.*

- **Múltiplas organizações** sob uma gestão central, com consolidação
- Usuários ilimitados
- Onboarding, migração de dados e treinamento
- SLA contratual, DPA customizado, backup dedicado
- Integrações e customizações sob demanda
- Ambiente ou região dedicada, se necessário

---

## 3. Matriz de recursos

| Recurso | `feature key` | Essencial | Gestão | Institucional | Rede |
|---|---|:---:|:---:|:---:|:---:|
| Usuários | `limit:users` | 3 | 15 | 50 | ∞ |
| Projetos ativos | `limit:projects` | 5 | 50 | ∞ | ∞ |
| Cadastros de pessoas | `limit:persons` | 500 | ∞ | ∞ | ∞ |
| Armazenamento | `limit:storage` | 2 GB | 20 GB | 100 GB | — |
| Pessoas & Rede | `people.base` | ✅ | ✅ | ✅ | ✅ |
| Projetos | `projects.base` | ✅ | ✅ | ✅ | ✅ |
| Contas a pagar/receber | `finance.base` | ✅ | ✅ | ✅ | ✅ |
| Relatórios padrão | `reports.base` | ✅ | ✅ | ✅ | ✅ |
| Grupos personalizados | `roles.custom` | ❌ | ✅ | ✅ | ✅ |
| Plano de contas | `finance.account_plans` | ❌ | ✅ | ✅ | ✅ |
| Centros de custo | `finance.cost_centers` | ❌ | ✅ | ✅ | ✅ |
| Financeiro por projeto | `finance.by_project` | ❌ | ✅ | ✅ | ✅ |
| Orçamento previsto × realizado | `finance.budget` | ❌ | ✅ | ✅ | ✅ |
| Recorrência e parcelamento | `finance.recurring` | ❌ | ✅ | ✅ | ✅ |
| Anexos e comprovantes | `attachments` | ❌ | ✅ | ✅ | ✅ |
| Geração de documentos | `documents.generate` | ❌ | ✅ | ✅ | ✅ |
| Relatórios avançados | `reports.advanced` | ❌ | ✅ | ✅ | ✅ |
| Auditoria | `audit.log` | ❌ | 90 dias | 2 anos | 5 anos |
| Contextos / portfólio | `contexts` | ❌ | ❌ | ✅ | ✅ |
| Múltiplas unidades | `multi_unit` | ❌ | ❌ | ✅ | ✅ |
| Portal de transparência | `public_portal` | ❌ | ❌ | ✅ | ✅ |
| White-label | `branding.custom` | ❌ | ❌ | ✅ | ✅ |
| API + webhooks | `api.access` | ❌ | ❌ | ✅ | ✅ |
| SSO / 2FA obrigatório | `auth.sso` | ❌ | ❌ | ✅ | ✅ |
| Importação assistida | `data.import` | ❌ | ❌ | ✅ | ✅ |
| Multi-organização | `multi_org` | ❌ | ❌ | ❌ | ✅ |

---

## 4. Add-ons

| Add-on | Preço | Observação |
|---|---|---|
| Usuário adicional | R$ 14,90/mês | Disponível a partir do Gestão |
| +10 GB de armazenamento | R$ 19,90/mês | Todos os planos |
| Migração de dados assistida | R$ 890 (única) | Planilhas ou sistema legado |
| Treinamento da equipe (2h remoto) | R$ 490 (única) | |
| Portal de transparência avulso | R$ 89,90/mês | Só para o plano Gestão |

---

## 5. Regras comerciais

- **Trial de 14 dias, sem cartão de crédito.** O público é avesso a cadastrar cartão para "experimentar". Pedir cartão no trial derruba a conversão de topo drasticamente nesse segmento.
- **Anual = 2 meses grátis** (~17% de desconto). Melhora muito o caixa e é o argumento certo para quem trabalha com orçamento aprovado anualmente.
- **Programa Impacto:** 30% de desconto permanente para organizações com CEBAS, OSCIP ou Utilidade Pública comprovada. É diferenciação real, gera boa vontade no setor e você valida o CNPJ de qualquer forma no cadastro.
- **Upgrade** é imediato com proração. **Downgrade** só na virada do ciclo, com aviso do que será perdido (ex.: "você tem 12 usuários, o plano Gestão permite 3 — escolha quais manter").
- **Inadimplência:** D+3 aviso · D+7 e-mail de bloqueio iminente · D+10 acesso restrito a leitura e exportação · D+30 suspensão · D+90 exclusão definitiva. **Nunca apagar dado sem exportação disponível** — é o maior medo do cliente e vira reputação ruim rápido.
- **Cancelamento por autoatendimento**, com export completo dos dados. Exigir ligação para cancelar destrói confiança nesse setor.

---

## 6. Como isso vira código

Nada de `if (plan === 'gestao')` espalhado. Os planos são **dados**, semeados em `prisma/seeds/plans.ts`:

```ts
{
  code: 'gestao',
  name: 'Gestão',
  priceMonthly: 149.90,
  priceYearly: 1499.00,
  maxUsers: 15,
  maxActiveProjects: 50,
  maxPersons: null,
  storageMb: 20_480,
  features: [
    'people.base', 'projects.base', 'finance.base', 'reports.base',
    'roles.custom', 'finance.account_plans', 'finance.cost_centers',
    'finance.by_project', 'finance.budget', 'finance.recurring',
    'attachments', 'documents.generate', 'reports.advanced', 'audit.log',
  ],
}
```

E são consumidos em três pontos:

1. **Backend, no acesso:** `requireEntitlement('finance.cost_centers')` → `402`
2. **Backend, na criação:** `checkLimit(orgId, 'users')` → `409 LIMIT_EXCEEDED`
3. **Frontend, na UI:** `<EntitlementGate feature="contexts" fallback={<UpsellCard />}>` (de `@sigetes/ui`)

> A UI **mostra** o recurso bloqueado com um cadeado em vez de escondê-lo. Recurso invisível não gera upgrade; recurso visível e bloqueado, sim.

---

## 7. O que ainda precisa de decisão

- **Preço de tabela vs. realidade:** você conhece o orçamento de TI de institutos como o IIRes melhor do que qualquer benchmark. Se R$ 399,90 soar alto para o público local, o degrau 3 pode cair para R$ 299,90.
- **Concorrentes** identificados no Brasil (Economato, OrgSystem, Ongsys, Any3, HYB) trabalham quase todos com preço sob consulta e venda consultiva — o que é uma oportunidade: **preço público e autoatendimento é o seu diferencial de posicionamento**.
- **IIRes como cliente zero:** entra em qual plano? Cortesia vitalícia como "cliente fundador" é uma boa história de venda, mas some da sua receita recorrente e distorce as métricas iniciais.
