# Arquitetura Técnica — SIGETES

> Complementa `PLANO_DE_ACAO.md`. Aqui ficam as decisões que o Claude Code precisa respeitar.

---

## 1. Monorepo

npm workspaces + Turborepo. Mantém `frontend/` e `backend/` na raiz e acrescenta `packages/` para o que é compartilhado.

```
sigetes/
├── package.json              # workspaces: ["backend","frontend","packages/*"]
├── turbo.json
├── CLAUDE.md
├── .env.example
├── docs/
│   ├── adr/                  # Architecture Decision Records
│   └── *.md
│
├── packages/
│   ├── shared/               # ⭐ tipos + schemas Zod usados pelos DOIS lados
│   │   └── src/
│   │       ├── schemas/      # organization.schema.ts, project.schema.ts...
│   │       ├── types/
│   │       ├── permissions.ts  # catálogo de permissões (fonte única da verdade)
│   │       └── constants.ts
│   ├── ui/                   # wrappers finos sobre o Ant Design (ver seção 7)
│   └── config/               # tsconfig base, eslint, theme tokens
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seeds/            # plans.ts, permissions.ts, account-plans.ts
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── routes.ts
│       ├── config/           # env (validado com Zod), prisma, storage, mail
│       ├── core/             # ⭐ o coração da plataforma
│       │   ├── context/      # AsyncLocalStorage (requestContext)
│       │   ├── prisma/       # extensão de tenant + client
│       │   ├── errors/       # AppError, códigos, handler
│       │   ├── rbac/         # permissões, checagem
│       │   └── billing/      # entitlements, limites, motor de recorrência
│       ├── modules/
│       │   └── <dominio>/
│       │       ├── <dominio>.routes.ts
│       │       ├── <dominio>.controller.ts
│       │       ├── <dominio>.service.ts      # regra de negócio
│       │       ├── <dominio>.repository.ts   # acesso a dados
│       │       └── <dominio>.schema.ts       # re-exporta de @sigetes/shared
│       └── shared/           # middlewares, services (mail, storage, pdf, xlsx), utils
│
└── frontend/
    └── src/
        ├── main.tsx
        ├── app/              # providers, router, query client, ConfigProvider
        ├── pages/
        │   ├── marketing/    # 🟡 ZONA TAILWIND — landing, planos, recursos
        │   └── auth/         # login, cadastro, onboarding (antd)
        ├── modules/          # 🟢 ZONA ANTD — <dominio>/{pages,components,hooks,services}
        ├── components/
        │   ├── ui/           # wrappers do antd (DataTable, PageShell, FormField)
        │   └── layout/       # Sidebar, Header, OrgSwitcher
        ├── lib/              # api.ts, theme.ts, permissions.ts
        ├── hooks/            # useAuth, usePermission, useEntitlement
        └── styles/
```

**Por que `packages/shared` importa:** o schema Zod de um formulário é escrito **uma vez** e usado no `react-hook-form` e no `validate` middleware. Sem isso, front e back divergem em três semanas.

---

## 2. Multi-tenancy

### Decisão (ADR-001): banco único, schema único, coluna `organizationId`

| Estratégia | Isolamento | Custo | Complexidade | Veredito |
|---|---|---|---|---|
| Banco por tenant | Máximo | Alto | Alta (N migrations) | ❌ inviável a R$ 49,90/mês |
| Schema por tenant | Alto | Médio | Alta | ❌ Prisma sofre |
| **Coluna `organizationId`** | Bom (com disciplina) | Baixo | Média | ✅ **escolhido** |

### Regras invioláveis

1. Toda tabela de domínio tem `organizationId String` + `@@index([organizationId])`.
2. **Todo `@unique` vira composto com `organizationId`.** Sem exceção.
3. `organizationId` **nunca** vem do body/query. Vem do token, via contexto de request.
4. Nenhum service usa o `PrismaClient` cru — só o client estendido.

### Implementação

```ts
// core/context/request-context.ts
import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
  userId: string;
  organizationId: string;
  membershipId: string;
  permissions: Set<string>;
  isPlatformAdmin: boolean;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getContext(): RequestContext {
  const ctx = requestContext.getStore();
  if (!ctx) throw new Error('Contexto de request ausente — rota fora do tenantMiddleware.');
  return ctx;
}
```

