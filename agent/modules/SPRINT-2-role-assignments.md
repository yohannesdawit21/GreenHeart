# Sprint 2 — Role Assignments

**Created:** 2026-06-06  
**Based on:** merged PRs on `main` + M6 verification spec  
**Workflow reference:** [workflows/end-to-end.md](../workflows/end-to-end.md)

---

## What landed recently (merged to `main`)

| Source | What was added | Status |
|--------|----------------|--------|
| **PR #2** `feat/m1-frontend-integration` | Role A: API client layer, AuthContext, SocketContext, wired Auth/Discovery/Wallet/Advisor/Consultation/IncomingCall pages | **Merged** — UI calls backend; needs M4/M5/M6 APIs to fully work |
| **Merge** `feat/m2-auth-users` | Role B: JWT auth, users, wallet, escrow, payment webhook, Neon Postgres fix, smoke tests | **Merged** — M2/M3 core **implemented** |
| **Commit** `9af4c15` | M6 advisor verification & RBAC **spec only**: roles, verification flow, API contract index, data models, UI routes, end-to-end workflow | **Spec only** — not implemented |
| **Branch** `feat/m4-m5-role-c` (remote) | Role C work — **behind `main`**; rebase before merging (would conflict with Role B backend) | **Not merged** |

### Key new product feature (M6)

Doctors must pass a **partner-doctor video verification interview** before appearing in patient search or going online. Four roles: `admin`, `partner_doctor`, `advisor`, `client`. See [M6-advisor-verification.md](./M6-advisor-verification.md).

---

## Current completion snapshot

| Module | Owner | Done | Remaining |
|--------|-------|------|-----------|
| **M1** Frontend | A | API layer, 6 layouts wired | M6 UIs, role-based routing, E2E polish |
| **M2** Auth & Users | B | Register/login/me/profile/advisors, Neon pool | M6 roles, advisor-apply path, admin seed |
| **M3** Wallet | B | Balance, purchase, webhook, escrow | Hardening only |
| **M4** Search | C | Gemini `embedding.service.ts` stub | Semantic search, reindex, verified filter |
| **M5** Sessions | C | Route stubs only | Redis, Socket.io, LiveKit, full call flow |
| **M6** Verification | B + A + C | Spec + contracts index | Full implementation |

---

## Role A — Frontend Lead

**Branch prefix:** `feat/m1-*`  
**Progress board:** [progress/modules/M1-frontend.md](../../progress/modules/M1-frontend.md) + [M6](../../progress/modules/M6-advisor-verification.md) (Role A section)

### You own

```
frontend/src/pages/admin/
frontend/src/pages/partner/
frontend/src/pages/advisor/apply/
frontend/src/pages/verification/   # or route /verification/:interviewId
frontend/src/api/verification.service.ts
```

### Sprint 2 tasks (priority order)

1. **Role-based auth routing** — after login, redirect by `user.role`:
   - `client` → `/discover`
   - `advisor` → `/advisor/dashboard` (show verification status banner if not verified)
   - `partner_doctor` → `/partner`
   - `admin` → `/admin`

2. **Doctor applicant signup** — `/auth/advisor-apply`
   - Separate form from patient signup (no client/advisor toggle on one form)
   - POST `/api/auth/register/advisor` (Role B)
   - Post-register: "Pending review" status screen

3. **Partner doctor dashboard** — `/partner`
   - Applicant queue (GET `/api/verification/applicants`)
   - "Start interview" → POST `/api/verification/interviews`
   - Pass/Fail buttons → PATCH `/api/verification/interviews/:id/complete`

4. **Verification video room** — `/verification/:interviewId`
   - Reuse LiveKit pattern from `/consultation` (no escrow UI)
   - Fetch token from GET `/api/verification/interviews/:id/livekit-token` (Role C)

5. **Admin dashboard** — `/admin`
   - Register partner doctor form → POST `/api/admin/partner-doctors`
   - List partner doctors
   - Override advisor verification status (suspend, etc.)

6. **Polish existing M1 pages** once M4/M5 land:
   - Discovery: show `isOnline` from presence API
   - Advisor control: disable online toggle if `verification_status !== verified`
   - Handle new error codes: `ADVISOR_NOT_VERIFIED`, `FORBIDDEN`

### Blocked until

| Task | Waiting on |
|------|------------|
| Advisor-apply form | Role B: `POST /api/auth/register/advisor` |
| Partner/admin dashboards | Role B: verification + admin APIs |
| Verification room tokens | Role C: LiveKit token for verification interviews |
| Verified-only discovery | Role C: M4 semantic search + verified filter |

---

## Role B — Backend Core (Identity & Ledger)

**Branch prefix:** `feat/m2-*`, `feat/m3-*`, `feat/m6-*`  
**Progress boards:** [M2](../../progress/modules/M2-auth-users.md), [M3](../../progress/modules/M3-wallet-ledger.md), [M6](../../progress/modules/M6-advisor-verification.md)

### You own

```
backend/src/modules/auth/
backend/src/modules/users/
backend/src/modules/wallet/
backend/src/modules/verification/     # NEW — create in Sprint 2
backend/sql/004_advisor_verification.sql
backend/sql/seed/001_admin.sql
shared/contracts/auth.api.ts
shared/contracts/users.api.ts
shared/contracts/wallet.api.ts
shared/contracts/models.user.ts
shared/contracts/verification.api.ts    # NEW — create from api-contracts.md
```

