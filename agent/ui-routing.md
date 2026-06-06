# UI Routing Map

Maps spec **Layout 1–6** to frontend routes. Role A owns implementation in `frontend/`.

| Layout | Spec route | Current route | Notes |
|--------|------------|---------------|-------|
| 1 — Split Auth Hub | `/auth` | `/auth` | Login/signup, role selection |
| 2 — Client Discovery | `/discovery` | `/discover` | Align to `/discovery` in Phase 2 |
| 2b — AI Pulse variant | — | `/discover/ai` | Semantic search active state |
| 3 — Wallet Hub | `/wallet` | `/wallet` | Coin bundles + balance |
| 4 — Advisor Control | `/advisor/dashboard` | `/advisor` | Rename to `/advisor/dashboard` optional |
| 5 — Signaling Overlay | Global portal | `/incoming-call` | Also mount as modal via context |
| 6 — Consultation Room | `/consultation/:sessionId` | `/consultation` | Add `:sessionId` param |

## Route migration (M1 task)

- [ ] Add redirect `/discover` → `/discovery` or rename route
- [ ] `/consultation/:sessionId` with session id from API
- [ ] Incoming call: global `CallOverlayProvider` listening on Socket.io (not route-only)

## Page → API dependencies

| Page | APIs needed | Owner |
|------|-------------|-------|
| Auth | M2 auth routes | B |
| Discovery | M4 semantic + M5 presence | C |
| Wallet | M3 wallet routes | B |
| Advisor dashboard | M3 stats + M5 presence PATCH | B + C |
| Incoming call | Socket `incoming_call_dispatch` | C |
| Consultation | M5 LiveKit token | C |

## Design tokens

Implemented in `frontend/src/index.css`. Do not duplicate in page components.
