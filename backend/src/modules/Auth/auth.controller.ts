import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';

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

      // 3. Gera o Token JWT (Crachá de Acesso)
      // Usamos a chave secreta que definimos no .env
      const secret = process.env.JWT_SECRET || 'secret-fallback-nao-use-em-prod';
      
      const token = jwt.sign(
        { 
          id: user.id, 
          role: user.role,
          group: user.group 
        }, // Payload (Dados públicos que vão dentro do token)
        secret,
        { expiresIn: '1d' } // O token expira em 1 dia
      );

      // 4. Retorna os dados do usuário + o Token
      res.status(200).json({
        message: 'Login realizado com sucesso!',
        token,
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
}