### Sprint 2 tasks (priority order)

1. **Extend roles (M2 + M6)**
   - Update SQL `users.role` CHECK: `admin | partner_doctor | advisor | client`
   - Update `auth.api.ts`, `models.user.ts`, JWT payload, auth middleware role checks

2. **Migration `004_advisor_verification.sql`**
   - `profiles.verification_status` (`pending_review | verified | rejected | suspended`)
   - `verification_interviews` table (partner_id, applicant_id, status, outcome, livekit_room)

3. **Admin seed** — `backend/sql/seed/001_admin.sql`
   - First admin user for dev/staging (document credentials in README, not in git secrets)

4. **Split registration**
   - `POST /api/auth/register` — **clients only** (`role: client`)
   - `POST /api/auth/register/advisor` — doctor applicants → `pending_review`, no M4 reindex

5. **Verification module** — `backend/src/modules/verification/`
   - GET `/api/verification/applicants` (partner_doctor only)
   - POST `/api/verification/interviews` (creates row; delegates LiveKit room id to Role C or stores room name)
   - PATCH `/api/verification/interviews/:id/complete` — pass → `verified` + call M4 reindex hook; fail → `rejected`

6. **Admin APIs**
   - POST/GET `/api/admin/partner-doctors`
   - PATCH `/api/admin/advisors/:id/verification-status`

7. **Auth `/me` response** — include `verificationStatus` for advisors

8. **Register routes** in `app.ts` (Role B block): `/api/verification`, `/api/admin`

### Already done (do not redo)

- M2 core auth, users, profiles, wallets
- M3 wallet, webhook, atomic escrow
- Neon IPv4 connection fix
- `npm run test:smoke` (15 tests)

### Blocked until

| Task | Waiting on |
|------|------------|
| Reindex on verify pass | Role C: `POST /api/search/reindex/:advisorId` |
| Interview LiveKit room | Role C: token service for `session_type: verification` |

---

## Role C — Backend Realtime & Intelligence

**Branch prefix:** `feat/m4-*`, `feat/m5-*`  
**Progress boards:** [M4](../../progress/modules/M4-search-vectors.md), [M5](../../progress/modules/M5-presence-sessions.md), [M6](../../progress/modules/M6-advisor-verification.md) (Role C section)

> **Important:** Rebase `feat/m4-m5-role-c` onto latest `main` before opening a PR — `main` now includes Role B backend.

### You own

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
```

### Sprint 2 tasks (priority order)

1. **M4 — Semantic search**
   - Run `003_advisor_embeddings.sql` (pgvector)
   - Wire `embedding.service.ts` (Gemini — already on `main`)
   - POST `/api/search/semantic` — JOIN profiles, filter `verification_status = 'verified'`
   - POST `/api/search/reindex/:advisorId` — only if verified
   - Merge `isOnline` from Redis in search/list responses

2. **M5 — Redis presence**
   - Replace Redis stub in `backend/src/database/redis/connection.ts`
   - PATCH `/api/presence/status` — **verified advisors only** (`ADVISOR_NOT_VERIFIED` otherwise)
   - GET `/api/presence/advisors`

3. **M5 — Sessions + Socket.io**
   - Run `002_sessions.sql`
   - Session repository + POST `/api/session/initiate` (verified advisor, calls `walletService.lockEscrow`)
   - Socket.io hub with JWT auth on connect
   - Events: `incoming_call_dispatch`, `call_accepted`, `call_declined`, `session_ready`

4. **M5 — LiveKit**
   - Implement `backend/src/livekit/token.service.ts`
   - GET `/api/session/:id/livekit-token` for consultations
   - POST `/api/session/:id/end` + escrow release via M3

5. **M6 — Verification LiveKit (shared token service)**
   - GET `/api/verification/interviews/:id/livekit-token`
   - Room type `verification` — no escrow, no session billing
   - Reuse same LiveKit credentials from `.env`

6. **Verified-only gates**
   - M4 search: exclude non-verified advisors
   - M5 presence + session initiate: reject unverified advisors

### Blocked until

| Task | Waiting on |
|------|------------|
| Session initiate escrow | **Unblocked** — M3 on `main` |
| Reindex trigger | Role B sets `verified` status (you implement reindex endpoint first) |

---

## Recommended parallel timeline

```
Week 1 (now)
  Role B: M6 schema + roles + admin seed + split register
  Role C: M4 search + M5 Redis/presence (rebase branch onto main)
  Role A:  Role-based routing + advisor-apply UI (mock until B ready)

Week 2
  Role B: Verification APIs + admin/partner endpoints
  Role C: M5 sessions + Socket.io + LiveKit
  Role A:  Partner + admin dashboards + verification room UI

Week 3 — E2E demo
  All roles: Run [end-to-end workflow](../workflows/end-to-end.md) Phases 0–5
```

---

## How to claim work

1. Open your progress board under `progress/modules/`
2. Set `Agent: your-name`
3. Branch from latest `main`: `git pull origin main`
4. Do **not** edit other roles' owned folders (see [team-roles.md](../team-roles.md))
