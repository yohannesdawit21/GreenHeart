# Shared contracts

TypeScript API and event types shared between **frontend**, **backend**, and **AI agents**.

## Ownership (avoid merge conflicts)

| File | Owner | Others |
|------|-------|--------|
| `auth.api.ts`, `users.api.ts`, `wallet.api.ts`, `models.user.ts` | Role B | read-only |
| `search.api.ts`, `session.api.ts`, `socket.events.ts` | Role C | read-only |
| `index.ts` | either B or C — append exports only, no reorder wars |

## Usage

**Frontend:** copy types or add path alias in `vite.config.ts`:

```typescript
resolve: { alias: { '@codex/shared': path.resolve(__dirname, '../shared/contracts') } }
```

**Backend:** same alias in `tsconfig.json` paths.

## Rule

If you change an endpoint shape, update the contract file in the **same PR** as the implementation.
