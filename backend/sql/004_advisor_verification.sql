-- Role B: M6 advisor verification (run after 001_users_wallets.sql)
-- Role C depends on verification_interviews + verification_status (M4/M5 gates)

-- Extend platform roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('client', 'advisor', 'partner_doctor', 'admin'));

-- Advisor verification status (NULL for non-advisor roles; NULL legacy = graceful M4/M5 fallback)
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20)
    CHECK (
        verification_status IS NULL
        OR verification_status IN ('pending_review', 'verified', 'rejected', 'suspended')
    );

CREATE INDEX IF NOT EXISTS idx_profiles_verification_status
    ON profiles (verification_status)
    WHERE verification_status IS NOT NULL;

CREATE TABLE IF NOT EXISTS verification_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    partner_doctor_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'in_progress', 'completed')
    ),
    outcome VARCHAR(10) CHECK (outcome IN ('pass', 'fail')),
    livekit_room VARCHAR(255),
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verification_interviews_applicant
    ON verification_interviews (applicant_id);

CREATE INDEX IF NOT EXISTS idx_verification_interviews_partner
    ON verification_interviews (partner_doctor_id);

CREATE INDEX IF NOT EXISTS idx_verification_interviews_status
    ON verification_interviews (status);
