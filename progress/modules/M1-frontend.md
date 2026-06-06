# M1 — Frontend

**Owner:** Role A  
**Agent:** Gemini CLI  
**Spec:** [agent/modules/M1-frontend.md](../../agent/modules/M1-frontend.md)

## Tasks

- [x] Create `frontend/src/api/` layer with typed clients
- [x] Add `VITE_API_URL` and mock mode flag
- [x] Wire AuthPage to real register/login
- [ ] Rename or alias `/discover` → `/discovery` (Decided to keep /discover for now, consistent with existing code)
- [x] Wire DiscoveryPage semantic search
- [x] Wire Connect Instantly → session initiate
- [x] Wire WalletPage balance + purchase
- [x] Wire AdvisorControlPage online toggle
- [x] Add Socket.io client + CallOverlayProvider (Implemented as SocketContext + App-level listener)
- [x] Add LiveKit room on `/consultation?sessionId=...`
- [x] Remove hardcoded mock advisors when API ready

## Notes

Stitch UI already implemented. Focus on integration, not redesign.
All core wiring completed and verified with `npm run build`.
