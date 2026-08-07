# Plano de Ação — ERP Institucional como Produto SaaS

> Documento mestre. Versão 1.0 — base para discussão antes de escrever a primeira linha de código.
> Produto: **SIGETES — Sistema de Gestão do Terceiro Setor**

---

## 0. Diagnóstico do projeto atual (`erp-gemini`)

O que já existe e **deve ser aproveitado** (conceito, não necessariamente o código):

| Área | Situação | Veredito |
|---|---|---|
| Modelagem de domínio | Pessoas (equipe, voluntários, doadores, parceiros), Projetos, Financeiro (plano de contas, centro de custos, transações com parcelamento/recorrência), Contextos Institucionais, Notificações, Auditoria | **Excelente.** É o coração do produto. Migra quase inteiro. |
| Backend | Express 5 + Prisma 7 + Zod, modular por domínio, middlewares de auth/audit/validate | **Boa base.** Estrutura de pastas se mantém, precisa de camada de tenant. |
| Frontend | React 19 + Vite + Ant Design + Tailwind, módulos bem separados | **Mantido.** Ant Design v6 continua sendo a base do ERP — ver `ARQUITETURA.md`, seção 7. |
| Paleta e identidade | Verde `#389334` + Azul `#0047AF` + Dark `#313450` + Amber `#FFC107` | **Mantida**, virando design tokens. |
| Autenticação | JWT + refresh token, reset de senha, grupos por string | Refazer: precisa de RBAC real e contexto de organização. |
| `PORTFOLIO_ECOSSISTEMA.md` | Documenta 3 abordagens; recomendava a 2 | A decisão comercial escolheu de fato a **Abordagem 3 (multi-tenant)**. |

### Problemas estruturais que precisam ser resolvidos na reescrita

1. 🔴 **`Float` para dinheiro.** `Transaction.amount`, `Project.budget`, `User.salary` são `Float`. Isso gera erro de centavos em qualquer soma. → `Decimal @db.Decimal(14,2)`.
2. 🔴 **Anexos em base64 dentro do Postgres.** `Transaction.attachments` e `User.documents` são `Json` com o arquivo embutido. Inviável em SaaS (custo, backup, performance). → Supabase Storage com URLs assinadas.
3. 🔴 **Uniques globais.** `cpf @unique`, `Donor.document @unique`, `Partner.cnpj @unique`, `AccountPlan.code @unique`. Num sistema multi-tenant, o instituto A não pode impedir o instituto B de cadastrar o mesmo CPF. → `@@unique([organizationId, cpf])`.
4. 🟠 **`User` mistura login com ficha de RH.** Salário, banco, PIS, título de eleitor, jornada e documentos estão na tabela de autenticação. → separar `User` (identidade global) de `Member` (vínculo + RH, escopado por organização).
5. 🟠 **Duplicação de pessoas.** A mesma pessoa física pode ser voluntária e doadora e está em duas tabelas com CPF repetido. → entidade `Person` unificada com papéis.
6. 🟠 **Permissão por string solta.** `usePermission` compara com `['Administrador', 'Tecnologia']` hardcoded. Não dá para o cliente criar os próprios grupos. → RBAC com permissões granulares em banco.
7. 🟡 Status como `String` em vez de `enum`; sem soft delete; sem paginação server-side.

---

## 1. Nome do produto

### ✅ Decidido pela diretoria: **SIGETES**

**SIGETES — Sistema de Gestão do Terceiro Setor**

- Tagline sugerida: *"A gestão que sustenta a sua missão."*
- Domínios: `sigetes.com.br` (site), `app.sigetes.com.br` (ERP), `api.sigetes.com.br`
- Namespaces de código: `@sigetes/shared`, `@sigetes/ui`, `sigetes-api`, `sigetes-web`
- Grafia: **SIGETES** em caixa alta em textos e interface (é sigla); minúsculo em pacotes, domínios e nomes de arquivo
- Gênero: **o** SIGETES (o sistema) — "no SIGETES", "do SIGETES"

### Implicações a considerar

