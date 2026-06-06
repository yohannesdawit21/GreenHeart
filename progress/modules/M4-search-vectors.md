# M4 — Search & Vectors

**Owner:** Role C  
**Agent:** cursor-role-c  
**Spec:** [agent/modules/M4-search-vectors.md](../../agent/modules/M4-search-vectors.md)

## Tasks

- [x] Run `backend/sql/003_advisor_embeddings.sql` (after 001)
- [x] Wire `embedding.service.ts` (Gemini / OpenAI, 1536-dim, query vs document task types)
- [x] POST `/api/search/semantic` (SQL JOIN users + profiles)
- [x] Filter results: `verification_status = 'verified'` only (M6 gate; graceful fallback until column exists)
- [x] POST `/api/search/reindex/:advisorId` (only when verified)
- [x] Merge online status from Redis in response
- [x] Update `shared/contracts/search.api.ts`

## Blocked by

M2 advisor profiles with bio/tags — **unblocked** ✅  
M6 `verification_status` column for strict gating (graceful fallback until M6 lands)
