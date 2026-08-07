import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes.js';
import { auditMiddleware } from './shared/middlewares/audit.middleware.js';

export function createApp() {
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

  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(express.json({ limit: '15mb' }));
  app.use(auditMiddleware);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor SIGETES operando em força máxima! 🚀' });
  });

  app.use('/api', routes);

  return app;
}
