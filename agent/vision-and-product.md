# Vision and Product

## One-line pitch

**Project Codex** is a high-concurrency, real-time holistic health and wellness gig-economy marketplace. Clients discover advisors via AI-assisted search, pay in **Coins**, and connect instantly over secure WebRTC video/audio.

## Problem

Traditional clinical pathways are slow and rigid. People need immediate access to verified advisors (MDs, psychologists, coaches) with transparent pricing and secure sessions.

## MVP mechanics

### Token economy (Coins)

- Clients buy fixed coin bundles via payment gateway webhook.
- Advisors set a flat **coin rate per 30-minute session**.
- All session payments use **escrow**: coins move from `coinBalance` → `escrowBalance` at call start; released or refunded after session.

### AI triage engine

- Discovery combines **category filters** + **natural language semantic search**.
- User distress text is embedded (1536-dim) and matched against advisor biographies in PostgreSQL (`pgvector`).
- Results are hydrated from PostgreSQL `users` + `profiles` (same database as embeddings).

### On-demand communication

1. Client clicks **Connect Instantly**.
2. Atomic escrow lock if balance sufficient.
3. WebSocket pushes **incoming call** overlay to advisor.
4. Advisor **Accept** → LiveKit room tokens issued to both parties.
5. `<LiveKitRoom>` establishes media session.

## User roles

| Role | Primary surfaces |
|------|------------------|
| **Client (patient)** | Auth (patient path), Discovery, Wallet, Consultation room |
| **Advisor (doctor applicant)** | Auth (advisor-apply path), application status, Consultation room (after verified) |
| **Partner doctor** | Partner RBAC dashboard, verification video room, pass/fail applicants |
| **Admin** | Admin dashboard — register partner doctors, override verification status |

### Advisor verification (before marketplace)

Doctors who want to offer services register on a **separate path** from patients. They start as `pending_review` and are **not** searchable until a **partner doctor** passes them in an **in-app video interview**. Admin can override status (e.g. `suspended`) from the platform side. First admin account is created via **DB seed**.

See [modules/M6-advisor-verification.md](./modules/M6-advisor-verification.md).

## Design language

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Trust Teal | `#0D5C60` | Brand, CTAs |
| Calm Sage | `#8FB9A8` | Secondary accents |
| Vibrant Coral | `#FF6B6B` | Alerts, Connect Instantly, timers |
| Midnight Charcoal | `#1A252C` | Video room background |

Fonts: Manrope (headlines), Source Sans 3 (body), Geist (labels). Implemented in `frontend/src/index.css`.

## Success criteria for MVP demo

- [ ] Register/login as client (patient path) or advisor applicant (doctor path)
- [ ] Admin (seed) registers partner doctor; partner verifies applicant via video
- [ ] Only **verified** advisors appear in semantic search and can go online
- [ ] Buy coins (mock or sandbox webhook)
- [ ] Connect flow locks escrow and rings verified advisor
- [ ] Accept opens LiveKit room with A/V
- [ ] Verified advisor toggles online/offline (Redis presence)
