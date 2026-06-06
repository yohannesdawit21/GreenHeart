# M4 — Search & Vectors

**Owner:** Role C  
**Agent:** cursor-role-c  
**Spec:** [agent/modules/M4-search-vectors.md](../../agent/modules/M4-search-vectors.md)

## Tasks

- [x] Run `backend/sql/003_advisor_embeddings.sql` (after 001)
- [x] Embedding service (Gemini / OpenAI text-embedding, 1536-dim)
- [x] POST `/api/search/semantic` (SQL JOIN users + profiles, **verified only**)
- [x] POST `/api/search/reindex/:advisorId` (after M6 verification pass)
- [x] Merge online status from Redis in response
- [ ] Update `shared/contracts/search.api.ts` (types unchanged — verify with frontend)

## Blocked by

M2 advisor profiles with bio/tags; M6 `verification_status` column for strict gating
