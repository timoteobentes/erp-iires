# Mapeamento de Efeitos — Transformação ERP IIRES → SIGETES (SaaS multi-tenant)

> Documento gerado em 2026-08-07 a partir da análise completa da pasta `docs/` (arquitetura, billing, design system, landing page, planos e preços, plano de ação, ADRs, schema draft) e do código atual do projeto (`backend/` e `frontend/`). Registra os principais efeitos da transformação do sistema, feito sob medida para o IIRES, em um produto SaaS multi-tenant chamado **SIGETES**, vendável a qualquer instituição do terceiro setor.

## Contexto

O sistema atual (`erp-gemini`) foi construído sob medida para uma única instituição, o IIRES. A pasta `docs/` documenta a decisão de transformar esse sistema em um produto SaaS multi-tenant chamado **SIGETES**, vendável a qualquer instituição do terceiro setor, com planos pagos, white-label e landing page própria. Este documento é o mapeamento dos principais efeitos dessa nova estrutura sobre o projeto existente, cobrindo todo o escopo descrito nos documentos (incluindo billing e landing page).

---

## 1. Mudança de paradigma central

| Hoje (erp-gemini) | Depois (SIGETES) |
|---|---|
| Uma instituição implícita (IIRES) dona de todos os dados | `Organization` explícita = o tenant; N organizações no mesmo banco |
| Usuário pertence à instituição por padrão | `User` (login global) × `Membership` (vínculo N:N com `Organization`, via `Role`) |
| Permissão = string livre `User.group` comparada em `requireGroups()` | RBAC granular por organização: `Role` + `Permission` (`modulo.recurso:acao`), customizável por plano |
| `InstitutionalContext` = classificador de negócio interno do IIRES (não isola nada) | Continua existindo, mas **não vira tenant** — é recurso do plano Institucional, ortogonal a `Organization` |
| Sem billing, sistema de uso interno | 4 planos pagos, entitlements, motor de cobrança recorrente |
| Sem landing page pública | Site de marketing pré-renderizado com SEO, planos, cadastro self-service |

**Achado importante do mapeamento**: a migration recente `20260710000000_add_institutional_contexts` e o módulo `InstitutionalContexts` (backend e frontend) **não são** o início da arquitetura multi-tenant, apesar do nome parecido. Os próprios comentários no schema atual dizem isso explicitamente ("Contextos são classificadores de registros do IIRes, não tenants"). Isso evita um erro real: tentar reaproveitar essa tabela como mecanismo de isolamento.

---

## 2. Efeitos no modelo de dados (Prisma / banco)

Comparando `backend/prisma/schema.prisma` (atual) com `docs/schema-draft.prisma` (proposto):

- **Toda tabela de domínio precisa ganhar `organizationId`** + índice: `User`→split em `User`/`Member`, `Volunteer`+`Donor`+`Partner`→unificados em `Person` (com `PersonRole[]` acumulável), `Project`, `Transaction`, `AccountPlan`, `CostCenter`, `InstitutionalContext`, `Notification`, `SystemLog`/`AuditLog`.
- **Todo `@unique` global vira composto com `organizationId`**: `User.email/cpf`, `Donor.document`, `Partner.cnpj`, `AccountPlan.code`, `CostCenter.code`. Hoje, duas instituições não poderiam ter o mesmo CPF cadastrado nem o mesmo código de plano de contas — isso quebra o modelo atual de raiz.
- **Separação `User` × `Member`**: hoje `User` mistura identidade de login com ficha de RH (salário, PIS, banco, título de eleitor). Vira dois models — `User` (login, camada plataforma, sem `organizationId`) e `Member` (vínculo/RH, por organização, com campos sensíveis protegidos por permissão `people.employees:read_sensitive`).
- **`Person` unificada**: hoje `Volunteer`, `Donor`, `Partner` são tabelas separadas — a mesma pessoa física cadastrada como voluntária e doadora vira dois registros duplicados sem relação. No draft, vira uma tabela `Person` com `kind` (PF/PJ) e `roles: PersonRole[]` acumuláveis.
- **`Float` → `Decimal(14,2)` para todo valor monetário** (`Transaction.amount`, `Project.budget`, `Member.salary`) — problema de arredondamento identificado no schema atual.
- **Anexos**: hoje não há model de anexo tratado; no draft, `Attachment` guarda só metadados, arquivo vai para Supabase Storage (`org/{organizationId}/...`), nunca base64 no Postgres.
- **Novas tabelas inteiras, camada plataforma** (sem `organizationId`, acima do tenant): `Organization`, `Membership`, `Role`, `Invite`, `RefreshToken` (com `familyId` para detecção de reuso).
- **Novas tabelas inteiras, billing** (camada plataforma): `Plan`, `Subscription`, `Invoice`, `WebhookEvent`.
- Enums que hoje são `String` livre (status de transação, tipo de vínculo, etc.) viram enums de verdade no draft.

