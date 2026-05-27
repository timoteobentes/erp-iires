import type { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service.js';

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;
      const success = statusCode < 400;

      let action = 'UNKNOWN';
      if (req.method === 'GET') action = 'READ';
      if (req.method === 'POST') {
        if (req.originalUrl.includes('login') || req.originalUrl.includes('signup')) action = 'LOGIN/SIGNUP';
        else if (req.originalUrl.includes('export')) action = 'EXPORT';
        else action = 'CREATE';
      }
      if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
      if (req.method === 'DELETE') action = 'DELETE';

      let moduleName = 'UNKNOWN';
      if (req.originalUrl.includes('/auth')) moduleName = 'AUTH';
      else if (req.originalUrl.includes('/team') || req.originalUrl.includes('/volunteers') || req.originalUrl.includes('/donors') || req.originalUrl.includes('/partners')) moduleName = 'PEOPLE';
      else if (req.originalUrl.includes('/projects')) moduleName = 'PROJECTS';
      else if (req.originalUrl.includes('/transactions')) moduleName = 'FINANCE';
      else if (req.originalUrl.includes('/reports')) moduleName = 'REPORTS';

      const user: any = (req as any).user;
      const userId = user?.id || null;
      const userEmail = user?.email || req.body?.email || null;
      const userName = user?.name || req.body?.name || null;

      await AuditService.log({
        action,
        module: moduleName,
        description: `Request ${req.method} ${req.originalUrl} finished with status ${statusCode}`,
        endpoint: req.originalUrl,
        method: req.method,
        ipAddress: req.ip || req.connection.remoteAddress?.toString() || null,
        userAgent: req.headers['user-agent'] || null,
        userId,
        userEmail,
        userName,
        success,
        statusCode,
        responseTime
      });
    } catch (error) {
      console.error('Falha no AuditMiddleware:', error);
    }
  });

  next();
};
