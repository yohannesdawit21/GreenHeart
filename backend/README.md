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
npm run db:migrate
npm run db:seed   # optional — first admin user
npm run dev
```

API: http://localhost:4000/health

## Deploy to Render

Production Docker deployment guide: **[DEPLOY-RENDER.md](./DEPLOY-RENDER.md)**

Quick summary:

1. Provision **Neon** (Postgres), **Upstash** (Redis), **LiveKit Cloud**
2. Render → New Web Service → **Docker** → root directory `backend`
3. Set env vars (`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `CORS_ORIGIN`, LiveKit keys)
4. First deploy: `RUN_ADMIN_SEED=true`, then disable
5. Point frontend `VITE_API_URL` / `VITE_SOCKET_URL` at your Render URL

## Specs

[`../agent/README.md`](../agent/README.md)

## API contracts

[`../shared/contracts/`](../shared/contracts/)
