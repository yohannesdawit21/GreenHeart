-- M6: advisor verification schema (Role B owns module; Role C depends on interviews table)
-- verification_status NULL = pre-M6 advisors (graceful fallback in M4/M5)

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) CHECK (
        verification_status IN ('pending_review', 'verified', 'rejected', 'suspended')
    );

CREATE TABLE IF NOT EXISTS verification_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES users (id),
    partner_doctor_id UUID NOT NULL REFERENCES users (id),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'in_progress', 'completed')
    ),
    outcome VARCHAR(10) CHECK (outcome IN ('pass', 'fail')),
    livekit_room VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verification_interviews_applicant ON verification_interviews (applicant_id);
CREATE INDEX IF NOT EXISTS idx_verification_interviews_partner ON verification_interviews (partner_doctor_id);
CREATE INDEX IF NOT EXISTS idx_verification_interviews_status ON verification_interviews (status);
