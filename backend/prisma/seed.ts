import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🧹 Limpando banco de dados...');

  // Deleção em ordem que respeita as FK constraints:
  //   1. Logs e notificações (sem dependências filhas)
  //   2. Transações (referenciam projeto, doador, parceiro, plano de contas, centro de custo)
  //   3. Projetos (limpa as join-tables M2M com voluntários e parceiros)
  //   4. Endereços (cascade cobriria, mas garantimos explicitamente)
  //   5. Voluntários, Doadores, Parceiros
  //   6. AccountPlan: nullificar parentId antes de deletar (self-FK)
  //   7. CentrosCusto
  //   8. Usuários (por último — notificações têm onDelete:Cascade)

  await prisma.systemLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.volunteer.deleteMany({});
  await prisma.donor.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.accountPlan.updateMany({ data: { parentId: null } });
  await prisma.accountPlan.deleteMany({});
  await prisma.costCenter.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Banco limpo.\n');

  // ── Usuário Administrador ────────────────────────────────────
  console.log('👑 Criando administrador...');
  const passwordHash = await bcrypt.hash('Admin2026!', await bcrypt.genSalt(10));

  await prisma.user.create({
    data: {
      name:         'Timóteo Bentes (Admin)',
      email:        'admin@iires.org',
      passwordHash,
      role:         'Admin',
      level:        'Diretoria',
      group:        'Gestão',
      status:       'active',
    },
  });
  console.log('  ✅ Usuário: admin@iires.org  |  Senha: Admin2026!\n');

  // ── Planos de Contas ─────────────────────────────────────────
  console.log('📋 Inserindo planos de contas...');

  const PLANS = [
    { code: '1',   name: 'Pagamento',                             type: 'EXPENSE', parentCode: null },
    { code: '1.1', name: 'Despesas administrativas e comerciais', type: 'EXPENSE', parentCode: '1'  },
    { code: '1.2', name: 'Despesas de serviços prestados',        type: 'EXPENSE', parentCode: '1'  },
    { code: '1.3', name: 'Despesas financeiras',                  type: 'EXPENSE', parentCode: '1'  },
    { code: '1.4', name: 'Investimentos',                         type: 'EXPENSE', parentCode: '1'  },
    { code: '1.5', name: 'Outras despesas',                       type: 'EXPENSE', parentCode: '1'  },
    { code: '2',   name: 'Recebimentos',                          type: 'INCOME',  parentCode: null },
    { code: '2.1', name: 'Receitas de serviços',                  type: 'INCOME',  parentCode: '2'  },
    { code: '2.2', name: 'Receitas financeiras',                  type: 'INCOME',  parentCode: '2'  },
    { code: '2.3', name: 'Outras receitas',                       type: 'INCOME',  parentCode: '2'  },
  ];

  const codeToId = new Map<string, string>();

  for (const plan of PLANS) {
    const parentId = plan.parentCode ? (codeToId.get(plan.parentCode) ?? null) : null;
    const created  = await prisma.accountPlan.create({
      data: { code: plan.code, name: plan.name, type: plan.type, parentId },
    });
    codeToId.set(plan.code, created.id);
    console.log(`  ✅ ${plan.code.padEnd(5)} ${plan.name}`);
  }

  console.log('\n🎉 Banco de dados pronto para uso!');
  console.log('══════════════════════════════════════');
  console.log('  E-mail : admin@iires.org');
  console.log('  Senha  : Admin2026!');
  console.log('  Perfil : Admin · Diretoria');
  console.log('══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
