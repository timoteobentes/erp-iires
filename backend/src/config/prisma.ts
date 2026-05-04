import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

// 1. Pegamos a nossa string de conexão do Supabase (com a porta 6543)
const connectionString = process.env.DATABASE_URL;

// 2. Criamos um Pool de conexões ultra-rápido nativo do Postgres
const pool = new Pool({ connectionString });

// 3. Passamos esse Pool para o Adaptador do Prisma
const adapter = new PrismaPg(pool);

// 4. Instanciamos o Prisma Client usando o adaptador!
const prisma = new PrismaClient({ adapter });

export default prisma;