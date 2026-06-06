# Green Heart Frontend

React implementation of the **Green Heart UI Manual** (Stitch project `12248742422895015941`).

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
- Tailwind CSS v4 (Green Heart design tokens from Stitch)
- React Router

## Team ownership

**Role A** owns this folder exclusively. Specs: [`../agent/modules/M1-frontend.md`](../agent/modules/M1-frontend.md)

API types: [`../shared/contracts/`](../shared/contracts/)
