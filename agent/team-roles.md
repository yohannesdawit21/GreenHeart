# Team Roles — 3-Person Split

Designed so **each person owns disjoint directories** and rarely touches the same files, minimizing git merge conflicts.

**Sprint status:** [progress/STATUS.md](../progress/STATUS.md)  
**End-to-end demo flow:** [workflows/end-to-end.md](./workflows/end-to-end.md)

---

## Platform roles (RBAC — who uses the app)

These are **user account types** in the database (`users.role`). Implemented in **M2 + M6** (Role B).

| Role | How account is created | What they do in the app |
|------|------------------------|-------------------------|
| `client` | Self-register at `/auth` (patient path) | Buy coins, search **verified** advisors, start video consultations |
| `advisor` | Self-register at `/auth/advisor-apply` (doctor path) | Apply to offer services; starts as `pending_review` until verified |
| `partner_doctor` | Admin creates account | Review doctor applicants, run verification video interviews, pass/fail |
| `admin` | DB seed only (`001_admin.sql`) | Register partner doctors, override verification status |

### Advisor verification status (`profiles.verification_status`)

Only applies to `advisor` role. Controls search visibility and online presence.

| Status | Searchable | Can go online | Set by |
|--------|------------|---------------|--------|
| `pending_review` | No | No | Default on advisor-apply register |
| `verified` | Yes | Yes | Partner doctor passes interview |
| `rejected` | No | No | Partner doctor fails interview |
| `suspended` | No | No | Admin override |

Full spec: [modules/M6-advisor-verification.md](./modules/M6-advisor-verification.md)

---

## Module map (all teammates)

