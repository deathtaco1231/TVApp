# TVApp — Onboarding Guide

This guide explains **how the codebase is organized** and **how one match is wired
together end to end**. It complements [`README.md`](../README.md), which covers
user-facing behaviour, and [`streamed-api.md`](./streamed-api.md), which documents
the upstream API.

> All paths are relative to the repository root. TVApp is young; treat line
> numbers here as accurate as of the last change and re-verify after large
> refactors.

## Table of contents

1. Start here — reading order
2. The repo map
3. The model: one App-Router Next.js app + one API client
4. The build pipeline
5. The wiring contract for a match
6. Annotated walkthrough — the live-matches list
7. Data-flow trace — `GET /api/matches/live` to a rendered card
8. Extension trace — adding a page or a new source-aware feature
9. Where do I change X?
10. Gotchas

---

## 1. Start here — reading order

1. [`README.md`](../README.md) — what the product is and the command list.
2. [`docs/streamed-api.md`](./streamed-api.md) — the endpoints and object shapes.
3. `src/lib/streamed/types.ts` — the data contracts as TypeScript.
4. `src/lib/streamed/client.ts` — the single `fetch` wrapper.
5. `src/lib/streamed/matches.ts` — the smallest complete data path.
6. `src/lib/live.ts` + `src/components/LiveBrowser.tsx` — the live board: pure
   grouping/search logic, then the client component that renders it.

## 2. The repo map

```text
TVApp/
  package.json            npm scripts + dependencies
  next.config.ts          Next config (image host allow-list)
  tsconfig.json           TypeScript + "@/*" -> "src/*" path alias
  eslint.config.mjs       ESLint (next/core-web-vitals + next/typescript)
  jest.config.mjs         Jest via next/jest
  jest.setup.ts           loads @testing-library/jest-dom
  src/
    app/                  App Router routes (folders = URL segments)
      layout.tsx          root layout: <html>, fonts, header nav, footer
      page.tsx            "/"            -> live matches (server) + <LiveBrowser>
      globals.css         Tailwind import + theme tokens
      schedule/           "/schedule"    -> today's matches, grouped (server)
      sports/[sport]/     "/sports/:sport" -> all matches for one sport
      matches/[id]/       "/matches/:id"   -> one match + stream picker
    components/           UI pieces
      LiveBrowser.tsx     live board: search, popular filter, sections (client)
      LiveSportNav.tsx    sport jump-nav with live counts (client)
      MatchCard.tsx       one match summary card (presentational)
      SportFilter.tsx     sport pills for /sports pages (server component)
      MatchStreams.tsx    stream picker (client component, holds state)
      StreamPlayer.tsx    iframe player + fallback link (client component)
    lib/
      live.ts             pure grouping/search/sort helpers for the home page
      streamed/           the ONLY code that talks to the API
        types.ts          APIMatch / Stream / Sport / MatchSource
        client.ts         base URL, error type, streamedFetch<T>()
        matches.ts        matchesPath + getMatches/getLiveMatches/...
        sports.ts         getSports()
        streams.ts        streamsPath + getStreams/getStreamsForSources()
        images.ts         badgeUrl/posterUrl/proxyImageUrl
        __tests__/        pure path-builder tests (no network)
      __tests__/          pure live-board helper tests (no network)
  public/                 static assets
```

Routes are created by **folders**, not a route table. `src/app/matches/[id]/page.tsx`
exists because the folder is named `matches/[id]`; the `[id]` brackets mark a
dynamic segment.

## 3. The model: one App-Router Next.js app + one API client

TVApp is a single Next.js application. There is no separate backend and no
database. Next.js runs two kinds of React components:

- **Server components** (the default) run on the server, may be `async`, and are
  where data is fetched. All pages and `MatchCard`/`SportFilter` are server
  components.
- **Client components** (marked `"use client"`) run in the browser and own
  interactivity. `LiveBrowser`, `LiveSportNav`, `MatchStreams`, and `StreamPlayer`
  are client components. `MatchCard` is presentational and is bundled client-side
  when `LiveBrowser` imports it (it uses no server-only APIs).

The seam between the app and the outside world is a single module,
`src/lib/streamed/`. Because the Streamed API sends
`Access-Control-Allow-Origin: *`, both server and client code could call it, but
today only server components fetch.

