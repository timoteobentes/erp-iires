import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import prisma from '../config/prisma.js';

/**
 * Teste de aceite da Fundação (ADR-001): duas organizações nunca podem
 * enxergar ou alcançar dados uma da outra, mesmo sabendo o ID exato do
 * recurso. Toda vez que esse teste passar, a garantia central do produto
 * multi-tenant está de pé.
 */

const app = createApp();
const suffix = Date.now();
const orgAEmail = `teste-isolamento-a-${suffix}@sigetes.test`;
const orgBEmail = `teste-isolamento-b-${suffix}@sigetes.test`;
const createdUserIds: string[] = [];
const createdOrgIds: string[] = [];

async function signUp(email: string, orgName: string) {
  const res = await request(app).post('/api/auth/signup').send({
    name: 'Admin Teste',
    email,
    password: 'senha123456',
    organizationName: orgName,
  });
  expect(res.status).toBe(201);
  createdUserIds.push(res.body.user.id);
  createdOrgIds.push(res.body.user.organization.id);
  return res.body as { token: string; user: { organization: { id: string } } };
}

describe('Isolamento entre organizações (tenants)', () => {
  it('uma organização não vê nem acessa dados de outra', async () => {
    const orgA = await signUp(orgAEmail, `Org Isolamento A ${suffix}`);
    const orgB = await signUp(orgBEmail, `Org Isolamento B ${suffix}`);

    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${orgA.token}`)
      .send({
        name: 'Projeto Sigiloso',
        description: 'não pode vazar para outra organização',
        startDate: new Date().toISOString(),
        status: 'PLANNING',
      });
    expect(created.status).toBe(201);
    const projectId = created.body.project.id;

    // A própria organização enxerga o que criou.
    const listA = await request(app).get('/api/projects').set('Authorization', `Bearer ${orgA.token}`);
    expect(listA.body.map((p: any) => p.id)).toContain(projectId);

    // A outra organização não vê nada na listagem...
    const listB = await request(app).get('/api/projects').set('Authorization', `Bearer ${orgB.token}`);
    expect(listB.body).toEqual([]);

    // ...e, mesmo sabendo o ID exato, não consegue acessar (404, nunca 403 — ADR-001).
    const directAccess = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${orgB.token}`);
    expect(directAccess.status).toBe(404);
  }, 20000); // chamadas HTTP reais contra o banco — timeout maior que o padrão de 5s
});

afterAll(async () => {
  // Cascade cuida de memberships/roles/projects/etc. ao apagar a organização.
  await prisma.organization.deleteMany({ where: { id: { in: createdOrgIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await prisma.$disconnect();
});
