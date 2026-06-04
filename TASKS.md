# 📋 TASKS — ERP IIRes

> **Análise realizada em:** 27/05/2026  
> **Status geral do projeto:** Backend 100% implementado · Frontend com UI completa em mock · Integração frontend↔backend pendente em todos os módulos de negócio

---

## Legenda de prioridade

| Símbolo | Significado |
|---|---|
| 🔴 | Crítico — bloqueia funcionamento real |
| 🟠 | Alta — integração de módulo de negócio |
| 🟡 | Média — melhoria funcional |
| 🟢 | Baixa — refinamentos e extras |

---

## 🔴 BLOCO 1 — Infraestrutura de Autenticação Global (Frontend)

> Sem isso, nenhum módulo consegue identificar o usuário logado nem proteger rotas com base em perfil.

- [x] **1.1 — Criar `AuthContext` e `AuthProvider`**  
  Implementado em `frontend/src/modules/Auth/context/AuthContext.tsx`.  
  `App.tsx` atualizado com `<AuthProvider>`.

- [x] **1.2 — Substituir leitura direta do `localStorage` no `ProtectedRoute`**  
  `ProtectedRoute.tsx` usa agora `useAuthContext()`. Trata `isLoadingAuth` para evitar redirect prematuro.

- [x] **1.3 — Conectar `UserProfile` ao backend**  
  `UserProfile.tsx` busca `authService.getMe()` na montagem, salva dados pessoais via `PATCH /auth/me` e altera senha via `PATCH /auth/change-password`. Skeleton de loading implementado.

- [x] **1.4 — Implementar rota de `PATCH /api/auth/me` no backend**  
  `updateMe` e `changePassword` adicionados ao `AuthController`. Rotas registradas em `auth.routes.ts`.

---

## 🔴 BLOCO 2 — Configuração de Ambiente

- [x] **2.1 — Criar arquivo `.env.example` na raiz do backend**  
  Criado em `backend/.env.example` com todas as variáveis documentadas.

- [x] **2.2 — Criar arquivo `.env` no backend** com os valores reais para desenvolvimento.  
  Variável `FRONTEND_URL` adicionada ao `.env` existente.

- [x] **2.3 — Criar arquivo `.env` no frontend**  
  Já existia com `VITE_API_URL=http://localhost:3333/api` — validado.

- [x] **2.4 — Configurar CORS no backend com origem específica**  
  `server.ts` atualizado com função `origin` que valida a lista de origens permitidas (dev + preview). Suporta Insomnia/Postman sem origin.

---

## 🟠 BLOCO 3 — Módulo Equipe (Team)

> **Backend:** ✅ completo (`POST /team`, `GET /team`, `GET /team/:id`, `PUT /team/:id`, `PATCH /team/:id/inactivate`)  
> **Frontend:** ✅ integrado

- [x] **3.1 — Criar `frontend/src/modules/People/services/team.service.ts`**  
  Métodos: `list()`, `getById(id)`, `create(data)`, `update(id, data)`, `inactivate(id)`. Tipos `TeamMember` e `TeamMemberPayload` exportados.

- [x] **3.2 — Integrar `TeamList`**  
  Dados reais via `teamService.list()`. Loading via `Table loading`. Empty state com `locale.emptyText`.  
  Busca por nome/e-mail/cargo (client-side). Filtros de Status e Grupo funcionais. Botão inativar chama API e atualiza lista localmente.

- [x] **3.3 — Integrar `TeamForm` (criação e edição)**  
  Modo criar: `teamService.create()` → notifica senha padrão `Mudar@123`. Modo editar: pré-carrega formulário via `getById()`, mapeia `personalEmail`→`personal_email` e `address.street`→`address`. E-mail bloqueado no modo edição. Skeleton de loading.

- [x] **3.4 — Integrar `TeamView`**  
  Dados reais via `teamService.getById()`. Skeleton durante carregamento. Botão "Revogar Acesso" chama `inactivate()` e atualiza status localmente. Exibe endereço completo ou mensagem de ausência.

---

## 🟠 BLOCO 4 — Módulo Voluntários

> **Backend:** ✅ completo (`POST /volunteers`, `GET /volunteers`, `GET /volunteers/:id`, `PUT /volunteers/:id`, `PATCH /volunteers/:id/inactivate`)  
> **Frontend:** ✅ integrado

