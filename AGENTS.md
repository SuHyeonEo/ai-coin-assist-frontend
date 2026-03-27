# AI Coin Assist Frontend - AGENTS.md

## Project Identity
This repository is the frontend for AI Coin Assist.

Service architecture:
- `C:\Users\tngus\batch`: produces analysis facts, report payloads, and narrative data
- `C:\Users\tngus\api`: assembles frontend-facing DTOs from persisted batch outputs
- `C:\Users\tngus\ai-coin-assist-frontend`: renders report reading UX from API responses

This product is not an exchange UI and not an auto-trading UI.
It is a reading-focused market interpretation product.

## Frontend Mission
The frontend exists to present analysis reports clearly and calmly.

Priorities:
- report reading UX first
- summary-to-detail information flow
- mobile and desktop readability
- dark/light mode support
- stable consumption of API DTOs

The frontend should help users:
- scan asset summaries
- open a report quickly
- read the latest conclusion and supporting context
- inspect levels, scenarios, and reference news without cognitive overload

## Core Truth Source Rule
The API server response is the frontend truth source.

The frontend must not:
- recompute analysis numbers
- derive new signals from raw values
- reinterpret indicator meaning with custom logic
- rebuild server-side comparison facts on the client
- merge batch payload structure directly into UI assumptions

If the UI needs a value, label, grouping, or derived statement that is not already in the API DTO, request a DTO change from the API server instead of computing it in the frontend.

## Current Frontend Stack
Current repository state:
- Next.js App Router
- TypeScript
- React 19
- Tailwind CSS v4
- ESLint
- `npm` scripts: `npm run dev`, `npm run build`, `npm run lint`

Use App Router conventions by default.

## App Router Principles
- Prefer Server Components by default.
- Use Client Components only for real interactivity, browser-only APIs, or local UI state.
- Keep route segments focused on user-facing pages, not data shaping.
- Put API fetching close to the route boundary or in dedicated server-side data helpers.
- Use loading and error states intentionally for reading flows.
- Avoid pushing report page assembly into large client-side trees.

Recommended route direction as the app grows:
- `app/page.tsx`: entry or dashboard
- `app/assets/[symbol]/page.tsx`: asset summary / landing
- `app/reports/[reportId]/page.tsx`: report detail
- optional query-based latest routes if product UX needs `symbol + reportType`

## Report Reading UX Principle
This product should feel like reading a high-quality research brief, not operating a trading terminal.

Prefer:
- strong headline and summary hierarchy
- generous spacing
- stable section order
- clear timestamp and freshness display
- readable card and section boundaries
- restrained use of accent colors
- high-contrast typography in both themes
- layouts that preserve reading rhythm on mobile

Avoid:
- blinking or highly saturated exchange-style panels
- dense red/green heatmap styling
- chart-first layouts that bury the conclusion
- ticker-wall or cockpit UI patterns
- noisy gradient abuse or speculative "trader" aesthetics

## Theme Principle
Dark mode and light mode are both required.

Rules:
- design both themes deliberately
- do not treat one theme as a fallback
- keep semantic color tokens centralized
- verify contrast and readability for long-form text
- use color to support hierarchy, not to simulate market urgency

Current code already uses CSS variables in `app/globals.css`. Continue that approach or replace it with a consistent theme system, but preserve support for both modes.

## API Consumption Principle
Frontend code should consume frontend-ready DTOs, not raw persistence semantics.

Current API repository reference:
- `C:\Users\tngus\api\src\main\java\com\aicoinassist\api\domain\report`
- `C:\Users\tngus\api\src\main\java\com\aicoinassist\api\domain\asset`

Current read endpoints confirmed from the API server:
- `GET /api/reports/latest/summary?symbol=BTCUSDT&reportType=SHORT_TERM`
- `GET /api/reports/latest/detail?symbol=BTCUSDT&reportType=SHORT_TERM`
- `GET /api/reports/{reportId}`
- `GET /api/reports/history?symbol=BTCUSDT&reportType=SHORT_TERM&limit=20`
- `GET /api/assets`
- `GET /api/assets/summaries`
- `GET /api/assets/{symbol}/summary`
- `GET /api/health`

Current local CORS defaults in the API server allow:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

## DTO Shape To Trust
The frontend should align its view model to the current API DTO surface, not to batch payload internals.

### Report summary
`ReportSummaryResponse` contains:
- `meta`
- `header`
- `snapshot`
- `sourceMeta`

Use it for:
- list pages
- hero summary blocks
- lightweight latest report previews

### Report detail
`ReportDetailResponse` contains:
- `meta`
- `header`
- `page`

`page` currently contains:
- `snapshot`
- `executiveConclusion`
- `domains`
- `levels`
- `crossSignalIntegration`
- `scenarios`
- `referenceNews`
- `sourceMeta`

This is the primary DTO for report reading pages.

### Report history
`ReportHistoryResponse` contains:
- `symbol`
- `reportType`
- `limit`
- `items`

Use it for:
- report timeline
- previous reports list
- symbol/report-type archives

### Asset summary
`AssetSummaryCardResponse` contains:
- symbol identity
- latest price and daily change
- trend / volatility / tone / outlook / headline
- latest analysis timestamps
- per-report-type status list

Use it for:
- dashboard
- asset cards
- quick navigation

