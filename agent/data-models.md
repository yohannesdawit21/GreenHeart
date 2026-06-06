# Data Models

All persistent data lives in **PostgreSQL**. Redis holds ephemeral presence only.

## PostgreSQL — `users` (Role B)

```sql
users (
  id UUID PK,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  role 'client' | 'advisor' | 'partner_doctor' | 'admin',
  created_at TIMESTAMPTZ
)
```

First `admin` row is inserted by `backend/sql/seed/001_admin.sql` (not self-register).

## PostgreSQL — `profiles` (Role B)

```sql
profiles (
  user_id UUID PK → users(id),
  username VARCHAR,
  bio TEXT,
  tags TEXT[],
  coin_rate_per_session INT,  -- advisors (after verified)
  verification_status 'pending_review' | 'verified' | 'rejected' | 'suspended'  -- advisors only; NULL for other roles
)
```

Advisor applicants default to `pending_review`. Partner doctor pass → `verified` (then M4 reindex). Admin may set any status.

## PostgreSQL — `wallets` (Role B)

```sql
wallets (
  user_id UUID PK → users(id),
  coin_balance INT >= 0,
  escrow_balance INT >= 0,
  withdrawable_balance INT >= 0
)
```

## PostgreSQL — `transactions` (Role B)

```sql
transactions (
  id UUID PK,
  client_id UUID → users,
  advisor_id UUID → users (nullable),
  type deposit | escrow_lock | escrow_release | escrow_refund,
  amount_coins INT,
  fiat_amount, currency, status, gateway_reference UNIQUE,
  created_at TIMESTAMPTZ
)
```

## PostgreSQL — `sessions` (Role C)

```sql
sessions (
  id UUID PK,
  session_id VARCHAR UNIQUE,  -- public id for URLs
  client_id, advisor_id UUID → users,
  status pending | ringing | active | completed | declined | cancelled,
  coin_amount INT,
  duration_minutes INT,
  livekit_room VARCHAR,
  created_at, started_at, ended_at TIMESTAMPTZ
)
```

## PostgreSQL — `verification_interviews` (Role B — M6)

```sql
verification_interviews (
  id UUID PK,
  applicant_id UUID → users(id),      -- advisor role
  partner_doctor_id UUID → users(id),
  status scheduled | in_progress | completed,
  outcome pass | fail,                -- set on complete
  livekit_room VARCHAR,
  notes TEXT,
  created_at, started_at, completed_at TIMESTAMPTZ
)
```

In-app video interview between partner doctor and advisor applicant. No escrow.

## PostgreSQL — `advisor_embeddings` (Role C)

See `backend/sql/003_advisor_embeddings.sql`. `user_id` is UUID FK → `users(id)`.

## Redis keys (Role C)

| Key pattern | Type | Value |
|-------------|------|-------|
| `online_advisors` | HASH | `advisorId → socketId` |
| `session:{sessionId}` | STRING | JSON session snapshot (TTL) |

## SQL migrations (run in order)

1. `backend/sql/001_users_wallets.sql` — Role B
2. `backend/sql/002_sessions.sql` — Role C
3. `backend/sql/003_advisor_embeddings.sql` — Role C (requires pgvector)
4. `backend/sql/004_advisor_verification.sql` — Role B (M6)
5. `backend/sql/seed/001_admin.sql` — Role B (first admin)

## TypeScript exports

Canonical types: `shared/contracts/models.*.ts`
