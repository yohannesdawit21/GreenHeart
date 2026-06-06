# Sprint Status

**Last updated:** 2026-06-06

| ID | Module | Owner | Agent | Status | Blocked by |
|----|--------|-------|-------|--------|------------|
| M1 | Frontend | Role A | unassigned | not_started | M2 partial for auth |
| M2 | Auth & Users | Role B | unassigned | not_started | — |
| M3 | Wallet & Ledger | Role B | unassigned | not_started | M2 |
| M4 | Search & Vectors | Role C | unassigned | not_started | M2 advisor profiles |
| M5 | Presence & Sessions | Role C | unassigned | not_started | M2, M3 |
| M6 | Advisor Verification & RBAC | B + A + C | unassigned | not_started | M2, M5 LiveKit reuse |

## Definition of done (MVP demo)

- [ ] Client registers (patient path), buys coins (sandbox), searches **verified** advisors semantically
- [ ] Doctor registers (advisor-apply path), partner doctor verifies via **video**, then appears in search
- [ ] Admin (seed) registers partner doctors; can override verification status
- [ ] Client connects → verified advisor receives overlay → accept → video call
- [ ] Escrow locks and releases correctly
- [ ] Verified advisor can go online/offline

## How to claim work

1. Open your module board under `progress/modules/`
2. Set `Agent: your-name`
3. Check tasks and mark `[x]` as you complete
4. Do not edit other modules' boards