| Ponto | Efeito |
|---|---|
| ✅ **SEO** | O nome contém as palavras-chave que o público busca ("gestão", "terceiro setor"). O nome por extenso vira meta title e H1 sem esforço. |
| ✅ **Credibilidade institucional** | Sigla no padrão de sistemas públicos e institucionais — familiar para quem lida com convênios, editais e prestação de contas. |
| ✅ **Termo único** | "SIGETES" como string tem concorrência praticamente nula em busca. |
| ⚠️ **Escopo do nome** | "Terceiro Setor" fecha o posicionamento. Empresas do portfólio, startups incubadas e cooperativas ficam de fora **pelo nome**, mesmo cabendo no produto. Se a intenção comercial inclui esse público, vale prever uma assinatura alternativa (ex.: *"SIGETES — Gestão para organizações de impacto"*). |
| ⚠️ **Memorização** | Siglas custam mais para fixar que palavras. Exibir sempre o nome por extenso junto da sigla nos primeiros contatos (landing, e-mails, rodapé). |

### Checklist de validação (fazer antes da Fase 0)
- [ ] `registro.br` — disponibilidade de `sigetes.com.br`
- [ ] INPI — busca nas classes **NCL 9** (software) e **NCL 42** (SaaS)
- [ ] Google — verificar se já existe sistema público ou privado usando a sigla
- [ ] Handles: Instagram, LinkedIn, GitHub org

> ⚠️ Nome só entra no código depois de validado. Trocar um nome espalhado em 300 arquivos é caro — e já trocamos uma vez.

---

## 2. Paleta e design tokens

> ⚠️ **Superado.** Esta seção previa manter a paleta do `erp-gemini`
> (verde `#389334` / azul `#0047AF`), escrita antes de existir uma logo
> oficial do SIGETES. Com a logo pronta, a diretoria decidiu extrair a
> paleta real dela em vez de manter a do projeto antigo. Especificação
> completa — rampas de cor, mapeamento antd/Tailwind, tipografia — está em
> **`docs/DESIGN_SYSTEM.md`**. Este parágrafo fica só como registro
> histórico da decisão.

Resumo da paleta atual (ver `DESIGN_SYSTEM.md` §1-2 para a extração e as
rampas completas de 50 a 900): `primary` `#009082` (verde-azulado, das
letras "TE"), `secondary` `#054EC0` (azul, da letra "S"), `success`
`#1D9D19` (verde, do ícone-mosaico), `dark` `#001F3D` (navy, das letras
"SIGE" — usado como neutro geral e fundo da sidebar). `warning` `#FFC107` e
`danger` `#DC2626` são funcionais, não vêm da logo.

Fontes: **Inter** (texto) e **Roboto Mono** (números e valores). A cursiva
**Caveat** sai — não cabe num produto institucional.

---

## 3. Planos de assinatura

Detalhamento completo em **`PLANOS_E_PRECOS.md`**. Resumo:

| | Essencial | Gestão | Institucional | Rede |
|---|---|---|---|---|
| Preço/mês | **R$ 49,90** | R$ 149,90 | R$ 399,90 | sob consulta |
| Usuários | 3 | 15 | 50 | ilimitado |
| Projetos ativos | 5 | 50 | ilimitado | ilimitado |
| Armazenamento | 2 GB | 20 GB | 100 GB | negociado |
| Grupos de acesso | fixos | personalizáveis | personalizáveis | + SSO |
| Destaque | Cadastros + financeiro básico | Prestação de contas por projeto | Portfólio, API, white-label | Multi-organização |

Princípio técnico: **nenhum limite hardcoded**. Planos e recursos vivem em banco (`Plan` + `PlanFeature`), consultados por middleware de *entitlement*.

---

## 4. Landing page

Detalhamento completo em **`LANDING_PAGE.md`**. Decisão de arquitetura: começar como rotas públicas dentro do mesmo app Vite, com pré-renderização (`vite-react-ssg`) para `/`, `/planos`, `/recursos`. SPA pura mata SEO — e SEO é o canal de aquisição mais barato para esse público.

---

## 5. Fases de execução

Estimativa para **1 dev focado usando Claude Code**. Cada fase termina com algo funcionando ponta a ponta.

### Fase 0 — Fundação (semana 1)
- [ ] Validar nome (INPI/registro.br) + registrar domínios
- [ ] Monorepo com npm workspaces + Turborepo (`backend/`, `frontend/`, `packages/shared`, `packages/config`)
- [ ] `CLAUDE.md` na raiz + por app (ver arquivo anexo)
- [ ] Supabase: projeto, banco, Storage buckets, `.env.example`
- [ ] Backend: Express + Prisma + Zod + errorHandler + healthcheck
- [ ] Frontend: Vite react-ts + **Ant Design v6** (`ConfigProvider` com a paleta) + layout base responsivo
- [ ] Tailwind configurado **apenas** para as rotas de marketing (`pages/marketing/*`)
- [ ] ADR-002: Ant Design no ERP, Tailwind na landing — fronteira por rota
- [ ] CI (GitHub Actions): lint + typecheck + build + testes
- [ ] ADR-001: multi-tenancy por coluna `organizationId`

