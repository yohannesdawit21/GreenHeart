# Sprint Status

**Last updated:** 2026-06-06  
**Sprint 2 assignments:** [agent/modules/SPRINT-2-role-assignments.md](../agent/modules/SPRINT-2-role-assignments.md)

## Merged PRs (what's on `main`)

| PR / merge | Owner | Summary |
|------------|-------|---------|
| **#2** `feat/m1-frontend-integration` | Role A | Frontend API layer + wired pages (auth, discover, wallet, advisor, consultation, socket) |
| **Merge** `feat/m2-auth-users` | Role B | Auth, users, wallet, escrow, webhook, Neon fix, smoke tests |
| **Commit** M6 spec | All | Advisor verification RBAC, end-to-end workflow doc (implementation pending) |

## Module status

| ID | Module | Owner | Agent | Status | Blocked by |
|----|--------|-------|-------|--------|------------|
| M1 | Frontend | Role A | Gemini CLI | **mostly done** | M4/M5/M6 APIs for full E2E |
| M2 | Auth & Users | Role B | cursor-agent | **core done** | M6 role extensions |
| M3 | Wallet & Ledger | Role B | cursor-agent | **done** | — |
| M4 | Search & Vectors | Role C | unassigned | not_started | Rebase onto main |
| M5 | Presence & Sessions | Role C | unassigned | not_started | Rebase onto main |
| M6 | Advisor Verification | B + A + C | unassigned | spec_only | M2 roles foundation |

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
| **A** | [Sprint 2 — Role A tasks](../agent/modules/SPRINT-2-role-assignments.md#role-a--frontend-lead) |
| **B** | [Sprint 2 — Role B tasks](../agent/modules/SPRINT-2-role-assignments.md#role-b--backend-core-identity--ledger) |
| **C** | [Sprint 2 — Role C tasks](../agent/modules/SPRINT-2-role-assignments.md#role-c--backend-realtime--intelligence) |

## How to claim work

1. Open your module board under `progress/modules/`
2. Set `Agent: your-name`
3. Check tasks and mark `[x]` as you complete
4. Do not edit other modules' boards
