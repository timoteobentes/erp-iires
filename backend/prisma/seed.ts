import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { DEFAULT_ROLES } from '@sigetes/shared';

async function main() {
  console.log('🧹 Limpando banco de dados...');

  // Deleção em ordem que respeita as FK constraints (camada tenant primeiro,
  // depois plataforma).
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.projectPerson.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.person.deleteMany({});
  await prisma.institutionalContext.deleteMany({});
  await prisma.accountPlan.updateMany({ data: { parentId: null } });
  await prisma.accountPlan.deleteMany({});
  await prisma.costCenter.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.invite.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Banco limpo.\n');

  // ── Organização (tenant) de demonstração ─────────────────────
  console.log('🏢 Criando organização IIRES...');
  const org = await prisma.organization.create({
    data: {
      slug: 'iires',
      legalName: 'Instituto de Inovação e Responsabilidade Social da Amazônia',
      tradeName: 'IIRES',
      document: '10.441.981/0001-66',
      legalNature: 'INSTITUTO',
      email: 'contato@iires.org',
      city: 'Manaus',
      state: 'AM',
      status: 'ACTIVE',
      onboardedAt: new Date(),
    },
  });

  console.log('🔑 Criando papéis padrão...');
  const roleByName: Record<string, { id: string }> = {};
  for (const r of DEFAULT_ROLES) {
    roleByName[r.name] = await prisma.role.create({
      data: {
        organizationId: org.id,
        name: r.name,
        isSystem: r.isSystem,
        permissions: r.permissions,
      },
    });
  }

  // ── Usuário Administrador ────────────────────────────────────
  console.log('👑 Criando administrador...');
  const initialPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(18).toString('base64url');
  const passwordHash = await bcrypt.hash(initialPassword, await bcrypt.genSalt(10));

  const admin = await prisma.user.create({
    data: {
      name: 'Timóteo Bentes (Admin)',
      email: 'admin@iires.org',
      passwordHash,
      status: 'ACTIVE',
    },
  });

  const adminMember = await prisma.member.create({
    data: {
      organizationId: org.id,
      name: admin.name,
      email: admin.email,
      jobTitle: 'Administrador',
      level: 'Diretor',
      department: 'Administrador',
      bondType: 'CLT',
      status: 'ACTIVE',
    },
  });

  await prisma.membership.create({
    data: {
      userId: admin.id,
      organizationId: org.id,
      roleId: roleByName.Administrador.id,
      isOwner: true,
      memberId: adminMember.id,
    },
  });

  await prisma.institutionalContext.createMany({
    data: [
      { organizationId: org.id, name: 'SELVA', type: 'PARTNER_COMPANY', relationship: 'STRATEGIC_PARTNERSHIP', responsibleId: admin.id },
      { organizationId: org.id, name: 'Bio System Ires', type: 'PARTNER_COMPANY', relationship: 'RESEARCH_AND_DEVELOPMENT', responsibleId: admin.id },
      { organizationId: org.id, name: 'Amazon Kapok', type: 'SUPPORTED_INITIATIVE', relationship: 'SUPPORTED_INITIATIVE', responsibleId: admin.id },
    ],
  });
  console.log('  ✅ Organização, administrador e contextos mínimos criados.\n');

  // ── Planos de Contas ─────────────────────────────────────────
  console.log('📋 Inserindo plano de contas padrão...');

  const PLANS = [
    { code: '1', name: 'Pagamento', type: 'EXPENSE' as const, parentCode: null as string | null },
    { code: '1.1', name: 'Despesas administrativas e comerciais', type: 'EXPENSE' as const, parentCode: '1' },
    { code: '1.2', name: 'Despesas de serviços prestados', type: 'EXPENSE' as const, parentCode: '1' },
    { code: '1.3', name: 'Despesas financeiras', type: 'EXPENSE' as const, parentCode: '1' },
    { code: '1.4', name: 'Investimentos', type: 'EXPENSE' as const, parentCode: '1' },
    { code: '1.5', name: 'Outras despesas', type: 'EXPENSE' as const, parentCode: '1' },
    { code: '2', name: 'Recebimentos', type: 'INCOME' as const, parentCode: null as string | null },
    { code: '2.1', name: 'Receitas de serviços', type: 'INCOME' as const, parentCode: '2' },
    { code: '2.2', name: 'Receitas financeiras', type: 'INCOME' as const, parentCode: '2' },
    { code: '2.3', name: 'Outras receitas', type: 'INCOME' as const, parentCode: '2' },
  ];

  const codeToId = new Map<string, string>();

  for (const plan of PLANS) {
    const parentId = plan.parentCode ? (codeToId.get(plan.parentCode) ?? null) : null;
    const created = await prisma.accountPlan.create({
      data: { organizationId: org.id, code: plan.code, name: plan.name, type: plan.type, parentId },
    });
    codeToId.set(plan.code, created.id);
    console.log(`  ✅ ${plan.code.padEnd(5)} ${plan.name}`);
  }

  console.log('\n🎉 Banco de dados pronto para uso!');
  console.log('══════════════════════════════════════');
  console.log('  Organização : IIRES');
  console.log('  E-mail      : admin@iires.org');
  console.log(`  Senha       : ${initialPassword}`);
  console.log('  Perfil      : Administrador (dono da organização)');
  console.log('══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
