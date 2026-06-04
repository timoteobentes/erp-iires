import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateMeSchema,
  refreshTokenSchema,
} from '../../shared/schemas/auth.schemas.js';

const authRoutes = Router();
const authController = new AuthController();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas solicitações de recuperação de senha. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rotas PÚBLICAS
authRoutes.post('/signup', validate(signUpSchema), authController.signUp);
authRoutes.post('/login', loginLimiter, validate(signInSchema), authController.signIn);
authRoutes.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
authRoutes.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Rota de Refresh Token (pública — usa o próprio refresh token como credencial)
authRoutes.post('/refresh', validate(refreshTokenSchema), authController.refresh);

// Rotas PRIVADAS (Só funcionam com Token)
authRoutes.get('/me', authMiddleware, authController.getMe);
authRoutes.patch('/me', authMiddleware, validate(updateMeSchema), authController.updateMe);
authRoutes.patch('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword);
authRoutes.post('/logout', authMiddleware, authController.logout);

export default authRoutes;