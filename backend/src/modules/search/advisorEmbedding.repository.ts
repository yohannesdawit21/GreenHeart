import { getPool } from '../../database/postgres/connection.js';

export interface AdvisorSearchRow {
  id: string;
  username: string;
  bio: string;
  tags: string[];
  coinRatePerSession: number;
  distance: number;
}

export interface AdvisorProfileRow {
  userId: string;
  role: string;
  username: string;
  bio: string;
  tags: string[];
  coinRatePerSession: number;
  verificationStatus: string | null;
  advisorCredentials: unknown;
}

export async function findAdvisorProfile(userId: string): Promise<AdvisorProfileRow | null> {
  const pool = getPool();
  const result = await pool.query<{
    user_id: string;
    role: string;
    username: string;
    bio: string;
    tags: string[];
    coin_rate_per_session: number;
    verification_status: string | null;
    advisor_credentials: unknown;
  }>(
    `SELECT u.id AS user_id, u.role, p.username, p.bio, p.tags, p.coin_rate_per_session,
            p.verification_status, p.advisor_credentials
     FROM users u
     JOIN profiles p ON p.user_id = u.id
     WHERE u.id = $1`,
    [userId],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    userId: row.user_id,
    role: row.role,
    username: row.username,
    bio: row.bio,
    tags: row.tags ?? [],
    coinRatePerSession: row.coin_rate_per_session,
    verificationStatus: row.verification_status,
    advisorCredentials: row.advisor_credentials,
  };
}

export async function semanticSearchAdvisors(
  vectorLiteral: string,
  maxDistance: number,
  limit: number,
): Promise<AdvisorSearchRow[]> {
  const pool = getPool();
  const result = await pool.query<{
    id: string;
    username: string;
    bio: string;
    tags: string[];
    coin_rate_per_session: number;
    distance: number;
  }>(
    `SELECT u.id, p.username, p.bio, p.tags, p.coin_rate_per_session,
            (ae.embedding <=> $1::vector) AS distance
     FROM advisor_embeddings ae
     JOIN users u ON u.id = ae.user_id
     JOIN profiles p ON p.user_id = u.id
     WHERE u.role = 'advisor'
       AND (
         p.verification_status = 'verified'
         OR p.verification_status IS NULL
       )
       AND (ae.embedding <=> $1::vector) < $2
     ORDER BY distance ASC
     LIMIT $3`,
    [vectorLiteral, maxDistance, limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    username: row.username,
    bio: row.bio,
    tags: row.tags ?? [],
    coinRatePerSession: row.coin_rate_per_session,
    distance: Number(row.distance),
  }));
}

export async function upsertAdvisorEmbedding(
  userId: string,
  tags: string[],
  biographyText: string,
  vectorLiteral: string,
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO advisor_embeddings (user_id, advisor_tags, biography_text, embedding, updated_at)
     VALUES ($1, $2, $3, $4::vector, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       advisor_tags = EXCLUDED.advisor_tags,
       biography_text = EXCLUDED.biography_text,
       embedding = EXCLUDED.embedding,
       updated_at = NOW()`,
    [userId, tags, biographyText, vectorLiteral],
  );
}

export async function deleteAdvisorEmbedding(userId: string): Promise<void> {
  const pool = getPool();
  await pool.query('DELETE FROM advisor_embeddings WHERE user_id = $1', [userId]);
}
