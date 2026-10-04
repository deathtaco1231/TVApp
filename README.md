# TVApp

A small web app for browsing and watching live sports streams. It is a thin client
over the public [Streamed API](https://streamed.pk/docs): no accounts, no backend,
no database of its own.

This started as a learning project for React and Next.js, and is built so a
beginner can follow one piece of data from the API to the screen. The home page
groups **live matches by sport** with a jump-nav sidebar, global search, and a
popular-only filter. Each match opens a **match page** with a stream picker and an
embedded player.

## Tech stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** for styling
- **Jest + React Testing Library** for tests
- **npm** for dependencies

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack, hot reload) |
| `npm run build` | Production build; also type-checks every page |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the Jest suite |
| `npm run test:watch` | Jest in watch mode |

## How it works

There is no server-side proxy: the Streamed API sends
`Access-Control-Allow-Origin: *`, so the app can call it directly. All calls go
through one typed module, `src/lib/streamed/`, so the rest of the app never
touches `fetch`.

```text
src/app/                     routes (App Router)
  page.tsx                   home → live matches
  sports/[sport]/page.tsx    matches for one sport
  matches/[id]/page.tsx      one match → stream picker + player
src/components/              presentational + interactive pieces
src/lib/
  live.ts                    grouping/search/sort for the home board (pure)
  streamed/                  typed API client (the only place that fetches)
```

## Documentation

- [`docs/ONBOARDING.md`](docs/ONBOARDING.md) — architecture, the wiring contract,
  a line-by-line walkthrough, and where to change things.
- [`docs/PRIMER.md`](docs/PRIMER.md) — a React/Next.js primer that teaches the
  concepts using this repo's own files.
- [`docs/streamed-api.md`](docs/streamed-api.md) — the Streamed API endpoints and
  object shapes this app relies on.

## Legal

TVApp does not host any video. It indexes and links to third-party streams
returned by the Streamed API. Respect the rights of content owners in your
region.
