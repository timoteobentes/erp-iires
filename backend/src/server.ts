import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes.js';
import { auditMiddleware } from './shared/middlewares/audit.middleware.js';

const app = express();

app.use(helmet());

// CORS configurado com origem específica para evitar acesso de origens não autorizadas
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',  // Vite dev server (fallback explícito)
  'http://localhost:4173',  // Vite preview
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: Insomnia, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origem não permitida — ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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