# M3 — Wallet & Ledger

**Owner:** Role B  
**Folder:** `backend/src/modules/wallet/`  
**Progress:** [progress/modules/M3-wallet-ledger.md](../../progress/modules/M3-wallet-ledger.md)

## Scope

Coin balances, transaction ledger, payment webhook, **atomic escrow** in Postgres transactions exported for M5.

## Files to implement

```
backend/src/modules/wallet/
├── wallet.routes.ts
├── wallet.controller.ts
├── wallet.service.ts          # export lockEscrow, releaseEscrow, refundEscrow
├── wallet.repository.ts
└── webhook.controller.ts
```

## Atomic escrow (Postgres)

```typescript
// wallet.service.ts
export async function lockEscrow(clientId: string, amount: number, sessionId: string): Promise<boolean> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const update = await client.query(
      `UPDATE wallets SET coin_balance = coin_balance - $1, escrow_balance = escrow_balance + $1
       WHERE user_id = $2 AND coin_balance >= $1 RETURNING user_id`,
      [amount, clientId],
    );
    if (update.rowCount === 0) {
      await client.query('ROLLBACK');
      return false;
    }
    await client.query(
      `INSERT INTO transactions (client_id, type, amount_coins, status) VALUES ($1, 'escrow_lock', $2, 'completed')`,
      [clientId, amount],
    );
    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
```

## Payment webhook

- `POST /api/wallet/webhook/payment` — verify signature (provider-specific)
- Idempotent on `gateway_reference`
- Credit `wallets.coin_balance` on completed deposit

## Do not implement here

- Session initiation (M5 calls your service)
- LiveKit (M5)
