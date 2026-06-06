-- Role C: semantic search (requires pgvector)

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS advisor_embeddings (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    advisor_tags TEXT[],
    biography_text TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS advisor_vector_idx
ON advisor_embeddings
USING hnsw (embedding vector_cosine_ops);