| Layer | Location | Purpose |
|---|---|---|
| Routes | `src/app/**` | URL → page component |
| UI | `src/components/**` | Presentational + interactive pieces |
| Live board logic | `src/lib/live.ts` | Pure grouping/search/sort for the home page |
| Data access | `src/lib/streamed/**` | Typed `fetch` wrappers, the API seam |
| Config | `next.config.ts`, `tsconfig.json`, `eslint.config.mjs` | Build/tooling |
| Tests | `src/lib/**/__tests__/**` | Jest unit tests (pure, offline) |

## 4. The build pipeline

`next build` compiles and type-checks everything, then renders pages:

```text
src/**/*.ts(x)
  -> Turbopack compiles (SWC)             # next build
  -> TypeScript check across the project  # "Running TypeScript ..."
  -> pages rendered:
       /                 static, revalidate 60s (ISR)
       /schedule         static, revalidate 60s (ISR)
       /sports/[sport]   dynamic (server-rendered on demand)
       /matches/[id]     dynamic (server-rendered on demand)
  -> output in .next/  (generated — never edit by hand)
```

Notes:

- `/` is prerendered at build time with a 60-second revalidation window because
  the page sets `export const revalidate = 60` (`src/app/page.tsx:6`) and the
  fetch default is also 60 (`src/lib/streamed/client.ts:25`).
- The **root layout** fetches `/api/sports` (`src/app/layout.tsx`) to build the
  header's Sports menu. The request is memoized and shares the 60s revalidate, so
  it does not double-hit the API.
- Route params in Next 16 are **asynchronous**: `params` is a `Promise` and must
  be awaited (`src/app/matches/[id]/page.tsx:14-16`).
- Next 16 generates route types under `.next/types/`; `next-env.d.ts:3` imports
  them. They refresh on `next dev`/`next build`.

## 5. The wiring contract for a match

One match passes through these layers:

```text
(1) src/lib/streamed/types.ts:21-30    APIMatch + sources[] shape
(2) src/lib/streamed/matches.ts:6-8    matchesPath() builds the API path
(3) src/lib/streamed/client.ts:23-43   streamedFetch() performs the request
(4) src/app/page.tsx:14                page fetches and receives APIMatch[]
(5) src/lib/live.ts:33-70              buildSportGroups() filters/groups/sorts
(6) src/components/MatchCard.tsx:44    card links to /matches/{match.id}
(7) src/app/matches/[id]/page.tsx:16   route reads { id } and finds the match
(8) src/lib/streamed/streams.ts:12-30  getStreamsForSources() fetches Stream[]
(9) src/components/StreamPlayer.tsx:29 iframe uses stream.embedUrl
```

**The "must match" rules** (these fail *silently* when broken):

1. **`sources[].source` must be a real endpoint id.** `streamsPath`
   (`streams.ts:4-6`) turns `{source, id}` into `/stream/{source}/{id}`. If
   `source` is renamed or unsupported, the request 404s and
   `getStreamsForSources` swallows the error (`streams.ts:23-25`), so the source
   simply vanishes with no visible error.
2. **`match.id` must be unique and present in `/matches/all`.** The card links
   with `match.id` (`MatchCard.tsx:44`) and the detail page finds it via
   `findMatchById` (`matches.ts:36-40`) over `/matches/all`. If the id is not in
   that list, the page calls `notFound()` (`matches/[id]/page.tsx:26-28`).
3. **Stream list keys must be composite.** `Stream.id` is only unique *within a
   source*, so React keys use `` `${source}:${id}:${streamNo}` ``
   (`MatchStreams.tsx:8-10`). Keying by `id` alone would produce duplicate keys
   and incorrect re-renders.
4. **The image host must be allowed.** `next.config.ts:4-11` allow-lists
   `streamed.pk` for `next/image`. Badges also pass `unoptimized`
   (`MatchCard.tsx:33`), which bypasses the optimizer entirely.
5. **The home page's group order is fixed, not count-based.** `buildSportGroups`
   (`live.ts`) sorts groups alphabetically by sport name so the sidebar and
   sections never disagree and never reshuffle between revalidations. Live counts
   are display-only, shown in the sidebar.

