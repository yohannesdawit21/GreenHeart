# Deploy GreenHeart API to Render

This guide walks you through deploying the **backend** (`GreenHeart/backend`) to [Render](https://render.com) using Docker. The frontend stays on Vercel (or similar); point it at your Render API URL.

---

## Architecture

| Service | Provider | Purpose |
|---------|----------|---------|
| API + Socket.io | **Render** (Docker Web Service) | Express, WebSockets, LiveKit tokens |
| PostgreSQL | **Neon** (recommended) | Primary database + pgvector |
| Redis | **Upstash** (recommended) | Advisor online status, socket routing |
| Video | **LiveKit Cloud** | Consultation & verification rooms |
| Frontend | **Vercel** | React SPA |

---

## Prerequisites

1. GitHub repo with `GreenHeart/backend` pushed
2. [Render](https://render.com) account
3. [Neon](https://neon.tech) Postgres database (free tier works)
4. [Upstash](https://upstash.com) Redis database (free tier works)
5. [LiveKit Cloud](https://cloud.livekit.io) project (for video)
6. Gemini or OpenAI API key (for semantic search)

---

## Step 1 — Create external services

### Neon (Postgres)

1. Create a project → copy the **pooled** connection string
2. Format: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`
3. Enable **pgvector** in Neon SQL editor (if not already):
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### Upstash (Redis)

1. Create a Redis database
2. Copy the **TLS** URL: `rediss://default:xxx@xxx.upstash.io:6379`

### LiveKit Cloud

1. Create a project
2. Copy **URL**, **API Key**, and **API Secret**
3. URL looks like: `wss://your-project.livekit.cloud`

---

## Step 2 — Deploy on Render (Docker)

### Option A — Dashboard (recommended first time)

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:

   | Field | Value |
   |-------|-------|
   | **Name** | `greenheart-api` |
   | **Root Directory** | `GreenHeart/backend` (adjust if repo root is `backend`) |
   | **Runtime** | **Docker** |
   | **Instance type** | Starter (or Free for testing — free tier sleeps) |

4. Render auto-detects `Dockerfile` in the root directory

5. Add **Environment Variables** (see table below)

6. Click **Create Web Service**

7. Wait for build + deploy. Check logs for:
   ```
   [migrate] applied 001_users_wallets.sql
   ...
   [postgres] connected
   [redis] connected
   Codex API listening on 0.0.0.0:10000
   ```

8. Open `https://your-service.onrender.com/health` — should return:
   ```json
   {"status":"ok","service":"codex-api"}
   ```

### Option B — Blueprint (`render.yaml`)

1. Render Dashboard → **New** → **Blueprint**
2. Connect repo; set root directory to `GreenHeart/backend`
3. Fill in secret env vars when prompted (`DATABASE_URL`, `REDIS_URL`, `CORS_ORIGIN`, LiveKit keys, etc.)
4. Deploy

---

## Step 3 — Environment variables

Set these in Render → your service → **Environment**:

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | Neon pooled URL with `?sslmode=require` |
| `REDIS_URL` | Yes | Upstash `rediss://...` URL |
| `JWT_SECRET` | Yes | Long random string (Render can generate) |
| `CORS_ORIGIN` | Yes | Your frontend URL, e.g. `https://greenheart.vercel.app` |
| `COOKIE_SAME_SITE` | Yes (cross-origin) | `none` when frontend is on a different domain |
| `LIVEKIT_URL` | Yes (video) | `wss://xxx.livekit.cloud` |
| `LIVEKIT_API_KEY` | Yes (video) | From LiveKit dashboard |
| `LIVEKIT_API_SECRET` | Yes (video) | From LiveKit dashboard |
| `GEMINI_API_KEY` | Yes (search) | Or use `OPENAI_API_KEY` + `EMBEDDING_PROVIDER=openai` |
| `RUN_DB_MIGRATE` | Optional | `true` (default) — runs SQL on each deploy |
| `RUN_ADMIN_SEED` | First deploy only | `true` once, then set to `false` |
| `ADMIN_SEED_EMAIL` | First deploy | `admin@greenheart.dev` |
| `ADMIN_SEED_PASSWORD` | First deploy | Strong password — save it |
| `PAYMENT_WEBHOOK_SECRET` | Optional | For payment webhooks |

**Important:** After first successful deploy with `RUN_ADMIN_SEED=true`, set `RUN_ADMIN_SEED=false` and redeploy so you don't rely on seed running every boot.

---

## Step 4 — Connect the frontend

In **Vercel** (or local `.env`), set:

```env
VITE_API_URL=https://your-service.onrender.com/api
VITE_SOCKET_URL=https://your-service.onrender.com
```

Redeploy the frontend after changing env vars.

---

## Step 5 — Verify

```bash
# Health
curl https://your-service.onrender.com/health

# Register + login from frontend at your Vercel URL
# Log in as admin (seed credentials) → /admin
```

Run smoke tests against production (optional):

```bash
cd backend
API_URL=https://your-service.onrender.com npm run test:smoke
```

(You may need to adjust test scripts to read `API_URL` from env — local default is `localhost:4000`.)

---

## Local Docker test (before Render)

From `GreenHeart/backend`:

```bash
# Build
docker build -t greenheart-api .

# Run (uses your local .env values)
docker run --rm -p 4000:4000 --env-file .env greenheart-api
```

Or with explicit vars:

```bash
docker run --rm -p 4000:4000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -e JWT_SECRET="test-secret" \
  -e CORS_ORIGIN="http://localhost:5173" \
  -e COOKIE_SAME_SITE=lax \
  -e RUN_ADMIN_SEED=true \
  greenheart-api
```

Visit http://localhost:4000/health

---

## How the Docker image works

```
docker-entrypoint.sh
  ├── node dist/bootstrap/migrate.js   (if RUN_DB_MIGRATE=true)
  ├── node dist/bootstrap/seed-admin.js (if RUN_ADMIN_SEED=true)
  └── node dist/index.js               (Express + Socket.io)
```

- Listens on `0.0.0.0` and `PORT` (Render sets `PORT` automatically)
- Health check: `GET /health`
- WebSockets work on Render web services (same URL as HTTPS, wss via Socket.io)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails | Check Render logs; ensure **Root Directory** is `backend` |
| `Missing required env var: JWT_SECRET` | Add `JWT_SECRET` in Render env |
| DB connection timeout | Use Neon **pooler** URL; include `sslmode=require` |
| Redis errors | Use Upstash **TLS** URL (`rediss://`) |
| Login works locally but not from Vercel | Set `CORS_ORIGIN` to exact Vercel URL; `COOKIE_SAME_SITE=none`; `NODE_ENV=production` |
| `SOCKET_NOT_CONNECTED` | Frontend `VITE_SOCKET_URL` must match Render URL (no `/api` suffix) |
| Video 503 `LIVEKIT_NOT_CONFIGURED` | Set all three LiveKit env vars |
| Free tier cold start | First request after idle may take 30–60s |

---

## Updating the deployment

Push to your connected branch → Render rebuilds automatically.

Migrations re-run on each deploy (`RUN_DB_MIGRATE=true`). SQL files use `IF NOT EXISTS` where possible.

---

## Security checklist

- [ ] Change `ADMIN_SEED_PASSWORD` after first login
- [ ] Set `RUN_ADMIN_SEED=false` after first deploy
- [ ] Use strong `JWT_SECRET` and `PAYMENT_WEBHOOK_SECRET`
- [ ] Restrict `CORS_ORIGIN` to your real frontend domain(s) only
- [ ] Never commit `.env` to git

---

## Related

- Frontend Vercel deploy: set `VITE_*` URLs to this Render service
- Workflow spec: [`../agent/workflows/end-to-end.md`](../agent/workflows/end-to-end.md)
- Local dev: [`README.md`](./README.md)
