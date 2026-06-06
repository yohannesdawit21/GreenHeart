# M2 — Auth & Users

**Owner:** Role B  
**Agent:** cursor-agent  
**Spec:** [agent/modules/M2-auth-users.md](../../agent/modules/M2-auth-users.md)

## Tasks

- [x] Finalize Postgres pool in `backend/src/database/postgres/connection.ts`
- [x] Run `backend/sql/001_users_wallets.sql` (`npm run db:migrate`)
- [x] User repository (SQL) with wallet + profile joins
- [x] POST `/api/auth/register` (client + advisor roles)
- [ ] POST `/api/auth/register/advisor` (pending_review flow — M6)
- [ ] Extend roles: admin, partner_doctor, advisor, client
- [ ] Run seed `backend/sql/seed/001_admin.sql`
- [x] POST `/api/auth/login` + JWT cookie
- [x] GET `/api/auth/me` + auth middleware
- [x] PATCH `/api/users/me/profile`
- [x] GET `/api/users/advisors` (list, non-semantic)
- [x] Register routes in `app.ts` (Role B block)
- [ ] Update `shared/contracts/auth.api.ts` + `users.api.ts` (M6 role extensions)
