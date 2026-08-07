# ADR-002: Ant Design v6 no ERP, Tailwind na landing — fronteira por rota

## Contexto

O frontend do SIGETES tem dois públicos com necessidades de UI muito diferentes:
- O **ERP** (`/app/*`) é feito de tabela, formulário, filtro, upload, date picker — um catálogo de componentes de painel administrativo.
- A **landing/marketing** (`/`, `/planos`, `/recursos`) é pública, precisa de diferenciação visual, peso de bundle baixo e pré-renderização para SEO.

## Opções consideradas

1. Uma única lib de UI para tudo (Tailwind + componentes próprios em ambos).
2. Ant Design em tudo.
3. **Ant Design v6 no ERP, Tailwind puro na landing — escolhido.**

## Decisão

Duas zonas, com fronteira rígida por diretório/rota:

| Zona | Rotas | Stack |
|---|---|---|
| 🟢 App | `modules/*`, `pages/auth/*` | Ant Design v6 |
| 🟡 Marketing | `pages/marketing/*` | Tailwind puro |

Regras:
- `pages/marketing/*` nunca importa `antd`.
- `modules/*` e `pages/auth/*` nunca usam classe Tailwind.
- Nenhuma cor literal em componente — vem sempre do token do `ConfigProvider` (antd) ou do config do Tailwind (marketing), o que é o que permite white-label sem recompilar.
- Com code splitting por rota, as duas stacks não devem carregar no mesmo chunk.

O antd v6 usa CSS Variables por padrão (`zeroRuntime: true`), o que permite trocar `colorPrimary` em tempo real por organização.

## Consequências

- `packages/ui` deixa de ser "construir componente do zero" e vira wrappers finos sobre o antd (`DataTable`, `PageShell`, `FormField`) — economiza ~3–4 semanas de desenvolvimento frente a um design system próprio.
- Precisa de disciplina para a fronteira não vazar (ex.: um botão Tailwind dentro de um módulo do ERP). Regra de lint dedicada fica para quando `modules/*` existir de fato (Fase 1+).
- Ant Design v6 é recente (lançado nov/2025) — em caso de dúvida sobre uma API, consultar `ant.design` em vez de assumir comportamento do v5.
