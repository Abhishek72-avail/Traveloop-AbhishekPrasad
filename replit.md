# Traveloop

AI-powered enterprise travel planning platform — plan trips, build itineraries, track budgets, manage packing lists, and share journeys.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/traveloop run dev` — run the React frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui (Odoo enterprise aesthetic, teal/indigo theme)
- API: Express 5 with JWT auth (stored in localStorage as `traveloop_token`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all routes)
- `lib/api-client-react/src/generated/` — auto-generated React Query hooks and schemas (do not edit)
- `lib/db/src/schema/` — Drizzle ORM table definitions
- `artifacts/api-server/src/routes/` — Express route handlers (auth, trips, cities, activities, stops, checklist, notes, analytics)
- `artifacts/api-server/src/lib/auth-middleware.ts` — JWT requireAuth / optionalAuth middleware
- `artifacts/traveloop/src/pages/` — All 16 frontend pages
- `artifacts/traveloop/src/components/layout/app-layout.tsx` — Sidebar navigation

## Architecture decisions

- **OpenAPI-first**: All API contracts defined in `openapi.yaml` before implementation. Orval generates typed hooks and Zod validators.
- **JWT in localStorage**: Auth token stored as `traveloop_token`; `custom-fetch.ts` automatically attaches it to all API calls as a Bearer header.
- **Date handling**: DB stores dates as `text` (ISO `YYYY-MM-DD`). Route handlers convert `Date` objects from Zod to strings before Drizzle inserts.
- **Shared lib pattern**: `@workspace/api-client-react` exports everything from the barrel (`src/index.ts`). Never import from deep paths like `.../src/generated/api.schemas`.
- **No root `dev` script**: Each artifact runs via its own Replit workflow with correct `PORT` and `BASE_PATH` env vars.

## Product

- **Dashboard** — overview of trips, stats, and quick actions
- **Trips** — create, view, edit, and delete travel plans
- **Itinerary Builder** — add destination stops with dates and activities
- **Budget Tracker** — per-category budget breakdown with visual charts
- **Packing Checklist** — grouped checklist with category and reset support
- **Trip Notes** — freeform notes per trip or destination stop
- **Cities & Activities** — browse destinations and activities to add to trips
- **Public Sharing** — share a read-only trip view via link
- **Admin Analytics** — platform-wide stats (admin role required)
- **Profile** — account settings and language preference

## Demo Credentials

- **Email**: `alex@traveloop.com` | **Password**: `password`
- **Admin**: `admin@traveloop.com` | **Password**: `password`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` when DB schema changes — the lib declarations must be rebuilt first.
- After adding new schema tables, re-run `pnpm --filter @workspace/db run push` and `pnpm run typecheck:libs`.
- After changing `openapi.yaml`, re-run codegen: `pnpm --filter @workspace/api-spec run codegen`.
- Date fields in DB are stored as `text` (YYYY-MM-DD). Convert `Date` objects with `.toISOString().split("T")[0]` before Drizzle inserts.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
