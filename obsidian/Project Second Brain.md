# Albion API Project Second Brain

Purpose: keep high-signal project context for AI agents and developers. Update this file whenever behavior, routes, data flow, dependencies, or architectural direction changes.

## Project Summary

Albion API is a full-stack TypeScript project for Albion Online market lookup, gold charts, Google OAuth login, and market recommendations.

- Frontend: Next.js App Router in `client/`.
- Backend: Bun + Elysia API in `server/`.
- Database: MongoDB for users and OAuth state.
- External market data: Albion Online Data Project and `ao-data/ao-bin-dumps`.
- Deployment files: Docker, Render, Vercel, Nginx, SSL helper scripts.

## Tech Stack

### Client

Source: `client/package.json`.

- Next.js `15.4.4`: app router frontend.
- React `19.1.0`: UI runtime.
- TypeScript `^5`: type safety.
- Tailwind CSS `^4`: styling via `client/app/globals.css`.
- Axios `^1.11.0`: browser API client in `client/api/config.ts`.
- TanStack React Query `^5.85.3`: fetch/cache hooks in `client/api/item.ts` and `client/hooks/QueryProvider.tsx`.
- Zustand `^5.0.7`: local item-search store in `client/stores/itemSearchStore.ts`.
- Chart.js + `react-chartjs-2`: gold price line chart.
- Radix Select + local `components/ui/*`: base UI primitives.
- Lucide React: icon library.

### Server

Source: `server/package.json`.

- Bun: runtime and dev watcher.
- Elysia `^1.3.8`: HTTP API framework.
- `@elysiajs/cors`: CORS middleware.
- `@elysiajs/jwt`: JWT signing and verification for auth routes.
- `@elysiajs/swagger`: installed, not visible in current `src/index.ts` flow.
- MongoDB native driver + Mongoose: native driver feeds repositories, Mongoose tracks connection state.
- Redis package: installed; current visible API mostly uses in-process `TTLCache`.
- bcrypt/jsonwebtoken/validator: installed; current OAuth flow mainly uses Elysia JWT and native crypto.

### External Services

- `https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json`: item metadata.
- `https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/world.json`: location metadata.
- `https://albion-online-data.com/api/v2/stats/prices/{itemId}`: item market prices.
- `https://east.albion-online-data.com/api/v2/stats/gold.json?count={count}`: gold history.
- `https://render.albiononline.com/v1/item/{itemId}.png`: item images.
- Google OAuth endpoints from `server/src/configs/Oauth.ts`.

## Runtime Flow

1. `server/src/index.ts` connects MongoDB through `connectToDatabase.connect()`.
2. It initializes indexes through `DatabaseManager.getInstance().initializeIndexes()`.
3. It builds an Elysia app with `errorHandler`, `requestLogger`, `securityHeaders`, CORS, controllers, health, and metrics routes.
4. Client pages call `client/api/item.ts` hooks or `AuthContext`.
5. `client/api/config.ts` adds base URL, `/api` prefix, JSON headers, auth token, and normalized error handling.
6. Server controllers validate request shape, call repositories/services, and return JSON or proxied image responses.
7. Repositories call external Albion APIs, map raw data, cache it, and report errors through custom error types.

## Backend Modules

### `server/src/index.ts`

- `connectToDatabase.connect()`: opens MongoDB before routes are served.
  - From: local config module.
  - Connects to: `server/src/configs/database.ts`.
- `DatabaseManager.getInstance().initializeIndexes()`: creates configured database indexes.
  - From: local singleton.
  - Connects to: `server/src/configs/databaseManager.ts`, `server/src/configs/indexs.ts`.
- Elysia app chain:
  - `.onError(errorHandler)`: centralized error response shaping.
  - `.use(requestLogger())`: request logging and performance monitoring.
  - `.use(securityHeaders())`: response security headers.
  - `.use(cors(...))`: allows local and production frontend origins.
  - `.use(itemController)`, `.use(goldController)`, `.use(OauthController)`, `.use(recommendationController)`: feature routes.
