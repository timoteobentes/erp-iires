# ADR-001: Multi-tenancy por coluna `organizationId`

## Contexto

O SIGETES é um ERP SaaS multi-tenant: cada organização assinante (instituto, associação, fundação) precisa ter seus dados completamente isolados dos demais clientes, sem exceção — um vazamento entre tenants é falha fatal (LGPD + confiança).

## Opções consideradas

| Estratégia | Isolamento | Custo | Complexidade |
|---|---|---|---|
| Banco por tenant | Máximo | Alto | Alta (N migrations para manter sincronizadas) |
| Schema por tenant (mesmo banco) | Alto | Médio | Alta (Prisma não tem bom suporte nativo) |
| Coluna `organizationId` no schema único | Bom, com disciplina de engenharia | Baixo | Média |

## Decisão

Banco único, schema único, toda tabela de domínio ganha uma coluna `organizationId String` indexada (`@@index([organizationId])`).

O isolamento é garantido em código por uma extensão do Prisma Client (`core/prisma/tenant-extension.ts`) que injeta `organizationId` automaticamente em toda operação (`where`, `data`) para os modelos listados em `TENANT_MODELS`, lendo o valor sempre do contexto de request (`AsyncLocalStorage`) — nunca de `body`/`query`/`params`.

Regras decorrentes:
1. Nenhum service usa `PrismaClient` cru — só o client estendido (`import { prisma } from '@/core/prisma'`).
2. Todo `@unique` de modelo de domínio é composto com `organizationId`.
3. Recurso de outro tenant retorna `404`, nunca `403` (não revela existência).
4. Suíte de teste de isolamento (`tests/tenant-isolation.spec.ts`) é obrigatória a partir da Fase 1 — para cada endpoint, tenta acessar recurso de outro tenant e espera `404`.

## Consequências

- Custo de infraestrutura baixo o suficiente para o plano de entrada (R$ 49,90/mês).
- Todo o isolamento depende de disciplina de código — um `findMany` esquecido sem passar pelo client estendido é vazamento silencioso. Mitigado por code review + teste automatizado obrigatório.
- Defesa em profundidade prevista para a Fase 5: Row Level Security (RLS) no Supabase como segunda barreira, ativada via `SET LOCAL app.current_org_id` dentro de `$transaction`.
