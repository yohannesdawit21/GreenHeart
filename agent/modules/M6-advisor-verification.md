# M6 — Advisor Verification & RBAC

**Owners:** Role B (API, roles, status) + Role A (dashboards) + Role C (verification video via LiveKit)  
**Folders:** `backend/src/modules/verification/`, partner/admin UI in `frontend/`  
**Progress:** [progress/modules/M6-advisor-verification.md](../../progress/modules/M6-advisor-verification.md)

## Scope

Partner doctors (senior doctors on our team) verify doctor applicants before they appear in patient search or go online. Admin seeds the first admin, registers partner doctors, and can override verification status. Verification interviews happen **in-app over video** (LiveKit).

## Roles (RBAC)

| Role | Who creates account | Primary job |
|------|---------------------|-------------|
| `admin` | DB seed (first admin) | Register partner doctors; override verification status |
| `partner_doctor` | Admin registers | Review applicant queue; run video interview; pass/fail applicants |
| `advisor` | Self-register (doctor path) | Apply to offer services; starts `pending_review` |
| `client` | Self-register (patient path) | Discover verified advisors only |

## Verification status (advisor applicants)

Stored on `profiles.verification_status` (Role B). Admin may set any status; normal happy path is partner doctor pass → `verified`.

| Status | Meaning | Searchable | Can go online |
|--------|---------|------------|---------------|
| `pending_review` | Registered, awaiting partner review | No | No |
| `verified` | Partner doctor passed interview | Yes | Yes |
| `rejected` | Partner doctor failed interview | No | No |
| `suspended` | Admin/platform hold | No | No |

On `verified`: Role C runs `POST /api/search/reindex/:advisorId` (M4 hook from M2/M6).

## Files to implement

```
backend/src/modules/verification/
├── verification.routes.ts
├── verification.controller.ts
├── verification.service.ts
└── verification.repository.ts

backend/sql/
└── 004_advisor_verification.sql   # verification_status column + verification_interviews table

backend/sql/seed/
└── 001_admin.sql                  # first admin user (dev/staging)

frontend/src/pages/admin/          # Role A — admin partner-doctor management
frontend/src/pages/partner/        # Role A — partner doctor RBAC dashboard
frontend/src/pages/advisor/apply/  # Role A — doctor applicant onboarding (distinct from client auth)
```

## Registration flows (split)

### Patient (client)

- Existing auth hub — role `client`
- Wallet created on register (M2)

### Doctor applicant (advisor)

- Separate signup path: `/auth/advisor-apply` (not the client form)
- Creates `users.role = advisor`, `profiles.verification_status = pending_review`
- **No** embedding/reindex until `verified`
- Applicant dashboard shows status: pending / rejected / verified

## Partner doctor dashboard (Role A UI + Role B/C APIs)

1. **Queue** — GET pending advisor applicants (`verification_status = pending_review`)
2. **Start interview** — POST creates `verification_interviews` row + LiveKit room (Role C token service, `session_type: verification`, no escrow)
3. **Video room** — `/verification/:interviewId` (LiveKit, both partner + applicant)
4. **Complete** — PATCH outcome `pass` → `verified` + reindex; `fail` → `rejected`
5. Admin may later set `suspended` or revert status via admin API

## Admin dashboard (Role A UI + Role B APIs)

- Seed first admin (see `backend/sql/seed/001_admin.sql`)
- POST register partner doctor (email, temp password or invite)
- GET list partner doctors
- PATCH override any advisor `verification_status` (audit log recommended)

## Verification interview flow (video)

```
Partner doctor clicks "Start interview" on applicant
  1. POST /api/verification/interviews { applicantId }
  2. Create verification_interviews row (status: in_progress)
  3. LiveKit room + tokens for partner_doctor + applicant (M5 livekit/token.service — reuse)
  4. Both join /verification/:interviewId
  5. Partner PATCH /api/verification/interviews/:id/complete { outcome: pass | fail }
  6. Update profiles.verification_status; on pass → trigger M4 reindex
```

No wallet/escrow on verification calls.

## Endpoints

See [api-contracts.md](../api-contracts.md) — `shared/contracts/verification.api.ts`.

## Integration points

- **M2:** Extended roles, split register paths, admin seed, `verification_status` on profiles
- **M4:** Semantic search + reindex only for `verification_status = verified`
- **M5:** Presence + patient call initiate only for verified advisors; LiveKit reused for verification rooms
- **M1:** New routes for admin, partner, advisor-apply UIs

## Do not implement here

- Wallet / escrow (M3)
- Patient discovery search logic (M4 — only add verified filter)

## Tests (minimum)

- Seed admin exists and can login
- Admin creates partner doctor
- Advisor applicant register → `pending_review`, excluded from search
- Partner pass interview → `verified`, appears in semantic search
- Admin suspend → removed from search and presence
