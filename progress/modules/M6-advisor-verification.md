# M6 — Advisor Verification & RBAC

**Owners:** Role B + Role A + Role C (LiveKit)  
**Agent:** unassigned  
**Spec:** [agent/modules/M6-advisor-verification.md](../../agent/modules/M6-advisor-verification.md)

## Tasks

### Role B
- [ ] Extend `users.role`: `admin | partner_doctor | advisor | client`
- [ ] Add `profiles.verification_status` + `verification_interviews` table (`004_advisor_verification.sql`)
- [ ] Seed script `backend/sql/seed/001_admin.sql`
- [ ] Split register: client vs advisor-apply paths
- [ ] Admin: CRUD partner doctors + status override APIs
- [ ] Partner: list pending applicants, complete interview outcome API
- [ ] Update `shared/contracts/verification.api.ts` + `models.user.ts`

### Role A
- [ ] `/auth/advisor-apply` — doctor registration (distinct from patient)
- [ ] `/admin` — partner doctor registration & status override
- [ ] `/partner` — RBAC dashboard (queue, start interview, pass/fail)
- [ ] `/verification/:interviewId` — LiveKit verification room UI

### Role C
- [ ] Verification interview LiveKit tokens (no escrow)
- [ ] M4 search filter: `verification_status = verified` only
- [ ] M5 gate: presence + patient sessions require verified advisor

## Blocked by

M2 roles/JWT foundation; M5 LiveKit token service for reuse