| ID | Name | Owner | Spec | Progress board | Status on `main` |
|----|------|-------|------|----------------|------------------|
| **M1** | Frontend | Role A | [M1-frontend.md](./modules/M1-frontend.md) | [progress](../progress/modules/M1-frontend.md) | Phase 1–6 **done** (PR #2) |
| **M2** | Auth & Users | Role B | [M2-auth-users.md](./modules/M2-auth-users.md) | [progress](../progress/modules/M2-auth-users.md) | Core **done** — M6 extensions pending |
| **M3** | Wallet & Ledger | Role B | [M3-wallet-ledger.md](./modules/M3-wallet-ledger.md) | [progress](../progress/modules/M3-wallet-ledger.md) | **Done** |
| **M4** | Search & Vectors | Role C | [M4-search-vectors.md](./modules/M4-search-vectors.md) | [progress](../progress/modules/M4-search-vectors.md) | **Done** — PR `feat/m5-presence-sessions` (awaiting merge) |
| **M5** | Presence & Sessions | Role C | [M5-presence-sessions.md](./modules/M5-presence-sessions.md) | [progress](../progress/modules/M5-presence-sessions.md) | **Done** — PR `feat/m5-presence-sessions` (awaiting merge) |
| **M6** | Advisor Verification | B + A + C | [M6-advisor-verification.md](./modules/M6-advisor-verification.md) | [progress](../progress/modules/M6-advisor-verification.md) | Role C LiveKit **done** — PR `feat/m6-verification-livekit`; Role B/A pending |

---

## Role A — Frontend Lead

**Teammate focus:** All UI, LiveKit/Socket **clients**, API integration. No backend code.

### Owns (exclusive write)

```
frontend/
```

### May read (no direct edits)

- `shared/contracts/*` — import types only
- `agent/modules/M1-frontend.md`
- `agent/modules/M6-advisor-verification.md` (UI sections only)
- `progress/modules/M1-frontend.md`
- `progress/modules/M6-advisor-verification.md` (Role A section)

### Does NOT touch

- `backend/**`
- Other teammates' progress boards

### Modules assigned

| Module | Deliverable |
|--------|-------------|
| **M1** | Six layouts wired to APIs; Socket.io client; LiveKit consultation room |
| **M6** | Admin, partner, advisor-apply, verification room UIs |

### ✅ Already done (M1 — PR #2 merged)

- API client layer (`frontend/src/api/`)
- AuthContext, SocketContext
- Auth, Discover, Wallet, Advisor Control, Consultation, Incoming Call pages wired

### 📋 Your next tasks (Sprint 2)

1. **Role-based redirect after login** — `client` → `/discover`, `advisor` → advisor dashboard, `partner_doctor` → `/partner`, `admin` → `/admin`
2. **`/auth/advisor-apply`** — doctor signup form → `POST /api/auth/register/advisor` (Role B)
3. **Advisor dashboard** — show `verification_status` banner (pending / rejected / verified)
4. **`/partner`** — applicant queue, start interview, pass/fail buttons
5. **`/verification/:interviewId`** — LiveKit room (reuse consultation pattern, no wallet UI)
6. **`/admin`** — register partner doctors, list partners, override verification status
7. **Polish** — disable online toggle if not verified; handle `ADVISOR_NOT_VERIFIED` errors

**Blocked until:** Role B verification APIs; Role C M4/M5/LiveKit verification tokens

### Git branch naming

`feat/m1-*` or `feat/m6-*` (frontend-only)

---

## Role B — Backend Core (Identity & Ledger)

**Teammate focus:** PostgreSQL (core tables), auth, users, wallet, escrow, verification RBAC, payment webhooks.

### Owns (exclusive write)

```
backend/src/modules/auth/
backend/src/modules/users/
backend/src/modules/wallet/
backend/src/modules/verification/
backend/src/database/postgres/
backend/sql/001_users_wallets.sql
backend/sql/004_advisor_verification.sql
backend/sql/seed/001_admin.sql
shared/contracts/auth.api.ts
shared/contracts/users.api.ts
shared/contracts/wallet.api.ts
shared/contracts/models.user.ts
shared/contracts/verification.api.ts
agent/modules/M2-auth-users.md
agent/modules/M3-wallet-ledger.md
agent/modules/M6-advisor-verification.md
progress/modules/M2-auth-users.md
progress/modules/M3-wallet-ledger.md
progress/modules/M6-advisor-verification.md
```

### Shared files — Role B is **maintainer**

| File | Rule |
|------|------|
| `backend/src/app.ts` | Role B registers auth / users / wallet / verification / admin routes |
| `backend/src/index.ts` | Role B sets up HTTP server bootstrap |
| `backend/package.json` | Add deps for your modules; coordinate major bumps |
| `backend/.env.example` | Add DATABASE_URL, JWT_*, PAYMENT_* vars |

### Modules assigned

| Module | Deliverable |
|--------|-------------|
| **M2** | JWT auth, user CRUD, four platform roles, admin seed |
| **M3** | Ledger, escrow atomic ops, deposit webhook |
| **M6** | Verification status, partner/admin APIs, split registration |

### ✅ Already done (M2 + M3 merged)

- Postgres pool + Neon IPv4 fix
- Register / login / logout / me / profile / advisors list
- Wallet balance, transactions, purchase, webhook, escrow lock/release/refund
- `npm run db:migrate`, `npm run test:smoke` (15 tests)

### 📋 Your next tasks (Sprint 2)

1. **Extend `users.role`** — `admin | partner_doctor | advisor | client` (SQL + JWT + contracts)
2. **Run `004_advisor_verification.sql`** — `verification_status` on profiles + `verification_interviews` table
3. **Admin seed** — `backend/sql/seed/001_admin.sql`
4. **Split registration** — `POST /api/auth/register` (clients only); `POST /api/auth/register/advisor` → `pending_review`
5. **Create `verification/` module** — applicants queue, start/complete interview APIs
6. **Admin APIs** — register/list partner doctors; PATCH verification status override
7. **Update contracts** — `auth.api.ts`, `models.user.ts`, create `verification.api.ts`
8. **`/api/auth/me`** — return `verificationStatus` for advisors

**Blocked until:** Role C PR `feat/m5-presence-sessions` merged — then call `POST /api/search/reindex/:advisorId` on verify pass

### Git branch naming

`feat/m2-*` / `feat/m3-*` / `feat/m6-*`

---

## Role C — Backend Realtime & Intelligence

**Teammate focus:** pgvector search, Redis presence, Socket.io server, LiveKit, session orchestration, verified-only gates.

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
| `backend/src/app.ts` | Role C registers search / presence / session routes + attaches socket |
| `backend/src/index.ts` | Role C initializes Socket.io on shared HTTP server |
| `backend/.env.example` | Add REDIS_*, LIVEKIT_*, GEMINI_* vars |
| `backend/src/livekit/token.service.ts` | Shared by M5 consultations + M6 verification interviews |

### Modules assigned

| Module | Deliverable |
|--------|-------------|
| **M4** | Gemini embeddings, semantic search, reindex (**verified advisors only**) |
| **M5** | Redis presence, Socket.io, sessions, LiveKit tokens, escrow orchestration |
| **M6** | Verification interview LiveKit tokens; gate presence + sessions on verified |

### ✅ Already on `main`

- `embedding.service.ts` (Gemini REST — document + query task types)
- Search / presence / session **route stubs** only

### ✅ Done on feature branches (merge PRs → `main`)

| Branch | Modules | Summary |
|--------|---------|---------|
| `feat/m5-presence-sessions` | **M4 + M5** | Semantic search, reindex, Redis presence, sessions, Socket.io, LiveKit consultations, verified-only gates, `npm run test:smoke:m5` |
| `feat/m6-verification-livekit` | **M6 (Role C)** | `livekit/verification.service.ts` + verification contract types (depends on M5 PR) |

Close / skip PR `feat/m4-m5-role-c` — superseded by `feat/m5-presence-sessions`.

### 📋 Your next tasks (Sprint 2)

1. **Merge** `feat/m5-presence-sessions` → `main` (M4 + M5)
2. **Merge** `feat/m6-verification-livekit` → `main` after M5 (M6 LiveKit helpers)
3. **Support Role B** — they wire `GET /api/verification/interviews/:id/livekit-token` using `createVerificationParticipantToken()`
4. **E2E** — full call flow smoke test once PRs are on `main`

### Git branch naming

`feat/m4-*` / `feat/m5-*` / `feat/m6-verification-livekit` (Role C slice of M6)

---

## Conflict prevention checklist

1. **One module folder = one owner.** Do not implement wallet logic inside `sessions/`.
2. **Cross-module calls go through service interfaces**, not direct DB access across modules.
   - Example: M5 calls `walletService.lockEscrow()` exported from M3.
3. **API contracts live in `shared/contracts/`** — owner of that domain edits the file.
4. **`backend/src/app.ts` merge strategy:** Each role adds routes in a clearly marked block:

```typescript
// --- Role B routes ---
app.use('/api/auth', authRouter);
app.use('/api/verification', verificationRouter);
// --- Role C routes ---
app.use('/api/search', searchRouter);
```

5. **Frontend never imports from `backend/`** — only from `shared/contracts` or HTTP.
6. **Claim tasks** on your progress board before starting (`Agent: your-name`).

---

## Sprint order (updated 2026-06-06)

| Week | Role A | Role B | Role C |
|------|--------|--------|--------|
| ~~1~~ | ~~M1: API layer + wire pages~~ ✅ | ~~M2: JWT + register~~ ✅ | ~~M4: pgvector + semantic search~~ ✅ → PR `feat/m5-presence-sessions` |
| ~~2~~ | ~~M1: Discovery + wallet + socket~~ ✅ | ~~M3: Escrow + webhook~~ ✅ | ~~M5: Redis + Socket.io + LiveKit~~ ✅ → PR `feat/m5-presence-sessions` |
| **3 (now)** | M6: `/auth/advisor-apply`, `/partner`, `/admin` UIs | M6: roles, `004` SQL, verification APIs, admin seed | **Merge PRs** → `main`; support Role B LiveKit token route |
| **4** | `/verification/:interviewId` UI + E2E demo | Wire reindex on verify pass; hardening | Full call + verification flow on `main` |

**PR order:** `feat/m5-presence-sessions` first, then `feat/m6-verification-livekit`. Do not merge `feat/m4-m5-role-c` (superseded).

---

## Assignment template (fill in names)

| Role | Teammate | GitHub | Branch prefix | Start here |
|------|----------|--------|---------------|------------|
| A — Frontend | _TBD_ | _TBD_ | `feat/m1-*`, `feat/m6-*` | [M1 progress](../progress/modules/M1-frontend.md) |
| B — Core Backend | _TBD_ | _TBD_ | `feat/m2-*`, `feat/m6-*` | [M2 progress](../progress/modules/M2-auth-users.md) |
| C — Realtime & AI | _TBD_ | _TBD_ | `feat/m4-*`, `feat/m5-*`, `feat/m6-*` | [M4 progress](../progress/modules/M4-search-vectors.md) |
