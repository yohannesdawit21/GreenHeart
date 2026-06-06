# M4 — Semantic Search & Vector Index

**Owner:** Role C  
**Folder:** `backend/src/modules/search/`  
**Progress:** [progress/modules/M4-search-vectors.md](../../progress/modules/M4-search-vectors.md)

## Scope

Advisor embedding storage, semantic search API, reindex on profile update. **Same Postgres DB** as M2 — JOIN on `users.id`.

## Files to implement

```
backend/src/modules/search/
├── search.routes.ts
├── search.controller.ts
├── search.service.ts
├── embedding.service.ts
└── advisorEmbedding.repository.ts

backend/sql/
├── 002_sessions.sql           # if not yet applied
└── 003_advisor_embeddings.sql
```

## Search query (single DB)

```sql
SELECT u.id, p.username, p.bio, p.tags, p.coin_rate_per_session,
       (ae.embedding <=> $1::vector) AS distance
FROM advisor_embeddings ae
JOIN users u ON u.id = ae.user_id
JOIN profiles p ON p.user_id = u.id
WHERE u.role = 'advisor'
  AND (ae.embedding <=> $1::vector) < 0.40
ORDER BY distance ASC
LIMIT 10;
```

Presence (`isOnline`) still comes from Redis at response assembly time.

## Reindex

- `POST /api/search/reindex/:advisorId` — read bio + tags from `profiles`, embed, upsert `advisor_embeddings`

## Do not implement here

- Wallet mutations (M3)
- Socket signaling (M5)