```ts
// core/prisma/tenant-extension.ts
const TENANT_MODELS = new Set([
  'Person', 'Member', 'Project', 'ProjectMember', 'ProjectPerson',
  'Transaction', 'AccountPlan', 'CostCenter', 'InstitutionalContext',
  'Attachment', 'Notification', 'AuditLog',
]);

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || !TENANT_MODELS.has(model)) return query(args);

        const { organizationId } = getContext();

        if (['findFirst','findMany','findUnique','update','updateMany',
             'delete','deleteMany','count','aggregate','groupBy'].includes(operation)) {
          args.where = { ...(args.where ?? {}), organizationId };
        }
        if (operation === 'create') {
          args.data = { ...args.data, organizationId };
        }
        if (operation === 'createMany') {
          args.data = (args.data as any[]).map(d => ({ ...d, organizationId }));
        }
        if (operation === 'upsert') {
          args.where  = { ...args.where,  organizationId };
          args.create = { ...args.create, organizationId };
        }
        return query(args);
      },
    },
  },
});

// escape hatch — SÓ para: login por e-mail, webhooks de billing, console da plataforma
export const prismaGlobal = basePrisma;
```

> ⚠️ `findUnique` com `where` composto exige `@@unique([organizationId, campo])` no schema. É outro motivo para a regra 2.

### Defesa em profundidade (Fase 5)
Ativar **RLS no Supabase** com `SET LOCAL app.current_org_id` dentro de `$transaction`. Segunda barreira caso a extensão falhe ou alguém use o client cru.

### Teste de isolamento (obrigatório na Fase 1)

```ts
// backend/tests/tenant-isolation.spec.ts
it.each(ALL_TENANT_ENDPOINTS)('%s não vaza dados entre organizações', async (endpoint) => {
  const a = await createOrgWithData();
  const b = await createOrg();
  const res = await request(app)
    .get(endpoint.replace(':id', a.recordId))
    .set('Authorization', `Bearer ${b.token}`);
  expect(res.status).toBe(404); // 404, não 403 — não revela existência
});
```

---

## 3. Autenticação

```
POST /auth/signup     → cria User + Organization + Membership(OWNER) + Subscription(TRIALING)
POST /auth/login      → { accessToken } + refreshToken em cookie httpOnly
POST /auth/refresh    → rotaciona o refresh token (o antigo é invalidado)
POST /auth/logout     → revoga o refresh token
POST /auth/switch-org → novo accessToken com outro organizationId
```

| Token | Formato | Validade | Onde fica |
|---|---|---|---|
| Access | JWT (`sub`, `orgId`, `membershipId`, `permVersion`) | 15 min | Memória do front (nunca `localStorage`) |
| Refresh | Opaco (32 bytes), **hash SHA-256 no banco** | 30 dias | Cookie `httpOnly; Secure; SameSite=Lax` |

- Rotação de refresh com detecção de reuso → revoga toda a família de tokens.
- `permVersion` no JWT: ao alterar permissões de um papel, incrementa a versão da organização e os tokens antigos são rejeitados sem esperar 15 min.
- bcrypt cost 12. Rate limit agressivo em `/auth/login` e `/auth/forgot-password`.
- 2FA (TOTP) como recurso do plano Institucional.

---

## 4. RBAC — grupos de acesso por organização

```
User ──< Membership >── Organization
                │
                └──> Role ──< permissions[] >
```

Um usuário pode ter membership em **várias** organizações (contador que atende 5 institutos, líder de startup do portfólio). O `Role` pertence a uma organização — cada instituto tem os seus.

### Catálogo de permissões (`packages/shared/src/permissions.ts`)

Formato: `modulo.recurso:acao`