- Health/metrics routes:
  - `/health/database` -> `DatabaseManager.healthCheck()`.
  - `/health/performance` -> `performanceMonitor.getSystemHealth()`.
  - `/metrics/endpoints` -> `performanceMonitor.getEndpointStats()`.
  - `/metrics/connections` -> `connectToDatabase.getConnectionStats()`.

### `server/src/controller/itemController.ts`

Base prefix: `/api`. Main dependency: `ItemRepository.getInstance()`.

- `GET /items`
  - Use: returns all item IDs with English names.
  - From: `ItemRepository.fetchMetadata()`.
  - Connects to: metadata cache and `ao-bin-dumps` item JSON.
- `GET /item/:id`
  - Use: returns one item summary and locations.
  - From: metadata lookup.
  - Connects to: `BadRequestError` when item is unknown.
- `GET /item?id=...`
  - Use: alternate item detail route with full raw item data.
  - From: metadata lookup.
  - Connects to: `NotFoundError`, `BadRequestError`.
- `GET /item/price?id=...&city=...`
  - Use: returns price rows for an item, optionally filtered by city.
  - From: `fetchItemPrice()` or `fetchItemPriceAndLocation()`.
  - Connects to: `filterPriceService.mapPriceData()`, price cache.
- `GET /cache/stats`
  - Use: exposes repository cache sizes and hit rates.
  - From: `ItemRepository.getCacheStats()`.
- `DELETE /cache/clear`
  - Use: clears metadata and price caches.
  - From: `ItemRepository.clearMetadataCache()`.
- `GET /items/paginated`
  - Use: paginated item list, optional search.
  - From: `ItemRepository.fetchItemsPaginated()`.
  - Connects to: `PaginationService.validateParams()` and `createResponse()`.
- `GET /item/:id/prices/paginated`
  - Use: paginated price rows for one item.
  - From: `ItemRepository.fetchItemPricesPaginated()`.
- `GET /items/popular/paginated`
  - Use: returns popular items by in-memory request counters.
  - From: `ItemRepository.fetchPopularItemsPaginated()`.
- `GET /item/:id/image`
  - Use: proxies Albion item PNG.
  - From: `HttpClient.get()`.
  - Connects to: Albion render service.
- `POST /items/prices/batch`
  - Use: batch price lookup for multiple item IDs, optional city.
  - From: `ItemRepository.fetchItemsPricesBatch()`.
  - Connects to: metadata validation and individual price fetchers.

### `server/src/repository/itemRepository.ts`

Pattern: singleton repository with in-memory TTL caches and external API calls.

- `getInstance()`
  - Use: shared repository instance.
  - Called by: item controller, price advisory service.
- `constructor()`
  - Use: starts metadata preloading.
  - Calls: `initializePreloading()`.
- `initializePreloading()` / `preloadMetadata()`
  - Use: warm metadata cache at startup.
  - Calls: `fetchMetadata()`.
- `fetchMetadata()`
  - Use: fetches item and world metadata, builds `items`, `locations`, `itemsData`.
  - From: GitHub `ao-data/ao-bin-dumps`.
  - Connects to: search index (`lowercaseIndex`, `prefixMap`), metadata TTL cache.
- `fetchItemPrice(itemId)`
  - Use: all-city price lookup for one item.
  - From: Albion Online Data price API.
  - Connects to: `fetchMetadata()`, `mapPriceData()`, price TTL cache.
- `fetchItemPriceAndLocation(itemId, city)`
  - Use: city-filtered price lookup.
  - From: Albion Online Data price API with `locations` query.
  - Connects to: metadata lookup, `mapPriceData()`, price TTL cache.
- `fetchItemsPricesBatch(itemIds, city?)`
  - Use: concurrent batch lookup with concurrency fixed at 4.
  - Calls: `fetchItemPrice()` or `fetchItemPriceAndLocation()`.
  - Notes: failures per item become empty arrays.
- `fetchItemsPaginated(query, searchTerm?)`
  - Use: item search and pagination.
  - From: metadata cache.
  - Connects to: `PaginationService.validateParams()`, `createResponse()`, prefix map for short queries, full lowercase scan for longer queries.
- `fetchItemPricesPaginated(itemId, query)`
  - Use: paginates price rows.
  - Calls: `fetchItemPrice()`, `PaginationService`.