**Efeito prático**: isso não é uma migration incremental — é uma reescrita de schema com necessidade de script de migração de dados (dedup de `Person` por CPF/CNPJ, split de `User`→`Member`, atribuição de `organizationId = <org do IIRES>` em todo registro existente).

---

## 3. Efeitos no backend (Express/TS)

### 3.1 Contexto de tenant (novo, não existe hoje)
- Nenhum middleware de resolução de tenant existe hoje (`routes.ts` só registra sub-routers, sem injeção de `organizationId`).
- Precisa: `AsyncLocalStorage` carregando `{ userId, organizationId, membershipId, permissions }` por request, populado a partir do JWT.
- Precisa: extensão do Prisma Client (`$extends`) que injeta `organizationId` automaticamente em `where`/`data` para os models de tenant — hoje todo controller usa `PrismaClient` cru sem qualquer filtro de isolamento.
- **Regra crítica de segurança**: `organizationId` nunca pode vir de body/query/params do cliente, sempre do contexto de auth. Recurso de outra organização deve retornar 404 (não 403).

### 3.2 Autenticação e autorização
- `auth.controller.ts` hoje gera JWT só com `{id, role, group}` — precisa incluir `orgId`, `membershipId`, `permVersion`.
- `authMiddleware`/`requireGroups()` (`shared/middlewares/auth.middleware.ts`) hoje comparam string livre de `group` — precisam virar `requirePermission()` + `requireEntitlement()` (esta última nova: checa se o plano da organização inclui a feature).
- Login hoje busca `User` só por email globalmente único — sem problema per se (User continua global), mas login precisa depois resolver **qual(is) organização(ões)** o usuário pertence e permitir troca (`/auth/switch-org`, endpoint que não existe hoje).
- Refresh token hoje é campo único simples no `User`; draft pede tabela própria com rotação e detecção de reuso por família.

### 3.3 Módulos existentes — todos precisam de tenant-awareness
Nenhum controller hoje (`Transactions`, `Projects`, `AccountPlans`, `CostCenters`, `People/*`, `InstitutionalContexts`, `Notifications`, `Reports`) filtra por instituição — todos os `findMany`/`groupBy` são globais. Cada um precisa passar a operar sob o Prisma Client estendido com tenant, e as rotas de escrita hoje protegidas só por `requireGroups()` precisam evoluir para checagem de permissão + entitlement do plano.

### 3.4 Conteúdo hardcoded do IIRES a extrair
- `server.ts`: CORS origin fixo (`system.iires.org`), mensagem de health-check
- `mail.service.ts`: remetente, rodapé, assunto de e-mail, link de reset com `localhost` hardcoded (nem usa env existente)
- `reports.service.ts`: logo fixo, rodapé de PDF com nome/CNPJ do IIRES
- `termo.service.ts`: texto jurídico completo do IIRES (razão social, endereço, CNPJ, nome do presidente) cravado no código — feature que os docs listam como "decisão em aberto: sai do MVP ou vira recurso pago"
- `team.controller.ts`: prefixo de senha temporária `'IIRes@'`
- `prisma/seed.ts`: semeia só o IIRES (admin `@iires.org`, 3 contextos institucionais reais, plano de contas fixo)

Todo esse conteúdo precisa virar dado por `Organization` (campos como `logoUrl`, `brandColor`, dados de rodapé/documento) em vez de literal no código.

