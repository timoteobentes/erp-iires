import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🧹 Limpando todas as tabelas...');

  // Apaga na ordem correta respeitando as FK constraints
  await prisma.systemLog.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.volunteer.deleteMany({});
  await prisma.donor.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Todas as tabelas limpas.');

  console.log('👑 Criando usuário administrador...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Admin2026!', salt);

  await prisma.user.create({
    data: {
      name: 'Timóteo Bentes (Admin)',
      email: 'admin@iires.org',
      passwordHash,
      role: 'Admin',
      level: 'Diretoria',
      group: 'Gestão',
      status: 'active',
    },
  });

  console.log('✅ Admin criado: admin@iires.org / Admin2026!');
  console.log('🎉 Banco de dados pronto para uso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
