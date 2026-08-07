# Design System — SIGETES

> Complementa `ARQUITETURA.md` (seção 7) e `docs/adr/003-tailwind-utilitario-no-erp.md`.
> Objetivo deste documento: dar ao Claude Code uma especificação completa o
> bastante para reformar as telas atuais (Login, Signup, AppLayout) e construir
> as próximas sem inventar padrão visual a cada tela nova.

---

## 0. O que estava errado e o que mudou

O ADR-002 original dizia *"`modules/*` nunca usa classe Tailwind"*. Isso foi
implementado à risca — inclusive tecnicamente: o `content` do
`tailwind.config.js` estava restrito a `pages/marketing/**`, então mesmo uma
classe Tailwind usada dentro de um módulo do ERP seria **purgada** do CSS
final. Resultado: as telas de Login e Signup são `Card` + `Form` do antd sem
nenhuma camada de acabamento — daí o visual "cru".

O ERP antigo (`erp-gemini`) nunca teve esse problema porque fazia o oposto:
usava o antd para *comportamento* (Table, Form, Menu, DatePicker) e o
Tailwind para *acabamento visual* — raio de borda, sombra, spacing, cores de
estado, sidebar escura, layout de tela cheia. É essa combinação que dá o
resultado polido, não o antd sozinho nem o Tailwind sozinho.

**Correção (ver ADR-003):** as duas zonas continuam existindo — nenhum
componente novo fora do catálogo do antd, nenhum shadcn/ui — mas dentro da
zona do ERP, classes utilitárias do Tailwind **são permitidas e esperadas**
para espaçamento, layout e visual. O `tailwind.config.js` foi corrigido para
escanear `src/**/*.{ts,tsx}` inteiro, e o preflight do Tailwind foi desligado
para não colidir com o reset do antd.

| | Antes (errado) | Agora |
|---|---|---|
| Classe Tailwind em `modules/*` | ❌ proibida e purgada | ✅ esperada, para spacing/layout/acabamento |
| Componente de UI em `modules/*` | antd | antd (continua) |
| Novo componente do zero (tipo shadcn) | — | ❌ continua proibido |
| `pages/marketing/*` | Tailwind puro | Tailwind puro (sem mudança) |

---

## 1. Fonte da paleta

A paleta **não** é mais a do `erp-gemini` (verde `#389334` / azul `#0047AF`).
É extraída da logo oficial do SIGETES (`frontend/public/logo-sigetes.png`),
por amostragem de pixel nas três cores de texto e nos quadrados do
ícone-mosaico:

| Elemento da logo | Cor extraída | Papel semântico |
|---|---|---|
| Letras "SIGE" | `#001F3D` (navy escuro) | `dark` — âncora neutra + sidebar |
| Letras "TE" | `#009082` (verde-azulado) | `primary` — cor de ação principal |
| Letra "S" final + quadrados azuis do mosaico | `#054EC0` (azul) | `secondary` / `info` |
| Quadrados verdes do mosaico | `#1D9D19` (verde) | `success` |

Cada cor virou uma rampa de 10 tons (50→900), pela mesma técnica do
`erp-gemini`: mistura linear com branco para os tons claros, com preto para
os escuros. `warning` (âmbar) e `danger` (vermelho) **não vêm da logo** — são
funcionais, mantidos por convenção de UI (alerta / erro), como já eram no
projeto antigo.

Fonte única: `packages/config/theme/colors.js`. Import em dois lugares —
`tokens.ts` (deriva o `BRAND` para o `ConfigProvider` do antd) e
`tailwind.config.js` (usa a rampa completa como paleta Tailwind). **Nunca
declarar uma dessas cores em outro lugar.**

---

## 2. Paleta completa

