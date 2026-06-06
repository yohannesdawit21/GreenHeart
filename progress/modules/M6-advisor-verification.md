# M6 — Advisor Verification & RBAC

**Owners:** Role B + Role A + Role C  
**Spec:** [agent/modules/M6-advisor-verification.md](../../agent/modules/M6-advisor-verification.md)

## Tasks — Role B

- [x] Extend `users.role`: `admin | partner_doctor | advisor | client`
- [x] Add `profiles.verification_status` + `verification_interviews` (`004_advisor_verification.sql`)
- [x] Seed script `backend/scripts/seed-admin.ts` (`npm run db:seed`)
- [x] Split register: client vs advisor-apply paths
- [x] Admin: register/list partner doctors + status override APIs
- [x] Partner: list pending applicants, start/complete interview APIs
- [x] Create `shared/contracts/verification.api.ts`
- [x] Update `auth.api.ts` + `models.user.ts`

## Tasks — Role A

- [ ] `/auth/advisor-apply` — doctor registration (distinct from patient)
- [ ] Role-based redirect after login
- [ ] Advisor dashboard — verification status banner
- [ ] `/partner` — queue, start interview, pass/fail UI
- [ ] `/verification/:interviewId` — LiveKit verification room
- [ ] `/admin` — partner doctor registration + status override
- [ ] `frontend/src/api/verification.service.ts`

## Tasks — Role C

- [x] `livekit/verification.service.ts` — interview room tokens (no escrow)
- [x] M4: filter semantic search to `verification_status = verified` only
- [x] M5: presence + session initiate reject unverified advisors (`ADVISOR_NOT_VERIFIED`)
- [x] GET `/api/verification/interviews/:id/livekit-token` — Role C route in `livekit/verification.routes.ts`

## Blocked by

None — Role B verification module merged with Role C LiveKit tokens on `main`.
