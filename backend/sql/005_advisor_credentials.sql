-- Role B: structured advisor credentials (run after 004_advisor_verification.sql)
-- Backward compatible: NULL/{} for legacy advisors; bio text parsing still works.

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS advisor_credentials JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_advisor_credentials
    ON profiles USING GIN (advisor_credentials);

COMMENT ON COLUMN profiles.advisor_credentials IS
    'Structured credential fields from advisor apply wizard (profession, license, region, etc.)';
