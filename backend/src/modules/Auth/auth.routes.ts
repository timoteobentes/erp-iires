import { Router } from 'express';
import { AuthController } from './auth.controller.js';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/signup', authController.signUp);
authRoutes.post('/login', authController.signIn);

export default authRoutes;