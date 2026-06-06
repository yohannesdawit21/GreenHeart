# UI Routing Map

Maps spec **Layout 1–6** to frontend routes. Role A owns implementation in `frontend/`.

| Layout | Spec route | Current route | Notes |
|--------|------------|---------------|-------|
| 1 — Split Auth Hub | `/auth` | `/auth` | Patient login/signup |
| 1b — Advisor apply | `/auth/advisor-apply` | — | Doctor registration (separate from patient) |
| 2 — Client Discovery | `/discovery` | `/discover` | Align to `/discovery` in Phase 2 |
| 2b — AI Pulse variant | — | `/discover/ai` | Semantic search active state |
| 3 — Wallet Hub | `/wallet` | `/wallet` | Coin bundles + balance |
| 4 — Advisor Control | `/advisor/dashboard` | `/advisor` | Verified advisors only; rename optional |
| 4b — Partner dashboard | `/partner` | — | Applicant queue, start interview, pass/fail |
| 4c — Admin | `/admin` | — | Register partner doctors, status override |
| 5 — Signaling Overlay | Global portal | `/incoming-call` | Also mount as modal via context |
| 6 — Consultation Room | `/consultation/:sessionId` | `/consultation` | Patient ↔ verified advisor |
| 6b — Verification Room | `/verification/:interviewId` | — | Partner doctor ↔ applicant (LiveKit) |

## Route migration (M1 task)

- [ ] Add redirect `/discover` → `/discovery` or rename route
- [ ] `/consultation/:sessionId` with session id from API
- [ ] Incoming call: global `CallOverlayProvider` listening on Socket.io (not route-only)

## Page → API dependencies

| Page | APIs needed | Owner |
|------|-------------|-------|
| Auth (patient) | M2 auth register/login | B |
| Auth (advisor apply) | M2 + M6 pending status | B |
| Admin | M6 partner doctor CRUD, status override | B + A |
| Partner dashboard | M6 applicant queue + interview | B + C + A |
| Verification room | M6 LiveKit token | C + A |
| Discovery | M4 semantic (verified only) + M5 presence | C |
| Wallet | M3 wallet routes | B |
| Advisor dashboard | M3 stats + M5 presence PATCH (verified only) | B + C |
| Incoming call | Socket `incoming_call_dispatch` | C |
| Consultation | M5 LiveKit token | C |

## Design tokens

Implemented in `frontend/src/index.css`. Do not duplicate in page components.
