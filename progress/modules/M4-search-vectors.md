# M4 — Search & Vectors

**Owner:** Role C  
**Agent:** unassigned  
**Spec:** [agent/modules/M4-search-vectors.md](../../agent/modules/M4-search-vectors.md)

> Rebase `feat/m4-m5-role-c` onto latest `main` before starting.

## Tasks

- [ ] Run `backend/sql/003_advisor_embeddings.sql` (after 001)
- [ ] Wire `embedding.service.ts` (Gemini — already on `main`)
- [ ] POST `/api/search/semantic` (SQL JOIN users + profiles)
- [ ] Filter results: `verification_status = 'verified'` only (M6 gate)
- [ ] POST `/api/search/reindex/:advisorId` (only when verified)
- [ ] Merge online status from Redis in response
- [ ] Update `shared/contracts/search.api.ts`

## Blocked by

M2 advisor profiles with bio/tags — **unblocked** ✅
