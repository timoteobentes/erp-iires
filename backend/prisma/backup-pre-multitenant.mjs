import 'dotenv/config';
import pg from 'pg';
import fs from 'node:fs';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const tables = [
  'users', 'addresses', 'volunteers', 'donors', 'partners', 'projects',
  'account_plans', 'cost_centers', 'transactions', 'notifications', 'logs_sistema',
  '_DonorToProject', '_PartnerToProject', '_ProjectTeamMembers', '_ProjectToVolunteer',
];

const backup = {};
for (const t of tables) {
  const r = await pool.query(`SELECT * FROM "${t}"`);
  backup[t] = r.rows;
  console.log(t.padEnd(24), r.rows.length, 'linhas');
}

fs.writeFileSync(
  new URL('./backup-pre-multitenant.json', import.meta.url),
  JSON.stringify(backup, null, 2),
);

await pool.end();
console.log('Backup salvo em prisma/backup-pre-multitenant.json');
