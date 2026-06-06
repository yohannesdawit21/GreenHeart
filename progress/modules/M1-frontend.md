# M1 — Frontend

**Owner:** Role A  
**Agent:** unassigned  
**Spec:** [agent/modules/M1-frontend.md](../../agent/modules/M1-frontend.md)

## Tasks

- [ ] Create `frontend/src/api/` layer with typed clients
- [ ] Add `VITE_API_URL` and mock mode flag
- [ ] Wire AuthPage to real register/login
- [ ] Rename or alias `/discover` → `/discovery`
- [ ] Wire DiscoveryPage semantic search
- [ ] Wire Connect Instantly → session initiate
- [ ] Wire WalletPage balance + purchase
- [ ] Wire AdvisorControlPage online toggle
- [ ] Add Socket.io client + CallOverlayProvider
- [ ] Add LiveKit room on `/consultation/:sessionId`
- [ ] Remove hardcoded mock advisors when API ready

## Notes

Stitch UI already implemented. Focus on integration, not redesign.
