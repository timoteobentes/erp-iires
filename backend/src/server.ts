import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes.js';
import { auditMiddleware } from './shared/middlewares/audit.middleware.js';

const app = express();

// Origens permitidas — CORS deve vir ANTES de helmet()
const allowedOrigins = [
  'http://localhost:5173',   // Vite dev
  'http://localhost:4173',   // Vite preview
  'https://system.iires.org',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permite sem origin (Insomnia, Postman, curl, SSR)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origem não permitida — ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Preflight OPTIONS deve ser respondido antes de qualquer outro middleware
app.options('/(.*)', cors(corsOptions));
app.use(cors(corsOptions));

app.use(helmet());

app.use(express.json({ limit: '15mb' }));
app.use(auditMiddleware);

// Rota de Teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor IIRes operando em força máxima! 🚀' });
});

// Pluga as nossas rotas na API
app.use('/api', routes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🔥 Servidor voando na porta ${PORT}`);
});