## 6. Annotated walkthrough — the live-matches list

Read in this order: `types.ts` → `matches.ts` → `client.ts` → `page.tsx` →
`LiveBrowser.tsx` → `live.ts` → `MatchCard.tsx`.

### 6a. `src/lib/streamed/types.ts`

The API contracts as TypeScript interfaces. `APIMatch` (`:21-30`) is the shape
returned by every `/api/matches/...` endpoint; note `sources` is a non-optional
array of `{ source, id }` (`MatchSource`, `:16-19`). `Stream` (`:32-39`) carries
`embedUrl`, the iframe target.

### 6b. `src/lib/streamed/matches.ts`

`matchesPath(filter, popular)` (`:6-8`) is a pure string builder: `/matches/live`
or `/matches/live/popular`. `getMatches` (`:10-15`) delegates to `streamedFetch`
and types the result as `APIMatch[]`. The named helpers (`getLiveMatches`
`:24-26`, `getTodayMatches` `:28-30`, `getAllMatches` `:32-34`) are thin,
self-documenting wrappers. Being pure, `matchesPath` is the natural unit to test.

### 6c. `src/lib/streamed/client.ts`

The single place in the app that calls `fetch`.

- `STREAMED_ORIGIN`/`STREAMED_API_BASE` (`:1-2`) — one source of truth for the host.
- `StreamedApiError` (`:4-12`) — carries the HTTP status.
- `streamedFetch<T>` (`:23-43`) — takes a path plus options, defaults
  `revalidate` to 60 (`:25`), passes it to Next via the `next` fetch option
  (`:29`), throws `StreamedApiError` on a non-OK response (`:35-40`), and returns
  parsed JSON cast to `T` (`:42`). **The `T` is a promise, not a runtime check** —
  the types describe the API, they do not validate it.

### 6d. `src/app/page.tsx` + `src/components/LiveBrowser.tsx`

`page.tsx` is a small `async` server component. `export const revalidate = 60`
(`:6`) makes the route ISR. It fetches live matches and sports in parallel (`:14`),
catches failures into an `error` string rather than crashing, and renders either an
error notice or `<LiveBrowser matches={matches} sports={sports} />` (`:29`). The
match/sport arrays are plain JSON, so they serialize cleanly to the client.

`LiveBrowser` owns the interactive board:

- state for the search text, the popular filter, and the tracked section
  (`src/components/LiveBrowser.tsx:17-19`);
- a `useMemo` call to `buildSportGroups(matches, sports, query, popularOnly)`,
  which does **all** filtering, grouping, and sorting (`:21-24`);
- a `useEffect` that subscribes to an `IntersectionObserver` to track which
  section is in view and highlight it in the sidebar (`:41-63`);
- a `handleJump` that scrolls a section into view (`:65-71`);
- the layout: toolbar + a two-column grid where the `LiveSportNav` sidebar sits
  beside the sport sections, each section mapping its matches to `MatchCard`.

Because `LiveBrowser` is a client component, `MatchCard` is bundled and rendered
client-side on this page. That is fine — `MatchCard` is purely presentational and
imports no server-only APIs.

### 6e. `src/lib/live.ts`

The pure heart of the board, deliberately kept out of React so it can be unit
tested:

- `buildSportGroups(matches, sports, query, popularOnly)` (`:33-70`) — filters
  (popular only, then search text), buckets by `category`, sorts each bucket with
  `compareMatches`, then sorts the groups alphabetically by display name.
- `compareMatches(a, b)` (`:26-31`) — popular first, then newest start time.
- `matchSearchText(match, sportName)` (`:13-24`) — the lowercased haystack
  (title, category, sport name, both team names) that search matches against.
- `sportNameById(sports)` (`:9-11`) — maps a category id to its display name,
  falling back to the raw id for unknown categories.

### 6f. `src/components/MatchCard.tsx`

A presentational component that receives one `APIMatch`. No state, no fetching.
`TeamBadge` (`:17-36`) renders a `next/image` badge via `badgeUrl` (`:28`) or a
letter fallback when a badge is missing (`:18-24`). The whole card is a
`next/link` to `/matches/${match.id}` (`:43-45`), which is what makes the card
clickable.

### The full loop