- [x] **4.1 — Criar `frontend/src/modules/People/services/volunteers.service.ts`**  
  Métodos: `list()`, `getById(id)`, `create(data)`, `update(id, data)`, `inactivate(id)`. Tipos `Volunteer` e `VolunteerPayload` exportados.

- [x] **4.2 — Integrar `VolunteersList`**  
  Substituir `mockData` com API real. Busca por nome/e-mail/habilidades. Filtros de Status e Disponibilidade. Botão inativar chama API e atualiza lista localmente. Grid e lista usam dados filtrados reais. Empty state com `Empty`.

- [x] **4.3 — Integrar `VolunteersForm` (criação e edição)**  
  Modo criar: `volunteersService.create()`. Modo editar: pré-carrega via `getById()`, converte `birthDate` ISO → `dayjs` para `DatePicker`, CPF bloqueado no modo edição. Skeleton de loading.

- [x] **4.4 — Integrar `VolunteersView`**  
  Dados reais via `volunteersService.getById()`. Skeleton de carregamento. Botão "Inativar" com `Modal.confirm`. `birthDate`, `createdAt`, e `termsAcceptedOn` formatados com `toLocaleDateString`. Endereço condicional.

---

## 🟠 BLOCO 5 — Módulo Doadores

> **Backend:** ✅ completo (`POST /donors`, `GET /donors`, `GET /donors/:id`, `PUT /donors/:id`, `PATCH /donors/:id/inactivate`)  
> **Frontend:** ✅ integrado

- [x] **5.1 — Criar `frontend/src/modules/People/services/donors.service.ts`**  
  Métodos: `list()`, `getById(id)`, `create(data)`, `update(id, data)`, `inactivate(id)`. Tipos `Donor` e `DonorPayload` exportados.

- [x] **5.2 — Integrar `DonorsList`**  
  Substituir `mockData` com API real. Busca por nome/e-mail/documento. Filtros de Status, Tipo (PF/PJ) e Recorrência. Botão inativar chama API e atualiza lista localmente. Colunas ajustadas para dados disponíveis (`totalDonated`/`lastDonation` requerem JOIN com transações — removidos da lista por ora).

- [x] **5.3 — Integrar `DonorsForm` (criação e edição)**  
  PF/PJ toggle com máscara dinâmica. Modo editar: pré-carrega via `getById()`, documento e tipo bloqueados. Skeleton de loading.

- [x] **5.4 — Integrar `DonorsView`**  
  Dados reais via `donorsService.getById()`. Skeleton de carregamento. Botão "Inativar" com `Modal.confirm`. "Lançar Doação" navega para `/finance/receivables/new` com estado pré-preenchido.

---

## 🟠 BLOCO 6 — Módulo Parceiros & Fornecedores

> **Backend:** ✅ completo (`POST /partners`, `GET /partners`, `GET /partners/:id`, `PUT /partners/:id`, `PATCH /partners/:id/inactivate`)  
> **Frontend:** ✅ integrado

- [x] **6.1 — Criar `frontend/src/modules/People/services/partners.service.ts`**  
  Métodos: `list()`, `getById(id)`, `create(data)`, `update(id, data)`, `inactivate(id)`. Mapeamento automático: formulário usa `document`+`type` → backend recebe `cnpj`+`partnershipType`. Tipos `Partner`, `PartnerFormData`, `PartnerPayload` exportados.

- [x] **6.2 — Integrar `PartnersList`**  
  Substituir `mockData` com API real. Busca por nome/contato/e-mail. Filtros de Tipo (Fornecedor/Parceiro) e Status. Botão inativar chama API e atualiza lista localmente. Grid e lista usam `filtered` real.

- [x] **6.3 — Integrar `PartnersForm` (criação e edição)**  
  Modo editar: pré-carrega via `getById()`, detecta PJ/PF pelo comprimento do CNPJ, mapeia `cnpj`→`document`, `partnershipType`→`type`. Documento e `personType` bloqueados no modo edição. Skeleton de loading.

- [x] **6.4 — Integrar `PartnersView`**  
  Dados reais via `partnersService.getById()`. Skeleton de carregamento. Botão "Inativar" com `Modal.confirm`. "Lançar Despesa" (apenas Fornecedores) navega para `/finance/payables/new`.

---

## 🟠 BLOCO 7 — Módulo Projetos

