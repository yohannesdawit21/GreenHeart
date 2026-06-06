# Sprint Status

**Last updated:** 2026-06-06  
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

## Module status

| ID | Module | Owner | Status |
|----|--------|-------|--------|
| M1 | Frontend (Phase 1) | Role A | **Done** |
| M1 | Frontend (Phase 2 / M6 UI) | Role A | **Done** |
| M2 | Auth & Users | Role B | **Done** |
| M3 | Wallet & Ledger | Role B | **Done** |
| M4 | Search & Vectors | Role C | **Done** |
| M5 | Presence & Sessions | Role C | **Done** |
| M6 | Advisor Verification | B + A + C | **Done** |

## Definition of done (MVP demo)

- [x] Client registers (patient path), buys coins (sandbox), searches **verified** advisors semantically
- [x] Doctor registers (advisor-apply path), partner doctor verifies via **video**, then appears in search
- [x] Admin (seed) registers partner doctors; can override verification status
- [x] Client connects → verified advisor receives overlay → accept → video call
- [x] Escrow locks and releases correctly
- [x] Verified advisor can go online/offline

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
| Admin | `npm run db:seed` → `admin@greenheart.dev` / `AdminChangeMe123!` |
| Partner doctor | Admin registers at `/admin` |
| Advisor applicant | Self-register at `/auth/advisor-apply` |
| Client | Self-register at `/auth` |
