# M5 — Presence & Sessions

**Owner:** Role C  
**Agent:** cursor-role-c  
**Spec:** [agent/modules/M5-presence-sessions.md](../../agent/modules/M5-presence-sessions.md)

## Tasks

- [x] Redis connection
- [x] PATCH `/api/presence/status` (verified advisors only; requires socket registered)
- [x] GET `/api/presence/advisors`
- [x] Session repository (Postgres `sessions` table)
- [x] Run `backend/sql/002_sessions.sql` (via db:migrate)
- [x] POST `/api/session/initiate` (verified advisor only; calls M3 lockEscrow)
- [x] Socket.io server + JWT auth on connect
- [x] Handlers: incoming_call_dispatch, call_accepted, call_declined
- [x] LiveKit token service (`livekit-server-sdk`)
- [x] POST `/api/session/:id/end` + escrow release/refund
- [x] GET `/api/session/:id/livekit-token`
- [x] Update `shared/contracts/session.api.ts` + `socket.events.ts` (verified in code)
- [x] `npm run test:smoke:m5`

## Blocked by

M6 strict verification (graceful until `verification_status` column exists)
