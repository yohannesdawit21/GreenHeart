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
| **Client** | Auth, Discovery, Wallet, Consultation room |
| **Advisor** | Auth, Advisor Control Center, Incoming call overlay, Consultation room |

## Design language

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Trust Teal | `#0D5C60` | Brand, CTAs |
| Calm Sage | `#8FB9A8` | Secondary accents |
| Vibrant Coral | `#FF6B6B` | Alerts, Connect Instantly, timers |
| Midnight Charcoal | `#1A252C` | Video room background |

Fonts: Manrope (headlines), Source Sans 3 (body), Geist (labels). Implemented in `frontend/src/index.css`.

## Success criteria for MVP demo

- [ ] Register/login as client or advisor (JWT)
- [ ] Buy coins (mock or sandbox webhook)
- [ ] Semantic search returns ranked advisors
- [ ] Connect flow locks escrow and rings advisor
- [ ] Accept opens LiveKit room with A/V
- [ ] Advisor toggles online/offline (Redis presence)
