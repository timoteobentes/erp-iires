# ADR-003: Tailwind utilitário dentro da zona antd (emenda ao ADR-002)

## Contexto

O ADR-002 estabeleceu duas zonas de UI: antd no ERP, Tailwind puro na
landing, com a regra "`modules/*` nunca usa classe Tailwind". Essa regra foi
implementada à risca — inclusive no `tailwind.config.js`, cujo `content`
ficou restrito a `pages/marketing/**`, purgando qualquer classe Tailwind
usada fora dali.

Resultado prático: as telas construídas na Fase 0/1 (Login, Signup,
AppLayout) são componentes antd sem nenhuma camada de acabamento visual —
sem raio de borda customizado, sem sombra, sem sidebar estilizada, sem os
paddings e spacing que davam ao `erp-gemini` (projeto de referência) sua
aparência polida.

Analisando o `erp-gemini`: o visual bom de lá **nunca veio do antd sozinho**.
Vinha da combinação antd (comportamento — `Table`, `Form`, `Menu`,
`DatePicker`) com Tailwind (acabamento — `rounded-2xl`, `shadow-soft`,
`gap-6`, cores de estado, sidebar escura customizada). O ADR-002 proibiu
exatamente a ferramenta que produzia o resultado que queríamos resgatar.

## Decisão

**Tailwind utilitário passa a ser permitido dentro da zona antd**
(`modules/*`, `pages/auth/*`) — para espaçamento, layout, raio, sombra e
cor de estado. O que continua proibido é outra coisa:

| Continua proibido | Passa a ser permitido |
|---|---|
| Componente de UI novo fora do catálogo do antd (recriar `Table`, `Select`, `DatePicker`) | Classe Tailwind de spacing/layout em cima de um componente antd |
| `shadcn/ui`, `radix-ui` ou qualquer lib de componente concorrente | `className` com `rounded-2xl`, `shadow-soft`, `gap-4`, `bg-primary-50` etc. |
| Cor hex literal fora de `colors.js`/`tokens.ts` | Uso das classes de cor geradas a partir de `colors.js` (`text-primary-600`) |
| `antd` dentro de `pages/marketing/*` | (sem mudança — regra original mantida) |

Ou seja: o antd continua sendo a única fonte de **comportamento** de
componente no ERP. O Tailwind é só a camada de **acabamento visual** por
cima — exatamente como era no projeto de referência.

## Mudanças técnicas

1. `frontend/tailwind.config.js`: `content` ampliado de
   `['./src/pages/marketing/**/*.{ts,tsx}']` para `['./src/**/*.{ts,tsx}']`.
2. `corePlugins.preflight: false` adicionado — o reset de estilos base já é
   feito pelo antd; rodar os dois resets juntos causa conflito sutil em
   `Button`/`Input` (padding, line-height).
3. Paleta Tailwind passa a ser a rampa completa de `packages/config/theme/colors.js`
   (a mesma fonte que alimenta os tokens do antd), não mais o tema padrão do
   Tailwind.
4. Ver `docs/DESIGN_SYSTEM.md` para os padrões concretos (card de KPI, badge
   de status, sidebar, tela de autenticação) que essa mudança destrava.

## Consequências

- A fronteira que importa deixa de ser "Tailwind sim/não" e passa a ser
  "componente novo sim/não". Isso é mais difícil de checar automaticamente
  por lint simples — fica para revisão de PR até existir uma regra de lint
  dedicada (ex.: proibir imports de libs de componente fora do antd).
- `packages/ui` continua sendo wrappers finos sobre o antd (`DataTable`,
  `StatCard`, `StatusBadge`, `PageShell`) — a diferença é que esses wrappers
  agora usam Tailwind por dentro para o acabamento, em vez de só props do
  antd.
- Nenhum impacto na zona de marketing — `pages/marketing/*` continua sem
  importar antd, regra original do ADR-002 mantida.
