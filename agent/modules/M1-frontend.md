# M1 — Frontend Application

**Owner:** Role A  
**Folder:** `frontend/`  
**Progress:** [progress/modules/M1-frontend.md](../../progress/modules/M1-frontend.md)

## Scope

Implement all UI layouts, integrate REST + WebSocket + LiveKit clients. No backend code.

## Directory structure

```
frontend/src/
├── api/              # HTTP client, typed from shared/contracts
├── context/          # AuthContext, SocketContext
├── components/       # existing + livekit/, overlays/
├── pages/            # route pages (see ui-routing.md)
└── lib/              # env, constants
```

## Tasks

### Phase 1 — API layer ✅ (PR #2)

- [x] Add `frontend/src/api/client.ts` (fetch wrapper, credentials cookie)
- [x] Add `auth.service.ts`, `wallet.service.ts`, `search.service.ts`, `session.service.ts`, `user.service.ts`
- [x] Import types from `shared/contracts`

### Phase 2 — Auth (Layout 1) ✅

- [x] Wire login/register to `POST /api/auth/*`
- [x] AuthContext with JWT cookie
- [ ] Role-based redirect: `client` → `/discover`, `advisor` → dashboard, `partner_doctor` → `/partner`, `admin` → `/admin`

### Phase 3 — Discovery (Layout 2) ✅

- [x] Wire search to `POST /api/search/semantic`
- [x] Connect Instantly → `POST /api/session/initiate`
- [ ] Show live indicator from presence API (when M5 ready)
- [ ] Only show verified advisors (when M4 filter ready)

### Phase 4 — Wallet (Layout 3) ✅

- [x] Balance from `GET /api/wallet/balance`
- [x] Package selection → `POST /api/wallet/purchase/initiate`
- [ ] Transaction history list (API exists on backend)

### Phase 5 — Advisor dashboard (Layout 4) ✅

- [x] Online toggle → `PATCH /api/presence/status`
- [ ] Disable toggle when `verification_status !== verified`
- [ ] Show verification status banner for pending/rejected advisors

### Phase 6 — Realtime (Layouts 5 & 6) ✅

- [x] Socket.io client in SocketContext
- [x] Incoming call listener + navigation
- [x] LiveKit room on `/consultation?sessionId=...`

### Phase 7 — M6 verification UIs (Sprint 2)

- [ ] `/auth/advisor-apply` — doctor registration (separate from patient `/auth`)
- [ ] `/partner` — partner doctor dashboard (queue, start interview, pass/fail)
- [ ] `/verification/:interviewId` — LiveKit verification room (no escrow UI)
- [ ] `/admin` — register partner doctors, list partners, override verification status
- [ ] Add `frontend/src/api/verification.service.ts`

## Dependencies on other modules

| Need | From | Blocked until |
|------|------|---------------|
| Auth API | M2 | ✅ login works |
| Wallet API | M3 | ✅ balance works |
| Search API | M4 | semantic results |
| Session + Socket + LiveKit | M5 | full call flow |
| Verification APIs | M6 (Role B) | advisor-apply, partner, admin |
| Verification LiveKit token | M6 (Role C) | verification room |

## Do not edit

- `backend/**`
- `shared/contracts/` (request changes from B/C)
