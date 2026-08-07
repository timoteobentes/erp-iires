import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { runWithContext } from '../../core/context/request-context.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        organizationId: string;
        membershipId: string;
        isOwner: boolean;
        permissions: string[];
      };
    }
  }
}

interface AccessTokenPayload {
  sub: string;
  name: string;
  email: string;
  orgId: string;
  membershipId: string;
  isOwner: boolean;
  permissions: string[];
}

/** Verifica se o usuário logado tem TODAS as permissões informadas. */
export function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado.' });
      return;
    }
    const missing = permissions.filter((p) => !req.user!.permissions.includes(p));
    if (missing.length > 0) {
      res.status(403).json({ error: 'Acesso negado. Permissão insuficiente para este recurso.' });
      return;
    }
    next();
  };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    return;
  }

  const [, token] = authHeader.split(' ');

  try {
    const secret = process.env.JWT_SECRET || 'secret-fallback-nao-use-em-prod';
    const decoded = jwt.verify(token!, secret) as AccessTokenPayload;

    req.user = {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      organizationId: decoded.orgId,
      membershipId: decoded.membershipId,
      isOwner: decoded.isOwner,
      permissions: decoded.permissions,
    };

    // A partir daqui, qualquer código async chamado por `next()` (controllers,
    // o Prisma Client com escopo de tenant, etc.) enxerga este contexto.
    runWithContext(
      {
        userId: decoded.sub,
        organizationId: decoded.orgId,
        membershipId: decoded.membershipId,
        isOwner: decoded.isOwner,
        permissions: decoded.permissions,
      },
      next,
    );
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