- `fetchPopularItemsPaginated(query)`
  - Use: paginates in-memory popularity counters.
  - From: `popularItems` map.
  - Connects to: `fetchMetadata()` for item names.
- `clearMetadataCache()`
  - Use: clears metadata and price cache.
- `getCacheStats()`
  - Use: cache visibility for `/api/cache/stats`.

### `server/src/service/filterPriceService.ts`

- `mapAllData(data, itemInfo, itemId)`
  - Use: raw API row mapper without filtering zero-price rows.
  - From: Albion API snake_case fields.
  - Connects to: `Price` interface.
- `mapPriceData(data, itemInfo, itemId)`
  - Use: filters rows where every buy/sell price is zero, maps names and price fields.
  - Called by: `ItemRepository.fetchItemPrice()` and `fetchItemPriceAndLocation()`.

### `server/src/service/timeToLive.ts`

- `TTLCache<T>`
  - Use: small in-process cache wrapper.
  - Methods: `set`, `get`, `delete`, `has`, `clear`, `cleanup`, `size`, `entries`.
  - Called by: `ItemRepository`, `GoldRepository`.
  - Limitation: memory-local only; cache is lost on restart and not shared across replicas.
- `TTL_CONSTANTS`
  - Use: shared TTL values from 1 minute to 1 day.
- `globalTTLCache`
  - Use: exported generic cache; not a major visible flow in current code.

### `server/src/controller/goldController.ts`

Base prefix: `/api`.

- `GET /gold?count=...`
  - Use: gold price history.
  - From: `GoldRepository.fetchGoldPrices({ count })`.
  - Connects to: client `itemApi.getGoldPrice()` and `client/app/gold/*`.
  - Cache headers: `public, max-age=300`.

### `server/src/repository/goldRepository.ts`

- `constructor()`
  - Use: creates `HttpClient`, preloads count values 2, 10, 20.
- `preloadPopularData()`
  - Use: warms common gold requests; ignores preload errors.
- `fetchGoldPrices(options)`
  - Use: fetches gold data from Albion east endpoint.
  - Connects to: `HttpClient.get()`, `TTLCache`, `TTL_CONSTANTS.FIVE_MINUTES`.
- `getCacheStats()` / `clearCache()`
  - Use: introspection and manual cache reset.

### `server/src/service/httpClient.ts`

- `HttpClient.getInstance()`
  - Use: singleton HTTP wrapper.
- `get(url, options)`
  - Use: fetch with keep-alive agent and gzip/deflate headers.
  - Called by: `GoldRepository`, item image proxy.
- `getStats()`
  - Use: returns agent socket/request stats.
  - Note: uses Node `http.Agent` for both URLs; Bun accepts the `agent` option.

### `server/src/controller/recommendationController.ts`

Base prefix: `/api`.

- Local `marketCache`
  - Use: 5-minute in-memory cache for market snapshots.
  - Key: `markets:{itemId}`.
- `getCached(key)` / `setCached(key, data, ttl)`
  - Use: tiny controller-local cache helpers.
- `GET /items/:id/markets`
  - Use: returns city-level market snapshot.
  - From: `PriceAdvisoryService.getMarketSnapshot(id)`.
  - Query: `fresh` bypasses cache.
- `GET /items/:id/recommendations`
  - Use: returns transport/selling recommendations.
  - Query: `from`, `mode`, `qty`, `weight`, `taxRate`, `limit`, `strategy`, `scenario`.
  - From: cached markets + `PriceAdvisoryService.recommend()`.

### `server/src/service/priceAdvisoryService.ts`

- `distanceFactor(from, to)`
  - Use: transport multiplier; same city class is `1`, cross class is `1.2`.
  - From: local royal city classification.
- `PriceAdvisoryService.getInstance()`
  - Use: singleton advisory service.
- `getMarketSnapshot(itemId)`
  - Use: aggregates price rows into per-city average sell/buy prices, sample size, and latest update.
  - From: `ItemRepository.fetchItemPrice()`.
  - Connects to: recommendation routes.
