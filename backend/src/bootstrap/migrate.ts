import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { connectPostgres, disconnectPostgres, getPool } from '../database/postgres/connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** SQL migrations live next to dist/ at /app/sql in Docker. */
function getSqlDir(): string {
  return join(__dirname, '../../sql');
}

/** Apply numbered SQL migrations in order (001, 002, …). */
export async function runMigrations(): Promise<void> {
  const sqlDir = getSqlDir();
  const files = readdirSync(sqlDir)
    .filter((f) => /^\d{3}_.+\.sql$/.test(f))
    .sort();

  await connectPostgres();

  for (const file of files) {
    const sql = readFileSync(join(sqlDir, file), 'utf8');
    await getPool().query(sql);
    console.log(`[migrate] applied ${file}`);
  }

  await disconnectPostgres();
}

const isDirectRun =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  runMigrations().catch((err) => {
    console.error('[migrate] failed:', err);
    process.exit(1);
  });
}
