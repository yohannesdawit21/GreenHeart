# Codex Backend API

Node.js / Express gateway for Project Codex. **PostgreSQL** is the single primary database (+ Redis for presence).

## Structure

```
backend/src/
├── config/
├── modules/
│   ├── auth/               # Role B — M2
│   ├── users/              # Role B — M2
│   ├── wallet/             # Role B — M3
│   ├── search/             # Role C — M4
│   ├── presence/           # Role C — M5
│   └── sessions/           # Role C — M5
├── database/
│   ├── postgres/           # Role B: pool + getPool()
│   └── redis/              # Role C
├── socket/                 # Role C
├── livekit/                # Role C
├── shared/
├── app.ts
└── index.ts

backend/sql/
├── 001_users_wallets.sql   # Role B
├── 002_sessions.sql        # Role C
└── 003_advisor_embeddings.sql  # Role C (pgvector)
```

## Setup

```bash
cd backend
cp .env.example .env
npm install
# Create DB, then run SQL files in order (001 → 002 → 003)
npm run dev
```

API: http://localhost:4000/health

## Specs

[`../agent/README.md`](../agent/README.md)

## API contracts

[`../shared/contracts/`](../shared/contracts/)
