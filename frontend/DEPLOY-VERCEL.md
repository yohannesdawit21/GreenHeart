# Deploy GreenHeart Frontend to Vercel

Deploy the React SPA from `frontend/` to [Vercel](https://vercel.com). The API runs separately on Render — see [`../backend/DEPLOY-RENDER.md`](../backend/DEPLOY-RENDER.md).

---

## Prerequisites

- GitHub repo connected to Vercel
- Backend deployed on Render (or running locally for preview)
- Backend `CORS_ORIGIN` includes your Vercel URL
- Backend `COOKIE_SAME_SITE=none` when frontend and API are on different domains

---

## Step 1 — Import project

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project**
2. Import your GitHub repository
3. Configure:

   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | Vite (auto-detected) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

   `vercel.json` in this folder sets these defaults; Vercel should detect them automatically.

4. Do **not** override install path — Vercel clones the full repo so the sibling `shared/` folder resolves for `@shared` imports.

---

## Step 2 — Environment variables

In Vercel → **Settings** → **Environment Variables**, add for **Production** (and Preview if needed):

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://greenheart-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://greenheart-api.onrender.com` |

**Important:** No trailing slash on `VITE_SOCKET_URL`. Include `/api` on `VITE_API_URL`.

Redeploy after changing env vars — Vite bakes them in at build time.

---

## Step 3 — Deploy

Click **Deploy**. After build completes, open your Vercel URL (e.g. `https://greenheart.vercel.app`).

Verify:

1. `/auth` loads
2. `/discover` loads (guest browse)
3. Login works (cookies + CORS configured on Render)
4. Socket connects (check browser devtools → Network → WS)

---

## Step 4 — Update backend CORS

On Render, set:

```
CORS_ORIGIN=https://your-app.vercel.app,http://localhost:5173
```

Redeploy the backend if you change this.

---

## SPA routing

`vercel.json` rewrites all routes to `index.html` so React Router paths work on refresh:

- `/discover`, `/wallet`, `/consultation`, `/verification/:id`, etc.

---

## Preview deployments

For PR previews, either:

- Use the same Render API with `CORS_ORIGIN` including `https://*.vercel.app` (not supported as wildcard in current backend — add each preview URL), or
- Point preview env vars at a staging API

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 404 on refresh | Ensure `vercel.json` rewrites are present |
| Build fails on `@shared` | Root Directory must be `frontend`, not repo root |
| API calls fail / CORS | Add exact Vercel URL to Render `CORS_ORIGIN` |
| Login fails cross-origin | Render: `COOKIE_SAME_SITE=none`, `NODE_ENV=production` |
| WebSocket fails | `VITE_SOCKET_URL` = Render base URL (no `/api`) |
| Stale API URL after env change | Redeploy frontend (env vars are build-time) |

---

## Local production preview

```bash
cd frontend
VITE_API_URL=https://your-api.onrender.com/api \
VITE_SOCKET_URL=https://your-api.onrender.com \
npm run build && npm run preview
```

Open http://localhost:4173
