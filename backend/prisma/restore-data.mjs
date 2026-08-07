// Script de migração de dados ÚNICO, já executado em 2026-08-07 durante a
// transição para multi-tenant (Fase 0 — Fundação). Mantido como registro
// histórico; rodá-lo de novo falhará (organização "iires" já existe).
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'node:fs';
import { DEFAULT_ROLES } from '@sigetes/shared';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const backup = JSON.parse(
  fs.readFileSync(new URL('./backup-pre-multitenant.json', import.meta.url), 'utf8'),
);

// Mapeia o antigo `group` (string livre) para um dos papéis padrão semeados.
const GROUP_TO_ROLE = {
  Administrador: 'Administrador',
  Tecnologia: 'Diretor',
  Financeiro: 'Financeiro',
  Inovação: 'Projetos',
  Diretoria: 'Diretor',
  Administrativo: 'Diretor',
  Comercial: 'Comercial',
};

const KNOWN_BOND_TYPES = ['CLT', 'PJ', 'INTERNSHIP', 'VOLUNTEER', 'TEMPORARY'];
const mapBondType = (v) => (KNOWN_BOND_TYPES.includes(v) ? v : 'CLT');
const mapRecordStatus = (v) => (v === 'active' ? 'ACTIVE' : 'INACTIVE');

async function main() {
  console.log('1/7 Criando organização IIRES...');
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

  console.log('2/7 Criando papéis padrão...');
  const roleByName = {};
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

  console.log('3/7 Migrando usuários existentes para Member + Membership...');
  const memberByUserId = {};
  for (const u of backup.users) {
    const addr = backup.addresses.find((a) => a.userId === u.id);
    const member = await prisma.member.create({
      data: {
        organizationId: org.id,
        name: u.name,
        email: u.email,
        personalEmail: u.personalEmail ?? null,
        document: u.cpf ?? null,
        phone: u.phone ?? null,
        birthDate: u.birthDate ? new Date(u.birthDate) : null,
        rg: u.rg ?? null,
        nationality: u.nationality ?? null,
        maritalStatus: u.maritalStatus ?? null,
        jobTitle: u.role ?? null,
        level: u.level ?? null,
        department: u.group ?? null,
        bondType: mapBondType(u.bondType),
        pis: u.pis ?? null,
        voterRegistration: u.voterRegistration ?? null,
        hasCnpj: u.hasCnpj ?? null,
        cnpjNumber: u.cnpjNumber ?? null,
        issuesInvoice: u.issuesInvoice ?? null,
        bankName: u.bankName ?? null,
        bankAgency: u.bankAgency ?? null,
        bankAccount: u.bankAccount ?? null,
        pixKey: u.pixKey ?? null,
        salary: u.salary ?? null,
        workDays: u.workDays ?? [],
        workHours: u.workHours ?? null,
        zipCode: addr?.cep ?? null,
        street: addr?.street ?? null,
        number: addr?.number ?? null,
        neighborhood: addr?.neighborhood ?? null,
        city: addr?.city || null,
        state: addr?.state || null,
        status: mapRecordStatus(u.status),
      },
    });
    memberByUserId[u.id] = member;

    const roleName = GROUP_TO_ROLE[u.group] ?? 'Leitor';
    const role = roleByName[roleName] ?? roleByName.Leitor;
    await prisma.membership.create({
      data: {
        userId: u.id,
        organizationId: org.id,
        roleId: role.id,
        isOwner: u.group === 'Administrador',
        memberId: member.id,
      },
    });
  }

  console.log('4/7 Migrando voluntários existentes para Person...');
  const personByVolunteerId = {};
  for (const v of backup.volunteers) {
    const addr = backup.addresses.find((a) => a.volunteerId === v.id);
    const person = await prisma.person.create({
      data: {
        organizationId: org.id,
        kind: 'INDIVIDUAL',
        roles: ['VOLUNTEER'],
        name: v.name,
        document: v.cpf ?? null,
        email: v.email ?? null,
        phone: v.phone ?? null,
        birthDate: v.birthDate ? new Date(v.birthDate) : null,
        rg: v.rg ?? null,
        nationality: v.nationality ?? null,
        maritalStatus: v.maritalStatus ?? null,
        profession: v.profession ?? null,
        skills: v.skills ?? [],
        availability: v.availability ?? null,
        services: v.services ?? null,
        schedule: v.schedule ?? null,
        acceptedTermsAt: v.acceptedTerms ? new Date() : null,
        supervisorId: v.supervisorId ? (memberByUserId[v.supervisorId]?.id ?? null) : null,
        emergencyName: v.emergencyName ?? null,
        emergencyPhone: v.emergencyPhone ?? null,
        zipCode: addr?.cep ?? null,
        street: addr?.street ?? null,
        number: addr?.number ?? null,
        neighborhood: addr?.neighborhood ?? null,
        city: addr?.city || null,
        state: addr?.state || null,
        status: mapRecordStatus(v.status),
      },
    });
    personByVolunteerId[v.id] = person;
  }

  console.log('5/7 Religando projeto (organização, gestor, equipe, voluntários)...');
  for (const p of backup.projects) {
    const managerMember = p.managerId ? memberByUserId[p.managerId] : null;
    await prisma.project.update({
      where: { id: p.id },
      data: {
        organizationId: org.id,
        managerId: managerMember?.id ?? null,
      },
    });
  }
  for (const row of backup._ProjectTeamMembers ?? []) {
    const member = memberByUserId[row.B];
    if (!member) continue;
    await prisma.projectMember.create({ data: { projectId: row.A, memberId: member.id } });
  }
  for (const row of backup._ProjectToVolunteer ?? []) {
    const person = personByVolunteerId[row.B];
    if (!person) continue;
    await prisma.projectPerson.create({
      data: { projectId: row.A, personId: person.id, role: 'VOLUNTEER' },
    });
  }

  console.log('6/7 Preenchendo organizationId nas demais tabelas do IIRES...');
  await prisma.accountPlan.updateMany({ data: { organizationId: org.id } });
  await prisma.costCenter.updateMany({ data: { organizationId: org.id } });
  await prisma.notification.updateMany({ data: { organizationId: org.id } });
  await prisma.transaction.updateMany({ data: { organizationId: org.id } });

  console.log('7/7 Tornando organizationId obrigatório nessas tabelas...');
  await prisma.$executeRawUnsafe(`ALTER TABLE "account_plans" ALTER COLUMN "organizationId" SET NOT NULL`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "cost_centers" ALTER COLUMN "organizationId" SET NOT NULL`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "notifications" ALTER COLUMN "organizationId" SET NOT NULL`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "projects" ALTER COLUMN "organizationId" SET NOT NULL`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "transactions" ALTER COLUMN "organizationId" SET NOT NULL`);

  console.log('\nConcluído. Organização IIRES criada com id:', org.id);
}

main()
  .catch((e) => {
    console.error('Falhou:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
