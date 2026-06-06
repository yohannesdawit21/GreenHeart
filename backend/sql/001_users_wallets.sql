-- Role B: core identity & ledger (PostgreSQL)
-- Run after: CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'advisor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    bio TEXT NOT NULL DEFAULT '',
    tags TEXT[] NOT NULL DEFAULT '{}',
    coin_rate_per_session INT NOT NULL DEFAULT 0 CHECK (coin_rate_per_session >= 0)
);

CREATE INDEX IF NOT EXISTS idx_profiles_tags ON profiles USING GIN (tags);

CREATE TABLE IF NOT EXISTS wallets (
    user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    coin_balance INT NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
    escrow_balance INT NOT NULL DEFAULT 0 CHECK (escrow_balance >= 0),
    withdrawable_balance INT NOT NULL DEFAULT 0 CHECK (withdrawable_balance >= 0)
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users (id),
    advisor_id UUID REFERENCES users (id),
    type VARCHAR(30) NOT NULL CHECK (
        type IN ('deposit', 'escrow_lock', 'escrow_release', 'escrow_refund')
    ),
    amount_coins INT NOT NULL CHECK (amount_coins > 0),
    fiat_amount NUMERIC(10, 2),
    currency VARCHAR(3),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'completed', 'failed')
    ),
    gateway_reference VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_client ON transactions (client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_advisor ON transactions (advisor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions (created_at DESC);
