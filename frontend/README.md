# Codex Frontend

React implementation of **Project Codex UI Manual** (Stitch project `12248742422895015941`) for GreenHeart.

## Screens

| Route | Stitch screen |
|-------|---------------|
| `/auth` | Authentication & Onboarding |
| `/discover` | Advisor Discovery Hub |
| `/discover/ai` | Advisor Discovery Hub — AI Pulse |
| `/wallet` | Client Wallet Dashboard |
| `/advisor` | Advisor Control Center |
| `/consultation` | Live Consultation Room |
| `/incoming-call` | Incoming Call Ingress |

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — you'll land on the auth screen. Use **Continue to Platform** or **Browse as guest** to enter the app.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 (Codex design tokens from Stitch)
- React Router
