# M2 — Auth & Users

**Owner:** Role B  
**Folders:** `backend/src/modules/auth/`, `backend/src/modules/users/`  
**Progress:** [progress/modules/M2-auth-users.md](../../progress/modules/M2-auth-users.md)

## Scope

PostgreSQL connection pool, user/profile/wallet rows, JWT auth, profile management, advisor listing (non-vector).

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
└── 001_users_wallets.sql      # run on setup
```

## On register

Insert into `users`, `profiles`, and `wallets` in one transaction (wallet defaults to 0 balances).

## Endpoints

See [api-contracts.md](../api-contracts.md) — update `shared/contracts/auth.api.ts` and `users.api.ts`.

## Integration points

- **M3:** Escrow reads/writes `wallets` + `transactions` tables
- **M4:** After advisor profile update → call `POST /api/search/reindex/:advisorId`
- **M5:** Sessions reference `users.id` (UUID)

## Tests (minimum)

- Register client / advisor (creates wallet row)
- Login returns cookie
- `/api/auth/me` returns profile
