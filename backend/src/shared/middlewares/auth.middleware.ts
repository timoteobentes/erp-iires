import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Estendendo a tipagem do Express (Padrão TypeScript Elite)
// Isso diz pro TypeScript que, após passar por esse middleware, a "Request" terá um objeto "user"
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        group: string;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Pega o token do cabeçalho de Autorização
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    return;
  }

  // O padrão é vir "Bearer eyJhbG..." então nós dividimos pelo espaço para pegar só o token
  const [, token] = authHeader.split(' ');

  try {
    const secret = process.env.JWT_SECRET || 'secret-fallback-nao-use-em-prod';
    
    // Verifica se o token é válido e decodifica os dados que guardamos nele no Login
    const decoded = jwt.verify(token!, secret) as any;

    // Injeta os dados do usuário na requisição para os Controllers poderem usar!
    req.user = {
      id: decoded.id,
      role: decoded.role,
      group: decoded.group,
    };

    // Manda seguir o fluxo (ir para o Controller)
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}