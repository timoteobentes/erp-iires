# IIRes ERP

Sistema Integrado de Gestão desenvolvido para a **IIRes da Amazônia** — plataforma modular para gerenciamento financeiro, projetos, doadores, voluntários e parceiros.

**Produção:**
- Frontend: https://system.iires.org (Vercel)
- Backend API: https://api.iires.org (Oracle Cloud — Ubuntu 22.04)

---

## Tecnologias

### Frontend
- **React 19** + **Vite** — SPA com HMR e builds otimizados
- **TypeScript** — tipagem estrita
- **Tailwind CSS 3** — estilização utilitária
- **Ant Design** — componentes de UI
- **React Router DOM 7** — roteamento client-side
- **React Hook Form** + **Zod** — formulários e validação
- **Axios** — cliente HTTP

### Backend
- **Node.js 22** + **Express 5** — servidor HTTP
- **TypeScript** — compilado para `dist/`
- **Prisma 7** + **PostgreSQL** (Supabase) — ORM e banco de dados
- **JWT** — autenticação
- **Helmet** + **CORS** — segurança
- **PDFKit** + **ExcelJS** — geração de relatórios
- **PM2** — gerenciador de processos em produção
- **Nginx** — reverse proxy

---

## Estrutura do Repositório

```text
erp/
├── backend/
│   ├── prisma/               # Schema, migrations e seed
│   ├── src/
│   │   ├── config/           # Prisma client
│   │   ├── modules/          # Módulos da aplicação (Financial, Reports, etc.)
│   │   ├── routes.ts         # Registro de rotas
│   │   ├── server.ts         # Entry point
│   │   └── shared/           # Middlewares e serviços compartilhados
│   ├── ecosystem.config.cjs  # Configuração PM2
│   └── tsconfig.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/           # Imagens e fontes
    │   ├── components/       # Componentes reutilizáveis (Sidebar, Header)
    │   ├── modules/          # Domínios (Login, Finance, Projects, etc.)
    │   └── routes/           # Rotas públicas e privadas
    └── vercel.json           # Rewrite rules para SPA
```

---

## Executar Localmente

### Backend

```bash
cd backend
npm install
cp .env.example .env        # preencha DATABASE_URL, JWT_SECRET, etc.
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev                 # http://localhost:3333
```

### Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

---

## Deploy no Servidor (Oracle Cloud)

### Primeira vez

```bash
# No servidor
cd ~/iires/erp-iires/backend

# Adicionar swap (evita OOM durante npm install)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile

npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run build

pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup   # execute o comando sudo gerado
```

### Atualizar após novo commit

```bash
cd ~/iires/erp-iires/backend
git pull
npm install
npx prisma generate
npx prisma migrate deploy   # aplica novas migrations, se houver
npm run build
pm2 restart iires-system-api
pm2 logs iires-system-api --lines 20
```

---

## Nginx (reverse proxy)

Arquivo: `/etc/nginx/sites-available/iires-api`

```nginx
server {
    listen 80;
    server_name api.iires.org;

    location / {
        proxy_pass         http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        client_max_body_size 20M;
    }
}
```

> O SSL é gerenciado pelo Cloudflare (modo Flexible). Não é necessário certificado no servidor.

---

## Variáveis de Ambiente (backend `.env`)

```env
DATABASE_URL=          # connection pooling (porta 6543)
DIRECT_URL=            # conexão direta (porta 5432) — usado pelo Prisma migrate
JWT_SECRET=
PORT=3333
FRONTEND_URL=https://system.iires.org
RESEND_API_KEY=        # envio de e-mails
```

---

*Time Tecnologia IIRes da Amazônia*