1. A user opens `/`.
2. The server runs `HomePage`, which calls `getLiveMatches()` (`page.tsx:14`).
3. That builds `/matches/live` (`matches.ts:7`) and fetches it (`client.ts:33`).
4. The JSON array is typed as `APIMatch[]` and passed to `<LiveBrowser>`.
5. `LiveBrowser` derives `SportGroup[]` via `buildSportGroups` (`live.ts:33`).
6. Each group renders a section; each match renders a `<MatchCard>`.
7. Clicking a card navigates to `/matches/{id}` (`MatchCard.tsx:44`).
8. The match page finds the match, loads its streams, and renders the player.

## 7. Data-flow trace — `GET /api/matches/live` to a rendered card

1. `src/app/page.tsx:14` — `getLiveMatches()` is called during server render.
2. `src/lib/streamed/matches.ts:24-26` — `getLiveMatches` → `getMatches("live")`.
3. `src/lib/streamed/matches.ts:10-14` — `getMatches` calls
   `streamedFetch<APIMatch[]>(matchesPath("live"))`.
4. `src/lib/streamed/matches.ts:6-8` — `matchesPath("live")` returns `/matches/live`.
5. `src/lib/streamed/client.ts:33` — `fetch("https://streamed.pk/api/matches/live", …)`.
6. `src/lib/streamed/client.ts:35-42` — non-OK throws; OK returns parsed JSON.
7. `src/app/page.tsx:29` — the array is passed to `<LiveBrowser>`.
8. `src/lib/live.ts:33-70` — `buildSportGroups` filters, groups, and sorts it.
9. `src/components/LiveBrowser.tsx` — maps groups to sections and matches to
   `<MatchCard>`; the sidebar shows per-sport counts.
10. `src/components/MatchCard.tsx:38-71` — each card renders teams, kickoff time,
    source count, and the link to the match page.
11. `src/components/MatchCard.tsx:28` — badges are requested from
    `https://streamed.pk/api/images/badge/{badge}.webp`.

The takeaway: **pages never call `fetch`; they call typed functions in
`src/lib/streamed/`, which all funnel through `streamedFetch`.** The only other
layer is pure presentation logic in `src/lib/live.ts`, which never touches the
network.

## 8. Extension trace — adding a page or a new source-aware feature

### Adding a page

1. **Create a route folder** under `src/app/`. The folder path *is* the URL, e.g.
   `src/app/schedule/page.tsx` → `/schedule`. For a dynamic segment use brackets
   (`src/app/teams/[teamId]/page.tsx`).
2. **Export a default async component.** Server components may `await` directly.
   For dynamic routes, `await params` (`matches/[id]/page.tsx:16`).
3. **Fetch through `src/lib/streamed/`.** If no wrapper exists, add one (see
   below) — do not call `fetch` in the page.
4. **Add `export const revalidate = <seconds>`** if the page should be cached.
5. **Link to it** with `next/link` from wherever users should reach it.
6. **Run `npm run build`** — Next regenerates `.next/types/` for the new route; a
   stale type cache can make `href` props error until you rebuild.

### Adding a new API wrapper

1. Add the shape to `src/lib/streamed/types.ts` if it is a new object.
2. Add a pure path builder and a thin fetch function next to it (mirror
   `matches.ts:6-15`).
3. If it builds a URL, add a case to `src/lib/streamed/__tests__/paths.test.ts`.
4. Only import it from server components unless the feature is interactive.

### Adding a new pure data helper

1. Put it in `src/lib/` (e.g. `src/lib/live.ts`) with an input/output type.
2. Keep it free of React and of network calls.
3. Add tests in `src/lib/__tests__/` (mirror `live.test.ts`).
4. Call it from a component; keep the component thin.

### Adding interactivity

1. Create a component under `src/components/` that starts with `"use client"`.
2. Pass server-fetched data in as props (as `LiveBrowser` receives
   `matches`/`sports`, or `MatchStreams` receives `streams`).
3. Hold UI state with `useState` (search text in `LiveBrowser`, selected stream in
   `MatchStreams.tsx:13`) and derive with `useMemo`.
