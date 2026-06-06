# Green Heart Project Instructions

This file contains foundational mandates for the Green Heart project. All contributors (including AI agents) must adhere to these standards.

## Team Roles

### Role A — Frontend Lead

**Teammate focus:** All UI, LiveKit/Socket **clients**, API integration. No backend code.

#### Owns (exclusive write)

- `frontend/`

#### May read (no direct edits)

- `shared/contracts/*` — import types only
- `agent/modules/M1-frontend.md`
- `agent/modules/M6-advisor-verification.md` (UI sections only)
- `progress/modules/M1-frontend.md`
- `progress/modules/M6-advisor-verification.md` (Role A section)

#### Does NOT touch

- `backend/**`
- Other teammates' progress boards

#### Modules assigned

| Module | Deliverable |
|--------|-------------|
| **M1** | Six layouts wired to APIs; Socket.io client; LiveKit consultation room |
| **M6** | Admin, partner, advisor-apply, verification room UIs |

#### ✅ Already done (M1 — PR #2 merged)

- API client layer (`frontend/src/api/`)
- AuthContext, SocketContext
- Auth, Discover, Wallet, Advisor Control, Consultation, Incoming Call pages wired

#### 📋 Your next tasks (Sprint 2)

1. **Role-based redirect after login** — `client` → `/discover`, `advisor` → advisor dashboard, `partner_doctor` → `/partner`, `admin` → `/admin`
2. **`/auth/advisor-apply`** — doctor signup form → `POST /api/auth/register/advisor` (Role B)
3. **Advisor dashboard** — show `verification_status` banner (pending / rejected / verified)
4. **`/partner`** — applicant queue, start interview, pass/fail buttons
5. **`/verification/:interviewId`** — LiveKit room (reuse consultation pattern, no wallet UI)
6. **`/admin`** — register partner doctors, list partners, override verification status
7. **Polish** — disable online toggle if not verified; handle `ADVISOR_NOT_VERIFIED` errors

**Blocked until:** Role B verification APIs; Role C M4/M5/LiveKit verification tokens

#### Git branch naming

`feat/m1-*` or `feat/m6-*` (frontend-only)