- `recommend(markets, ctx)`
  - Use: validates context and delegates scoring.
  - Connects to: internal `computeRecommendations()`.
- `computeRecommendations(markets, ctx)`
  - Use: ranks cities by net profit or safety-adjusted score.
  - Inputs: source city, mode, quantity, item weight, tax rate, strategy, scenario.
  - Outputs: gross, tax, transport, risk penalty, net, risk score.
  - Current simplification: fixed city risk table and fixed transport unit.

### `server/src/controller/authcontroller.ts`

- `initializeServices()`
  - Use: ensures database connection and health, creates `DatabaseService`, creates `OAuthService`.
  - Connects to: `connectToDatabase`, `DatabaseManager`, `authRepository`.
- `GET /api/auth/:provider`
  - Use: starts Google OAuth.
  - From: `OAuthService.getAuthorizationUrl('google')`.
  - Returns: OAuth URL and state.
- `GET /auth/google/callback`
  - Use: handles Google callback, creates JWT, sets cookies, redirects to frontend callback page.
  - From: `OAuthService.handleCallback()`.
  - Connects to: Elysia `jwt.sign`, `handleOAuthError()`, frontend `/auth/callback`.
- `GET /api/auth/me`
  - Use: validates bearer token and returns current user.
  - From: `jwt.verify()`, `dbService.findUserByGoogleId()`.
- `POST /api/auth/logout`
  - Use: clears `auth-token` and `logged_in` cookies.

### `server/src/service/oauthService.ts`

- `generateCodeVerifier()`
  - Use: PKCE verifier via Node `crypto.randomBytes`.
- `generateCodeChallenge(verifier)`
  - Use: SHA-256 PKCE challenge.
- `generateState()`
  - Use: random OAuth CSRF state.
- `getAuthorizationUrl('google')`
  - Use: creates unique state, stores verifier in MongoDB, builds Google OAuth URL.
  - Connects to: `DatabaseService.saveOAuthState()`, `OAUTH_CONFIG`.
- `exchangeCodeForToken(code, state)`
  - Use: verifies saved state, deletes it, exchanges code for Google token.
  - Connects to: Google token endpoint.
- `getUserInfo(accessToken)`
  - Use: fetches Google profile, maps `sub` to `id`.
  - Connects to: Google userinfo endpoint.
- `handleCallback(code, state)`
  - Use: deduplicates concurrent callbacks using `pendingRequests`.
  - Calls: `processCallback()`.
- `processCallback(code, state)`
  - Use: token exchange, userinfo fetch, upsert user.
  - Connects to: `DatabaseService.findUserByGoogleId()`, `createUser()`, `updateUser()`.
- `cleanup()`
  - Use: clears in-memory pending OAuth tracking.

### `server/src/repository/authRepository.ts`

- `DatabaseService`
  - Use: native MongoDB data access for `users` and `oauth_states`.
- `setupIndexes()` / `createIndexes()`
  - Use: creates unique indexes on `googleId`, `email`, `state`, and TTL index on `expiresAt`.
- `findUserByGoogleId(googleId)`
  - Use: lookup current user.
- `createUser(userData)`
  - Use: insert OAuth user with timestamps.
- `updateUser(googleId, userData)`
  - Use: update OAuth user profile and `updatedAt`.
- `saveOAuthState(state, codeVerifier, redirectUri)`
  - Use: persist OAuth PKCE state for 10 minutes.
- `getOAuthState(state)`
  - Use: retrieve pending OAuth state.
- `deleteOAuthState(state)`
  - Use: consume OAuth state after callback starts.
- `cleanupExpiredStates()`
  - Use: manual cleanup for old states; TTL index also exists.

### `server/src/configs/database.ts`

- `connectToDatabase.connect()`
  - Use: resolves MongoDB URI, connects Mongoose and native MongoClient, stores `Db`.
  - Source priority: `MONGODB_URI`, username/password, docker local default, localhost fallback.
  - Connects to: server startup and OAuth initialization.
- `getClient()`, `getDb()`, `getItemRepo()`, `isConnected()`
  - Use: shared DB accessors.
- `getConnectionStats()`
  - Use: metrics endpoint.
