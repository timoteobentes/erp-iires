import { z } from 'zod';

export const createInviteSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  roleId: z.string().uuid('roleId inválido.'),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório.'),
  name: z.string().trim().min(2).optional(),
  password: z.string().min(6).optional(),
});