> **Backend:** ✅ completo (`POST /projects`, `GET /projects`, `GET /projects/:id`, `PUT /projects/:id`, `PATCH /projects/:id/status`)  
> **Frontend:** ✅ integrado

- [x] **7.1 — Criar `frontend/src/modules/Projects/services/projects.service.ts`**  
  Métodos: `list()`, `getById(id)`, `create(data)`, `update(id, data)`, `changeStatus(id, status)`. Tipos `Project` e `ProjectPayload` exportados.

- [x] **7.2 — Integrar `ProjectList`**  
  `mockData` substituído por API real. Busca por nome/responsável. Filtro de Status funcional.  
  Campos `progress` e `budget` removidos (não existem no schema — campos `status` e `startDate` substituem na listagem).  
  Botão cancelar chama `changeStatus(id, 'canceled')` e remove da lista. Grid e lista ambos funcionais.

- [x] **7.3 — Integrar `ProjectForm` (criação e edição)**  
  `managerId` carregado da API de equipe (`teamService.list()`). `volunteerIds` carregado da API de voluntários. Sem campo `budget`.  
  Modo edição pré-preenche via `getById()` com `startDate` e `endDate` convertidos para `dayjs`. Skeleton de loading.

- [x] **7.4 — Integrar `ProjectView`**  
  Dados reais via `projectsService.getById()`. Voluntários e parceiros exibidos.  
  Seções de `budget`/`progress`/`spent` removidas (não existem no schema). Skeleton de carregamento.

- [x] **7.5 — Adicionar campos `budget` e `progress` no schema do Projeto**  
  `budget Float?` e `progress Int @default(0)` adicionados ao `schema.prisma`. `prisma db push` aplicado ao banco.  
  Backend: create e update aceitam os novos campos. List inclui budget/progress no select.  
  Frontend: `ProjectForm` com campo de orçamento (R$) e slider de progresso (0–100%). `ProjectView` exibe barra de progresso e card de orçamento.

---

## 🟠 BLOCO 8 — Módulo Financeiro

> **Backend:** ✅ completo + `GET /transactions/monthly-summary` adicionado  
> **Frontend:** ✅ integrado

- [x] **8.1 — Criar `frontend/src/modules/Finance/services/transactions.service.ts`**  
  Métodos: `list()`, `getById(id)`, `create(data)`, `update(id, data)`, `cancel(id)`, `getSummary()`, `getMonthlySummary()`. Tipos `Transaction`, `TransactionSummary`, `MonthlySummary`, `TransactionPayload` exportados.

- [x] **8.2 — Integrar `FinanceOverview`**  
  KPIs reais: `totalIncome`, `totalExpense`, `balance`, taxa de comprometimento. Tabela de últimas transações com dados reais. Gráfico de linha com dados reais do `getMonthlySummary()`.

- [x] **8.3 — Integrar `ReceivablesList`** (`type=INCOME`)  
  `mockData` substituído. Filtra por `type: 'INCOME'`. Busca, filtros de Status e Categoria funcionais. Botão cancelar chama `cancel(id)` e atualiza localmente.

- [x] **8.4 — Integrar `ReceivablesForm` e `ReceivablesView`**  
  Formulário com create/update real. Pré-preenche a partir de `navigate state` (payer, categoryId). View com dados reais via `getById()`. Skeleton em ambos.

- [x] **8.5 — Integrar `PayablesList`** (`type=EXPENSE`)  
  `mockData` substituído. Filtra por `type: 'EXPENSE'`. Busca, filtros e cancelamento funcionais.

- [x] **8.6 — Integrar `PayablesForm` e `PayablesView`**  
  Formulário com create/update real. Pré-preenche a partir de `navigate state` (provider). Selects de projeto e parceiro carregados da API. View com dados reais.

- [x] **8.7 — Criar endpoint `GET /api/transactions/monthly-summary` no backend**  
  Implementado em `transactions.controller.ts`: agrupa por mês nos últimos 6 meses, retorna `[{ month, income, expense }]`. Rota registrada em `transactions.routes.ts`.

---

## 🟠 BLOCO 9 — Módulo Relatórios

> **Backend:** ✅ expandido (suporta `financial`, `donors`, `volunteers`, `partners`, `projects`)  
> **Frontend:** ✅ integrado

