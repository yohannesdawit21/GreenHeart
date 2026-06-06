# Architecture

## Topology (Postgres-only)

```
┌────────────────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite) — Role A                      │
│          Tailwind | LiveKit React SDK | Socket.io Client               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST / WebSockets
┌───────────────────────────────────▼────────────────────────────────────┐
│              Node.js API Gateway (Express) — Role B + C                 │
│                    Socket.io Server (Role C)                            │
└───────────┬───────────────────────────────────────────┬────────────────┘
            │                                           │
┌───────────▼───────────────────────────┐   ┌─────────▼────────────┐
│         PostgreSQL (+ pgvector)         │   │ Redis                │
│  users, profiles, wallets, transactions │   │ online_advisors map  │
│  sessions, advisor_embeddings           │   │ (Role C)             │
│  Role B: core tables | Role C: rest     │   └──────────────────────┘
└─────────────────────────────────────────┘
                        │
            ┌───────────▼───────────┐
            │ LiveKit Server        │
            │ (Role C)              │
            └───────────────────────┘
```

**Why Postgres-only?** One database simplifies ops, enables ACID escrow in SQL transactions, and lets semantic search JOIN advisor profiles with embeddings on `user_id` (UUID) without cross-database hydration.

**Redis stays** for ephemeral presence (`advisorId → socketId`) — not a replacement for Postgres.

## Backend module map

| Folder | Owner | Responsibility |
|--------|-------|----------------|
| `backend/src/modules/auth/` | Role B | JWT, login, register, cookies |
| `backend/src/modules/users/` | Role B | Profiles, roles, advisor tags/rates |
| `backend/src/modules/wallet/` | Role B | Balances, escrow, transactions, webhooks |
| `backend/src/modules/verification/` | Role B | Partner doctor RBAC, verification interviews, admin override |
| `backend/src/modules/search/` | Role C | Embeddings pipeline, pgvector queries |
| `backend/src/modules/presence/` | Role C | Redis advisor online state |
| `backend/src/modules/sessions/` | Role C | Initiate call, escrow trigger hook, LiveKit tokens |
| `backend/src/socket/` | Role C | Socket.io hub, event routing |
| `backend/src/livekit/` | Role C | Room service client wrapper |
| `backend/src/database/postgres/` | Role B init pool; all modules use `getPool()` |
| `backend/sql/001_*.sql` | Role B | users, profiles, wallets, transactions |
| `backend/sql/002_*.sql` | Role C | sessions |
| `backend/sql/003_*.sql` | Role C | advisor_embeddings + pgvector |
| `backend/sql/004_*.sql` | Role B | verification_status + verification_interviews |

## Critical workflows

### Semantic search (M4)

1. `POST /api/search/semantic` with `{ query: string }`
2. Embed query → 1536-dim vector
3. Postgres: vector distance + JOIN profiles; **filter `verification_status = verified`**
4. Return sorted advisor cards (single DB round-trip)

### Advisor verification interview (M6)

1. Partner doctor starts interview → `verification_interviews` row + LiveKit room (no escrow)
2. Partner + applicant join `/verification/:interviewId`
3. Partner completes with `pass` → `profiles.verification_status = verified` → M4 reindex
4. Admin may override status (`suspended`, etc.) outside this flow

### Escrow (M3, called by M5)

```sql
BEGIN;
UPDATE wallets
SET coin_balance = coin_balance - $1,
    escrow_balance = escrow_balance + $1
WHERE user_id = $2 AND coin_balance >= $1;
-- if rowCount = 0 → ROLLBACK, INSUFFICIENT_FUNDS
INSERT INTO transactions (client_id, type, amount_coins, status) VALUES (...);
COMMIT;
```

Implement in `wallet.service.ts` using `getPool()` and a transaction client.

### Call signaling (M5)

1. `POST /api/session/initiate` → escrow (M3 service) → insert `sessions` row
2. Socket emit `incoming_call_dispatch` to advisor socket id (from Redis)
3. Advisor `call_accepted` → LiveKit tokens to both
4. Frontend navigates to `/consultation/:sessionId`

## Environment variables

See `backend/.env.example`. Never commit secrets.

## Ports (local default)

| Service | Port |
|---------|------|
| Frontend (Vite) | 5173 |
| Backend API | 4000 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| LiveKit | 7880 |
