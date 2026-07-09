# Decision Log

Record decisions that future AI sessions should preserve. Keep entries short.

## Template

```text
YYYY-MM-DD - <Decision>
Context: <why>
Keep: <what future agents should preserve>
Change when: <trigger>
```

## Decisions

2026-07-09 - Use Obsidian as project memory, not source of truth
Context: AI needs fast repo orientation, but code can drift.
Keep: Use notes as a map; verify behavior in source before editing.
Change when: automated docs generation exists and is kept current.

2026-07-09 - Keep backend business logic in repositories/services
Context: Item prices, gold data, OAuth, and recommendations already route through backend modules.
Keep: Controllers validate and delegate; repositories/services own data and business rules.
Change when: a specific frontend-only interaction does not require backend data.

2026-07-09 - In-memory cache is acceptable for current market data flows
Context: Metadata, prices, gold, and recommendations already use `TTLCache` or local maps.
Keep: Use existing cache primitives before adding Redis-backed behavior.
Change when: multiple backend instances need shared cache consistency or restart persistence.

2026-07-09 - Production behavior is gated by NODE_ENV via `configs/runtime.ts`
Context: Cookies were `secure:false`, JWT had a hardcoded dev fallback, and auth CORS used `origin:true` (any origin + credentials). NODE_ENV=production is set in render.yaml and prod compose.
Keep: Read `isProduction`, `allowedOrigins`, and `getJwtSecret()` from `server/src/configs/runtime.ts`. Cookies are `secure` in prod; `getJwtSecret()` refuses the dev fallback in prod; CORS uses an allowlist (override with `CORS_ORIGINS`). `validateEnv()` runs first in `index.ts` and requires GOOGLE_* + a real JWT secret in prod.
Change when: a reverse proxy terminates TLS and forwards http internally (revisit `secure`/HSTS), or a new trusted frontend origin is added (extend `CORS_ORIGINS`).

2026-07-09 - Validate item ids and city filters at the API boundary
Context: `id` was interpolated into external price/render URLs without format checks; city filters and batch size were unbounded.
Keep: Use `assertValidItemId`, `validateCities`, and `MAX_BATCH_IDS` from `server/src/service/validation.ts` in controllers. Upstream fetches carry a 10s `AbortSignal.timeout`. Unexpected 500s are logged server-side and return a generic message (`middleware/errorHandler.ts`).
Change when: Albion changes item-id charset, adds/removes markets, or the batch endpoint needs a different cap.