| Tom | `primary` (teal) | `secondary` (azul) | `success` (verde) | `dark` (navy) |
|---|---|---|---|---|
| 50  | `#F2F9F9` | `#F2F6FC` | `#F4FAF4` | `#F2F4F5` |
| 100 | `#E3F3F1` | `#E4ECF8` | `#E6F4E6` | `#E3E6EA` |
| 200 | `#BFE3E0` | `#C0D3EF` | `#C6E6C6` | `#BFC7CE` |
| 300 | `#94D0CA` | `#96B5E5` | `#A0D69E` | `#94A1AE` |
| 400 | `#57B6AC` | `#5A8AD5` | `#6ABE67` | `#576B7F` |
| **500 (base)** | **`#009082`** | **`#054EC0`** | **`#1D9D19`** | **`#001F3D`** |
| 600 | `#007C70` | `#0443A5` | `#198716` | `#001B34` |
| 700 | `#00655B` | `#043786` | `#146E12` | `#00162B` |
| 800 | `#004E46` | `#032A68` | `#10550E` | `#001121` |
| 900 | `#003A34` | `#021F4D` | `#0C3F0A` | `#000C18` |

Funcionais (não vêm da logo): `warning` base `#FFC107`, `danger` base
`#DC2626` — rampas completas em `colors.js`.

Neutros de layout: `background` `#F8F9FA` (fundo da aplicação), `surface`
`#FFFFFF` (cards, header).

### Mapeamento para o antd (`ConfigProvider`)

```
colorPrimary  → primary.500   (#009082)
colorInfo     → secondary.500 (#054EC0)
colorSuccess  → success.500   (#1D9D19)
colorWarning  → warning.500   (#FFC107)
colorError    → danger.500    (#DC2626)
colorTextBase → dark.500      (#001F3D)
```

Já implementado em `ThemeProvider.tsx` — inclusive os `components.Menu.dark*`
para a sidebar (ver §5.2). **Não sobrescrever token do antd via CSS** — se
faltar um token, adicionar em `components` no `ThemeProvider`, não em
`global.css`.

### Regra de white-label

`colorPrimary` vem de `Organization.brandColor` quando existir (plano
Institucional), com `BRAND.primary` como fallback. Isso só funciona se
**nenhuma tela usar a cor primária como hex literal** — sempre `primary-500`
(Tailwind) ou `colorPrimary`/`Card`/`Button` padrão (antd), nunca
`style={{ color: '#009082' }}`.

---

## 3. Tipografia

- **Inter** para todo o texto de interface — títulos, corpo, formulários.
- **Roboto Mono** para números: valores monetários, datas em tabela, códigos.
  Aplicar via `font-mono` do Tailwind ou `<Text style={{ fontFamily: 'var(--font-mono)' }}>`
  em componentes antd que exibem valor financeiro.
- A fonte cursiva **Caveat** do projeto antigo **não volta** — não combina
  com um sistema institucional multi-organização.
- Pesos: 600–700 para títulos de página e valores de destaque (KPI), 500 para
  labels e cabeçalho de tabela, 400 para corpo.
- `tracking-tight` em títulos grandes (`text-2xl` +), `tracking-wider` +
  `uppercase` em labels pequenos de KPI (padrão do card de estatística, §5.4).

---

## 4. Espaçamento, raio e sombra

| Token | Valor | Uso |
|---|---|---|
| `rounded-lg` (antd padrão) | 8px | Input, Button, Select |
| `rounded-xl` | 12px | Ícone em badge, item de menu, chip de status |
| `rounded-2xl` | 16px | Card, painel, container de página |
| `shadow-soft` | `0 2px 10px rgba(0,31,61,.06)` | Estado de repouso de qualquer `Card` |
| `shadow-card` | `0 8px 30px rgba(0,31,61,.10)` | Hover de card interativo, dropdown, modal |

Padrão de elevação: cards começam em `shadow-soft` e sobem para `shadow-card`
no hover, com `transition-all duration-300`. Não pular direto para
`shadow-card` em repouso — fica pesado numa tela com muitos cards.

Grid de página: `Row`/`Col` do antd com `gutter={[24, 24]}` para os
containers principais; `gap-4`/`gap-6` do Tailwind dentro de um card para
subelementos.

---

## 5. Padrões resgatados do `erp-gemini`

Cada padrão abaixo existia no projeto antigo e funcionava bem — a mudança é
só a paleta (e, na tela de auth, a arte).

### 5.1 Layout de autenticação — tela dividida

Duas colunas: formulário à esquerda (~40–45% da largura, `lg:w-[45%]`),
painel gráfico à direita (`lg:w-[55%]`, escondido abaixo de `lg`).

