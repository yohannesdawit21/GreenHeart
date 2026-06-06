/**
 * Wipe all app data, re-apply SQL migrations, seed admin only.
 * Run: npm run db:reset
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectPostgres, disconnectPostgres, getPool } from '../src/database/postgres/connection.js';
import { connectRedis, disconnectRedis, getRedis } from '../src/database/redis/connection.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlDir = join(__dirname, '../sql');
const BCRYPT_ROUNDS = 10;

async function wipePostgres() {
  const pool = getPool();
  await pool.query(`
    TRUNCATE TABLE
      verification_interviews,
      advisor_embeddings,
      sessions,
      transactions,
      wallets,
      profiles,
      users
    RESTART IDENTITY CASCADE
  `);
  console.log('[reset] postgres data cleared');
}

async function applyMigrations() {
  const files = readdirSync(sqlDir)
    .filter((f) => /^\d{3}_.+\.sql$/.test(f))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(sqlDir, file), 'utf8');
    await getPool().query(sql);
    console.log(`[reset] applied ${file}`);
  }
}

async function seedAdminOnly() {
  const email = (process.env.ADMIN_SEED_EMAIL ?? 'admin@gmail.com').toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD ?? '12345678';
  const username = process.env.ADMIN_SEED_USERNAME ?? 'Platform Admin';

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const userResult = await client.query<{ id: string }>(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin') RETURNING id`,
      [email, passwordHash],
    );
    const userId = userResult.rows[0].id;
    await client.query(
      `INSERT INTO profiles (user_id, username, bio, tags, coin_rate_per_session, verification_status)
       VALUES ($1, $2, '', '{}', 0, NULL)`,
      [userId, username],
    );
    await client.query(
      `INSERT INTO wallets (user_id, coin_balance, escrow_balance, withdrawable_balance)
       VALUES ($1, 0, 0, 0)`,
      [userId],
    );
    await client.query('COMMIT');
    console.log('[reset] seeded admin:', email);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function flushRedisIfAvailable() {
  try {
    await connectRedis();
    await getRedis().flushDb();
    console.log('[reset] redis flushed');
    await disconnectRedis();
  } catch (err) {
    console.warn('[reset] redis flush skipped:', (err as Error).message);
  }
}

async function reset() {
  await connectPostgres();
  await wipePostgres();
  await applyMigrations();
  await seedAdminOnly();
  await disconnectPostgres();
  await flushRedisIfAvailable();
  console.log('[reset] done — fresh DB with admin only');
}

reset().catch((err) => {
  console.error('[reset] failed:', err);
  process.exit(1);
});
