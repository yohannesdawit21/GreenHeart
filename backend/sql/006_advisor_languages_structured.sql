-- Role B: migrate advisor_credentials.languages from string[] to structured [{code, name, fluency}]
-- Run after 005_advisor_credentials.sql on Render deploy.

UPDATE profiles
SET advisor_credentials = jsonb_set(
  advisor_credentials,
  '{languages}',
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'code', lower(regexp_replace(lang, '[^a-zA-Z0-9]+', '_', 'g')),
          'name', lang,
          'fluency', 'fluent'
        )
      )
      FROM jsonb_array_elements_text(advisor_credentials->'languages') AS lang
    ),
    '[]'::jsonb
  )
)
WHERE advisor_credentials->'languages' IS NOT NULL
  AND jsonb_typeof(advisor_credentials->'languages') = 'array'
  AND jsonb_array_length(advisor_credentials->'languages') > 0
  AND jsonb_typeof(advisor_credentials->'languages'->0) = 'string';

COMMENT ON COLUMN profiles.advisor_credentials IS
  'Structured credential fields including languages: [{code, name, fluency}]';
