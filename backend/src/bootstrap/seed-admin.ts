import { pathToFileURL } from 'node:url';
import bcrypt from 'bcryptjs';
import { connectPostgres, disconnectPostgres, getPool } from '../database/postgres/connection.js';

const BCRYPT_ROUNDS = 10;

export async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_SEED_EMAIL ?? 'admin@gmail.com';
  const password = process.env.ADMIN_SEED_PASSWORD ?? '12345678';
  const username = process.env.ADMIN_SEED_USERNAME ?? 'Platform Admin';

  await connectPostgres();
  const pool = getPool();

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rowCount && existing.rowCount > 0) {
    console.log('[seed] admin already exists:', email);
    await disconnectPostgres();
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userResult = await client.query<{ id: string }>(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin') RETURNING id`,
      [email.toLowerCase(), passwordHash],
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
    console.log('[seed] created admin:', email);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await disconnectPostgres();
  }
}

const isDirectRun =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  seedAdmin().catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  });
}
