import { runMigrations } from '../src/bootstrap/migrate.js';

runMigrations().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