## What The API Already Hides For The Frontend
Based on `C:\Users\tngus\api\src\main\java\com\aicoinassist\api\domain\report\service\ReportReadService.java`, the API server already:
- reads persisted report payload JSON
- reads narrative output JSON
- maps them into page-friendly DTOs
- hides raw payload structure from the frontend
- provides empty lists or nullable sections when data is absent

This means the frontend should render the DTO it gets, not reach behind it and model batch JSON directly.

## Batch Server Reference
Batch repository reference:
- `C:\Users\tngus\batch`
- `C:\Users\tngus\batch\docs\report-payload-spec.md`
- `C:\Users\tngus\batch\src\main\java\com\aicoinassist\batch\domain\report`

Important batch-side reality:
- batch owns fact production
- batch owns indicator calculation
- batch owns comparison logic
- batch owns scenario input structure
- GPT is used for interpretation, not as the primary calculation engine

The frontend must not recreate any of that responsibility.

## Component Structure Principle
As this frontend grows, organize code by feature and rendering responsibility.

Preferred direction:
- `app/`: routes, layouts, loading, error boundaries
- `components/ui/`: reusable presentational primitives
- `components/report/`: report-specific sections
- `components/asset/`: asset summary and navigation UI
- `lib/api/`: fetchers and DTO typing
- `lib/format/`: pure formatting helpers only
- `lib/theme/`: theme tokens or theme helpers
- `types/`: shared frontend DTO types when needed

Rules:
- keep API fetch logic out of low-level presentational components
- keep formatting helpers separate from domain interpretation
- keep section components small and map them to DTO sections
- prefer composition over one giant report page component
- avoid introducing client state where server rendering is sufficient

Recommended report page section decomposition:
- report hero
- report meta bar
- snapshot KPI section
- executive conclusion
- domain analyses
- support/resistance levels
- cross-signal integration
- scenarios
- reference news
- report source/freshness meta

## Formatting Vs Interpretation
Frontend formatting is allowed.

Allowed examples:
- date/time formatting
- number formatting
- percentage display formatting
- empty-state wording
- section ordering
- visual emphasis

Not allowed:
- recalculating `dailyPriceChangeRate`
- deriving a new trend label from price movement
- re-ranking scenarios by custom client logic
- converting raw lists into a new hidden semantic model
- replacing server-provided tone/outlook with client-generated language

## Nullability And Missing Data
Some API sections may be absent, empty, or partially null.

Frontend rules:
- treat optional sections as optional
- omit empty sections cleanly
- do not crash on missing narrative fields
- distinguish "no data" from loading state
- keep layout stable when one section is unavailable

Absence of a narrative section is not a frontend bug if the API contract allows omission.

## What The Frontend Should Request From The API Server
When a new page or UX need appears, request DTO additions that are page-oriented and stable.

Ask the API server for:
- display-ready grouped sections, not raw DB field dumps
- explicit labels and enums when semantics matter
- timestamps with clear business meaning
- optional section omission rules
- stable per-card and per-page DTOs
- list endpoints that match navigation use cases
- summary DTOs separate from detail DTOs

Prefer API additions like:
- report hero summary fields
- section visibility flags only when omission alone is ambiguous
- asset list ordering metadata if product ordering becomes important
- explicit freshness metadata if users need staleness warnings
- dedicated DTOs for dashboard, detail, and history instead of one overloaded response

Avoid asking the API server for:
- raw batch payload passthrough
- internal table-shaped responses
- mixed persistence/debug payloads in normal user endpoints
- "frontend can calculate it" style gaps for important display logic

## What The Frontend Must Never Do
- never calculate RSI, MACD, ATR, Bollinger, support, resistance, or scenario logic
- never infer bullish/bearish/neutral conclusions from raw numbers on the client
- never expose batch internal JSON as if it were a public frontend contract
- never couple UI structure directly to undocumented batch payload fields
- never hardcode symbol assumptions beyond API-provided supported assets
- never use exchange-style urgency patterns as the default product tone
- never let charts dominate the page before the written conclusion
- never treat missing narrative as permission to invent replacement analysis text

## Visual Product Direction
This UI should be calm, editorial, and analytical.

Design keywords:
- research brief
- decision support
- structured narrative
- high signal density without clutter

Not acceptable as default direction:
- neon trading terminal
- gamified gain/loss dashboard
- aggressive red/green market theater

## Working Agreement For Future Agent Tasks
When starting work in this repository:
1. Inspect the current route tree and existing components first.
2. Confirm whether the needed data already exists in the API DTOs.
3. If yes, consume the DTO directly.
4. If no, inspect `C:\Users\tngus\api` before inventing frontend-side derivation.
5. If the API also lacks the needed semantic field, request or implement a backend DTO addition.
6. Keep the frontend focused on rendering, formatting, accessibility, and interaction polish.

## Verification Baseline
Before finishing meaningful frontend work, run:
- `npm run lint`
- `npm run build`

If visual work is substantial, also verify:
- desktop light mode
- desktop dark mode
- mobile light mode
- mobile dark mode

## Current Repository Reality
This frontend repository is currently close to the default Next.js starter.

That means future work should establish:
- real route structure
- API client layer
- report-first page architecture
- theme tokens that suit this product
- reusable reading-oriented section components

Build those foundations in a way that follows the server contracts above.