- `close()`
  - Use: disconnects Mongoose and native client.

### `server/src/configs/databaseManager.ts`

- `getInstance()`
  - Use: singleton manager.
- `initializeIndexes()`
  - Use: creates indexes from `INDEX_DEFINITIONS`.
  - Connects to: `connectToDatabase.getDb()`.
- `healthCheck()`
  - Use: MongoDB `ping` endpoint.

### Middleware

- `errorHandler.ts`
  - Use: maps thrown custom errors into API responses.
- `customError.ts`
  - Use: shared error classes such as `BadRequestError`, `NotFoundError`, `ExternalApiError`, `ConnectionError`.
- `logger.ts`
  - Use: request logging and performance tracking.
- `security.ts`
  - Use: security headers.
- `oauthErrorHandler.ts`
  - Use: maps Google OAuth errors to user-facing route response.

## Frontend Modules

### `client/api/config.ts`

- `API_BASE_URL`
  - Use: backend origin. Defaults to Render backend.
  - Override: `NEXT_PUBLIC_API_BASE_URL`.
- `API_PREFIX`
  - Use: fixed `/api` prefix for backend API routes.
- `axiosInstance`
  - Use: shared Axios client.
  - Request interceptor: reads `localStorage.auth_token` and adds bearer token.
  - Response interceptor: normalizes errors through `handleApiError()`.
- `createApiUrl(endpoint)`
  - Use: builds full API URL without duplicate slashes.

### `client/api/item.ts`

- `itemApi.getItemImageUrl(itemId, quality, size)`
  - Use: direct Albion render image URL.
  - Called by: `ItemSearch`.
- `itemApi.getAllItems()`
  - Calls: `GET /api/items`.
- `itemApi.searchItems(searchTerm, page, limit, signal?)`
  - Calls: `GET /api/items/paginated`.
  - Used by: `useSearchItems()`, `ItemSearch`.
- `itemApi.getItem(itemId)`
  - Calls: `GET /api/item/:id`.
- `itemApi.getItemPrices(itemId, city?, signal?)`
  - Calls: `GET /api/item/price`.
  - Used by: `ItemSearch.fetchCityPrices()`.
- `itemApi.getItemsPricesBatch(ids, city?, signal?)`
  - Calls: `POST /api/items/prices/batch`.
- `itemApi.getGoldPrice()`
  - Calls: `GET /api/gold?count=50`.
- `useItems()`
  - React Query hook for all items.
- `useSearchItems(searchTerm, page, limit)`
  - React Query hook for paginated search.
- `useItem(itemId)`
  - React Query hook for one item.
- `useItemPrices(itemId, city?)`
  - React Query hook for live price data; refetches every 30 seconds.
- `useCreateItem()`
  - Mutation currently calls `PUT /items/:id`; no matching visible backend route in `itemController.ts`.

### `client/components/ItemSearch.tsx`

Main UI for searching items and showing city price chips.

- State:
  - `rawSearch`: input value.
  - `debouncedSearch`: 300ms debounced value from `useDebounce`.
  - `page`: current item page.
  - `selectedCities`: city chip filter.
  - `cityPricesByItem`: rendered price map.
  - `priceCacheRef`: component-local price cache.
- `fetchCityPrices(uniqueName)`
  - Use: fetches price rows for configured cities, falls back to all-city request when city-filter returns empty.
  - From: `itemApi.getItemPrices()`.
  - Connects to: `helpers/helperItem.tsx` functions `isMarketItem`, `rowsFrom`, `n`, `minDef`, `maxDef`.
- `handleSearch(e)`
  - Use: prevents form submit reload and resets to page 1.
- `handlePageChange(p)`
  - Use: validates page, sets page, scrolls to results.
- `toggleCity(city)`, `selectAllCities()`, `clearAllCities()`
  - Use: city filter UI.
- Prefetch effect
  - Use: prefetches next search page through React Query when current page resolves.
- Lazy price loading effect
  - Use: fetches first 5 item prices immediately, remaining items after 150ms.
  - Current simplification: per-component cache, not shared globally.
- `ChipsRow`
  - Use: renders selected city price chips for one price metric.
