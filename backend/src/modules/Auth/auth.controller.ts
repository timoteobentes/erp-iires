import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../config/prisma.js';
import { MailService } from '../../shared/services/mail.service.js';
import { DEFAULT_ROLES } from '@sigetes/shared';
import { generateAccessToken, issueRefreshToken, resolveMembership, serializeSession } from './auth.tokens.js';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'organizacao';
}

export class AuthController {
  // 1. CADASTRO DE NOVA INSTITUIÇÃO (cria User dono + Organization + Membership OWNER)
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const {
        name, email, password, organizationName, document, legalNature,
        zipCode, street, number, complement, neighborhood, city, state,
        legalRepName, legalRepDocument, legalRepRole, legalRepEmail,
      } = req.body;

      if (!name || !email || !password || !organizationName) {
        res.status(400).json({ error: 'Nome, e-mail, senha e nome da instituição são obrigatórios.' });
        return;
      }

      const userExists = await prisma.user.findUnique({ where: { email } });
      if (userExists) {
        res.status(409).json({ error: 'Este e-mail já está em uso.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));

      let slug = slugify(organizationName);
      if (await prisma.organization.findUnique({ where: { slug } })) {
        slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
      }

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data: { name, email, passwordHash, status: 'ACTIVE' } });

        const organization = await tx.organization.create({
          data: {
            slug,
            legalName: organizationName,
            tradeName: organizationName,
            document: document || `PENDENTE-${crypto.randomBytes(6).toString('hex')}`,
            legalNature: legalNature || 'OUTRO',
            email,
            zipCode: zipCode || null,
            street: street || null,
            number: number || null,
            complement: complement || null,
            neighborhood: neighborhood || null,
            city: city || null,
            state: state || null,
            legalRepName: legalRepName || null,
            legalRepDocument: legalRepDocument || null,
            legalRepRole: legalRepRole || null,
            legalRepEmail: legalRepEmail || null,
            status: 'ACTIVE',
            onboardedAt: new Date(),
          },
        });

        let ownerRole = null;
        for (const r of DEFAULT_ROLES) {
          const role = await tx.role.create({
            data: { organizationId: organization.id, name: r.name, isSystem: r.isSystem, permissions: r.permissions },
          });
          if (r.name === 'Administrador') ownerRole = role;
        }
        if (!ownerRole) throw new Error('Papel Administrador não foi semeado corretamente.');

        const membership = await tx.membership.create({
          data: { userId: user.id, organizationId: organization.id, roleId: ownerRole.id, isOwner: true },
          select: {
            id: true,
            organizationId: true,
            isOwner: true,
            role: { select: { name: true, permissions: true } },
            organization: { select: { id: true, slug: true, tradeName: true, legalName: true } },
          },
        });

        return { user, membership };
      });

      const accessToken = generateAccessToken(result.user, result.membership);
      const refreshToken = await issueRefreshToken(result.user.id, req);

      res.status(201).json({
        message: 'Instituição cadastrada com sucesso!',
        token: accessToken,
        refreshToken,
        user: serializeSession(result.user, result.membership),
      });
    } catch (error) {
      console.error('Erro no SignUp:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 2. LOGIN
  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, organizationId } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.status !== 'ACTIVE') {
        res.status(401).json({ error: 'Credenciais inválidas ou conta inativa.' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Credenciais inválidas.' });
        return;
      }

      const membership = await resolveMembership(user.id, organizationId);
      if (!membership) {
        res.status(403).json({ error: 'Este usuário não está vinculado a nenhuma organização ativa.' });
        return;
      }

      const accessToken = generateAccessToken(user, membership);
      const refreshToken = await issueRefreshToken(user.id, req);
      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

      res.status(200).json({
        message: 'Login realizado com sucesso!',
        token: accessToken,
        refreshToken,
        user: serializeSession(user, membership),
      });
    } catch (error) {
      console.error('Erro no SignIn:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 3. PERFIL DO USUÁRIO LOGADO
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não identificado.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, avatarUrl: true, status: true, createdAt: true },
      });
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }

      const membership = await resolveMembership(userId, req.user!.organizationId);
      res.status(200).json({ ...user, session: membership ? serializeSession(user, membership) : null });
    } catch (error) {
      console.error('Erro no getMe:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 4. ESQUECI A SENHA
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'O e-mail é obrigatório.' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(200).json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
        return;
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 900000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: resetToken, resetPasswordExpires: resetExpires },
      });

      await MailService.sendResetPasswordEmail(user.name, user.email, resetToken);
      res.status(200).json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
    } catch (error) {
      console.error('Erro no forgotPassword:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 5. ATUALIZAR PRÓPRIO PERFIL
  async updateMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não identificado.' });
        return;
      }

      const { name, phone, avatarUrl } = req.body;
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ error: 'Nenhum campo para atualizar foi enviado.' });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, name: true, email: true, phone: true, avatarUrl: true, status: true },
      });

      res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
    } catch (error) {
      console.error('Erro no updateMe:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 6. ALTERAR PRÓPRIA SENHA
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

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        res.status(401).json({ error: 'Senha atual incorreta.' });
        return;
      }

      const newPasswordHash = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
      await prisma.user.update({ where: { id: userId }, data: { passwordHash: newPasswordHash } });

      res.status(200).json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
      console.error('Erro no changePassword:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 7. REFRESH TOKEN — rotação com detecção de reuso
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken, organizationId } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token é obrigatório.' });
        return;
      }

      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

      if (!stored || stored.expiresAt < new Date()) {
        res.status(401).json({ error: 'Refresh token inválido ou expirado. Faça login novamente.' });
        return;
      }

      if (stored.revokedAt) {
        // Um token já usado sendo reapresentado é sinal de roubo — revoga a família inteira.
        await prisma.refreshToken.updateMany({
          where: { familyId: stored.familyId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        res.status(401).json({ error: 'Sessão comprometida detectada. Faça login novamente.' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: stored.userId } });
      if (!user || user.status !== 'ACTIVE') {
        res.status(401).json({ error: 'Usuário inválido.' });
        return;
      }

      const membership = await resolveMembership(user.id, organizationId);
      if (!membership) {
        res.status(403).json({ error: 'Este usuário não está vinculado a nenhuma organização ativa.' });
        return;
      }

      await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
      const newRefreshToken = await issueRefreshToken(user.id, req, stored.familyId);
      const accessToken = generateAccessToken(user, membership);

      res.status(200).json({
        token: accessToken,
        refreshToken: newRefreshToken,
        user: serializeSession(user, membership),
      });
    } catch (error) {
      console.error('Erro no refresh:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 8. TROCAR DE ORGANIZAÇÃO (usuário com múltiplos vínculos)
  async switchOrg(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { organizationId } = req.body;
      if (!userId || !organizationId) {
        res.status(400).json({ error: 'organizationId é obrigatório.' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const membership = await resolveMembership(userId, organizationId);
      if (!user || !membership) {
        res.status(403).json({ error: 'Você não tem vínculo ativo com essa organização.' });
        return;
      }

      const accessToken = generateAccessToken(user, membership);
      res.status(200).json({ token: accessToken, user: serializeSession(user, membership) });
    } catch (error) {
      console.error('Erro no switchOrg:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 8b. LISTAR MINHAS ORGANIZAÇÕES (para o seletor de organização)
  async myOrganizations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const memberships = await prisma.membership.findMany({
        where: { userId, status: 'ACTIVE' },
        select: {
          id: true,
          isOwner: true,
          organizationId: true,
          role: { select: { name: true } },
          organization: { select: { id: true, slug: true, tradeName: true, legalName: true, logoUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      res.json({
        organizations: memberships.map((m) => ({
          organizationId: m.organizationId,
          name: m.organization.tradeName || m.organization.legalName,
          slug: m.organization.slug,
          logoUrl: m.organization.logoUrl,
          role: m.role.name,
          isOwner: m.isOwner,
          isCurrent: m.organizationId === req.user!.organizationId,
        })),
      });
    } catch (error) {
      console.error('Erro no myOrganizations:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 9. LOGOUT — revoga o refresh token apresentado
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await prisma.refreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
      }
      res.status(200).json({ message: 'Logout realizado com sucesso.' });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // 10. REDEFINIR SENHA (com token)
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
        return;
      }

      const user = await prisma.user.findFirst({
        where: { resetPasswordToken: token, resetPasswordExpires: { gt: new Date() } },
      });
      if (!user) {
        res.status(400).json({ error: 'Token inválido ou expirado.' });
        return;
      }

      const newPasswordHash = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash, resetPasswordToken: null, resetPasswordExpires: null },
      });

      res.status(200).json({ message: 'Senha redefinida com sucesso! Você já pode fazer login.' });
    } catch (error) {
      console.error('Erro no resetPassword:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
}
