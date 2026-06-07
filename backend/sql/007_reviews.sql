-- Session reviews (client rates advisor after completed consultation)

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(64) NOT NULL UNIQUE REFERENCES sessions (session_id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users (id),
    advisor_id UUID NOT NULL REFERENCES users (id),
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_advisor ON reviews (advisor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client ON reviews (client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);
