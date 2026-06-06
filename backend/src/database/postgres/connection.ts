import dns from 'node:dns/promises';
import pg from 'pg';
import { config } from '../../config/index.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

async function buildPoolConfig(): Promise<pg.PoolConfig> {
  const url = new URL(config.postgres.url);
  const isRemoteSsl = url.hostname.includes('neon.tech') || url.searchParams.get('sslmode');

  if (!isRemoteSsl) {
    return {
      connectionString: config.postgres.url,
      connectionTimeoutMillis: 15_000,
    };
  }

  // Neon: resolve IPv4 + SNI — avoids broken IPv6 routes and multi-IP connect timeouts
  const { address: host } = await dns.lookup(url.hostname, { family: 4 });

  return {
    host,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    connectionTimeoutMillis: 15_000,
    ssl: { rejectUnauthorized: true, servername: url.hostname },
  };
}

export function getPool(): pg.Pool {
  if (!pool) {
    throw new Error('Postgres pool not initialized — call connectPostgres() first');
  }
  return pool;
}

/** Shared Postgres pool — Role B connects in M2, all modules use getPool() */
export async function connectPostgres(): Promise<void> {
  if (pool) return;
  pool = new Pool(await buildPoolConfig());
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
