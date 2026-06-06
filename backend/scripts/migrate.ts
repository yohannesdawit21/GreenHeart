import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectPostgres, disconnectPostgres, getPool } from '../src/database/postgres/connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlDir = join(__dirname, '../sql');

async function migrate() {
  await connectPostgres();
  const files = readdirSync(sqlDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(sqlDir, file), 'utf8');
    await getPool().query(sql);
    console.log(`[migrate] applied ${file}`);
  }

  await disconnectPostgres();
}

migrate().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