```ts
export const PERMISSIONS = {
  // Organização
  'org.settings:read', 'org.settings:update',
  'org.members:read', 'org.members:invite', 'org.members:update', 'org.members:remove',
  'org.roles:read', 'org.roles:manage',
  'org.billing:read', 'org.billing:manage',
  'org.audit:read',

  // Pessoas & Rede
  'people.persons:read', 'people.persons:create', 'people.persons:update', 'people.persons:archive',
  'people.employees:read_sensitive',   // salário, dados bancários

  // Projetos
  'projects:read', 'projects:create', 'projects:update', 'projects:delete',

  // Financeiro
  'finance.transactions:read', 'finance.transactions:create',
  'finance.transactions:update', 'finance.transactions:delete', 'finance.transactions:approve',
  'finance.account_plans:manage', 'finance.cost_centers:manage',

  // Relatórios
  'reports:read', 'reports:export',
} as const;
```

### Papéis semeados em cada nova organização

| Papel | Permissões | Editável |
|---|---|---|
| **Administrador** (OWNER) | todas | ❌ (protegido, mínimo 1 por org) |
| **Diretor** | leitura ampla + aprovação financeira + projetos | ✅ |
| **Financeiro** | módulo financeiro completo + relatórios | ✅ |
| **Comercial** | pessoas (doadores/parceiros) + leitura de projetos | ✅ |
| **Projetos** | projetos completo + leitura financeira do projeto | ✅ |
| **Leitor** | somente leitura, sem dados sensíveis | ✅ |

Papéis **customizados** são recurso do plano Gestão em diante.

### Aplicação

```ts
// backend
router.post('/transactions',
  authenticate,
  tenantContext,
  requirePermission('finance.transactions:create'),
  requireEntitlement('finance.base'),
  validate(createTransactionSchema),
  controller.create,
);
```

```tsx
// frontend — esconde a UI, NUNCA é a única barreira
const { can } = usePermission();
{can('finance.transactions:create') && <Button type="primary">Novo lançamento</Button>}
```

---

## 5. Planos e entitlements

Planos vivem em banco, não em `if` no código.

```ts
// core/billing/entitlements.ts
export async function getEntitlements(orgId: string) { /* cache 60s */ }
export function requireEntitlement(feature: string) { /* 402 se não tiver */ }
export async function checkLimit(orgId: string, limit: 'users' | 'projects' | 'storage_mb') {
  // { used, max, exceeded }
}
```

Resposta padronizada ao bater limite (o front usa para mostrar o upsell certo):

```json
{
  "error": "LIMIT_EXCEEDED",
  "limit": "users",
  "used": 3,
  "max": 3,
  "message": "Seu plano Essencial permite 3 usuários.",
  "upgradeTo": "gestao"
}
```

---

## 6. Armazenamento de arquivos

Supabase Storage, **nunca base64 no Postgres**.

```
bucket: sigetes-files (privado)
  org/{organizationId}/transactions/{transactionId}/{uuid}-{nome}.pdf
  org/{organizationId}/persons/{personId}/documents/{uuid}-{nome}.pdf
  org/{organizationId}/branding/logo.png
```

- Upload: front pede URL assinada ao backend → envia direto ao Storage → confirma no backend (que grava metadados em `Attachment`).
- Download: URL assinada com 5 min de validade, gerada **após** checar permissão e tenant.
- Limite por plano somando `Attachment.sizeBytes` (denormalizado em `Organization.storageUsedBytes`).
- Whitelist de MIME types desde o dia 1. Antivírus na Fase 5.

---

## 7. Design System — Ant Design v6 no ERP, Tailwind na landing

### Decisão (ADR-002 + ADR-003)

Duas zonas, com fronteira por rota — mas a fronteira é sobre **componente**,
não sobre **classe utilitária**. Ver `docs/adr/003-tailwind-utilitario-no-erp.md`
para o histórico: a versão original desta regra proibia Tailwind inteiro
dentro do ERP, o que purgava o próprio acabamento visual que dava ao
`erp-gemini` (referência de design) sua aparência polida. Foi corrigida.

