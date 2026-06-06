# Team Roles — 3-Person Split

Designed so **each person owns disjoint directories** and rarely touches the same files, minimizing git merge conflicts.

---

## Role A — Frontend Lead

**Teammate focus:** Client & advisor UI, LiveKit/Socket **clients**, API integration.

### Owns (exclusive write)

```
frontend/
```

### May read (no direct edits)

- `shared/contracts/*` — import types only
- `agent/modules/M1-frontend.md`
- `progress/modules/M1-frontend.md`

### Does NOT touch

- `backend/**`
- Other teammates' progress boards

### Modules assigned

| Module | Deliverable |
|--------|-------------|
| **M1** | Wire all 6 layouts to real APIs; Socket.io client; LiveKit room |

### Git branch naming

`feat/m1-<short-description>` or `feat/frontend-<feature>`

---

## Role B — Backend Core (Identity & Ledger)

**Teammate focus:** PostgreSQL (core tables), auth, users, wallet, escrow, payment webhooks.

### Owns (exclusive write)

```
backend/src/modules/auth/
backend/src/modules/users/
backend/src/modules/wallet/
backend/src/database/postgres/     # Role B: init pool in M2; all modules use getPool()
backend/sql/001_users_wallets.sql
shared/contracts/auth.api.ts
shared/contracts/users.api.ts
shared/contracts/wallet.api.ts
shared/contracts/models.user.ts
agent/modules/M2-auth-users.md
agent/modules/M3-wallet-ledger.md
progress/modules/M2-auth-users.md
progress/modules/M3-wallet-ledger.md
```

### Shared files — Role B is **maintainer**

| File | Rule |
|------|------|
| `backend/src/app.ts` | Role B registers auth/users/wallet routes only |
| `backend/src/index.ts` | Role B sets up HTTP server bootstrap |
| `backend/package.json` | Add deps for your modules; coordinate major bumps |
| `backend/.env.example` | Add DATABASE_URL, JWT_*, PAYMENT_* vars |

### Modules assigned

| Module | Deliverable |
|--------|-------------|
| **M2** | JWT auth, user CRUD, role separation |
| **M3** | Ledger, escrow atomic ops, deposit webhook |

### Git branch naming

`feat/m2-*` / `feat/m3-*`

---

## Role C — Backend Realtime & Intelligence

**Teammate focus:** PostgreSQL/pgvector, Redis presence, Socket.io server, LiveKit, session orchestration.

### Owns (exclusive write)

```
backend/src/modules/search/
backend/src/modules/presence/
backend/src/modules/sessions/
backend/src/database/redis/
backend/src/socket/
backend/src/livekit/
backend/sql/002_sessions.sql
backend/sql/003_advisor_embeddings.sql
shared/contracts/search.api.ts
shared/contracts/session.api.ts
shared/contracts/socket.events.ts
shared/contracts/models.session.ts
agent/modules/M4-search-vectors.md
agent/modules/M5-presence-sessions.md
progress/modules/M4-search-vectors.md
progress/modules/M5-presence-sessions.md
```

### Shared files — Role C edits **only these sections**

| File | Rule |
|------|------|
| `backend/src/app.ts` | Role C registers search/presence/session routes + attaches socket |
| `backend/src/index.ts` | Role C initializes Socket.io on shared HTTP server |
| `backend/.env.example` | Add PG_*, REDIS_*, LIVEKIT_*, OPENAI_* vars |

### Modules assigned

| Module | Deliverable |
|--------|-------------|
| **M4** | Embedding pipeline + semantic search endpoint |
| **M5** | Presence, call signaling, LiveKit token API |

### Git branch naming

`feat/m4-*` / `feat/m5-*`

---

## Conflict prevention checklist

1. **One module folder = one owner.** Do not implement wallet logic inside `sessions/`.
2. **Cross-module calls go through service interfaces**, not direct DB access across modules.
   - Example: M5 calls `walletService.lockEscrow(clientId, amount)` exported from M3.
3. **API contracts live in `shared/contracts/`** — one file per domain; owner of that domain edits the file.
4. **`backend/src/app.ts` merge strategy:** Each role adds routes in a clearly marked block:

```typescript
// --- Role B routes ---
app.use('/api/auth', authRouter);
// --- Role C routes ---
app.use('/api/search', searchRouter);
```

5. **Frontend never imports from `backend/`** — only from `shared/contracts` or HTTP.
6. **Claim tasks** on your progress board before starting (`Agent: your-name`).

---

## Suggested sprint order

| Week | Role A | Role B | Role C |
|------|--------|--------|--------|
| 1 | M1: API client layer, auth forms → `/api/auth` | M2: Postgres pool + JWT + register | M4: pgvector + embeddings schema |
| 2 | M1: Discovery + wallet UI wired | M3: Escrow + mock webhook | M5: Redis presence + socket hub |
| 3 | M1: LiveKit + incoming call overlay | M3: Transaction history API | M5: Session initiate + LiveKit tokens |
| 4 | Polish, E2E demo path | Hardening, tests | E2E call flow |

---

## Assignment template (fill in names)

| Role | Teammate | GitHub | Branch prefix |
|------|----------|--------|---------------|
| A — Frontend | _TBD_ | _TBD_ | `feat/m1-*` |
| B — Core Backend | _TBD_ | _TBD_ | `feat/m2-*`, `feat/m3-*` |
| C — Realtime & AI | _TBD_ | _TBD_ | `feat/m4-*`, `feat/m5-*` |
