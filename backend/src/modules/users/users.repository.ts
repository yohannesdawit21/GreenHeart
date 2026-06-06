import type { UpdateProfileRequest, UserRole } from '../../shared/types/contracts.js';
import { getPool } from '../../database/postgres/connection.js';

export interface UserWithProfileRow {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  username: string;
  bio: string;
  tags: string[];
  coin_rate_per_session: number;
}

export interface AdvisorRow {
  id: string;
  username: string;
  bio: string;
  tags: string[];
  coin_rate_per_session: number;
}

export async function findUserByEmail(email: string): Promise<UserWithProfileRow | null> {
  const { rows } = await getPool().query<UserWithProfileRow>(
    `SELECT u.id, u.email, u.password_hash, u.role, u.created_at,
            p.username, p.bio, p.tags, p.coin_rate_per_session
     FROM users u
     JOIN profiles p ON p.user_id = u.id
     WHERE u.email = $1`,
    [email.toLowerCase()],
  );
  return rows[0] ?? null;
}

export async function findUserById(userId: string): Promise<UserWithProfileRow | null> {
  const { rows } = await getPool().query<UserWithProfileRow>(
    `SELECT u.id, u.email, u.password_hash, u.role, u.created_at,
            p.username, p.bio, p.tags, p.coin_rate_per_session
     FROM users u
     JOIN profiles p ON p.user_id = u.id
     WHERE u.id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function createUserWithProfileAndWallet(input: {
  email: string;
  passwordHash: string;
  role: UserRole;
  username: string;
  bio: string;
  tags: string[];
  coinRatePerSession: number;
}): Promise<UserWithProfileRow> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query<{ id: string; created_at: Date }>(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [input.email.toLowerCase(), input.passwordHash, input.role],
    );
    const userId = userResult.rows[0].id;

    await client.query(
      `INSERT INTO profiles (user_id, username, bio, tags, coin_rate_per_session)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, input.username, input.bio, input.tags, input.coinRatePerSession],
    );

    await client.query(
      `INSERT INTO wallets (user_id, coin_balance, escrow_balance, withdrawable_balance)
       VALUES ($1, 0, 0, 0)`,
      [userId],
    );

    await client.query('COMMIT');

    const user = await findUserById(userId);
    if (!user) throw new Error('Failed to load created user');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateUserProfile(userId: string, updates: UpdateProfileRequest): Promise<UserWithProfileRow> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (updates.username !== undefined) {
    fields.push(`username = $${idx++}`);
    values.push(updates.username);
  }
  if (updates.bio !== undefined) {
    fields.push(`bio = $${idx++}`);
    values.push(updates.bio);
  }
  if (updates.tags !== undefined) {
    fields.push(`tags = $${idx++}`);
    values.push(updates.tags);
  }
  if (updates.coinRatePerSession !== undefined) {
    fields.push(`coin_rate_per_session = $${idx++}`);
    values.push(updates.coinRatePerSession);
  }

  if (fields.length === 0) {
    const user = await findUserById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  values.push(userId);
  await getPool().query(
    `UPDATE profiles SET ${fields.join(', ')} WHERE user_id = $${idx}`,
    values,
  );

  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  return user;
}

export async function listAdvisors(): Promise<AdvisorRow[]> {
  const { rows } = await getPool().query<AdvisorRow>(
    `SELECT u.id, p.username, p.bio, p.tags, p.coin_rate_per_session
     FROM users u
     JOIN profiles p ON p.user_id = u.id
     WHERE u.role = 'advisor'
     ORDER BY p.username ASC`,
  );
  return rows;
}

export async function findAdvisorById(advisorId: string): Promise<AdvisorRow | null> {
  const { rows } = await getPool().query<AdvisorRow>(
    `SELECT u.id, p.username, p.bio, p.tags, p.coin_rate_per_session
     FROM users u
     JOIN profiles p ON p.user_id = u.id
     WHERE u.id = $1 AND u.role = 'advisor'`,
    [advisorId],
  );
  return rows[0] ?? null;
}