**Entregável:** `GET /health` respondendo e uma tela em branco com a marca aplicada.

### Fase 1 — Núcleo da plataforma (semanas 2–4) 🔴 crítico
- [ ] Modelos: `User`, `Organization`, `Membership`, `Role`, `Permission`, `Invite`, `Plan`, `PlanFeature`, `Subscription`
- [ ] Contexto de tenant: `AsyncLocalStorage` + extensão do Prisma Client que injeta `organizationId`
- [ ] Auth: signup (cria User + Organization + Membership OWNER + Subscription trial), login, refresh rotativo, logout, esqueci/redefinir senha
- [ ] Wizard de cadastro institucional (CNPJ + ViaCEP + natureza jurídica + responsável legal)
- [ ] RBAC: seed de papéis (Administrador, Diretor, Financeiro, Comercial, Projetos, Leitor) + papéis customizados
- [ ] Convite de usuários por e-mail (Resend)
- [ ] Seletor de organização (usuário pode pertencer a várias)
- [ ] Middleware `requirePermission` + `requireEntitlement` + `checkLimit`
- [ ] Telas: login, cadastro, onboarding, configurações da organização, usuários e grupos de acesso, meu perfil

**Entregável:** dois institutos independentes conseguem se cadastrar, convidar equipe e configurar permissões, sem enxergar dados um do outro.

> 🔒 **Teste de aceite obrigatório da fase:** suíte automatizada que, para cada endpoint, tenta acessar recurso de outro tenant e espera `404`. Isso não é opcional.

### Fase 2 — Módulos de domínio (semanas 5–8)
Migrar em fatias verticais (modelo → serviço → API → tela), sempre tenant-aware:
- [ ] **Pessoas & Rede** — `Person` unificada (PF/PJ) com papéis: colaborador, voluntário, doador, parceiro
- [ ] **Projetos** — com equipe, orçamento, progresso, vínculo com contexto
- [ ] **Financeiro** — plano de contas (seed do terceiro setor), centros de custo, contas a pagar/receber, parcelamento, recorrência, anexos via Storage
- [ ] **Relatórios** — dashboard, DRE simplificada, fluxo de caixa, prestação de contas por projeto, export PDF/Excel
- [ ] **Contextos institucionais** — plano Institucional
- [ ] Auditoria + notificações

**Entregável:** paridade funcional com o ERP atual, porém multi-tenant.

### Fase 3 — Monetização (semanas 9–12) — ver `BILLING.md`
- [ ] Adaptador `InfinitePayGateway` (Checkout Integrado) atrás de uma interface `PaymentGateway`
- [ ] **Motor de recorrência próprio** (job diário idempotente) — a InfinitePay não tem API de assinatura
- [ ] Job de reconciliação como fallback do webhook
- [ ] Checkout, trial de 14 dias sem cartão, upgrade/downgrade com proração
- [ ] Webhooks → máquina de estados da assinatura (`TRIALING → ACTIVE → PAST_DUE → CANCELED`)
- [ ] Portal do assinante: plano, faturas, nota fiscal, cartão/PIX/boleto
- [ ] UI de limites: banner de trial, bloqueio elegante + upsell ao bater limite
- [ ] Rotina de dunning (cobrança em atraso) e período de graça

### Fase 4 — Aquisição (semanas 11–12)
- [ ] Landing page completa, responsiva, pré-renderizada
- [ ] Página de planos com toggle mensal/anual
- [ ] Termos de Uso, Política de Privacidade, DPA (LGPD)
- [ ] Analytics + formulário de contato para plano Rede
- [ ] Importador assistido (CSV) de pessoas e lançamentos

### Fase 5 — Migração e beta (semanas 13–14)
- [ ] Script de migração do IIRes → organização nº 1
- [ ] Beta com 2–3 institutos parceiros
- [ ] Backup automatizado + PITR, Sentry, logs estruturados (pino)
- [ ] Runbook de incidentes, status page
- [ ] Encerramento do `erp-gemini` (congelar, manter read-only por 90 dias)