```tsx
<div className="min-h-screen w-full flex bg-white overflow-hidden">
  <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center flex-shrink-0">
    {/* AuthForm */}
  </div>
  <div className="hidden lg:flex lg:w-[55%] xl:w-[60%]">
    {/* AuthHero */}
  </div>
</div>
```

O painel direito usa gradiente com as cores da marca — **trocar** o gradiente
verde→azul-escuro do IIRes por `primary`→`dark`:

```tsx
<div className="relative w-full h-full bg-gradient-to-br from-primary-600 to-dark-500 text-white p-12 xl:p-24 flex flex-col justify-center overflow-hidden">
  <h2 className="text-[44px] font-semibold leading-[1.15] tracking-tight max-w-xl relative z-10">
    A gestão que sustenta a sua missão.
  </h2>
</div>
```

O elemento gráfico de fundo do ERP antigo era a logo do IIRes gigante e
desbotada no canto inferior direito. **Trocar pelo ícone-mosaico** da logo
SIGETES (os quadrados verde→teal→azul, sem o texto) — extrair esse ícone
isolado como SVG/PNG e aplicar do mesmo jeito:

```tsx
<div className="absolute bottom-[-15%] right-[-10%] w-[700px] opacity-10 pointer-events-none select-none">
  <img src="/icone-mosaico-sigetes.png" alt="" />
</div>
```

> 📌 Ainda não existe esse ícone isolado (sem o texto "SIGETES") como
> arquivo separado. Extrair da logo original ou pedir arte nova antes de
> implementar este detalhe — não é bloqueante para o resto da reforma.

Formulário: `Form` do antd, mas com os inputs redimensionados via className
(`rounded-lg`, `focus:ring-4 focus:ring-primary-500/10`), label pequeno acima
de cada campo, botão primário `block` ocupando a largura toda.

### 5.2 Sidebar escura

`Layout.Sider` do antd com fundo `dark.500` (não uma sombra mais escura da
rampa — o navy da marca já é escuro o bastante, ver `tokens.ts`). Logo no
topo, colapsa para só o ícone-mosaico quando `collapsed`.

Estilo do `Menu` via **tokens do antd**, não CSS solto (já em
`ThemeProvider.tsx`):
- `darkItemSelectedBg: primary.500`, texto branco — item ativo vira um
  "pill" verde-azulado dentro da sidebar navy.
- `darkItemHoverBg: rgba(255,255,255,.06)` — overlay translúcido, não outra
  cor da rampa (o navy já está perto do limite escuro da rampa; escurecer
  mais não gera contraste visível).
- `itemBorderRadius: 12`, `itemMarginBlock: 4` — itens como blocos
  arredondados com respiro entre eles, não uma lista colada.

### 5.3 Header

`Layout.Header` branco, sticky, `shadow-soft`, com busca global à esquerda
(`Input` borderless dentro de um `bg-background rounded-xl`) e
notificações + avatar à direita. Botão de collapse da sidebar com ícone
`lucide-react` (`AlignLeft` / `Menu`), não o ícone padrão do antd.

### 5.4 Card de estatística (KPI)

O padrão mais replicável do projeto antigo — usar em todo dashboard e
página de resumo:

```tsx
<Card className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-all duration-300">
  <div className="flex justify-between items-start">
    <div>
      <p className="text-dark-400 text-sm font-semibold mb-1 uppercase tracking-wider">
        Total Captado
      </p>
      <h3 className="text-3xl font-bold text-dark-500 tracking-tight font-mono">
        {formatCurrency(value)}
      </h3>
    </div>
    <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary-50">
      <TrendingUp size={24} className="text-primary-600" />
    </div>
  </div>
</Card>
```

Cor do badge do ícone segue o significado do KPI, não é sempre `primary`:
financeiro positivo → `primary`, projetos → `secondary` ou `warning`,
pessoas → `success`. Ver tabela de status em §5.5 para a mesma lógica.

Este é o candidato natural a virar `StatCard` em `packages/ui` — mesma ideia
do `DataTable`, um wrapper fino, não um componente novo do zero.

