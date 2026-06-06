# M6 — Advisor Verification & RBAC

**Owners:** Role B + Role A + Role C  
**Agent:** cursor-agent (Role B)  
**Spec:** [agent/modules/M6-advisor-verification.md](../../agent/modules/M6-advisor-verification.md)

## Tasks — Role B

- [x] Extend `users.role`: `admin | partner_doctor | advisor | client`
- [x] Add `profiles.verification_status` + `verification_interviews` (`004_advisor_verification.sql`)
- [x] Seed script `backend/sql/seed/001_admin.sql` (`npm run db:seed`)
- [x] Split register: client vs advisor-apply paths
- [x] Admin: register/list partner doctors + status override APIs
- [x] Partner: list pending applicants, start/complete interview APIs
- [x] Create `shared/contracts/verification.api.ts`
- [x] Update `auth.api.ts` + `models.user.ts`
- [ ] LiveKit token on verification interviews (Role C — stub returns room name)

## Tasks — Role A

- [ ] `/auth/advisor-apply` — doctor registration (distinct from patient)
- [ ] Role-based redirect after login
- [ ] Advisor dashboard — verification status banner
- [ ] `/partner` — queue, start interview, pass/fail UI
- [ ] `/verification/:interviewId` — LiveKit verification room
- [ ] `/admin` — partner doctor registration + status override
- [ ] `frontend/src/api/verification.service.ts`

## Tasks — Role C

- [ ] GET `/api/verification/interviews/:id/livekit-token` (full token minting)
- [ ] M4 search filter: `verification_status = verified` only
- [ ] M5 gate: presence + patient sessions require verified advisor

## Blocked by

M2 roles/JWT foundation — **unblocked** ✅