**Total: ~14 semanas.** Fases 0–2 são inegociáveis; 3–5 podem rodar em paralelo se houver mais gente.

---

## 6. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| **Vazamento entre tenants** | Fatal (LGPD + confiança) | Extensão do Prisma + testes de isolamento obrigatórios + RLS no Supabase na Fase 5 |
| Fronteira antd/Tailwind vazando | Bundle da landing inchado, ERP inconsistente | Regra de lint: `pages/marketing/*` não importa `antd`; `modules/*` não importa Tailwind |
| Claude Code com conhecimento instável do antd v6 (lançado nov/2025) | Código com API de v5 ou inventada | Fixar versão no `package.json`; mandar consultar `ant.design` ao errar |
| Escopo infinito ("mais um módulo") | Nunca lança | Congelar escopo do MVP = paridade com o atual. Nada novo até o beta. |
| Custo Supabase explodir | Margem negativa a R$49,90 | Nada de base64 no banco; anexos no Storage; monitorar por org |
| Nome com problema de marca | Retrabalho de branding | Validar INPI **antes** da Fase 0 |
| **Churn involuntário** — na InfinitePay o cliente precisa clicar no link todo mês | Receita perdida sem o cliente ter decidido sair | Empurrar plano anual, avisar dentro do app (não só por e-mail), PIX como padrão |
| InfinitePay sem webhook de confirmação | Conciliação manual, inviável acima de ~30 clientes | Confirmar com `parcerias@cloudwalk.io` **antes** da Fase 3 |
| Dependência do `organizationId` esquecida em 1 query | Vazamento silencioso | Nunca usar o client cru; lint rule + code review + testes |
| LGPD: você vira **operador** dos dados dos doadores dos clientes | Jurídico | DPA no contrato, política de retenção, export/exclusão por organização |

---

## 7. Decisões

### ✅ Fechadas

| # | Decisão | Consequência |
|---|---|---|
| 1 | **Nome: SIGETES — Sistema de Gestão do Terceiro Setor** (decisão da diretoria) | Registrar domínios e fazer busca no INPI antes da Fase 0. Ver ressalva de escopo na seção 1 |
| 2 | **`Person` unificada** com papéis acumuláveis (voluntário, doador, parceiro, fornecedor, beneficiário) | Já refletido no `schema-draft.prisma`. Exige script de deduplicação por CPF/CNPJ na migração do IIRes |
| 3 | **UI: Ant Design v6 no ERP, Tailwind na landing** | `packages/ui` deixa de ser "construir DataTable" e vira wrappers finos sobre o antd. Economiza ~3–4 semanas |
| 4 | **Gateway: InfinitePay** | ⚠️ Não tem API de assinatura. O motor de recorrência é nosso. Ver `BILLING.md` — a Fase 3 sobe de 2 para 3–4 semanas |

### ⏳ Em aberto

5. **Landing** — dentro do app Vite pré-renderizado (rápido) ou app separado em Astro (SEO/performance melhores)?
6. **IIRes como cliente zero** — a organização nº 1 entra em qual plano? Tratamento especial (cortesia de cliente fundador) ou paga como qualquer outro?
7. **Módulos exclusivos do IIRes** — "Contextos Institucionais" e "Termo de Voluntariado" viram recursos de plano superior ou saem do MVP?
8. 🔴 **Webhook da InfinitePay** — confirmar com `parcerias@cloudwalk.io` se o Checkout Integrado tem webhook de confirmação de pagamento. **Se não tiver, isso é bloqueante** e o gateway precisa ser reavaliado. Ver `BILLING.md`, seção 1.

---

## 8. Documentos deste pacote

| Arquivo | Conteúdo |
|---|---|
| `PLANO_DE_ACAO.md` | Este documento — visão geral e roadmap |
| `ARQUITETURA.md` | Monorepo, multi-tenancy, RBAC, segurança, design system |
| `schema-draft.prisma` | Rascunho do modelo de dados novo |
| `PLANOS_E_PRECOS.md` | Planos, matriz de recursos, entitlements |
| `BILLING.md` | Cobrança com InfinitePay: motor de recorrência, webhook, dunning |
| `LANDING_PAGE.md` | Estrutura, copy e SEO da landing |
| `CLAUDE.md` | Convenções para o Claude Code |
