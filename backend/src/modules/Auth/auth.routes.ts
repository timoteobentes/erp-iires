import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const authRoutes = Router();
const authController = new AuthController();

// Rotas PÚBLICAS
authRoutes.post('/signup', authController.signUp);
authRoutes.post('/login', authController.signIn);
authRoutes.post('/forgot-password', authController.forgotPassword);
authRoutes.post('/reset-password', authController.resetPassword);

// Rotas PRIVADAS (Só funcionam com Token)
authRoutes.get('/me', authMiddleware, authController.getMe);

export default authRoutes;