4. Keep pure logic out of the component and in `src/lib/` so it is unit-testable.
5. Use `useEffect` only to subscribe to an external system — `LiveBrowser` uses an
   `IntersectionObserver` to track the visible section. Avoid setting state
   synchronously in an effect body (the repo's ESLint config rejects it); derive
   instead.

## 9. Where do I change X?

| I want to… | Edit these files | Rebuild needed? |
|---|---|---|
| Change home grouping / search / ordering | `src/lib/live.ts` | Dev hot-reloads; rebuild for production |
| Change the sport sidebar / jump behavior | `src/components/LiveSportNav.tsx` | Dev hot-reloads |
| Change the home layout (sections, toolbar) | `src/components/LiveBrowser.tsx` | Dev hot-reloads |
| Add/rename a header nav link | `src/app/layout.tsx` | Dev hot-reloads; rebuild for typed routes |
| Change the Today page | `src/app/schedule/page.tsx` | Dev hot-reloads |
| Change the API base URL | `src/lib/streamed/client.ts:1-2` | Dev hot-reloads; production build |
| Change how long data is cached | `src/lib/streamed/client.ts:25` and the page's `export const revalidate` | Yes |
| Add a new match filter/page | `src/app/…/page.tsx` + a helper in `matches.ts` | Yes (regenerates route types) |
| Change the card layout | `src/components/MatchCard.tsx` | Dev hot-reloads |
| Change the player / iframe settings | `src/components/StreamPlayer.tsx:26-34` | Dev hot-reloads |
| Change stream selection UI | `src/components/MatchStreams.tsx` | Dev hot-reloads |
| Allow another image host | `next.config.ts:4-11` | Yes (config) |
| Global colors / fonts / theme | `src/app/globals.css`, `src/app/layout.tsx` | Dev hot-reloads |

## 10. Gotchas

1. **Handling a live API at build time.** `/` is prerendered, so `next build`
   performs a real network call. If the API is down or you are offline, the page
   still builds static (its `try/catch` yields the error state), but the baked
   HTML shows the error until the next revalidation.
2. **`.next/` and `next-env.d.ts` are generated.** Never hand-edit them. Route
   types for typed `<Link href>` (e.g. the global `LayoutProps`) live in
   `.next/types/` and refresh on `next dev`/`next build` — and on `npm run
   typecheck`, which runs `next typegen` first (so it works after `.next/` is
   deleted).
3. **Silent source drops.** `getStreamsForSources` catches per-source failures and
   returns `[]` (`streams.ts:23-25`). A typo in a source name produces a match with
   fewer streams, not an error. If a match unexpectedly shows "No streams", check
   the source strings.
4. **`params` is a Promise (Next 15+).** Forgetting `await params` gives a runtime
   type error and empty values.
5. **Composite stream keys.** `Stream.id` repeats across sources; always key by
   `streamKey` (`MatchStreams.tsx:8-10`), not by `id`.
6. **Poster URL ambiguity** in the upstream docs — see
   [`streamed-api.md`](./streamed-api.md) "Gotchas". Prefer badges.
7. **Embed blocking.** Some `embedUrl` hosts refuse to be framed; the player shows
   an "open raw link" fallback.
8. **Rebuild vs hot-reload.** Component and page edits hot-reload in `npm run dev`;
   `next.config.ts`, `package.json`, and `.env` changes need a dev-server restart.
9. **Home order is intentionally stable.** Groups are alphabetical by sport name
   (`src/lib/live.ts`), *not* by live count, so sections don't reshuffle between
   60s revalidations and break the jump-nav or user muscle memory. Counts are
   display-only.
10. **`MatchCard` is shared across server and client.** It has no `"use client"`
    and no server-only APIs, so it works in both trees. Don't add server-only
    imports (or `async`) to it without moving it out of the client tree.
11. **Filtering state is local.** Search and "Popular only" live only in
    `LiveBrowser` state; they are not in the URL, so they reset on reload.
12. **Sport pages must stay reachable.** `/sports/[sport]` was once orphaned from
    home. The header **Sports** dropdown (`src/app/layout.tsx`) and the sidebar
    arrows (`src/components/LiveSportNav.tsx`) keep them one click away — don't
    remove both.

---

Next: [`PRIMER.md`](./PRIMER.md) teaches the React and Next.js concepts referenced
here, using this repo as the example. Coding-agent context lives in the
repository-root `AGENTS.md`.