| Zona | Rotas | Componentes | Acabamento visual | Por quê |
|---|---|---|---|---|
| 🟢 **App** | `/app/*`, `modules/*`, `pages/auth/*` | **Ant Design v6** (única fonte de comportamento de componente) | Classes Tailwind por cima (spacing, raio, sombra, cor de estado) | O antd cobre tabela/formulário/filtro/upload/date picker; o Tailwind dá o acabamento que o antd sozinho não tem |
| 🟡 **Marketing** | `/`, `/planos`, `/recursos`, `pages/marketing/*` | Tailwind puro | Tailwind puro | Público, precisa de diferenciação visual, peso baixo e pré-renderização |

**Regra rígida (o que não mudou):** `pages/marketing/*` nunca importa
`antd`. Nenhuma zona usa `shadcn/ui`, `radix-ui` ou qualquer lib de
componente fora do antd. Cor sempre via token (`colors.js`/`tokens.ts`),
nunca hex literal.

**O que mudou:** classe utilitária do Tailwind (`rounded-2xl`, `shadow-soft`,
`gap-4`, `bg-primary-50` etc.) é permitida e esperada dentro de `modules/*` e
`pages/auth/*`, para reproduzir os padrões visuais documentados em
`docs/DESIGN_SYSTEM.md` — sidebar escura, card de KPI, badge de status, tela
de autenticação dividida.

Ver `docs/DESIGN_SYSTEM.md` para a especificação completa (paleta extraída
da logo, tipografia, padrões de componente, checklist de aceite visual).

### Configuração de tema

O antd v6 usa **CSS Variables por padrão**, o que dá troca de tema em tempo real — exatamente o que o white-label precisa.

> ⚠️ `zeroRuntime: true` (modo estático, sem custo de geração de CSS em runtime)
> **exige** importar o CSS pré-compilado do antd manualmente ou rodar
> `@ant-design/static-style-extract` no build — sem isso, os componentes
> renderizam sem estilo nenhum (foi um bug real na Fase 1: inputs e botões
> saíam como HTML puro). Não ativar até essa extração estar configurada — ver
> item de performance 🟢 mais abaixo.

A paleta em si **não é mais hardcoded aqui** — vem de `packages/config/theme/colors.js`
(fonte única, extraída por pixel da logo oficial — ver `docs/DESIGN_SYSTEM.md`
§1) via `packages/config/theme/tokens.ts`. Implementação de referência:

```tsx
// app/providers/ThemeProvider.tsx
import { BRAND } from '@sigetes/config/theme/tokens';
import { ConfigProvider, theme } from 'antd';
import ptBR from 'antd/locale/pt_BR';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // TODO (Fase 1): trocar BRAND.primary por organization?.brandColor
  // quando o white-label existir.
  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: BRAND.primary,
          colorInfo: BRAND.info,
          colorSuccess: BRAND.success,
          colorWarning: BRAND.warning,
          colorError: BRAND.danger,
          colorBgLayout: BRAND.bgLayout,
          colorTextBase: BRAND.textBase,
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
        },
        components: {
          Layout: { siderBg: BRAND.sidebarBg },
          Menu: {
            darkItemBg: BRAND.sidebarBg,
            darkItemSelectedBg: BRAND.primary,
            darkItemHoverBg: 'rgba(255,255,255,0.06)',
            itemBorderRadius: 12,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
```

> ⚠️ Nada de cor literal em componente. A cor vem do token, sempre — é isso que faz o white-label funcionar sem recompilar.

### `packages/ui` — wrappers, não reimplementações

Com o antd, o `packages/ui` deixa de ser "construir componente do zero" e vira uma camada fina que padroniza o uso, combinando comportamento do antd com o acabamento visual do Tailwind (ver `docs/DESIGN_SYSTEM.md` §5 e `docs/adr/003-tailwind-utilitario-no-erp.md`). Construir **antes** da Fase 2:

| Componente | O que faz |
|---|---|
| `DataTable` | Wrapper do `Table` do antd com paginação **server-side** obrigatória, loading, empty state, export e persistência de filtro na URL |
| `PageShell` | Título, breadcrumb, ações, tabs |
| `FormField` | `Form.Item` + máscaras BR (CPF, CNPJ, CEP, telefone, moeda) |
| `CurrencyInput` | `InputNumber` configurado em BRL, casando com `Decimal` do backend |
| `StatCard` | Card de KPI — label, valor em destaque, ícone com badge de cor (padrão em `DESIGN_SYSTEM.md` §5.4) |
| `StatusBadge` | Chip de status com a paleta de cor semântica (padrão em `DESIGN_SYSTEM.md` §5.5) |
| `PermissionGate` / `EntitlementGate` | Esconde ou bloqueia com upsell |
| `ConfirmDialog`, `EmptyState` | Padronização de uso |

