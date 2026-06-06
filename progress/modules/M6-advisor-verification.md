# M6 — Advisor Verification & RBAC

**Owners:** Role B + Role A + Role C  
**Agent:** unassigned  
**Spec:** [agent/modules/M6-advisor-verification.md](../../agent/modules/M6-advisor-verification.md)

## Platform roles (reference)

| Role | Created by | UI route |
|------|------------|----------|
| `admin` | DB seed | `/admin` |
| `partner_doctor` | Admin registers | `/partner` |
| `advisor` | Self-register at `/auth/advisor-apply` | Advisor dashboard |
| `client` | Self-register at `/auth` | `/discover` |

## Tasks — Role B

- [ ] Extend `users.role`: `admin | partner_doctor | advisor | client`
- [ ] Add `profiles.verification_status` + `verification_interviews` (`004_advisor_verification.sql`)
- [ ] Seed script `backend/sql/seed/001_admin.sql`
- [ ] `POST /api/auth/register` — clients only
- [ ] `POST /api/auth/register/advisor` — sets `pending_review`
- [ ] Create `backend/src/modules/verification/` (routes, controller, service, repository)
- [ ] GET `/api/verification/applicants` (partner doctor queue)
- [ ] POST `/api/verification/interviews` (start interview)
- [ ] PATCH `/api/verification/interviews/:id/complete` (pass → verified + reindex hook)
- [ ] POST `/api/admin/partner-doctors` + GET list
- [ ] PATCH `/api/admin/advisors/:id/verification-status` (admin override)
- [ ] Create `shared/contracts/verification.api.ts`
- [ ] Update `auth.api.ts` + `models.user.ts` with four roles + verificationStatus

## Tasks — Role A

- [ ] `/auth/advisor-apply` — doctor registration page
- [ ] Role-based redirect after login
- [ ] Advisor dashboard — verification status banner
- [ ] `/partner` — queue, start interview, pass/fail UI
- [ ] `/verification/:interviewId` — LiveKit verification room
- [ ] `/admin` — partner doctor registration + status override
- [ ] `frontend/src/api/verification.service.ts`

## Tasks — Role C

- [ ] GET `/api/verification/interviews/:id/livekit-token`
- [ ] M4: filter semantic search to `verification_status = verified` only
- [ ] M5: presence + session initiate reject unverified advisors (`ADVISOR_NOT_VERIFIED`)

## Blocked by

- Role B: M2 JWT foundation ✅ (done)
- Role C: LiveKit token service (reuse for verification rooms)
