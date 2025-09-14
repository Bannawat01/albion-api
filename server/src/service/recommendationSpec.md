## Recommendation Service Specification

Purpose: Provide a consistent backend service to recommend the best city to sell an Albion Online item based on price, safety and transport considerations. This spec guides the implementation in `priceAdvisoryService.ts`.

### Core Concepts

1. Market Snapshot: A merged view of current sell/buy prices of an item across major cities.
2. Recommendation Modes:
   - `profit`: maximize net profit only.
   - `safe`: prioritize low-risk (royal) cities; risk penalty applied strongly.
   - `balanced`: weighted blend of profit and safety.
3. Risk & Transport Modeling: Lightweight heuristic (no full path graph) to keep latency low and avoid external dependencies.

### Target Endpoints (to be added later)

1. `GET /api/items/:id/markets`
   - Aggregates raw price data for the item across supported cities.
   - Query params: `cities?` (comma separated override), `fresh?=true` bypass cache.
2. `GET /api/items/:id/recommendations`
   - Query params:
     - `from` (current city; required)
     - `mode` = `profit|safe|balanced` (default `profit`)
     - `qty` (integer; default 1)
     - `weight` (float per item; optional; default 1)
     - `taxRate` (decimal; default 0.065)
     - `limit` (top N; default 5)

### Data Structures (TypeScript Interfaces)

```ts
export interface CityMarketStat {
  city: string
  sellPrice: number // chosen representative sell price (e.g. minSell or median)
  buyPrice: number  // representative buy order price (optional usage later)
  sampleSize: number // number of records considered
  lastUpdated: string // ISO timestamp
}

export interface TransportContext {
  fromCity: string
  itemWeight: number
  quantity: number
  taxRate: number
  mode: 'profit' | 'safe' | 'balanced'
  limit?: number
}

export interface CityRecommendation {
  city: string
  gross: number
  tax: number
  transport: number
  riskPenalty: number
  net: number
  riskScore: number
  score?: number // composite score for balanced mode
}
```

### Constants

```ts
export const ROYAL_CITIES = ['Bridgewatch','Martlock','Lymhurst','Fort Sterling','Thetford'] as const

export const RISK_SCORE: Record<string, number> = {
  Bridgewatch: 0.1,
  Martlock: 0.1,
  Lymhurst: 0.1,
  'Fort Sterling': 0.1,
  Thetford: 0.1,
  Caerleon: 0.35,
  'Black Market': 0.55
}

// Compact distance categories: originType:destType mapping
export const DISTANCE_FACTOR: Record<string, number> = {
  'royal:royal': 1,
  'royal:Caerleon': 1.4,
  'royal:Black Market': 1.8,
  'Caerleon:Black Market': 1.2
}
```

### Helper Functions

```ts
function classify(city: string): string {
  return ROYAL_CITIES.includes(city) ? 'royal' : city
}

export function distanceFactor(from: string, to: string): number {
  if (from === to) return 0.3 // same city minimal movement
  const key = `${classify(from)}:${classify(to)}`
  return DISTANCE_FACTOR[key] ?? 1.6 // default fallback
}
```

### Formulas

Given:
```
gross = sellPrice * quantity
tax   = gross * taxRate
transport = baseTransportUnit * distanceFactor(from, city) * quantity * itemWeight
riskPenalty = (mode in ['safe','balanced']) ? gross * (riskScore * riskPenaltyWeight) : 0
net = gross - tax - transport - riskPenalty
```

Initial Tunable Parameters:
```
baseTransportUnit = 50           // approximate cost per unit weight per distance category
riskPenaltyWeight = 0.15         // 15% scaling of riskScore impact on gross
balancedProfitWeight = 0.6
balancedSafetyWeight = 0.4
```

Balanced Score:
```
score = balancedProfitWeight * (net / maxNet) + balancedSafetyWeight * (1 - riskScore)
```

### Algorithm (recommendation pipeline)

1. Acquire market snapshot (array of `CityMarketStat`). Missing cities may be skipped.
2. Normalize / sanitize prices (ignore zero or null sellPrice entries).
3. Map to recommendations via formulas.
4. Filter for `safe` mode → keep only ROYAL_CITIES.
5. For `balanced` compute composite score.
6. Sort:
   - profit: by `net` desc
   - safe: by `net` desc (after filter)
   - balanced: by `score` desc
7. Slice top N (`limit`).
8. Return structure with metadata (mode, generatedAt, itemId).

### Output Shape Example

```json
{
  "itemId": "T4_BAG",
  "mode": "balanced",
  "fromCity": "Martlock",
  "params": { "qty": 10, "weight": 2.5, "taxRate": 0.065 },
  "generatedAt": "2025-09-14T10:15:00Z",
  "recommendations": [
    { "city": "Bridgewatch", "gross": 125000, "tax": 8125, "transport": 375, "riskPenalty": 1875, "net": 114625, "riskScore": 0.1, "score": 0.92 },
    { "city": "Lymhurst",   "gross": 124500, "tax": 8092, "transport": 410, "riskPenalty": 1867, "net": 114131, "riskScore": 0.1, "score": 0.918 }
  ]
}
```

### Caching Strategy

| Layer | Key | TTL | Notes |
|-------|-----|-----|------|
| Market snapshot | `markets:${itemId}` | 300s | Combines all city price calls; reuse across requests |
| Recommendation | `reco:${itemId}:${from}:${mode}:${qty}:${weight}:${tax}` | 60s | Fast repeated chatbot questions |

### Error Handling

| Case | Handling |
|------|----------|
| No price data for item | Return 404 from endpoint with message "NO_MARKET_DATA" |
| fromCity unknown | 400 with list of supported cities |
| All computed net <= 0 | Still return sorted list; client may decide to show warning |

### Validation Rules

| Field | Rule |
|-------|------|
| qty | integer 1..10000 (reject otherwise) |
| weight | 0 < weight <= 500 (default 1) |
| taxRate | 0 <= taxRate <= 0.5 |
| mode | Enum: profit/safe/balanced |

### Security Considerations

No sensitive operations; ensure no arbitrary remote fetch (prices sourced from existing repository logic). Rate limit recommendation endpoint if public.

### Next Steps (Implementation Checklist)

1. Implement `priceAdvisoryService.ts` with constants, distanceFactor, recommendCities.
2. Integrate with existing `ItemRepository` to reuse price fetch logic — add batch city fetch helper.
3. Add controller endpoints.
4. Add lightweight unit tests (formula sanity & sorting correctness).
5. Document in README.
