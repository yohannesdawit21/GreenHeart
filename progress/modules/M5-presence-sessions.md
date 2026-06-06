# M5 — Presence & Sessions

**Owner:** Role C  
**Agent:** unassigned  
**Spec:** [agent/modules/M5-presence-sessions.md](../../agent/modules/M5-presence-sessions.md)

> Rebase `feat/m4-m5-role-c` onto latest `main` before starting.

## Tasks

- [ ] Replace Redis stub — real connection in `database/redis/connection.ts`
- [ ] PATCH `/api/presence/status` (verified advisors only)
- [ ] GET `/api/presence/advisors`
- [ ] Run `backend/sql/002_sessions.sql`
- [ ] Session repository (Postgres `sessions` table)
- [ ] POST `/api/session/initiate` (verified advisor; calls M3 `lockEscrow`)
- [ ] Socket.io server + JWT auth on connect
- [ ] Handlers: `incoming_call_dispatch`, `call_accepted`, `call_declined`, `session_ready`
- [ ] LiveKit token service (`backend/src/livekit/token.service.ts`)
- [ ] GET `/api/session/:id/livekit-token`
- [ ] POST `/api/session/:id/end` + escrow release via M3
- [ ] Update `shared/contracts/session.api.ts` + `socket.events.ts`

## Blocked by

M2, M3 — **unblocked** ✅ (both on `main`)
