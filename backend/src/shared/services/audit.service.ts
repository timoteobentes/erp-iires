import prisma from '../../config/prisma.js';
import { Prisma } from '@prisma/client';

export class AuditService {
  static async log(data: Omit<Prisma.AuditLogUncheckedCreateInput, 'id' | 'createdAt'>) {
    try {
      await prisma.auditLog.create({ data });
    } catch (error) {
      console.error('Erro ao gravar log de auditoria:', error);
    }
  }
}
