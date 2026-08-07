# Gestão do Ecossistema de Empresas — Análise de Abordagens

**Contexto:** O IIRes possui projetos que resultaram em startups e empresas constituídas. Essas empresas são entidades independentes com seus próprios processos, equipes e projetos. Este documento apresenta três abordagens para que o ERP gerencie esse ecossistema.

---

## Contexto levantado

- Relação entre IIRes e as empresas: **parceria estratégica**
- As empresas possuem seus próprios projetos e equipes
- Por enquanto, **financeiro não precisa ser gerenciado por empresa** — apenas visibilidade de projetos e equipe
- Acesso: **equipe do IIRes + líderes de cada startup**, com isolamento (a startup só vê seus próprios dados)

---

## Abordagem 1 — Projeto-pai / Sub-projetos

### Como funciona

Adicionar um campo `projeto-pai` no modelo de Projeto (auto-referência). Cada empresa seria um projeto do IIRes, e os projetos internos da empresa seriam filhos desse projeto-pai.

```
Projetos IIRes
└── [Empresa XYZ]  ← projeto-pai
    ├── Projeto A da empresa
    ├── Projeto B da empresa
    └── Projeto C da empresa
```

### Vantagens

- Implementação simples e rápida — mínima mudança no banco de dados
- Aproveita toda a estrutura de projetos já existente
- Sem necessidade de novo módulo

### Desvantagens

- Não representa a independência jurídica das empresas (uma empresa não é um "projeto")
- Sem gestão de equipe própria por empresa — todos os membros continuam no pool do IIRes
- Sem controle de acesso isolado — os líderes das startups veriam todos os projetos do IIRes
- Não escala: adicionar financeiro ou outras entidades por empresa exigiria retrabalho

### Indicada quando

A empresa é uma iniciativa temporária do IIRes, não uma entidade com identidade própria de longo prazo.

---

## Abordagem 2 — Entidade "Empresa" própria *(Recomendada)*

### Como funciona

Criar um novo módulo **Portfólio de Empresas** com a entidade `Empresa`. Cada empresa tem seu próprio espaço de dados dentro do ERP, vinculado ao IIRes como parceira estratégica.

```
IIRes
├── Projetos do IIRes
├── Equipe do IIRes
└── Portfólio de Empresas
    ├── Empresa Alpha
    │   ├── Projetos da Alpha
    │   └── Equipe da Alpha
    ├── Empresa Beta
    │   ├── Projetos da Beta
    │   └── Equipe da Beta
    └── ...
```

### Modelo de dados

| Campo | Descrição |
|---|---|
| CNPJ | Identificação jurídica |
| Razão Social / Nome Fantasia | Identidade da empresa |
| Setor | Tecnologia, Saúde, Educação, etc. |
| Estágio | Pré-seed, MVP, Seed, Série A, Graduada |
| Status | Ativa, Pausada, Graduada, Encerrada |
| Vínculo com IIRes | Parceira estratégica, spin-off, investida, etc. |

### Controle de acesso

| Perfil | O que enxerga |
|---|---|
| Equipe IIRes | Tudo — projetos e pessoas do IIRes + visão consolidada do portfólio |
| Líder de startup | Apenas os projetos e a equipe da **sua empresa** |

### Navegação proposta

- **Equipe IIRes:** Dashboard → Portfólio (lista de empresas) → [empresa selecionada] → projetos e equipe da empresa
- **Líder de startup:** ao logar, cai diretamente no contexto da sua empresa

### Vantagens

- Reflete a realidade jurídica e operacional das empresas
- Isolamento de acesso por empresa sem complexidade de multi-tenant
- Escalável: quando necessário, adicionar financeiro por empresa é natural
- Base sólida para relatórios consolidados do portfólio (saúde das empresas, progresso, equipe total)

### Desvantagens

- Exige criação de novo módulo e ajustes no controle de acesso
- Prazo de implementação maior que a Abordagem 1
- Requer definição de quais campos e estágios fazem sentido para o contexto do IIRes

### Indicada quando

As empresas são entidades com identidade, equipe e projetos próprios que precisam ser gerenciados de forma independente dentro do ecossistema.

---

## Abordagem 3 — Multi-tenant completo

### Como funciona

Cada empresa recebe seu próprio **workspace isolado** dentro do sistema. A autenticação é feita por contexto (o usuário escolhe em qual organização está operando ao logar).

```
[IIRes]          → workspace próprio
[Empresa Alpha]  → workspace próprio
[Empresa Beta]   → workspace próprio
```

Todos os módulos (projetos, financeiro, pessoas, relatórios) são completamente separados por workspace.

### Vantagens

- Isolamento total de dados entre organizações
- Cada empresa poderia ter suas próprias configurações, planos de conta, centros de custo
- Modelo SaaS: potencial de transformar o ERP em produto para as empresas do portfólio

### Desvantagens

- Alta complexidade de implementação (autenticação por contexto, filtros em todas as queries, separação de dados)
- Custo de manutenção elevado
- Dificulta visão consolidada do portfólio pelo IIRes
- Requer reescrita significativa da base atual

### Indicada quando

O IIRes deseja oferecer o ERP como produto independente para as empresas do portfólio, com planos de monetização ou como benefício da aceleração.

---

## Comparativo resumido

| Critério | Abordagem 1 | Abordagem 2 *(Rec.)* | Abordagem 3 |
|---|:---:|:---:|:---:|
| Complexidade de implementação | Baixa | Média | Alta |
| Reflete independência das empresas | Não | Sim | Sim |
| Isolamento de acesso por empresa | Não | Sim | Sim |
| Visão consolidada do portfólio | Parcial | Sim | Complexo |
| Escalável para financeiro futuro | Não | Sim | Sim |
| Prazo estimado | Dias | Semanas | Meses |

---

## Recomendação

**Abordagem 2** é a que melhor equilibra fidelidade ao modelo de negócio do IIRes, viabilidade técnica e escalabilidade. Ela representa adequadamente as empresas como entidades independentes, permite controle de acesso granular para os líderes de cada startup, e abre caminho natural para adicionar financeiro por empresa no futuro — sem exigir reescrita do sistema.

A Abordagem 1 pode ser considerada como solução provisória de curto prazo caso haja necessidade urgente de registro de sub-projetos. A Abordagem 3 deve ser revisitada apenas se houver decisão estratégica de transformar o ERP em produto SaaS.

---

*Documento preparado para apresentação à liderança do IIRes — Junho 2026*
