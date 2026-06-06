# M4 — Search & Vectors

**Owner:** Role C  
**Agent:** unassigned  
**Spec:** [agent/modules/M4-search-vectors.md](../../agent/modules/M4-search-vectors.md)

## Tasks

- [ ] Run `backend/sql/003_advisor_embeddings.sql` (after 001)
- [ ] Embedding service (OpenAI text-embedding-3-small)
- [ ] POST `/api/search/semantic` (SQL JOIN users + profiles, **verified only**)
- [ ] POST `/api/search/reindex/:advisorId` (after M6 verification pass)
- [ ] Merge online status from Redis in response
- [ ] Update `shared/contracts/search.api.ts`

## Blocked by

M2 advisor profiles with bio/tags