- [x] **9.1 — Criar `frontend/src/modules/Reports/services/reports.service.ts`**  
  Método `exportReport({ moduleType, format, sendToEmail?, filters? })` com download via blob. `downloadBlob()` utilitário para acionar download no browser.

- [x] **9.2 — Integrar botões de exportação em `ReportsDashboard`**  
  `setTimeout` substituídos por chamadas reais. Cada relatório mapeado para `moduleType` correto. Download de arquivo binário (blob) funcional. Modal de e-mail conectado à API real.

- [x] **9.3 — Expandir `ReportsController` no backend**  
  Adicionados: `volunteers` (habilidades, disponibilidade), `partners` (tipo, contato), `projects` (manager, volunteers, partners, datas).

- [x] **9.4 — Conectar filtros de data e status** nos relatórios  
  `RangePicker` e `Select` de status conectados via estado. Filters passados como `{ startDate, endDate, status }` para a API.  
  Backend atualizado: `buildWhere()` processa filtros de forma segura (sem passagem direta ao Prisma).

---

## 🟠 BLOCO 10 — Dashboard

> **Frontend:** ✅ integrado com dados reais

- [x] **10.1 — KPIs reais via chamadas paralelas**  
  `Total Captado` → `getSummary().totalIncome`. `Saldo Atual` → `getSummary().balance`.  
  `Projetos Ativos` → contagem de projetos com `status='active'`.  
  `Voluntários Ativos` → contagem de voluntários com `status='active'`.

- [x] **10.2 — Integrar Gráfico de Barras (Captação vs Investimento)**  
  Consumindo `getMonthlySummary()` — últimos 6 meses. Tooltip formatado em BRL. Responde ao resize.

- [x] **10.3 — Integrar Gráfico Donut (Status dos Projetos)**  
  Dados calculados a partir da lista de projetos. Legenda mostra contagens reais.

- [x] **10.4 — Integrar tabela "Projetos Atualizados Recentemente"**  
  4 primeiros projetos da API. Colunas: nome, responsável, voluntários (avatares), status. Sem campos mockados (`progress`, `budget`).

---

## 🟡 BLOCO 11 — Backend: Filtros e Paginação nas APIs

> Atualmente todos os endpoints retornam todos os registros sem suporte a filtro ou paginação.

- [x] **11.1 — Adicionar suporte a query params de filtragem**  
  Implementado em todos os controllers: `?status=`, `?type=`, `?availability=`, `?partnershipType=`, `?category=`.

- [x] **11.2 — Adicionar paginação nos endpoints de listagem**  
  Todos os controllers de listagem suportam `?page=1&limit=10` retornando `{ data, total, page, totalPages }`.  
  Sem `page`: retorna array completo (retrocompatível com frontend existente).

- [x] **11.3 — Adicionar busca por texto**  
  `?search=texto` com `contains` case-insensitive nos campos relevantes de cada módulo.

---

## 🟡 BLOCO 12 — Funcionalidades de UX pendentes

- [x] **12.1 — Implementar filtros funcionais em todas as listagens**  
  Filtros client-side implementados em todos os módulos (blocos 3-10). Backend agora também suporta `?search=`, `?status=` etc. (bloco 11).

- [x] **12.2 — Loading states em todas as listagens**  
  Skeleton do Ant Design implementado em todos os módulos (blocos 3-10).

- [x] **12.3 — Empty states**  
  Empty states implementados em todos os módulos (blocos 3-10).

- [x] **12.4 — Tratamento global de erros de API**  
  `notification.error` com mensagem do backend em todos os módulos. `<App>` do Ant Design adicionado ao `App.tsx` para garantir renderização.  
  Bug crítico corrigido: interceptor axios não redireciona para `/login` em erros de autenticação própria (login/signup/forgot/reset).

- [x] **12.5 — Confirmar deleção/inativação com feedback real**  
  `Modal.confirm` conectados às actions reais de serviço em todos os módulos (blocos 3-10).

---

## 🟡 BLOCO 13 — Módulo de Configurações do Sistema

> A página `SystemSettings` existe no frontend mas está vazia/placeholder.

- [ ] **13.1 — Definir quais configurações serão gerenciáveis** (dados da organização, e-mail SMTP, etc.)
- [ ] **13.2 — Criar endpoints no backend** para leitura/escrita de configurações
- [ ] **13.3 — Implementar a tela com formulário funcional**

