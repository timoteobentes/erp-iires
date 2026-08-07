# Landing Page — Estrutura, Copy e SEO

---

## 0. ⚠️ Zona Tailwind — sem Ant Design

Por decisão do ADR-002, tudo em `pages/marketing/*` usa **Tailwind puro**. Nenhum `import ... from 'antd'` nesta zona: a landing precisa ser leve, pré-renderizada e visualmente distinta do painel. Carregar a biblioteca inteira do antd para mostrar texto e dois botões derruba o Lighthouse e dá cara de sistema administrativo para a página de vendas.

---

## 1. Decisão de arquitetura

| Opção | Prós | Contras | Veredito |
|---|---|---|---|
| Rotas públicas no mesmo app Vite | Um projeto, um deploy, tokens e componentes compartilhados | SPA pura = SEO ruim | ⚠️ só com pré-render |
| **Vite + `vite-react-ssg`** | HTML estático nas rotas de marketing, resto continua SPA | Uma dependência a mais | ✅ **recomendado** |
| App separado em Astro | Melhor performance e SEO possível | Segundo projeto, segundo design system | Considerar na Fase 4 se marketing virar prioridade |

**Recomendação:** `/`, `/planos`, `/recursos`, `/para-quem`, `/contato`, `/termos`, `/privacidade` pré-renderizadas; `/app/*` continua SPA autenticada.

**Por que importa:** o público-alvo busca no Google por *"sistema de gestão para ONG"*, *"software prestação de contas terceiro setor"*, *"ERP para instituto"*. É tráfego de intenção alta e custo zero. Uma SPA que entrega `<div id="root"></div>` para o crawler desperdiça isso.

---

## 2. Estrutura de seções

### 0. Barra de navegação (sticky)
Logo · Recursos · Planos · Para quem é · Blog · **Entrar** · **[Testar grátis]** (botão primário)
Mobile: hambúrguer → drawer próprio em Tailwind (não usar `Drawer` do antd aqui).

### 1. Hero
```
H1:   A gestão completa do seu instituto, sem planilha e sem retrabalho.
Sub:  Financeiro, projetos, doadores, voluntários e prestação de contas
      em um só lugar. Feito para institutos, associações e fundações
      que precisam prestar contas com transparência.

[Testar grátis por 14 dias]  [Ver planos]
✓ Sem cartão de crédito   ✓ Configuração em 10 minutos   ✓ Suporte em português
```
**Visual:** mockup do dashboard real (não ilustração genérica), levemente inclinado, com `framer-motion` fazendo fade-up sutil na entrada. Fundo com gradiente suave do `primary` ao branco.

### 2. Prova social
> "Em operação no IIRes da Amazônia — mais de X projetos e R$ Y sob gestão."

Comece honesto com um cliente só. Uma logo real vale mais do que seis placeholders.

### 3. O problema (agitação)
```
H2: Você reconhece alguma dessas?
```
Quatro cards com ícone (lucide-react é permitido nesta zona):
- 🗂️ **Dados espalhados** — planilha do financeiro, lista de voluntários no WhatsApp, contratos no Drive
- 📉 **Prestação de contas no sufoco** — três dias de trabalho toda vez que um financiador pede relatório
- 🔒 **Todo mundo vê tudo** — ou ninguém vê nada, porque o controle é uma planilha compartilhada
- 🔁 **Retrabalho** — o mesmo doador cadastrado em quatro lugares diferentes

### 4. Módulos
```
H2: Tudo que a sua organização faz, em um sistema só.
```
Grid 3×2 (1 coluna no mobile), cards com ícone, título e 2 linhas. Animação escalonada no scroll.

| Módulo | Descrição curta |
|---|---|
| 💰 Financeiro | Contas a pagar e receber, plano de contas do terceiro setor, centros de custo e fluxo de caixa |
| 📁 Projetos | Cronograma, equipe, orçamento previsto × realizado e progresso por projeto |
| 🤝 Doadores e parceiros | Cadastro completo, histórico de doações, recibos e recorrência |
| 🙋 Voluntários | Ficha, habilidades, disponibilidade, horas doadas e termo de adesão gerado automaticamente |
| 👥 Equipe | Colaboradores, vínculos, documentos e grupos de acesso por área |
| 📊 Relatórios | Prestação de contas por projeto e convênio, exportação em PDF e Excel |

