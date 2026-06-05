import prisma from '../src/config/prisma.js';

const PLANS = [
  { code: '1',   name: 'Pagamento',                               type: 'EXPENSE', parentCode: null },
  { code: '1.1', name: 'Despesas administrativas e comerciais',   type: 'EXPENSE', parentCode: '1'  },
  { code: '1.2', name: 'Despesas de serviços prestados',          type: 'EXPENSE', parentCode: '1'  },
  { code: '1.3', name: 'Despesas financeiras',                    type: 'EXPENSE', parentCode: '1'  },
  { code: '1.4', name: 'Investimentos',                           type: 'EXPENSE', parentCode: '1'  },
  { code: '1.5', name: 'Outras despesas',                         type: 'EXPENSE', parentCode: '1'  },
  { code: '2',   name: 'Recebimentos',                            type: 'INCOME',  parentCode: null },
  { code: '2.1', name: 'Receitas de serviços',                    type: 'INCOME',  parentCode: '2'  },
  { code: '2.2', name: 'Receitas financeiras',                    type: 'INCOME',  parentCode: '2'  },
  { code: '2.3', name: 'Outras receitas',                         type: 'INCOME',  parentCode: '2'  },
];

async function main() {
  console.log('📋 Inserindo planos de contas padrão...');

  for (const plan of PLANS) {
    let parentId: string | null = null;
    if (plan.parentCode) {
      const parent = await prisma.accountPlan.findUnique({ where: { code: plan.parentCode } });
      parentId = parent?.id ?? null;
    }

    await prisma.accountPlan.upsert({
      where:  { code: plan.code },
      update: { name: plan.name, type: plan.type, parentId },
      create: { code: plan.code, name: plan.name, type: plan.type, parentId },
    });

    console.log(`  ✅ ${plan.code} – ${plan.name}`);
  }

  console.log('🎉 Planos de contas inseridos com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
