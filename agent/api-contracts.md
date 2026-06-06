# API Contracts Index

**Source of truth:** TypeScript files in [`shared/contracts/`](../shared/contracts/).

When implementing an endpoint or socket event, update the contract file **first** (or in the same PR as the implementation).

## REST endpoints

### Auth & Users (Role B — M2)

| Method | Path | Contract file | Status |
|--------|------|---------------|--------|
| POST | `/api/auth/register` | `auth.api.ts` | stub — **client** path only |
| POST | `/api/auth/register/advisor` | `auth.api.ts` | stub — doctor applicant → `pending_review` |
| POST | `/api/auth/login` | `auth.api.ts` | stub |
| POST | `/api/auth/logout` | `auth.api.ts` | stub |
| GET | `/api/auth/me` | `auth.api.ts` | stub |
| PATCH | `/api/users/me/profile` | `users.api.ts` | stub |
| GET | `/api/users/advisors` | `users.api.ts` | stub |
| GET | `/api/users/advisors/:id` | `users.api.ts` | stub |

### Advisor verification & RBAC (Role B — M6, LiveKit Role C)

| Method | Path | Contract file | Status |
|--------|------|---------------|--------|
| POST | `/api/admin/partner-doctors` | `verification.api.ts` | stub — admin only |
| GET | `/api/admin/partner-doctors` | `verification.api.ts` | stub |
| PATCH | `/api/admin/advisors/:id/verification-status` | `verification.api.ts` | stub — admin override |
| GET | `/api/verification/applicants` | `verification.api.ts` | stub — partner doctor queue |
| POST | `/api/verification/interviews` | `verification.api.ts` | stub — start video interview |
| PATCH | `/api/verification/interviews/:id/complete` | `verification.api.ts` | stub — pass/fail |
| GET | `/api/verification/interviews/:id/livekit-token` | `verification.api.ts` | Role C service ready — Role B route pending |

### Wallet & Ledger (Role B — M3)

| Method | Path | Contract file | Status |
|--------|------|---------------|--------|
| GET | `/api/wallet/balance` | `wallet.api.ts` | stub |
| GET | `/api/wallet/transactions` | `wallet.api.ts` | stub |
| POST | `/api/wallet/purchase/initiate` | `wallet.api.ts` | stub |
| POST | `/api/wallet/webhook/payment` | `wallet.api.ts` | stub |
| POST | `/api/wallet/escrow/lock` | `wallet.api.ts` | internal — called by M5 |
| POST | `/api/wallet/escrow/release` | `wallet.api.ts` | internal |
| POST | `/api/wallet/escrow/refund` | `wallet.api.ts` | internal |

### Search (Role C — M4)

| Method | Path | Contract file | Status |
|--------|------|---------------|--------|
| POST | `/api/search/semantic` | `search.api.ts` | implemented |
| POST | `/api/search/reindex/:advisorId` | `search.api.ts` | implemented |

### Sessions & Presence (Role C — M5)

| Method | Path | Contract file | Status |
|--------|------|---------------|--------|
| PATCH | `/api/presence/status` | `session.api.ts` | implemented |
| GET | `/api/presence/advisors` | `session.api.ts` | implemented |
| POST | `/api/session/initiate` | `session.api.ts` | implemented |
| POST | `/api/session/:id/accept` | `session.api.ts` | implemented |
| POST | `/api/session/:id/decline` | `session.api.ts` | implemented |
| POST | `/api/session/:id/end` | `session.api.ts` | implemented |
| GET | `/api/session/:id/livekit-token` | `session.api.ts` | implemented |

## WebSocket events (Role C)

See `shared/contracts/socket.events.ts`.

| Direction | Event | Payload |
|-----------|-------|---------|
| Server → Advisor | `incoming_call_dispatch` | `{ sessionId, clientName, durationMinutes }` |
| Advisor → Server | `call_accepted` | `{ sessionId }` |
| Advisor → Server | `call_declined` | `{ sessionId }` |
| Server → Both | `session_ready` | `{ sessionId, livekitToken, livekitUrl }` |
| Server → Client | `call_processing` | `{ sessionId, status }` |
| Either → Server | `presence_ping` | `{ advisorId, online }` |

## Error shape (all routes)

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Human readable message"
  }
}
```

Codes: `UNAUTHORIZED`, `FORBIDDEN`, `INSUFFICIENT_FUNDS`, `ADVISOR_OFFLINE`, `ADVISOR_NOT_VERIFIED`, `SESSION_NOT_FOUND`, `VALIDATION_ERROR`.
