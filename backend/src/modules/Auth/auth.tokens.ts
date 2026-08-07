import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { Request } from 'express';
import prisma from '../../config/prisma.js';

const JWT_SECRET = () => process.env.JWT_SECRET || 'secret-fallback-nao-use-em-prod';
const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

export type BasicUser = { id: string; name: string; email: string };
export type MembershipWithRole = {
  id: string;
  organizationId: string;
  isOwner: boolean;
  role: { name: string; permissions: string[] };
  organization: { id: string; slug: string; tradeName: string | null; legalName: string };
};

export function generateAccessToken(user: BasicUser, membership: MembershipWithRole) {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      orgId: membership.organizationId,
      membershipId: membership.id,
      isOwner: membership.isOwner,
      permissions: membership.role.permissions,
    },
    JWT_SECRET(),
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
  );
}

export async function issueRefreshToken(userId: string, req: Request, familyId?: string) {
  const raw = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      familyId: familyId ?? crypto.randomUUID(),
      expiresAt,
      userAgent: (req.headers['user-agent'] as string) ?? null,
      ipAddress: req.ip ?? null,
    },
  });
  return raw;
}

/** Busca o vínculo ativo do usuário com uma organização (a informada, ou a primeira, por padrão). */
export async function resolveMembership(userId: string, organizationId?: string): Promise<MembershipWithRole | null> {
  return prisma.membership.findFirst({
    where: { userId, status: 'ACTIVE', ...(organizationId ? { organizationId } : {}) },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      organizationId: true,
      isOwner: true,
      role: { select: { name: true, permissions: true } },
      organization: { select: { id: true, slug: true, tradeName: true, legalName: true } },
    },
  });
}

export function serializeSession(user: BasicUser & { avatarUrl?: string | null; phone?: string | null }, membership: MembershipWithRole) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    phone: user.phone ?? null,
    organization: {
      id: membership.organization.id,
      slug: membership.organization.slug,
      name: membership.organization.tradeName || membership.organization.legalName,
    },
    membership: {
      id: membership.id,
      isOwner: membership.isOwner,
      role: membership.role.name,
      permissions: membership.role.permissions,
    },
  };
}
