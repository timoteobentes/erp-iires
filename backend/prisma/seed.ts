import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';
import { fakerPT_BR as faker } from '@faker-js/faker'; // Traz dados em Português do Brasil!

async function main() {
  console.log('🌱 Iniciando o plantio de dados (Seeding)...');

  // 1. DADOS INICIAIS DA ONG (Usuário Admin)
  // Verifica se o admin já existe para não duplicar
  let adminUser = await prisma.user.findUnique({ where: { email: 'admin@iires.org' } });

  if (!adminUser) {
    console.log('👑 Criando Usuário Administrador Mestre...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@2026', salt);

    adminUser = await prisma.user.create({
      data: {
        name: 'Timóteo Bentes (Admin)',
        email: 'admin@iires.org',
        passwordHash,
        role: 'Admin',
        level: 'Diretoria',
        group: 'Gestão',
        status: 'active',
        address: {
          create: {
            cep: '69000-000',
            street: 'Av. Eduardo Ribeiro',
            number: '123',
            neighborhood: 'Centro',
            city: 'Manaus',
            state: 'AM',
          }
        }
      }
    });
  }

  // ==========================================
  // GERAÇÃO DE DADOS EM MASSA (Fake Data)
  // ==========================================

  // 2. Criar 5 Doadores (Donors)
  console.log('🤝 Criando Doadores...');
  const donors = [];
  for (let i = 0; i < 5; i++) {
    const donor = await prisma.donor.create({
      data: {
        type: i % 2 === 0 ? 'PF' : 'PJ',
        name: i % 2 === 0 ? faker.person.fullName() : faker.company.name(),
        document: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(), // CPF/CNPJ fake numérico
        email: faker.internet.email(),
        phone: faker.phone.number(),
        recurrence: 'Mensal',
        paymentMethod: 'PIX',
        status: 'active',
        address: {
          create: {
            cep: faker.location.zipCode(),
            street: faker.location.street(),
            number: faker.location.buildingNumber(),
            neighborhood: faker.location.county(),
            city: faker.location.city(),
            state: faker.location.state({ abbreviated: true }),
          }
        }
      }
    });
    donors.push(donor);
  }

  // 3. Criar 5 Voluntários
  console.log('🙌 Criando Voluntários...');
  const volunteers = [];
  for (let i = 0; i < 5; i++) {
    const volunteer = await prisma.volunteer.create({
      data: {
        name: faker.person.fullName(),
        cpf: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
        email: faker.internet.email(),
        profession: faker.person.jobTitle(),
        status: 'active',
        acceptedTerms: true,
        address: {
          create: {
            cep: faker.location.zipCode(),
            street: faker.location.street(),
            number: faker.location.buildingNumber(),
            neighborhood: faker.location.county(),
            city: faker.location.city(),
            state: faker.location.state({ abbreviated: true }),
          }
        }
      }
    });
    volunteers.push(volunteer);
  }

  // 4. Criar 3 Projetos (Conectando Admin como Gerente e Voluntários)
  console.log('🏗️ Criando Projetos...');
  const projects = [];
  for (let i = 0; i < 3; i++) {
    const project = await prisma.project.create({
      data: {
        name: `Projeto ${faker.commerce.department()} Solidário`,
        description: faker.lorem.paragraph(),
        startDate: faker.date.past(),
        status: 'active',
        managerId: adminUser.id, // O Admin gerencia todos
        volunteers: {
          // Conecta aleatoriamente 2 voluntários a este projeto
          connect: [{ id: volunteers[0]?.id || "" }, { id: volunteers[1]?.id || "" }]
        }
      }
    });
    projects.push(project);
  }

  // 5. Criar 20 Transações Financeiras Aleatórias
  console.log('💰 Gerando Fluxo de Caixa (Transações)...');
  for (let i = 0; i < 20; i++) {
    const isIncome = faker.datatype.boolean(); // 50% de chance de ser entrada ou saída
    
    await prisma.transaction.create({
      data: {
        title: isIncome ? 'Doação Recebida' : 'Compra de Insumos',
        type: isIncome ? 'INCOME' : 'EXPENSE',
        amount: parseFloat(faker.finance.amount({ min: 50, max: 5000 })), // Valores entre 50 e 5000
        date: faker.date.recent({ days: 30 }), // Transações dos últimos 30 dias
        status: 'PAID',
        category: isIncome ? 'Doação' : 'Material',
        projectId: projects[0]?.id || "", // Atrelando ao primeiro projeto só pra teste
        donorId: isIncome ? donors[0]?.id || "" : null, // Se for entrada, atrela ao primeiro doador
      }
    });
  }

  console.log('✅ SEED CONCLUÍDO COM SUCESSO! O banco está vivo!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Desconecta do banco de forma segura
    await prisma.$disconnect();
  });