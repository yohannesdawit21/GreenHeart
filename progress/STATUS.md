# Sprint Status

**Last updated:** 2026-06-07  
**Team guide:** [agent/team-roles.md](../agent/team-roles.md)

## Merged on `main`

| PR / merge | Owner | Summary |
|------------|-------|---------|
| **#2** `feat/m1-frontend-integration` | Role A | Frontend API layer + wired pages (M1) |
| **Merge** `feat/m2-auth-users` | Role B | Auth, users, wallet, escrow, webhook |
| **Merge** `feat/m5-presence-sessions` | Role C | M4 search + M5 presence/sessions/socket/LiveKit |
| **#7** `feat/m6-verification-livekit-token` | Role C | Verification LiveKit tokens |
| **Merge** `feat/m6-verification-rbac` | Role B | M6 verification RBAC + admin APIs |
| **Commit** `d706331` | Role A | M6 UI — advisor-apply, partner, admin, verification room |
| **Latest** | All | Reviews, discover filters, presence restore, notifications, docs |

## Module status

| ID | Module | Owner | Status |
|----|--------|-------|--------|
| M1 | Frontend (Phase 1) | Role A | **Done** |
| M1 | Frontend (Phase 2 / M6 UI) | Role A | **Done** |
| M2 | Auth & Users | Role B | **Done** |
| M3 | Wallet & Ledger | Role B | **Done** — demo/sandbox coins |
| M4 | Search & Vectors | Role C | **Done** |
| M5 | Presence & Sessions | Role C | **Done** — intended-online restore on reload |
| M6 | Advisor Verification | B + A + C | **Done** |
| M7 | Reviews & Discover UX | A + B | **Done** |

## Definition of done (MVP demo)

- [x] Client registers (patient path), buys **demo coins** (sandbox), searches **verified** advisors semantically
- [x] Doctor registers via **5-step** `/auth/advisor-apply`, partner doctor verifies via **video**, then appears in search
- [x] Admin (seed `admin@gmail.com`) registers partner doctors; can override verification status
- [x] Client connects → verified advisor receives overlay + browser notification → accept → video call
- [x] Escrow locks and releases correctly
- [x] Verified advisor can go online/offline; **online state restores after page reload**
- [x] Client can leave a **review** after completed session
- [x] Discover supports multi-filter (language, region, profession, rate, rating, sort)

## Verify locally

```bash
# Terminal 1 — backend
cd backend && npm run db:migrate && npm run db:seed && npm run dev

# Terminal 2 — tests
cd backend && npm run test:smoke && npm run test:smoke:m5 && npm run test:smoke:m6 && npm run test:functional

# Terminal 3 — frontend
cd frontend && npm run dev
```

## Demo accounts

| Role | How to get |
|------|------------|
| Admin | `npm run db:seed` → `admin@gmail.com` / `12345678` |
| Partner doctor | Admin registers at `/admin/partners` |
| Advisor applicant | Self-register at `/auth/advisor-apply` (5-step wizard) |
| Client | Self-register at `/auth` |

## Deploy note (Render)

Run migration **007_reviews.sql** after deploy: `npm run db:migrate`
