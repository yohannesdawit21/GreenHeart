# Project Codex — Agent & Team Documentation

Living specification for **Project Codex** (GreenHeart). AI agents and human teammates should read this tree before implementing anything.

## Quick links

| Document | Purpose |
|----------|---------|
| [vision-and-product.md](./vision-and-product.md) | Product concept, MVP mechanics, user flows |
| [architecture.md](./architecture.md) | System topology, data stores, event pipelines |
| [team-roles.md](./team-roles.md) | **3-person team split**, ownership boundaries, git rules |
| [api-contracts.md](./api-contracts.md) | REST + WebSocket contract index (source of truth: `shared/contracts/`) |
| [data-models.md](./data-models.md) | PostgreSQL & Redis schemas |
| [ui-routing.md](./ui-routing.md) | Frontend routes mapped to spec layouts |
| [workflows/end-to-end.md](./workflows/end-to-end.md) | **Start-to-finish workflow** — bootstrap → verification → consultation |

## Module specs (implementation guides)

| ID | Owner role | Spec | Progress board |
|----|------------|------|----------------|
| M1 | Role A | [frontend](./modules/M1-frontend.md) | [progress/modules/M1-frontend.md](../progress/modules/M1-frontend.md) |
| M2 | Role B | [auth-users](./modules/M2-auth-users.md) | [progress/modules/M2-auth-users.md](../progress/modules/M2-auth-users.md) |
| M3 | Role B | [wallet-ledger](./modules/M3-wallet-ledger.md) | [progress/modules/M3-wallet-ledger.md](../progress/modules/M3-wallet-ledger.md) |
| M4 | Role C | [search-vectors](./modules/M4-search-vectors.md) | [progress/modules/M4-search-vectors.md](../progress/modules/M4-search-vectors.md) |
| M5 | Role C | [presence-sessions](./modules/M5-presence-sessions.md) | [progress/modules/M5-presence-sessions.md](../progress/modules/M5-presence-sessions.md) |
| M6 | B + A + C | [advisor-verification](./modules/M6-advisor-verification.md) | [progress/modules/M6-advisor-verification.md](../progress/modules/M6-advisor-verification.md) |
| — | **All** | **[Team roles & Sprint 2 tasks](./team-roles.md)** | [progress/STATUS.md](../progress/STATUS.md) |

## Repo layout

```
GreenHeart/
├── agent/          ← you are here (specs)
├── progress/       ← task boards & sprint status
├── shared/         ← cross-team TypeScript contracts ONLY
├── frontend/       ← Role A exclusively
└── backend/        ← Role B + Role C (split by module folder)
```

## Rules for agents

1. **Stay in your module folder** — see [team-roles.md](./team-roles.md).
2. **Never edit `shared/contracts/` without updating the matching agent spec** and notifying the other role.
3. **Do not rename routes** listed in [ui-routing.md](./ui-routing.md) or [api-contracts.md](./api-contracts.md) without team agreement.
4. **Mock data is OK in frontend** until M2/M3 APIs exist; wire to real endpoints using types from `shared/contracts/`.
5. Update your module's progress board when starting or finishing a task.

## Current state (2026-06-06)

| Area | Status |
|------|--------|
| Frontend UI + API wiring (M1) | **Mostly done** — PR #2 merged |
| Backend auth/users/wallet (M2/M3) | **Implemented** — smoke tests pass |
| Advisor verification (M6) | **Spec only** — Sprint 2 priority |
| Search / presence / sessions (M4/M5) | **Stubs** — Role C, rebase onto main |
| Socket.io / LiveKit | Frontend wired; backend stubs |
| End-to-end demo | Blocked on M4 + M5 + M6 |

See **[Sprint 2 assignments](./modules/SPRINT-2-role-assignments.md)** for per-role next tasks.