- `Legend`
  - Use: city filter controls and color legend.

### `client/contexts/AuthContext.tsx`

- `AuthProvider`
  - Use: app-wide auth state.
  - Source: `localStorage.auth-token` bearer token and backend `/api/auth/me`.
- `_doCheck(setLocal)`
  - Use: singleton throttled auth check; avoids repeated calls within 8 seconds.
  - Connects to: backend `GET /api/auth/me`.
- `login(redirect?)`
  - Use: fetches Google OAuth URL from `GET /api/auth/google`, then redirects browser.
- `logout()`
  - Use: calls backend logout, clears `logged_in` cookie and local token.
- `useAuth()`
  - Use: context hook; throws outside provider.
- Cookies:
  - `logged_in` is readable by Next middleware.
  - `auth-token` is set server-side during OAuth callback.

### `client/stores/itemSearchStore.ts`

Zustand store for search state:

- `searchTerm`, `items`, `loading`, `error`, `currentPage`, `totalItems`, `itemsPerPage`.
- `abortController`, `nextPageItems`, `lastQueryKey`.
- Current note: `ItemSearch.tsx` currently uses local React state instead of this store for its main flow.

### `client/app/gold/GoldLineChart.tsx`

- Registers only required Chart.js modules.
- Renders `<Line data={data} options={options} />`.
- Used by gold page to display `itemApi.getGoldPrice()` data.

### Other Frontend Areas

- `client/components/navBar.tsx`: navigation and auth/user UI.
- `client/components/ProtectedRoute.tsx`: authenticated route wrapper.
- `client/app/auth/callback/CallbackClient.tsx`: receives token from OAuth redirect.
- `client/app/api/chatbot/route.ts`: Next API route for chatbot integration.
- `client/middleware.ts`: likely uses `logged_in` cookie to gate protected pages.

## API Route Map

Server routes:

