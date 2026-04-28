import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// Middlewares Globais
app.use(helmet()); // Proteção de cabeçalhos HTTP
app.use(cors()); // Permite que nosso frontend Vite converse com o backend
app.use(express.json()); // Permite receber JSON no body das requisições

// Rota de Teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor IIRes operando em força máxima! 🚀' });
});

// Importaremos as rotas dos módulos aqui no futuro...

// Inicialização do Servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🔥 Servidor voando na porta ${PORT}`);
});