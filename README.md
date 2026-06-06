# GreenHeart — Project Codex

Holistic health gig-economy marketplace: coin-based sessions, AI advisor discovery, instant WebRTC consultations.

## Monorepo layout

| Path | Owner | Description |
|------|-------|-------------|
| [`agent/`](./agent/) | Team | Specs for humans & AI agents |
| [`progress/`](./progress/) | Team | Module task boards |
| [`shared/contracts/`](./shared/contracts/) | B + C | API type contracts |
| [`frontend/`](./frontend/) | **Role A** | React UI (Vite) |
| [`backend/`](./backend/) | **Role B + C** | Express API |

## Team of 3 — quick assignment

| Role | Focus | Folders |
|------|-------|---------|
| **A — Frontend** | UI, LiveKit client, Socket client | `frontend/` |
| **B — Core Backend** | Auth, users, wallet, PostgreSQL core | `backend/src/modules/{auth,users,wallet}/` |
| **C — Realtime & AI** | Search, presence, sessions, Socket, LiveKit | `backend/src/modules/{search,presence,sessions}/`, `socket/`, `livekit/` |

Full ownership rules: [`agent/team-roles.md`](./agent/team-roles.md)

## Getting started

```bash
# Frontend (Role A)
cd frontend && npm install && npm run dev

# Backend (Role B/C)
cd backend && cp .env.example .env && npm install && npm run dev
```

## Documentation for agents

Start at [`agent/README.md`](./agent/README.md).

## Current status

- Frontend: Stitch UI screens implemented (mock data)
- Backend: scaffold + stub routes
- Databases / LiveKit / payments: Postgres schema ready; services not connected

See [`progress/STATUS.md`](./progress/STATUS.md).
