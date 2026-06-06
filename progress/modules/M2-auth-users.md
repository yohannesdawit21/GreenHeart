# M2 — Auth & Users

**Owner:** Role B  
**Agent:** cursor-agent  
**Spec:** [agent/modules/M2-auth-users.md](../../agent/modules/M2-auth-users.md)

## Tasks

- [x] Finalize Postgres pool in `backend/src/database/postgres/connection.ts`
- [x] Run `backend/sql/001_users_wallets.sql` (`npm run db:migrate`)
- [x] User repository (SQL) with wallet + profile joins
- [x] POST `/api/auth/register` (clients only)
- [x] POST `/api/auth/register/advisor` (pending_review flow — M6)
- [x] Extend roles: admin, partner_doctor, advisor, client
- [x] Run seed `backend/scripts/seed-admin.ts` (`npm run db:seed`)
- [x] POST `/api/auth/login` + JWT cookie
- [x] GET `/api/auth/me` + auth middleware (+ verificationStatus for advisors)
- [x] PATCH `/api/users/me/profile`
- [x] GET `/api/users/advisors` (verified only)
- [x] Register routes in `app.ts` (Role B block)
- [x] Update `shared/contracts/auth.api.ts` + `models.user.ts`
