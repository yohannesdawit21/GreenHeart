import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectPostgres, disconnectPostgres, getPool } from '../src/database/postgres/connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  await connectPostgres();
  const sqlPath = join(__dirname, '../sql/001_users_wallets.sql');
  const sql = readFileSync(sqlPath, 'utf8');
  await getPool().query(sql);
  console.log('[migrate] applied 001_users_wallets.sql');
  await disconnectPostgres();
}

migrate().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
