# M3 — Wallet & Ledger

**Owner:** Role B  
**Agent:** unassigned  
**Spec:** [agent/modules/M3-wallet-ledger.md](../../agent/modules/M3-wallet-ledger.md)

## Tasks

- [ ] Wallet + transaction repositories (SQL)
- [ ] GET `/api/wallet/balance`
- [ ] GET `/api/wallet/transactions`
- [ ] POST `/api/wallet/purchase/initiate`
- [ ] POST `/api/wallet/webhook/payment` (sandbox)
- [ ] Implement `lockEscrow`, `releaseEscrow`, `refundEscrow` in `wallet.service.ts` (SQL transactions)
- [ ] Coin package config
- [ ] Update `shared/contracts/wallet.api.ts`

## Blocked by

M2 (user + wallet rows must exist)
