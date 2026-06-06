# Sprint Status

**Last updated:** 2026-06-06  
**Sprint 2 tasks:** [agent/team-roles.md](../agent/team-roles.md) — each role has ✅ done + 📋 next tasks

## Merged PRs (what's on `main`)

| PR / merge | Owner | Summary |
|------------|-------|---------|
| **#2** `feat/m1-frontend-integration` | Role A | Frontend API layer + wired pages (auth, discover, wallet, advisor, consultation, socket) |
| **Merge** `feat/m2-auth-users` | Role B | Auth, users, wallet, escrow, webhook, Neon fix, smoke tests |
| **Commit** M6 spec | All | Advisor verification RBAC, end-to-end workflow doc |

## Open PRs (Role C — awaiting merge)

| Branch | Owner | Summary |
|--------|-------|---------|
| `feat/m5-presence-sessions` | Role C | **M4 + M5** — search, presence, sessions, Socket.io, LiveKit |
| `feat/m6-verification-livekit` | Role C | **M6 (C slice)** — verification LiveKit token service |

Merge **M5 PR first**, then **M6 PR**. Close `feat/m4-m5-role-c` (superseded).

## Module status

| ID | Module | Owner | Agent | Status | Blocked by |
|----|--------|-------|-------|--------|------------|
| M1 | Frontend | Role A | Gemini CLI | **mostly done** | M4/M5/M6 APIs for full E2E |
| M2 | Auth & Users | Role B | cursor-agent | **core done** | M6 role extensions |
| M3 | Wallet & Ledger | Role B | cursor-agent | **done** | — |
<<<<<<< HEAD
| M4 | Search & Vectors | Role C | cursor-role-c | **done** (branch `feat/m6-verification-livekit`) | Merge PR to `main` |
| M5 | Presence & Sessions | Role C | cursor-role-c | **done** (branch `feat/m6-verification-livekit`) | Merge PR to `main` |
| M6 | Advisor Verification | B + A + C | unassigned | **partial** — Role C LiveKit helpers only | Role B APIs + Role A UI |
=======
| M4 | Search & Vectors | Role C | cursor-role-c | **PR ready** | Merge `feat/m5-presence-sessions` |
| M5 | Presence & Sessions | Role C | cursor-role-c | **PR ready** | Merge `feat/m5-presence-sessions` |
| M6 | Advisor Verification | B + A + C | mixed | **in progress** | Role B/A APIs; Role C PR `feat/m6-verification-livekit` |
>>>>>>> origin/main

## Definition of done (MVP demo)

- [ ] Client registers (patient path), buys coins (sandbox), searches **verified** advisors semantically
- [ ] Doctor registers (advisor-apply path), partner doctor verifies via **video**, then appears in search
- [ ] Admin (seed) registers partner doctors; can override verification status
- [ ] Client connects → verified advisor receives overlay → accept → video call
- [ ] Escrow locks and releases correctly
- [ ] Verified advisor can go online/offline

## Next actions by role

| Role | Start here |
|------|------------|
| **A** | [team-roles.md → Role A](../agent/team-roles.md#role-a--frontend-lead) · [M1 progress](./modules/M1-frontend.md) |
| **B** | [team-roles.md → Role B](../agent/team-roles.md#role-b--backend-core-identity--ledger) · [M2 progress](./modules/M2-auth-users.md) |
| **C** | Merge PRs · [M4 progress](./modules/M4-search-vectors.md) · [M5 progress](./modules/M5-presence-sessions.md) |

## How to claim work

1. Open your module board under `progress/modules/`
2. Set `Agent: your-name`
3. Check tasks and mark `[x]` as you complete
4. Do not edit other modules' boards
