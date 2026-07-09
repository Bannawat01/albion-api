# CLAUDE.md

## Mission

Build this repo as a practical Albion Online market tool. Keep changes small, typed, and easy to verify. Prefer fixing the shared root cause over patching one caller.

## Project Shape

- `client/`: Next.js 15, React 19, TypeScript, Tailwind, React Query, Axios, Zustand.
- `server/`: Bun, Elysia, TypeScript, MongoDB, Mongoose/native driver, Google OAuth, in-memory TTL caches.
- Main project memory starts at `obsidian/00 AI Index.md`.

## Operating Rules

- Before changing behavior, read the files in the actual request path and their direct callers.
- Use existing helpers first: `ItemRepository`, `PaginationService`, `TTLCache`, `HttpClient`, `axiosInstance`, `itemApi`, `AuthContext`.
- Do not add dependencies unless an installed dependency or standard API cannot reasonably do it.
- Keep API response shapes stable unless the user asks for a breaking change.
- Do not move logic into the client if it belongs in backend repositories/services.
- Keep comments and docs in English.
- Avoid broad refactors while fixing one behavior.

## Token-Efficient Workflow

1. Read `obsidian/00 AI Index.md`.
2. Start source discovery with `rg --files -g '!node_modules' -g '!.next'`.
3. Read only the route/component/service touched by the request plus direct callers.
4. Summarize decisions in file paths and function names, not pasted code.
5. Use one focused test/check when logic is non-trivial.
6. Report only changed files and verification result.

## Documentation Requirement

Whenever you add, remove, or change behavior, update the Obsidian memory in the same turn.

Add the update to the smallest relevant section:

- Start at `obsidian/00 AI Index.md` to pick the right note.
- New route: update "API Route Map" and the controller section.
- New function: document what it does, where input comes from, what it calls, and who calls it.
- New dependency or tool: update "Tech Stack".
- New env var or external service: update "External Services" or runtime notes.
- Bug fix: add a one-line "Change Log" entry with date and affected files.
- Architecture decision: add an entry to `obsidian/03 Decision Log.md`.
- Multi-session/non-trivial task: copy `obsidian/02 Task Card Template.md` into `obsidian/tasks/`.

Keep the Obsidian update concise. Do not paste full implementations.

## Architecture Direction

- Backend controllers should stay thin: validate request, call service/repository, return response.
- Repositories own data access and external Albion API calls.
- Services own reusable business logic such as pagination, OAuth, recommendations, and mapping.
- Client API access should go through `client/api/config.ts` and `client/api/item.ts`.
- Client UI should consume React Query hooks or existing context before adding new state stores.
- In-memory cache is acceptable for metadata, prices, and recommendations until multi-instance consistency is required.

## Known Cautions

- Do not trust README examples blindly; some text is encoding-corrupted and may be stale.
- `useCreateItem()` appears to call a backend route that does not exist.
- Server price row fields and client `Price` type are not fully aligned.
- Auth token storage names are inconsistent: check both `auth-token` and `auth_token` before changing auth.
- Redis is installed but not the active cache path in the visible code.
