import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
  organizationId: z.string().uuid().optional(),
});

export const signUpSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres.'),
  organizationName: z.string().min(2, 'Nome da instituição deve ter pelo menos 2 caracteres.'),
  document: z.string().optional(),
});

export const switchOrgSchema = z.object({
  organizationId: z.string().uuid('organizationId inválido.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório.'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres.'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória.'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres.'),
});

export const updateMeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.').optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório.'),
  organizationId: z.string().uuid().optional(),
});
