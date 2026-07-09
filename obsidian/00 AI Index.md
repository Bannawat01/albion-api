# AI Index

Use this as the first Obsidian file for AI work on this repo.

## Read Order

1. `CLAUDE.md` - mandatory agent rules.
2. `obsidian/00 AI Index.md` - this navigation file.
3. `obsidian/01 AI Workflow.md` - how to use memory with low token cost.
4. `obsidian/Project Second Brain.md` - detailed architecture only for touched areas.
5. `obsidian/02 Task Card Template.md` - copy for non-trivial tasks.
6. `obsidian/03 Decision Log.md` - check before changing architecture.
7. `obsidian/04 Glossary.md` - project terms and aliases.

## Fast Context Map

| Task type | Read these sections/files |
| --- | --- |
| Item search or prices | `Project Second Brain.md` -> `itemController`, `ItemRepository`, `ItemSearch`, `client/api/item.ts` |
| Gold chart/data | `goldController`, `GoldRepository`, `GoldLineChart`, `itemApi.getGoldPrice()` |
| Auth/OAuth | `authcontroller`, `oauthService`, `authRepository`, `AuthContext`, `middleware.ts` |
| Recommendation logic | `recommendationController`, `priceAdvisoryService`, `ItemRepository.fetchItemPrice()` |
| API errors | `middleware/errorHandler.ts`, `customError.ts`, `client/lib/errorMessage.ts` |
| Caching/performance | `TTLCache`, `ItemRepository`, `GoldRepository`, `recommendationController`, `performanceMonitor` |
| UI page work | target page/component, `client/app/globals.css`, matching API hook |
| Deployment | `docker-compose*.yml`, `Dockerfile*`, `render.yaml`, `vercel.json`, deployment docs |

## Agent Memory Protocol

- Start each task by naming the touched area, files to read, and expected verification.
- Read the detailed second brain only for the touched area.
- After changing code, update the smallest matching note.
- Add a `03 Decision Log.md` entry only for architecture choices that should survive future sessions.
- Add a `02 Task Card Template.md` copy only for tasks spanning more than one feature area or more than one turn.

## Update Rules

- Facts live in `Project Second Brain.md`.
- Process lives in `01 AI Workflow.md`.
- Decisions live in `03 Decision Log.md`.
- Terms live in `04 Glossary.md`.
- Temporary task state lives in a copied task card, not in the main second brain.

## Current High-Risk Areas

- Auth token naming mismatch: `auth-token` vs `auth_token`.
- Server price row fields differ from the client `Price` type.
- `useCreateItem()` references a missing backend route.
- README has encoding corruption; source files are more reliable.
- Redis is installed but not the main cache implementation.
