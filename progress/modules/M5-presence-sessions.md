# M5 — Presence & Sessions

**Owner:** Role C  
**Agent:** unassigned  
**Spec:** [agent/modules/M5-presence-sessions.md](../../agent/modules/M5-presence-sessions.md)

## Tasks

- [ ] Redis connection
- [ ] PATCH `/api/presence/status`
- [ ] GET `/api/presence/advisors`
- [ ] Session repository (Postgres `sessions` table)
- [ ] Run `backend/sql/002_sessions.sql`
- [ ] POST `/api/session/initiate` (calls M3 lockEscrow)
- [ ] Socket.io server + JWT auth on connect
- [ ] Handlers: incoming_call_dispatch, call_accepted, call_declined
- [ ] LiveKit token service
- [ ] POST `/api/session/:id/end` + escrow release
- [ ] Update `shared/contracts/session.api.ts` + `socket.events.ts`

## Blocked by

M2, M3
