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
| `docker compose up -d --build` | Build the image and serve it on port 3000 (see [Run with Docker](#run-with-docker)) |
| `docker build -t tvapp .` | Build the container image only |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, and build on every
push and pull request.

## Run with Docker

The app ships as a self-contained container, so you do not need Node.js
installed to run it. With [Docker](https://docs.docker.com/get-docker/) (or
Docker Desktop) installed:

```bash
docker compose up -d --build
```

Then open <http://localhost:3000>. To stop it:

```bash
docker compose down
```

To let other devices on your network reach it, use the host machine's IP, e.g.
`http://192.168.1.20:3000` (port `3000` is published by `docker-compose.yml`).
The image defines a `HEALTHCHECK`, so `docker compose ps` reports `healthy` once
it is serving.

Prefer plain Docker without Compose:

```bash
docker build -t tvapp .
docker run --rm -p 3000:3000 tvapp
```

The image is built with Next.js [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output),
so the production build runs via `node server.js` inside the container rather
than `next start`. The base image is digest-pinned for reproducible builds. The
build needs internet access (it prerenders live data and downloads fonts).
Normal local development is unaffected — `npm run dev` and `npm run build`
behave exactly as before; `DOCKER_BUILD=1` (set only by the Docker build) is what
switches on standalone mode.

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
