# M2 — Auth & Users

**Owner:** Role B  
**Agent:** unassigned  
**Spec:** [agent/modules/M2-auth-users.md](../../agent/modules/M2-auth-users.md)

## Tasks

- [ ] Finalize Postgres pool in `backend/src/database/postgres/connection.ts`
- [ ] Run `backend/sql/001_users_wallets.sql`
- [ ] User repository (SQL) with wallet + profile joins
- [ ] POST `/api/auth/register` (client) + `/api/auth/register/advisor` (pending_review)
- [ ] Extend roles: admin, partner_doctor, advisor, client
- [ ] Run seed `backend/sql/seed/001_admin.sql`
- [ ] POST `/api/auth/login` + JWT cookie
- [ ] GET `/api/auth/me` + auth middleware
- [ ] PATCH `/api/users/me/profile`
- [ ] GET `/api/users/advisors` (list, non-semantic)
- [ ] Register routes in `app.ts` (Role B block)
- [ ] Update `shared/contracts/auth.api.ts` + `users.api.ts`