### 5.5 Badge de status (tag)

Chip suave: fundo muito claro da rampa (`50`), texto no tom `600`, borda no
tom `200`. Nunca a cor sólida cheia (`500`) como fundo de um badge de texto —
fica pesado; a cor cheia é para ações (`Button`), não para rótulos.

```tsx
const STATUS: Record<Status, { label: string; className: string }> = {
  active:    { label: 'Em Andamento', className: 'bg-primary-50 text-primary-600 border-primary-200' },
  planning:  { label: 'Planejamento', className: 'bg-secondary-50 text-secondary-600 border-secondary-200' },
  completed: { label: 'Concluído',    className: 'bg-success-50 text-success-600 border-success-200' },
  blocked:   { label: 'Bloqueado',    className: 'bg-danger-50 text-danger-600 border-danger-200' },
  draft:     { label: 'Rascunho',     className: 'bg-dark-50 text-dark-400 border-dark-200' },
};

<span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${STATUS[status].className}`}>
  {STATUS[status].label}
</span>
```

Candidato a `StatusBadge` em `packages/ui`.

### 5.6 Scrollbar customizado

Fino (6px), transparente em repouso, `dark.200` no thumb, `dark.400` no
hover. Já em `global.css` — não precisa reimplementar por tela.

---

## 6. O que continua proibido

Para não reabrir a porta que o ADR-002 tentava fechar:

- ❌ Nenhum componente novo de UI genérico fora do catálogo do antd
  (nada de reconstruir `Table`, `Select`, `DatePicker` em Tailwind puro).
- ❌ `shadcn/ui`, `radix-ui` ou qualquer outra lib de componente — o antd é a
  única fonte de comportamento de componente no ERP.
- ❌ Cor literal (`#009082`, `style={{ color: ... }}`) fora de `colors.js` /
  `tokens.ts`. Sempre `primary-500`/`bg-primary-50` (Tailwind) ou token do
  antd.
- ❌ `pages/marketing/*` importando `antd`. A landing continua Tailwind puro
  — isso não mudou.

O que passa a ser permitido é só o **uso de utilitário de layout e
acabamento do Tailwind dentro do antd** — não uma segunda linguagem de
componente.

---

## 7. Checklist de aceite visual

Antes de considerar uma tela pronta:

- [ ] Nenhuma cor hex fora de `colors.js`/`tokens.ts`
- [ ] Cards em `rounded-2xl shadow-soft`, com `hover:shadow-card` se forem clicáveis
- [ ] Números monetários em `font-mono`
- [ ] Título de página em `tracking-tight`, peso 600+
- [ ] Testada em 375px de largura (mobile) — sidebar vira `Drawer`, tabela
      vira lista de cards (ver `ARQUITETURA.md` §7, responsividade)
- [ ] Estados vazios (`EmptyState`) e de carregamento (`Skeleton`) tratados,
      não só o estado "com dados"

---

## 8. Prompt de execução para o Claude Code

Colar no Claude Code depois que os arquivos de config deste pacote
(`colors.js`, `tokens.ts`, `tailwind.config.js`, `global.css`,
`ThemeProvider.tsx`) já estiverem no repositório:

```
Leia @docs/DESIGN_SYSTEM.md e @docs/adr/003-tailwind-utilitario-no-erp.md.

Os arquivos de configuração de tema já foram atualizados (colors.js,
tokens.ts, tailwind.config.js, global.css, ThemeProvider.tsx). Importe
global.css em main.tsx se ainda não estiver importado.

Reforme as telas existentes seguindo a seção 5 do DESIGN_SYSTEM.md:

1. Login.tsx e Signup.tsx → layout de tela dividida (§5.1). Extraia o
   ícone-mosaico da logo se possível, ou deixe o painel direito só com
   o gradiente por enquanto.
2. AppLayout.tsx → Sider escuro (§5.2) + Header (§5.3), com o Menu já
   usando os component tokens do antd (não precisa CSS novo).

Não crie componentes de UI novos fora do antd. Use classes Tailwind
livremente para espaçamento e acabamento, dentro dos padrões da seção 5.
Me mostre o plano de arquivos antes de implementar.
```
