# M1 — Frontend Application

**Owner:** Role A  
**Folder:** `frontend/`  
**Progress:** [progress/modules/M1-frontend.md](../../progress/modules/M1-frontend.md)

## Scope

Implement all six UI layouts, integrate REST + WebSocket + LiveKit clients. No backend code.

## Directory structure (extend only inside `frontend/`)

```
frontend/src/
├── api/              # HTTP client, typed from shared/contracts
├── hooks/            # useAuth, useSocket, useWallet
├── context/          # CallOverlayProvider, AuthProvider
├── components/       # existing + livekit/, overlays/
├── pages/            # route pages
└── lib/              # env, constants
```

## Tasks

### Phase 1 — API layer

- [ ] Add `frontend/src/api/client.ts` (fetch wrapper, JWT cookie/header)
- [ ] Add `frontend/src/api/auth.ts`, `wallet.ts`, `search.ts`, `session.ts`
- [ ] Copy/import types from `@codex/shared` or relative `../../shared/contracts`

### Phase 2 — Auth (Layout 1)

- [ ] Wire login/register to `POST /api/auth/*`
- [ ] Persist JWT (httpOnly cookie preferred)
- [ ] Advisor signup: tags + `coinRatePerSession` fields
- [ ] Role-based redirect: client → `/discovery`, advisor → `/advisor/dashboard`

### Phase 3 — Discovery (Layout 2)

- [ ] Wire search input to `POST /api/search/semantic`
- [ ] Category filter chips (client-side or query param)
- [ ] Show live indicator from presence API
- [ ] **Connect Instantly** → `POST /api/session/initiate`

### Phase 4 — Wallet (Layout 3)

- [ ] Display balance from `GET /api/wallet/balance`
- [ ] Package selection → `POST /api/wallet/purchase/initiate`
- [ ] Transaction history list

### Phase 5 — Advisor dashboard (Layout 4)

- [ ] Metrics from wallet + session stats endpoints
- [ ] Online toggle → `PATCH /api/presence/status`

### Phase 6 — Realtime (Layouts 5 & 6)

- [ ] Socket.io client singleton in `frontend/src/lib/socket.ts`
- [ ] Global incoming call overlay (Layout 5)
- [ ] Accept/decline → socket events + navigation
- [ ] LiveKit `<LiveKitRoom>` on `/consultation/:sessionId`
- [ ] Session timer, mute, end call

## Dependencies on other modules

| Need | From | Blocked until |
|------|------|---------------|
| Auth API | M2 | login works |
| Wallet API | M3 | balance display |
| Search API | M4 | semantic discovery |
| Session + Socket + LiveKit | M5 | full call flow |

## Mock mode

Until APIs exist, keep `VITE_USE_MOCKS=true` in `.env` with local mock handlers in `frontend/src/api/mocks/`.

## Do not edit

- `backend/**`
- `shared/contracts/` (request changes from B/C)
