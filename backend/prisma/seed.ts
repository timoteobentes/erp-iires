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
  await prisma.plan.deleteMany({});
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

  // ── Planos de assinatura (SaaS) ───────────────────────────────
  // Preços e limites vêm de docs/PLANOS_E_PRECOS.md §2-3. "Rede" é sob
  // consulta (sem preço público) — fica marcado como não-público.
  console.log('\n💳 Criando planos de assinatura...');

  const SUBSCRIPTION_PLANS = [
    {
      code: 'essencial', name: 'Essencial', tagline: 'Para institutos que ainda vivem em planilhas.',
      priceMonthly: 49.9, priceYearly: 499.0,
      maxUsers: 3, maxActiveProjects: 5, maxPersons: 500, storageMb: 2048,
      features: ['people.base', 'projects.base', 'finance.base', 'reports.base'],
      isPublic: true, sortOrder: 1,
    },
    {
      code: 'gestao', name: 'Gestão', tagline: 'Para quem presta contas a financiadores.',
      priceMonthly: 149.9, priceYearly: 1499.0,
      maxUsers: 15, maxActiveProjects: 50, maxPersons: null, storageMb: 20_480,
      features: [
        'people.base', 'projects.base', 'finance.base', 'reports.base',
        'roles.custom', 'finance.account_plans', 'finance.cost_centers',
        'finance.by_project', 'finance.budget', 'finance.recurring',
        'attachments', 'documents.generate', 'reports.advanced', 'audit.log',
      ],
      isPublic: true, sortOrder: 2,
    },
    {
      code: 'institucional', name: 'Institucional', tagline: 'Para institutos com portfólio, núcleos ou programas.',
      priceMonthly: 399.9, priceYearly: 3999.0,
      maxUsers: 50, maxActiveProjects: null, maxPersons: null, storageMb: 102_400,
      features: [
        'people.base', 'projects.base', 'finance.base', 'reports.base',
        'roles.custom', 'finance.account_plans', 'finance.cost_centers',
        'finance.by_project', 'finance.budget', 'finance.recurring',
        'attachments', 'documents.generate', 'reports.advanced', 'audit.log',
        'contexts', 'multi_unit', 'public_portal', 'branding.custom',
        'api.access', 'auth.sso', 'data.import',
      ],
      isPublic: true, sortOrder: 3,
    },
    {
      code: 'rede', name: 'Rede', tagline: 'Para federações, redes de institutos e aceleradoras — sob consulta.',
      priceMonthly: 0, priceYearly: 0,
      maxUsers: null, maxActiveProjects: null, maxPersons: null, storageMb: null,
      features: [
        'people.base', 'projects.base', 'finance.base', 'reports.base',
        'roles.custom', 'finance.account_plans', 'finance.cost_centers',
        'finance.by_project', 'finance.budget', 'finance.recurring',
        'attachments', 'documents.generate', 'reports.advanced', 'audit.log',
        'contexts', 'multi_unit', 'public_portal', 'branding.custom',
        'api.access', 'auth.sso', 'data.import', 'multi_org',
      ],
      isPublic: false, sortOrder: 4,
    },
  ];

  const planByCode: Record<string, { id: string }> = {};
  for (const p of SUBSCRIPTION_PLANS) {
    planByCode[p.code] = await prisma.plan.create({ data: p });
    console.log(`  ✅ ${p.name} — R$ ${p.priceMonthly}/mês`);
  }

  // IIRES é o cliente zero — cortesia de cliente fundador no plano Institucional,
  // sem cobrança (ver docs/PLANOS_E_PRECOS.md §7, decisão em aberto resolvida
  // a favor da cortesia por enquanto).
  await prisma.subscription.create({
    data: {
      organizationId: org.id,
      planId: planByCode.institucional.id,
      status: 'ACTIVE',
      interval: 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date('2099-12-31'),
      gateway: 'infinitepay',
    },
  });
  console.log('  ✅ Assinatura cortesia (Institucional) atribuída ao IIRES.\n');

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
