import { getPool } from '../../database/postgres/connection.js';

export interface ReviewRow {
  id: string;
  session_id: string;
  client_id: string;
  advisor_id: string;
  rating: number;
  comment: string | null;
  created_at: Date;
}

export interface ClientReviewRow extends ReviewRow {
  advisor_username: string;
}

export interface AdvisorRatingAggregate {
  advisor_id: string;
  average_rating: number;
  review_count: number;
}

export async function createReview(input: {
  sessionId: string;
  clientId: string;
  advisorId: string;
  rating: number;
  comment?: string;
}): Promise<ReviewRow> {
  const { rows } = await getPool().query<ReviewRow>(
    `INSERT INTO reviews (session_id, client_id, advisor_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, session_id, client_id, advisor_id, rating, comment, created_at`,
    [input.sessionId, input.clientId, input.advisorId, input.rating, input.comment ?? null],
  );
  return rows[0];
}

export async function findReviewBySessionId(sessionId: string): Promise<ReviewRow | null> {
  const { rows } = await getPool().query<ReviewRow>(
    `SELECT id, session_id, client_id, advisor_id, rating, comment, created_at
     FROM reviews WHERE session_id = $1`,
    [sessionId],
  );
  return rows[0] ?? null;
}

export async function listReviewsForAdvisor(advisorId: string, limit = 50): Promise<ReviewRow[]> {
  const { rows } = await getPool().query<ReviewRow>(
    `SELECT id, session_id, client_id, advisor_id, rating, comment, created_at
     FROM reviews
     WHERE advisor_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [advisorId, limit],
  );
  return rows;
}

export async function listReviewsForClient(clientId: string, limit = 50): Promise<ClientReviewRow[]> {
  const { rows } = await getPool().query<ClientReviewRow>(
    `SELECT r.id, r.session_id, r.client_id, r.advisor_id, r.rating, r.comment, r.created_at,
            p.username AS advisor_username
     FROM reviews r
     JOIN profiles p ON p.user_id = r.advisor_id
     WHERE r.client_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2`,
    [clientId, limit],
  );
  return rows;
}

export async function getAdvisorRatingAggregate(advisorId: string): Promise<AdvisorRatingAggregate | null> {
  const { rows } = await getPool().query<AdvisorRatingAggregate>(
    `SELECT advisor_id,
            COALESCE(AVG(rating)::numeric(3,2), 0) AS average_rating,
            COUNT(*)::int AS review_count
     FROM reviews
     WHERE advisor_id = $1
     GROUP BY advisor_id`,
    [advisorId],
  );
  return rows[0] ?? null;
}

export async function getRatingAggregatesForAdvisors(
  advisorIds: string[],
): Promise<Map<string, { averageRating: number; reviewCount: number }>> {
  const map = new Map<string, { averageRating: number; reviewCount: number }>();
  if (advisorIds.length === 0) return map;

  const { rows } = await getPool().query<AdvisorRatingAggregate>(
    `SELECT advisor_id,
            COALESCE(AVG(rating)::numeric(3,2), 0) AS average_rating,
            COUNT(*)::int AS review_count
     FROM reviews
     WHERE advisor_id = ANY($1::uuid[])
     GROUP BY advisor_id`,
    [advisorIds],
  );

  for (const row of rows) {
    map.set(row.advisor_id, {
      averageRating: Number(row.average_rating),
      reviewCount: row.review_count,
    });
  }
  return map;
}
