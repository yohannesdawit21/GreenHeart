# M2 — Auth & Users

**Owner:** Role B  
**Folders:** `backend/src/modules/auth/`, `backend/src/modules/users/`  
**Progress:** [progress/modules/M2-auth-users.md](../../progress/modules/M2-auth-users.md)

## Scope

PostgreSQL connection pool, user/profile/wallet rows, JWT auth, profile management, advisor listing (non-vector). **Four roles:** `client`, `advisor`, `partner_doctor`, `admin`. Split registration: patient vs doctor applicant. First admin via seed.

## Files to implement

```
backend/src/modules/auth/
├── auth.routes.ts
├── auth.controller.ts
├── auth.service.ts
└── auth.schemas.ts          # zod validation

backend/src/modules/users/
├── users.routes.ts
├── users.controller.ts
├── users.service.ts
├── users.repository.ts
└── user.repository.ts       # SQL queries via getPool()

backend/src/database/postgres/
└── connection.ts              # already stubbed — finalize in M2

backend/sql/
├── 001_users_wallets.sql      # run on setup
└── seed/001_admin.sql         # first admin (M6, run after 001)
```

## On register

**Client:** Insert into `users` (role `client`), `profiles`, and `wallets` in one transaction.

**Advisor applicant:** POST `/api/auth/register/advisor` → role `advisor`, `profiles.verification_status = pending_review`. No search index yet (M4 reindex only after M6 pass).

**Partner doctor:** Created by admin via M6 — not self-register.

**Admin:** Seed only — `backend/sql/seed/001_admin.sql`.

## Endpoints

See [api-contracts.md](../api-contracts.md) — update `shared/contracts/auth.api.ts` and `users.api.ts`.

## Integration points

- **M3:** Escrow reads/writes `wallets` + `transactions` tables
- **M4:** After advisor **verified** (M6) → call `POST /api/search/reindex/:advisorId`
- **M6:** Verification status on profiles; partner/admin APIs in `verification/` module
- **M5:** Sessions reference `users.id` (UUID)

## Tests (minimum)

- Register client / advisor applicant (creates wallet row; advisor → pending_review)
- Login returns cookie; RBAC rejects wrong-role routes
- `/api/auth/me` returns profile + verification_status for advisors
