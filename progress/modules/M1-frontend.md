# M1 — Frontend

**Owner:** Role A  
**Agent:** Gemini CLI  
**Spec:** [agent/modules/M1-frontend.md](../../agent/modules/M1-frontend.md)

## Phase 1 — Done (PR #2)

- [x] Create `frontend/src/api/` layer with typed clients
- [x] Add `VITE_API_URL` and mock mode flag
- [x] Wire AuthPage to real register/login
- [x] Wire DiscoveryPage semantic search
- [x] Wire Connect Instantly → session initiate
- [x] Wire WalletPage balance + purchase
- [x] Wire AdvisorControlPage online toggle
- [x] Add Socket.io client + incoming call listener (SocketContext)
- [x] Add LiveKit room on `/consultation?sessionId=...`
- [x] Remove hardcoded mock advisors when API ready

## Phase 2 — M6 + polish (Done)

- [x] Role-based redirect after login (client / advisor / partner_doctor / admin)
- [x] `/auth/advisor-apply` — doctor registration (separate from patient)
- [x] Advisor dashboard: show `verification_status` (pending / verified / rejected)
- [x] `/partner` — partner doctor queue + start interview + pass/fail
- [x] `/verification/:interviewId` — LiveKit verification room
- [x] `/admin` — register partner doctors + verification override
- [x] Disable online toggle when advisor not verified
- [x] Handle API errors: `ADVISOR_NOT_VERIFIED`, `ADVISOR_OFFLINE`, `INSUFFICIENT_FUNDS`
- [x] `frontend/src/api/verification.service.ts` aligned with backend routes

## Notes

Stitch UI implemented. Build verified with `npm run build`.
