# M5 — Presence, Sessions & LiveKit

**Owner:** Role C  
**Folders:** `backend/src/modules/presence/`, `backend/src/modules/sessions/`, `backend/src/socket/`, `backend/src/livekit/`  
**Progress:** [progress/modules/M5-presence-sessions.md](../../progress/modules/M5-presence-sessions.md)

## Scope

Redis advisor presence, Socket.io signaling, session lifecycle, LiveKit room tokens, escrow orchestration via M3.

## Files to implement

```
backend/src/modules/presence/
├── presence.routes.ts
├── presence.service.ts
└── presence.repository.ts    # Redis HASH online_advisors

backend/src/modules/sessions/
├── sessions.routes.ts
├── sessions.controller.ts
├── sessions.service.ts
├── sessions.repository.ts

backend/sql/
└── 002_sessions.sql

backend/src/socket/
├── index.ts                  # attach to HTTP server
├── handlers.ts
└── auth.middleware.ts        # JWT on connection

backend/src/livekit/
├── client.ts
└── token.service.ts

backend/src/database/redis/
└── connection.ts
```

## Session initiate flow

```
POST /api/session/initiate { advisorId }
  1. Validate client JWT + advisor online (Redis)
  2. Read advisor coinRatePerSession
  3. walletService.lockEscrow(clientId, rate)  ← M3
  4. Create session doc (status: ringing)
  5. socket.to(advisorSocketId).emit('incoming_call_dispatch', payload)
  6. Return { sessionId, status: 'ringing' } to client
```

## Accept flow

```
Socket: call_accepted { sessionId }
  1. Update session → active
  2. Create LiveKit room
  3. Emit session_ready + tokens to client and advisor
```

## Decline / timeout

- Refund escrow via M3 `refundEscrow`
- Update session → declined/cancelled

## LiveKit token

Use `@livekit/server-sdk`:

```typescript
import { AccessToken } from 'livekit-server-sdk';
```

## Do not implement here

- User registration (M2)
- Direct wallet balance mutations (always M3 service)

## Tests (minimum)

- Advisor online toggle updates Redis
- Initiate with offline advisor → ADVISOR_OFFLINE
- Accept emits tokens to both parties
