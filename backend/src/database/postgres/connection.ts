import pg from 'pg';
import { config } from '../../config/index.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    throw new Error('Postgres pool not initialized — call connectPostgres() first');
  }
  return pool;
}

/** Shared Postgres pool — Role B connects in M2, all modules use getPool() */
export async function connectPostgres(): Promise<void> {
  if (pool) return;
  pool = new Pool({ connectionString: config.postgres.url });
  await pool.query('SELECT 1');
  console.log('[postgres] connected');
}

export async function disconnectPostgres(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[postgres] disconnected');
  }
}