### Performance — o que realmente importa

A biblioteca de UI **não** é o gargalo. Na ordem de impacto real:

1. 🔴 **Paginação server-side em toda listagem.** `findMany()` sem `take` é bug.
2. 🔴 **TanStack Query** para cache — sem isso, refetch a cada navegação.
3. 🟠 **Code splitting por rota** com `React.lazy`. O ERP inteiro num bundle é o pior cenário.
4. 🟠 **`Table` virtual do antd** em listas grandes; `rowKey` estável e memoização de `columns`.
5. 🟠 **Anexos fora do banco.**
6. 🟢 Import de `@ant-design/icons` — importar ícone por ícone, nunca o barrel inteiro.
7. 🟢 `zeroRuntime: true` + `@ant-design/static-style-extract`.

### Responsividade
Mobile-first. `Sider` vira `Drawer` no mobile. `DataTable` troca para lista de `Card` abaixo de 768px (prop `responsive` no wrapper). Formulários longos viram `Steps`. Alvo: usável de verdade em 375px.

---

## 8. Stack

Confirmada e complementada:

| Camada | Escolha |
|---|---|
| Backend | Node 22, Express 5, TypeScript, Prisma 7, PostgreSQL (Supabase), Zod, JWT |
| Frontend | React 19, Vite, TypeScript, **Ant Design v6**, `@ant-design/icons` |
| Landing | **Tailwind**, `framer-motion`, pré-render (`vite-react-ssg`) |
| Estado de servidor | **TanStack Query** ⭐ obrigatório |
| Formulários | `Form` do antd **ou** react-hook-form + zodResolver — escolher um e padronizar |
| Datas | `dayjs` (é o que o antd usa internamente) |
| Gráficos | `echarts-for-react` (já em uso) |
| Dinheiro | `Prisma.Decimal` |
| Testes | Vitest + Supertest + Testing Library |
| Observabilidade | `pino` + Sentry |
| E-mail / Arquivos | Resend · Supabase Storage · ExcelJS · PDFKit |
| Segurança | helmet, cors, express-rate-limit |
| Build | Turborepo |

> `shadcn/ui`, `lucide-react`, `TanStack Table` e `date-fns` **saem** da stack do ERP. `lucide-react` pode ficar só na landing, se quiser.

---

## 9. Segurança e LGPD

- Helmet, CORS com whitelist, rate limit global + por rota sensível
- Validação Zod em **toda** entrada; nada de `any` vindo do body
- Auditoria imutável (`AuditLog` append-only) com `organizationId`, ator, IP, antes/depois
- Segredos só em variáveis de ambiente, validadas com Zod no boot
- **A SIGETES é operadora dos dados pessoais dos clientes** (doadores, voluntários, assistidos):
  - DPA anexo aos Termos de Uso
  - Export completo dos dados da organização (JSON + CSV) por autoatendimento
  - Exclusão definitiva em até 30 dias após cancelamento, com aviso prévio
  - Política de retenção documentada; anonimização onde houver obrigação contábil
  - Encarregado (DPO) nomeado e publicado na landing
- Backup: PITR do Supabase + dump diário fora do provedor

---

## 10. Padrões de API

- Base: `/api/v1`
- Envelope de listagem: `{ data: [], meta: { page, pageSize, total, totalPages } }`
- Erros: `{ error: 'CODE', message: string, details?: ZodIssue[] }`
- Códigos: `400` validação · `401` sem auth · `403` sem permissão · `402` sem entitlement · `404` inexistente **ou de outro tenant** · `409` conflito · `429` rate limit
- Idempotência em webhooks (`WebhookEvent` com `@@unique([gateway, externalId])`)
- Paginação server-side em toda listagem, sempre
