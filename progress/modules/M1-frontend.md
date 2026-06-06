# M1 — Frontend

**Owner:** Role A  
**Agent:** Gemini CLI  
**Spec:** [agent/modules/M1-frontend.md](../../agent/modules/M1-frontend.md)  
**Sprint 2:** [SPRINT-2-role-assignments.md](../../agent/modules/SPRINT-2-role-assignments.md#role-a--frontend-lead)

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

## Phase 2 — Sprint 2 (M6 + polish)

- [ ] Role-based redirect after login (client / advisor / partner_doctor / admin)
- [ ] `/auth/advisor-apply` — doctor registration (separate from patient)
- [ ] Advisor dashboard: show `verification_status` (pending / verified / rejected)
- [ ] `/partner` — partner doctor queue + start interview + pass/fail
- [ ] `/verification/:interviewId` — LiveKit verification room
- [ ] `/admin` — register partner doctors + verification override
- [ ] Disable online toggle when advisor not verified
- [ ] Handle API errors: `ADVISOR_NOT_VERIFIED`, `FORBIDDEN`

## Notes

Stitch UI already implemented. Phase 1 build verified with `npm run build`.  
Phase 2 depends on Role B (M6 APIs) and Role C (M4/M5/LiveKit verification tokens).
