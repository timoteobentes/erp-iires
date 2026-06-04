import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../config/prisma.js';
import { MailService } from '../../shared/services/mail.service.js';

const JWT_SECRET = () => process.env.JWT_SECRET || 'secret-fallback-nao-use-em-prod';
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || 'refresh-fallback-nao-use-em-prod';
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

function generateTokens(userId: string, role: string | null, group: string | null) {
  const accessToken = jwt.sign({ id: userId, role, group }, JWT_SECRET(), { expiresIn: '1d' });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const refreshExpires = new Date(Date.now() + REFRESH_EXPIRES_MS);
  return { accessToken, refreshToken, refreshExpires };
}

export class AuthController {

  // 1. ROTA DE CADASTRO
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
        return;
      }

      const userExists = await prisma.user.findUnique({ where: { email } });

      if (userExists) {
        res.status(409).json({ error: 'Este e-mail já está em uso.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'Usuário',
          level: 'Operacional',
          group: 'Geral',
          status: 'active'
        },
      });

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
      });

    } catch (error) {
      console.error('Erro no SignUp:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 2. NOVA ROTA DE LOGIN (Sign In)
  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        return;
      }

      // 1. Busca o usuário pelo e-mail
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Se não achar o usuário, ou se a conta estiver inativa
      if (!user || user.status === 'inactive') {
        res.status(401).json({ error: 'Credenciais inválidas ou conta inativa.' });
        return;
      }

      // 2. Compara a senha digitada com o Hash do banco
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Credenciais inválidas.' });
        return;
      }

      // 3. Gera o Access Token + Refresh Token
      const { accessToken, refreshToken, refreshExpires } = generateTokens(user.id, user.role, user.group);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken, refreshTokenExpires: refreshExpires },
      });

      // 4. Retorna os dados do usuário + os tokens
      res.status(200).json({
        message: 'Login realizado com sucesso!',
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          group: user.group
        }
      });

    } catch (error) {
      console.error('Erro no SignIn:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 3. ROTA DO PERFIL DO USUÁRIO LOGADO (Get Me)
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      // O ID vem magicamente do nosso middleware! O usuário não precisa mandar no body.
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não identificado.' });
        return;
      }

      // Busca o usuário no banco
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          // Usamos o select para garantir que a SENHA NUNCA seja retornada!
          id: true,
          name: true,
          email: true,
          cpf: true,
          phone: true,
          role: true,
          level: true,
          group: true,
          status: true,
          createdAt: true
        }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }

      res.status(200).json(user);

    } catch (error) {
      console.error('Erro no getMe:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 4. ESQUECI A SENHA (Gera Token)
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'O e-mail é obrigatório.' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Por segurança, não avisamos se o e-mail existe ou não.
        res.status(200).json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
        return;
      }

      // Gera um token aleatório de 32 bytes em formato Hexadecimal
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Define a validade do token para 15 minutos (900000 ms)
      const resetExpires = new Date(Date.now() + 900000);

      // Salva no banco
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires,
        }
      });

      await MailService.sendResetPasswordEmail(user.name, user.email, resetToken);

      res.status(200).json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });

    } catch (error) {
      console.error('Erro no forgotPassword:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 5. ATUALIZAR DADOS DO PRÓPRIO PERFIL (updateMe)
  async updateMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não identificado.' });
        return;
      }

      const { name, phone } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ error: 'Nenhum campo para atualizar foi enviado.' });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpf: true,
          role: true,
          level: true,
          group: true,
          status: true,
        },
      });

      res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
    } catch (error) {
      console.error('Erro no updateMe:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 6. ALTERAR PRÓPRIA SENHA (changePassword)
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não identificado.' });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }

      // Verifica se a senha atual bate
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isCurrentPasswordValid) {
        res.status(401).json({ error: 'Senha atual incorreta.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      res.status(200).json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
      console.error('Erro no changePassword:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 7. REFRESH TOKEN — troca o refresh token por novos tokens
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token é obrigatório.' });
        return;
      }

      const user = await prisma.user.findFirst({
        where: {
          refreshToken,
          refreshTokenExpires: { gt: new Date() },
          status: 'active',
        },
      });

      if (!user) {
        res.status(401).json({ error: 'Refresh token inválido ou expirado. Faça login novamente.' });
        return;
      }

      const { accessToken, refreshToken: newRefreshToken, refreshExpires } = generateTokens(user.id, user.role, user.group);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken, refreshTokenExpires: refreshExpires },
      });

      res.status(200).json({
        token: accessToken,
        refreshToken: newRefreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, group: user.group },
      });
    } catch (error) {
      console.error('Erro no refresh:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 8. LOGOUT — invalida o refresh token
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { refreshToken: null, refreshTokenExpires: null },
        });
      }
      res.status(200).json({ message: 'Logout realizado com sucesso.' });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 9. REDEFINIR SENHA (Com Token)
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
        return;
      }

      // Busca o usuário que tem esse token e se a data de validade é MAIOR que agora
      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { gt: new Date() }, // gt = greater than (maior que)
        }
      });

      if (!user) {
        res.status(400).json({ error: 'Token inválido ou expirado.' });
        return;
      }

      // Criptografa a nova senha
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // Atualiza a senha e APAGA o token (para não ser usado de novo)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        }
      });

      res.status(200).json({ message: 'Senha redefinida com sucesso! Você já pode fazer login.' });

    } catch (error) {
      console.error('Erro no resetPassword:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
}