### 5. Diferenciais
```
H2: Feito para quem presta contas.
```
- **Plano de contas do terceiro setor já configurado.** Você não começa do zero.
- **Prestação de contas por projeto e por convênio.** Relatório pronto para o financiador.
- **Grupos de acesso por área.** O financeiro vê o financeiro. O comercial vê o comercial.
- **Conformidade com a LGPD.** Dados de doadores e assistidos tratados com o cuidado que a lei exige.
- **Preço público.** Sem "fale com um consultor" para descobrir quanto custa.

### 6. Como funciona
Três passos horizontais, numerados, com linha conectora:
1. **Crie sua conta** — informe o CNPJ; buscamos os dados institucionais automaticamente
2. **Convide a equipe** — defina quem acessa o quê
3. **Comece a lançar** — importe sua planilha ou lance direto

### 7. Planos
Toggle **Mensal / Anual (2 meses grátis)** com animação de troca de preço.
Quatro cards; "Gestão" com borda `primary` e selo *Mais popular*.
Link discreto: *"Organização com CEBAS, OSCIP ou Utilidade Pública? Veja o Programa Impacto."*

### 8. Depoimento
Foto, nome, cargo, organização. Um depoimento verdadeiro do IIRes vale mais que três genéricos.

### 9. FAQ (accordion)
- Preciso de cartão de crédito para testar?
- Meus dados ficam seguros? Onde são armazenados?
- Consigo importar meus dados de planilha?
- E se eu precisar cancelar? Perco meus dados?
- Serve para associação/fundação/OSCIP ou só para instituto?
- Vocês emitem nota fiscal?
- Quantas pessoas da minha equipe podem usar?

### 10. CTA final
Faixa `primary` com texto branco:
```
H2: Sua organização merece uma gestão à altura da sua missão.
[Testar grátis por 14 dias]
```

### 11. Rodapé
Quatro colunas — Produto · Empresa · Recursos · Legal
Legal: Termos de Uso · Política de Privacidade · LGPD e Encarregado (DPO) · CNPJ e endereço da empresa.

---

## 3. Alternativas de headline para teste

| # | Headline | Ângulo |
|---|---|---|
| 1 | A gestão completa do seu instituto, sem planilha e sem retrabalho. | Dor operacional |
| 2 | Prestação de contas pronta em minutos, não em dias. | Dor específica e aguda |
| 3 | O sistema de gestão feito para quem transforma vidas. | Emocional/missão |
| 4 | Financeiro, projetos e pessoas do seu instituto — em um só lugar. | Descritivo/claro |

Comece com a **1** (equilibra clareza e dor) e teste a **2** — que é a dor mais aguda e mais cara desse público.

---

## 4. SEO

- Meta title: `SIGETES — Sistema de Gestão do Terceiro Setor`
  > 🎯 O nome por extenso **já é a palavra-chave principal**. Isso é uma vantagem real: title, H1 e nome da marca coincidem, o que é raro. Use o nome completo no title, no rodapé e no primeiro parágrafo da home.
- Como a sigla é desconhecida, sempre apresentar expandida no primeiro contato: `SIGETES — Sistema de Gestão do Terceiro Setor`. Só usar a sigla sozinha depois que o usuário já está dentro do app.
- Meta description: até 155 caracteres, com o benefício principal e a chamada do trial
- OG image 1200×630 com o mockup do dashboard
- `sitemap.xml` + `robots.txt`
- JSON-LD: `SoftwareApplication` com `offers` (os preços) e `Organization`
- URLs em português: `/planos`, `/recursos`, `/para-quem-e`
- Palavras-alvo: *sistema de gestão para ONG*, *software para terceiro setor*, *ERP para instituto*, *prestação de contas ONG*, *sistema de gestão para associação*
- Blog em `/blog` a partir da Fase 5 — conteúdo sobre marco regulatório, prestação de contas, editais. É o que atrai esse público organicamente.

---

## 5. Performance e acessibilidade

- Alvo Lighthouse: 95+ em Performance e Acessibilidade
- Imagens em WebP com `width`/`height` explícitos (evita CLS)
- Fontes com `font-display: swap`, apenas os pesos usados
- `framer-motion` só nas seções visíveis; respeitar `prefers-reduced-motion`
- Contraste AA em todos os textos — atenção especial ao `#FFC107` sobre branco (**reprova**; usar só como fundo com texto escuro)
- Navegação completa por teclado no menu e no accordion

---

## 6. Analytics e conversão

- Plausible (leve, sem banner de cookie) ou GA4 (se precisar de Google Ads)
- Eventos: `cta_hero_click`, `cta_pricing_click`, `plan_selected`, `signup_started`, `signup_completed`, `trial_activated`
- Formulário de contato do plano Rede → e-mail + registro em banco
- Meta inicial realista: 2–4% de visitantes iniciando o trial
