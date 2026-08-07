import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../config/prisma.js';
import { tenantPrisma } from '../../core/prisma/tenant-client.js';
import { getContext } from '../../core/context/request-context.js';
import { respondError } from '../../shared/utils/respond-error.js';
import { MailService } from '../../shared/services/mail.service.js';
import { generateAccessToken, issueRefreshToken, resolveMembership, serializeSession } from '../Auth/auth.tokens.js';

const INVITE_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

export class InvitesController {
  // POST /invites — cria e envia o convite (autenticado, dentro da organização)
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, roleId } = req.body;
      const { organizationId } = getContext();

      const role = await tenantPrisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        res.status(400).json({ error: 'Papel inválido.' });
        return;
      }

      const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
      if (!organization) {
        res.status(404).json({ error: 'Organização não encontrada.' });
        return;
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      const invite = await tenantPrisma.invite.create({
        data: {
          email,
          roleId,
          tokenHash,
          invitedById: req.user!.id,
          expiresAt: new Date(Date.now() + INVITE_EXPIRES_MS),
        } as any, // organizationId é injetado automaticamente pelo tenantPrisma
      });

      await MailService.sendInviteEmail({
        organizationName: organization.tradeName || organization.legalName,
        inviterName: req.user!.name,
        to: email,
        roleName: role.name,
        token: rawToken,
      });

      res.status(201).json({ message: 'Convite enviado com sucesso!', invite: { id: invite.id, email: invite.email, status: invite.status } });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Já existe um convite pendente para este e-mail.' });
        return;
      }
      respondError(res, error, 'Erro ao criar convite.');
    }
  }

  // GET /invites — lista convites pendentes da organização
  async list(req: Request, res: Response): Promise<void> {
    try {
      const invites = await tenantPrisma.invite.findMany({
        where: { status: 'PENDING' },
        include: { role: { select: { name: true } }, invitedBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ invites });
    } catch (error) {
      respondError(res, error, 'Erro ao listar convites.');
    }
  }

  // DELETE /invites/:id — revoga um convite pendente
  async revoke(req: Request, res: Response): Promise<void> {
    try {
      await tenantPrisma.invite.update({ where: { id: req.params['id'] as string }, data: { status: 'REVOKED' } });
      res.json({ message: 'Convite revogado.' });
    } catch (error) {
      respondError(res, error, 'Erro ao revogar convite.');
    }
  }

  // GET /invites/by-token/:token — rota PÚBLICA, usada pela tela de aceite para saber o que exibir
  async preview(req: Request, res: Response): Promise<void> {
    try {
      const tokenHash = crypto.createHash('sha256').update(req.params['token'] as string).digest('hex');
      const invite = await prisma.invite.findUnique({
        where: { tokenHash },
        include: { role: { select: { name: true } }, organization: { select: { legalName: true, tradeName: true } } },
      });

      if (!invite || invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
        res.status(404).json({ error: 'Convite inválido ou expirado.' });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });

      res.json({
        email: invite.email,
        roleName: invite.role.name,
        organizationName: invite.organization.tradeName || invite.organization.legalName,
        requiresNewAccount: !existingUser,
      });
    } catch (error) {
      respondError(res, error, 'Erro ao consultar convite.');
    }
  }

  // POST /invites/accept — rota PÚBLICA, usa o token como credencial
  async accept(req: Request, res: Response): Promise<void> {
    try {
      const { token, name, password } = req.body;
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const invite = await prisma.invite.findUnique({ where: { tokenHash } });
      if (!invite || invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
        res.status(400).json({ error: 'Convite inválido ou expirado.' });
        return;
      }

      let user = await prisma.user.findUnique({ where: { email: invite.email } });

      if (!user) {
        if (!name || !password) {
          res.status(400).json({ error: 'Nome e senha são obrigatórios para criar sua conta.' });
          return;
        }
        const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
        user = await prisma.user.create({ data: { name, email: invite.email, passwordHash, status: 'ACTIVE' } });
      }

      const existingMembership = await prisma.membership.findFirst({
        where: { userId: user.id, organizationId: invite.organizationId },
      });

      if (existingMembership) {
        if (existingMembership.status === 'ACTIVE') {
          res.status(409).json({ error: 'Você já é membro desta organização.' });
          return;
        }
        await prisma.membership.update({ where: { id: existingMembership.id }, data: { status: 'ACTIVE', roleId: invite.roleId } });
      } else {
        await prisma.membership.create({
          data: { userId: user.id, organizationId: invite.organizationId, roleId: invite.roleId, isOwner: false },
        });
      }

      await prisma.invite.update({ where: { id: invite.id }, data: { status: 'ACCEPTED', acceptedAt: new Date() } });

      const membership = await resolveMembership(user.id, invite.organizationId);
      if (!membership) throw new Error('Falha ao resolver o vínculo recém-criado.');

      const accessToken = generateAccessToken(user, membership);
      const refreshToken = await issueRefreshToken(user.id, req);

      res.status(200).json({
        message: 'Convite aceito com sucesso!',
        token: accessToken,
        refreshToken,
        user: serializeSession(user, membership),
      });
    } catch (error) {
      respondError(res, error, 'Erro ao aceitar convite.');
    }
  }
}
