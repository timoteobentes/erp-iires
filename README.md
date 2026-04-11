# IIRes ERP

Bem-vindo ao repositório principal do **IIRes ERP**, um Sistema Integrado de Gestão Empresarial desenvolvido para oferecer escalabilidade, organização estrutural e uma interface rica e moderna em toda a sua malha de funcionalidades.

## 📋 Sobre o Projeto

O IIRes ERP visa construir uma plataforma completa de gerenciamento com uma arquitetura modular. A aplicação foi concebida isolando de forma eficaz as responsabilidades de Frontend e Backend, mantendo porém tudo num único monorepo para facilitar o fluxo de desenvolvimento ágil.

---

## 🚀 Tecnologias Integradas

O software está dividido primariamente em duas frentes de trabalho.

### Frontend
Em fase de estruturação e polimento. Uma arquitetura modular com tipagem forte e design moderno está garantida:
- **Core**: [React 19](https://react.dev/) instanciado com [Vite](https://vitejs.dev/) garantindo HMR e builds ultra-rápidos
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) para segurança de tipos
- **Estilização**: [Tailwind CSS 3](https://tailwindcss.com/) acoplado ao PostCSS para utilitários ágeis
- **Roteamento**: [React Router DOM 7](https://reactrouter.com/)

### Backend
*(Em estruturação inicial)* O backend residirá na pasta `/backend` contendo a modelagem, controladores e toda a regra de negócio robusta que irá servir as APIs de integração pro Frontend.

---

## 📁 Estrutura do Repositório

```text
erp/
├── backend/                  # API e lógicas de servidor
├── frontend/                 # Aplicação React SPA
│   ├── public/               # Assets estáticos
│   └── src/
│       ├── assets/           # Arquivos globais (ex: global.css)
│       ├── components/       # Componentes React reutilizáveis/UI
│       ├── contexts/         # Contextos globais e Estados da aplicação (React Context)
│       ├── hooks/            # Custom Hooks
│       ├── layouts/          # Estruturas base de layout (Sidebar, Header, etc.)
│       ├── modules/          # Funcionalidades e Domínios da aplicação (ex: Login, Dashboard)
│       ├── pages/            # Telas de página final de cada rota
│       ├── routes/           # Definições de rotas (Private, Public, etc.)
│       ├── services/         # Integrações com API e requests (fetch, axios, etc.)
│       ├── types/            # Definições de tipos e interfaces TypeScript globais
│       └── utils/            # Funções utilitárias e máscaras de formatação
└── README.md
```

## ⚙️ Como Executar o Projeto Localmente

### 1. Clonando o Repositório

```bash
git clone https://github.com/seu-usuario/iires-erp.git
cd iires-erp
```

### 2. Rodando o Frontend

Navegue até a pasta frontend:
```bash
cd frontend
```

Instale as dependências e inicie o servidor:
```bash
npm install
npm run dev
```

A aplicação deverá rodar por padrão em `http://localhost:5173`. Você pode acessá-la em seu navegador preferido.

---

## 🛠 Padrões de Qualidade e Código

* **Modularidade Extrema**: Todas as features são mantidas dentro de sua própria "caixa", permitindo crescer sem confusão.
* **Tipagem Segura**: Utilização rigorosa do TypeScript para compilação segura.
* **Arquitetura Clean**: Padrões de separação de pastas seguem os conceitos de Clean Architecture.

---

*IIRes da Amazônia*
