# GreenHeart — Project Codex

Holistic health gig-economy marketplace: demo coin-based sessions, AI advisor discovery, instant WebRTC consultations.

## Monorepo layout

| Path | Owner | Description |
|------|-------|-------------|
| [`agent/`](./agent/) | Team | Specs for humans & AI agents |
| [`progress/`](./progress/) | Module task boards |
| [`shared/contracts/`](./shared/contracts/) | B + C | API type contracts |
| [`frontend/`](./frontend/) | **Role A** | React UI (Vite) |
| [`backend/`](./backend/) | **Role B + C** | Express API |

## Team of 3 — quick assignment

| Role | Focus | Folders |
|------|-------|---------|
| **A — Frontend** | UI, LiveKit client, Socket client | `frontend/` |
| **B — Core Backend** | Auth, users, wallet, PostgreSQL core | `backend/src/modules/{auth,users,wallet,reviews}/` |
| **C — Realtime & AI** | Search, presence, sessions, Socket, LiveKit | `backend/src/modules/{search,presence,sessions}/`, `socket/`, `livekit/` |

Full ownership rules: [`agent/team-roles.md`](./agent/team-roles.md)

## Getting started

```bash
# Frontend (Role A)
cd frontend && npm install && npm run dev

# Backend (Role B/C)
cd backend && cp .env.example .env && npm install && npm run db:migrate && npm run db:seed && npm run dev
```

**Seeded admin:** `admin@gmail.com` / `12345678` (override via `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`)

## Key routes

| Route | Purpose |
|-------|---------|
| `/workflow` | 5-step onboarding guide (admin → partner → advisor apply → verify → patient call) |
| `/auth/advisor-apply` | 5-step advisor application wizard |
| `/discover` | Advisor discovery with multi-filter + semantic search |
| `/advisor` | Advisor hub (online toggle, earnings) |
| `/admin/partners` | Admin partner doctor management |

## Documentation for agents

Start at [`agent/README.md`](./agent/README.md).

## Current status

- Frontend: wired to live API — discovery filters, reviews, presence restore, notifications
- Backend: auth, wallet (demo coins), search, sessions, reviews, verification RBAC
- **Migration 007** (`reviews` table) required on Render after deploy

See [`progress/STATUS.md`](./progress/STATUS.md) and [`progress/E2E-TEST-GUIDE.md`](./progress/E2E-TEST-GUIDE.md).
