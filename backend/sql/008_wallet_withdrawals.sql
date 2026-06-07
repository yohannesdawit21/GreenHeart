-- Advisor demo payouts — withdrawal transaction type
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (
    type IN ('deposit', 'escrow_lock', 'escrow_release', 'escrow_refund', 'withdrawal')
);