- `GET /`
- `GET /favicon.ico`
- `GET /api/items`
- `GET /api/item/:id`
- `GET /api/item?id=...`
- `GET /api/item/price?id=...&city=...`
- `GET /api/cache/stats`
- `DELETE /api/cache/clear`
- `GET /api/items/paginated?page=...&limit=...&search=...`
- `GET /api/item/:id/prices/paginated`
- `GET /api/items/popular/paginated`
- `GET /api/item/:id/image`
- `POST /api/items/prices/batch`
- `GET /api/gold?count=...`
- `GET /api/auth/google`
- `GET /auth/google/callback`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/items/:id/markets`
- `GET /api/items/:id/recommendations`
- `GET /health/database`
- `GET /health/performance`
- `GET /metrics/endpoints`
- `GET /metrics/connections`

## Data Shapes

### Item Summary

```ts
{
  id: string
  name: string
  uniqueName: string
}
```

### Price Row

Server `Price` rows use names like:

```ts
{
  itemName: string
  item_id: string
  city: string
  quantity: number
  sell_Price_Min: number
  sell_Price_Min_Date: string
  sell_Price_Max: number
  sell_Price_Max_Date: string
  buy_Price_max: number
  buy_Price_Max_Date: string
  buy_Price_Min: number
  buy_Price_Min_Date: string
}
```

Note: `client/api/item.ts` has a `Price` type using camel-ish field names (`itemId`, `sellPriceMin`, etc.) that does not match the server mapper. UI code in `ItemSearch.tsx` reads the server field names.

### Paginated Response

```ts
{
  success: true
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    nextPage: number | null
    previousPage: number | null
  }
  message?: string
}
```

## Current Architecture Decisions

- Keep API business logic in server repositories/services, not client pages.
- Use `ItemRepository` as the source of truth for Albion metadata and prices.
- Keep pagination response format centralized in `PaginationService`.
- Use in-memory caches for metadata/prices/recommendations until multi-instance consistency matters.
- Keep OAuth state in MongoDB; use in-memory `pendingRequests` only for deduplicating concurrent callbacks.
- Prefer existing installed dependencies. Do not add libraries for small helpers.
- Keep docs token-efficient: update this note with facts, links, and flow, not long prose.

## Known Gaps / Watch List

- Some source comments and README text are mojibake/encoding-corrupted Thai. Prefer English for new docs and comments.
- `useCreateItem()` calls `PUT /items/:id`, but no matching backend route is visible.
- `client/stores/itemSearchStore.ts` exists, but `ItemSearch.tsx` mostly uses local state.
- Server and client token key names differ in places: Axios reads `auth_token`, AuthContext reads/removes `auth-token`.
- `Redis` is installed, but current visible cache flow is mostly in-memory.
- Recommendation scoring uses fixed risk and transport constants. Add calibration only when product needs accurate economics.

## How To Update This Note

When an AI agent changes code:

1. Add a short entry under "Change Log".
2. Update the affected module section.
3. Record new routes, env vars, external APIs, or data shapes.
4. If a function is added, include:
   - what it does,
   - where the input comes from,
   - what it calls,
   - who calls it.
5. Keep entries factual and short. Link paths instead of pasting code.

## Change Log

- 2026-07-09: Created initial project second brain from current repo scan. Added tech stack, backend flow, frontend flow, routes, data shapes, and known gaps.

## AI Memory System

Start AI work from `obsidian/00 AI Index.md`, not this long note. This file is the detailed architecture map; source code remains the source of truth.

- `00 AI Index.md`: route map for which notes/code to read.
- `01 AI Workflow.md`: token-efficient AI workflow and reusable prompts.
- `02 Task Card Template.md`: copy into `obsidian/tasks/` for non-trivial or multi-session tasks.
- `03 Decision Log.md`: durable architecture decisions.
- `04 Glossary.md`: shared project terms and aliases.

## Change Log Addendum

- 2026-07-09: Added AI memory system notes: index, workflow, task card template, decision log, glossary, and updated `CLAUDE.md` to start from the Obsidian index.
- 2026-07-09: Backend hardening + resilience pass. New `server/src/configs/runtime.ts` (`isProduction`, `allowedOrigins`, `getJwtSecret`) and `server/src/service/validation.ts` (`assertValidItemId`, `validateCities`, `MAX_BATCH_IDS`) + `validation.test.ts` (8 passing bun tests). `itemController.ts` now validates item ids on `/item/:id`, `/item`, `/item/price`, `/item/:id/prices/paginated`, `/item/:id/image` (also clamps render quality/size + encodes id), validates city filters, and caps batch size at 100. `itemRepository.ts` upstream fetches (metadata + prices) get 10s timeouts and metadata `response.ok` checks; batch fanout is also capped. `httpClient.get` gains a default 10s `AbortSignal.timeout`. `errorHandler.ts` no longer leaks internal messages on 500 (logs server-side, generic message) and fixes the unreachable `ConnectionError`/503 branch. Auth (`authcontroller.ts`): CORS now uses the shared allowlist instead of `origin:true`, cookies are `secure` in production, JWT secret via `getJwtSecret()`. `oauthService.ts` no longer logs PII/token bodies. `env.ts` `validateEnv()` is now called at startup (`index.ts`) and is production-aware. Verified: `bunx tsc --noEmit` clean, `bun test` 8/8 pass.
- 2026-07-09: Frontend UI modernization pass (dark fantasy market theme). Replaced generic cyan/purple/pink/blue SaaS gradients with a cohesive charcoal/steel + muted-gold palette (emerald/crimson accents) driven by theme tokens in `client/app/globals.css` (`--primary` now muted gold; added `--gold/--emerald/--crimson/--steel` vars, `.text-gold`/`.text-gold-gradient` utils, restyled `.glass-card` and `.animated-bg`). Simplified `client/app/page.tsx` hero (removed feature grid + long "How to Use" guide, gold-gradient heading, icon chips). Restyled `client/components/navBar.tsx` (gold-accented Gold Market, emerald AI Tool, muted About/Donate), `client/components/UserProfile.tsx` login button, `client/components/ItemSearch.tsx` (legend, spinner, item cards, empty/error states use tokens), and `client/components/pagination/PaginationControls.tsx` (gold active page). Footer polish in `client/app/layout.tsx`. `client/components/ui/card.tsx` intentionally left unchanged. Verified with `tsc --noEmit` (clean).
