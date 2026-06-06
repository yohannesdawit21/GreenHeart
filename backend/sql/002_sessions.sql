-- Role C: consultation sessions

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(64) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES users (id),
    advisor_id UUID NOT NULL REFERENCES users (id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'ringing', 'active', 'completed', 'declined', 'cancelled')
    ),
    coin_amount INT NOT NULL CHECK (coin_amount > 0),
    duration_minutes INT NOT NULL DEFAULT 30,
    livekit_room VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions (client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_advisor ON sessions (advisor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions (status);
