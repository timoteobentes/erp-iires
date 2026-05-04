import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

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