### 3.5 Billing (módulo inteiro novo)
- Gateway escolhido: **InfinitePay** — não tem API de assinatura nativa por padrão. Isso significa construir um **motor de recorrência próprio** (não é só "integrar um gateway"):
  - Interface abstrata `PaymentGateway` (createCharge/getCharge/parseWebhook) desde o início, para não travar em um único provedor.
  - Job diário: gerar fatura (D-5), lembrar (D-2/D/D-3), régua de dunning (D+1 até D+90, com suspensão em D+30 e exclusão em D+90 — sempre preservando exportação de dados), reconciliar via fallback caso webhook falhe.
  - Webhook `POST /api/v1/webhooks/infinitepay` fica **fora** do middleware de tenant/auth normal (usa client Prisma "global"), valida HMAC/IP, idempotente via `@@unique([gateway, externalId])`.
  - **Atualização**: a documentação oficial da InfinitePay (https://www.infinitepay.io/checkout-documentacao) confirma que existe webhook de confirmação de pagamento — o bloqueio levantado inicialmente em `BILLING.md` está resolvido.
  - **Plano B aprovado** caso o motor de recorrência completo se mostre trabalho demais para o prazo: tratar como compra avulsa (não assinatura recorrente automática) usando a InfinitePay só como gateway de pagamento, com aviso diário ao usuário a partir de 7 dias antes do vencimento do plano, para renovação manual.
- Entitlements (o que cada plano libera) vivem em banco (`Plan`, `PlanFeature`), nunca em `if` fixo no código — consumidos via `requireEntitlement()` (402) e `checkLimit()` (409 `LIMIT_EXCEEDED`) no backend.
- 4 planos definidos com preço, limites (usuários/projetos/storage) e features — tabela completa em `docs/PLANOS_E_PRECOS.md`.

---

## 4. Efeitos no frontend (React/TS)

### 4.1 Zero tenant-awareness hoje
Confirmado por busca no código — nenhuma ocorrência de "tenant"/"organizationId" em `frontend/src`.

- `api.ts`: nenhum header de tenant enviado hoje; chaves de `localStorage` prefixadas `@iires:` (token/user/refreshToken/sessionTimeout) — precisam generalizar.
- Nenhum `*.service.ts` (Projects, Transactions, People, etc.) envia `organizationId` — todos os endpoints hoje são "flat".
- Login hoje não tem seleção de organização; `AuthContext`/`AuthUser` não tem campo de instituição.
- `usePermission.ts` tem RBAC hardcoded com nomes de grupo específicos do IIRES (`'Administrador'`, `'Tecnologia'`, `'Financeiro'`, `'Inovação'`) — precisa virar dirigido por permissões vindas do backend, não strings fixas.
- `SystemSettings.tsx` hoje é uma tela decorativa com dados do IIRES hardcoded, sem persistência real (nem tem API por trás) — é o candidato natural para virar "Configurações da Organização" por tenant.

### 4.2 Rebranding (17 arquivos com referência direta a "IIRes" identificados)
Logos, textos e cores fixas em: `Sidebar.tsx`, `Login/*`, `SignUp/*`, `ForgotPassword/*`, `ResetPassword/*`, `SystemSettings.tsx`, formulários de People/Finance/Projects (textos de ajuda como "o projeto continua sendo do IIRes"), `index.html` (title). Nova paleta definida em `docs/DESIGN_SYSTEM.md`, extraída por pixel da logo SIGETES:
- `primary` `#009082`, `secondary` `#054EC0`, `success` `#1D9D19`, `dark` `#001F3D` (substitui o verde `#389334`/azul `#0047AF` atual)
- Tipografia: Inter (interface) + Roboto Mono (números), remove a fonte cursiva `Caveat` atual
- Há cor hardcoded fora do Tailwind em `global.css` (menu Ant Design) que duplica valor literal — precisa virar CSS variable para permitir white-label em runtime

### 4.3 Fronteira de UI (ADR-002 + ADR-003)
- Ant Design v6 continua no ERP (`modules/*`, telas autenticadas); Tailwind puro só na zona de marketing (`pages/marketing/*`).
- Emenda importante (ADR-003, motivada por um bug real já ocorrido): classes Tailwind utilitárias (spacing/raio/sombra) **são permitidas dentro** da zona antd para acabamento visual — só componente novo fora do catálogo antd é que continua proibido (nada de shadcn/radix).
- Regra de white-label: nenhuma cor literal em código — sempre via token, para permitir `colorPrimary` vir de `Organization.brandColor` (plano Institucional) em runtime via CSS Variables do AntD v6.

### 4.4 White-label (recurso pago, plano Institucional+)
- `Organization.logoUrl` e `Organization.brandColor` no schema — feature `branding.custom`.
- Requer `ConfigProvider` dinâmico do Ant Design (não existe hoje) alimentado pelos dados da organização logada.

---

## 5. Landing page (inexistente hoje — módulo inteiro novo)

- Decisão de arquitetura: Vite + `vite-react-ssg` (rotas de marketing pré-renderizadas: `/`, `/planos`, `/recursos`, `/para-quem`, `/contato`, `/termos`, `/privacidade`), resto do app continua SPA autenticada em `/app/*`.
- Estrutura de seções completa e copy já definidos em `docs/LANDING_PAGE.md`: Hero, prova social, problema, módulos, diferenciais, como funciona, planos (toggle mensal/anual), depoimento, FAQ, CTA, rodapé com LGPD/DPO.
- SEO: meta tags, OG image, sitemap/robots, JSON-LD, palavras-chave definidas ("sistema de gestão para ONG" etc.).
- Fluxo de cadastro self-service (`/auth/signup`) precisa existir de verdade no backend — hoje a rota `/signup` do frontend existe mas está **desativada** (redireciona para `/login`), e o método `signUp` do backend está órfão (não registrado em `auth.routes.ts`).
- Página de planos consome os mesmos dados de `Plan`/entitlements do backend (fonte única, sem duplicar preço/limite no front).

---

## 6. Segurança, LGPD e riscos identificados nos docs

- **Vazamento de dados entre organizações** é listado como risco fatal (implica LGPD) — mitigação central é a extensão do Prisma Client + regra "nunca confiar em `organizationId` vindo do cliente" + suíte de teste automatizado de isolamento (todo endpoint testado contra acesso cruzado, esperando 404).
- SIGETES passa a ser **operador** dos dados pessoais dos clientes finais das organizações (doadores, voluntários, assistidos) — implica DPA, exportação/exclusão por autoatendimento, DPO nomeado, política de retenção documentada.
- Defesa em profundidade adicional prevista (não imediata): Row-Level Security no Postgres/Supabase.
- Risco de churn involuntário por causa da cobrança manual via InfinitePay (mitigado pelo plano B de aviso diário D-7, ver seção 3.5).
- Risco de fronteira Tailwind/antd vazar sem lint dedicado (fica em revisão de PR por enquanto).

---

## 7. Faseamento descrito nos documentos (referência)

`docs/PLANO_DE_ACAO.md` estima ~14 semanas com 1 dev + Claude Code:

| Fase | Semanas | Escopo essencial |
|---|---|---|
| 0 — Fundação | 1 | Monorepo, CI, Supabase, esqueleto back/front, ADRs |
| 1 — Núcleo da plataforma | 2–4 | `Organization`/`Membership`/`Role`, contexto de tenant, auth completo, RBAC, teste de isolamento obrigatório |
| 2 — Módulos de domínio | 5–8 | Migração tenant-aware de Pessoas/Projetos/Financeiro/Relatórios |
| 3 — Monetização | 9–12 | Motor de recorrência InfinitePay, dunning, portal do assinante |
| 4 — Aquisição | 11–12 (paralela) | Landing completa, termos/LGPD, analytics |
| 5 — Migração e beta | 13–14 | Migração de dados do IIRES, beta com outras instituições, backup/observabilidade |

Fases 0–2 são descritas como inegociáveis (nada funciona multi-tenant sem elas). Fases 3–5 podem rodar em paralelo com mais gente.

Este projeto está iniciando a execução pela **Fundação**, que combina o essencial das Fases 0 e 1 dos documentos: colocar o alicerce multi-tenant de pé e funcionando ponta a ponta antes de migrar módulos de negócio, fazer rebranding visual, billing ou landing page.

---

## 8. Decisões que os documentos deixavam em aberto (e status atual)

- IIRES como "cliente zero": qual plano/tratamento comercial recebe na migração — **ainda em aberto**.
- Módulos exclusivos do IIRES hoje (Termo de Voluntariado com texto jurídico próprio, os 3 Contextos Institucionais reais semeados) — viram recurso configurável por organização, ou saem do MVP — **ainda em aberto**.
- Landing page como parte do mesmo app Vite (`vite-react-ssg`) ou projeto Astro separado — **ainda em aberto**.
- Preço de tabela do plano Institucional pode cair de R$399,90 para R$299,90 dependendo de validação de mercado — **ainda em aberto**.
- Webhook de confirmação de pagamento da InfinitePay — **resolvido**: existe, confirmado na documentação oficial. Plano B de compra avulsa + aviso D-7 aprovado como alternativa caso o motor de recorrência completo consuma tempo demais.