---

## 🟢 BLOCO 14 — Refinamentos de Segurança e Produção

- [x] **14.1 — Validação de entrada no backend**  
  Middleware `validate.middleware.ts` criado. Schemas Zod em `shared/schemas/auth.schemas.ts`.  
  Aplicado nas rotas de auth: login, signup, forgotPassword, resetPassword, changePassword, updateMe.

- [x] **14.2 — Rate limiting**  
  `express-rate-limit` instalado. `loginLimiter` (10 req/15min) em `POST /auth/login`.  
  `forgotPasswordLimiter` (5 req/hora) em `POST /auth/forgot-password`.

- [ ] **14.3 — Controle de acesso por grupo (RBAC)**  
  O `authMiddleware` já injeta `role` e `group` no `req.user`. Criar middleware de autorização para restringir rotas sensíveis (ex: somente Administrador pode acessar `/api/team`).

- [x] **14.4 — Refresh Token**  
  Campo `refreshToken String? @unique` + `refreshTokenExpires DateTime?` adicionados ao model `User`. `prisma db push` aplicado.  
  Backend: `signIn` retorna `{ token, refreshToken }`. Novos endpoints: `POST /auth/refresh` (rotação do token) e `POST /auth/logout` (invalida o refresh token no banco).  
  Frontend: `AuthContext.login()` persiste o refreshToken. Interceptor axios com fila de requisições — em caso de 401, tenta refresh automático antes de redirecionar para login.  
  `authService.logout()` invalida o token no servidor. Variável `JWT_REFRESH_SECRET` necessária no `.env` em produção.

- [ ] **14.5 — Helmet e segurança de headers**  
  Helmet já está configurado. Revisar e endurecer a CSP para produção.

- [ ] **14.6 — Variáveis de ambiente em produção**  
  Garantir que `JWT_SECRET` em produção não use o fallback `secret-fallback-nao-use-em-prod`.

---

## 🟢 BLOCO 15 — Infraestrutura e Deploy

- [ ] **15.1 — Configurar `Dockerfile` para backend e frontend**
- [ ] **15.2 — Configurar `docker-compose.yml`** com backend + frontend + banco PostgreSQL
- [ ] **15.3 — Configurar pipeline de CI/CD** (GitHub Actions ou similar)
- [ ] **15.4 — Configurar migração automática do banco em produção** (`prisma migrate deploy`)
- [ ] **15.5 — Configurar variáveis de ambiente em produção** (Vercel, Railway, Render, etc.)

---

## 📊 Resumo Geral

| Módulo | Backend | Frontend (UI) | Integração |
|---|---|---|---|
| **Autenticação** | ✅ Completo | ✅ Completo | ✅ Integrado |
| **Equipe** | ✅ Completo | ✅ UI pronta | ✅ Integrado |
| **Voluntários** | ✅ Completo | ✅ UI pronta | ✅ Integrado |
| **Doadores** | ✅ Completo | ✅ UI pronta | ✅ Integrado |
| **Parceiros** | ✅ Completo | ✅ UI pronta | ✅ Integrado |
| **Projetos** | ✅ Completo | ✅ UI pronta | ✅ Integrado |
| **Financeiro** | ✅ Completo | ✅ UI pronta | ✅ Integrado |
| **Relatórios** | ✅ Completo | ✅ UI pronta | ✅ Integrado |
| **Dashboard** | — | ✅ UI pronta | ✅ Integrado |
| **Perfil do Usuário** | ✅ Completo | ✅ UI pronta | ✅ Integrado |
| **Configurações** | ❌ Ausente | 🟡 Placeholder | ❌ Pendente |

---

## 🚀 Ordem de Execução Sugerida

```
Bloco 2 (Ambiente)
    → Bloco 1 (AuthContext)
        → Bloco 3 (Equipe)
        → Bloco 4 (Voluntários)
        → Bloco 5 (Doadores)
        → Bloco 6 (Parceiros)
        → Bloco 7 (Projetos)
        → Bloco 8 (Financeiro)
            → Bloco 10 (Dashboard)
            → Bloco 9 (Relatórios)
→ Bloco 11 (Filtros/Paginação API)
→ Bloco 12 (UX)
→ Bloco 13 (Configurações)
→ Bloco 14 (Segurança)
→ Bloco 15 (Deploy)
```
