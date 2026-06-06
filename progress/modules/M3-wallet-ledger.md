# M3 — Wallet & Ledger

**Owner:** Role B  
**Agent:** cursor-agent  
**Spec:** [agent/modules/M3-wallet-ledger.md](../../agent/modules/M3-wallet-ledger.md)

## Tasks

- [x] Wallet + transaction repositories (SQL)
- [x] GET `/api/wallet/balance`
- [x] GET `/api/wallet/transactions`
- [x] POST `/api/wallet/purchase/initiate`
- [x] POST `/api/wallet/webhook/payment` (sandbox)
- [x] Implement `lockEscrow`, `releaseEscrow`, `refundEscrow` in `wallet.service.ts` (SQL transactions)
- [x] Coin package config
- [x] Update `shared/contracts/wallet.api.ts`

## Blocked by

M2 (user + wallet rows must exist) — **unblocked**
