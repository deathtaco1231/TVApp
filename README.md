# TVApp

A small web app for browsing and watching live sports streams. It is a thin client
over the public [Streamed API](https://streamed.pk/docs): no accounts, no backend,
no database of its own.

This started as a practical tool for finding live sports streams, and doubles as
a vehicle for learning React and Next.js. It is deliberately structured so you
can follow one piece of data from the API to the screen. The home page
groups **live matches by sport** with a jump-nav sidebar, global search, and a
popular-only filter. A persistent header links **Live**, **Today** (today's full
schedule across sports), and every sport. The **Today** and per-sport pages offer
a popular-only filter plus a sort control (Popular / Soonest / Latest / Most
sources). Each match opens a **match page** with a stream picker and an embedded
player.

## Use it (no coding)

### Option 1 — Open the shared link (easiest)

If the host shares their TVApp over **Tailscale**:

1. Install [Tailscale](https://tailscale.com/download) and sign in with the
   invite you were sent.
2. Open the link they gave you (for example
   `https://tvapp.<your-tailnet>.ts.net`).

Nothing else to install. In-app instructions live at **`/help`**.

### Option 2 — Run your own copy with Docker

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or
Docker Engine on Linux). Then one command:

```bash
docker run -d -p 3000:3000 --restart unless-stopped ghcr.io/deathtaco1231/tvapp:latest
```

Open <http://localhost:3000>. Update it later with:

```bash
docker pull ghcr.io/deathtaco1231/tvapp:latest
# then stop and start it again (or use the compose file below)
```

Prefer a compose file? This repo ships a pull-only one:

```bash
docker compose -f docker-compose.release.yml up -d     # start / update
docker compose -f docker-compose.release.yml pull      # fetch a newer image
docker compose -f docker-compose.release.yml down      # stop
```

Pin a version with `TVAPP_TAG=v0.2.0` (defaults to `latest`).

Optional helper scripts wrap the compose commands and print a friendly message if
Docker is missing or not running:

- Windows: double-click `scripts\run.cmd` (or run `scripts\run.ps1`).
- Linux / macOS: `bash scripts/run.sh`.

### Share your own copy over Tailscale (host)

With Docker running and Tailscale installed on the host:

```bash
docker compose -f docker-compose.release.yml up -d
tailscale serve --bg https / http://127.0.0.1:3000
```

Tailscale prints an `https://<host>.<tailnet>.ts.net` URL — share that. Peers
only need Tailscale installed; no domain name or port forwarding required. (This
also makes the no-install popup-guard launcher at `/help` work, since it needs a
reachable origin.)

## Run it for development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. This is the development server (Turbopack, hot
reload); it does not use the published image.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack, hot reload) |
| `npm run build` | Production build; also type-checks every page |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm test` | Run the Jest suite |
| `npm run test:watch` | Jest in watch mode |
| `docker build -t tvapp .` | Build the container image locally |
| `docker compose up -d --build` | Build + serve locally on port 3000 |
| `docker compose -f docker-compose.release.yml up -d` | Run the published image |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, and build on every
push and pull request.

## Releases & versioning

`package.json` `version` is the single source of truth and is shown in the app
footer (with an automatic **BETA** tag while the major version is `0`).

To cut a release:

```bash
npm version patch   # or minor / major — bumps package.json and creates a git tag
git push --follow-tags
```

That pushes a `vX.Y.Z` tag, which triggers
[`.github/workflows/release.yml`](.github/workflows/release.yml): it runs the
checks, builds the image for **linux/amd64 and linux/arm64** on native runners,
and pushes `ghcr.io/deathtaco1231/tvapp` with the semver, `X.Y`, and `latest`
tags (plus an immutable `sha-…` tag). Roll back by running an older version tag.

**arm64 rollback:** if the native `ubuntu-24.04-arm` runner is unavailable on
your plan, or the extra build time isn't worth it, delete the arm64 entry from
the workflow's build matrix. The workflow keeps working with a single platform
and nothing else changes.

**First release — make the package pullable anonymously:** a new GHCR package is
**private** by default. After the first tag, open the package on GitHub
(`https://github.com/users/deathtaco1231/packages/container/tvapp/settings`) and
set its visibility to **Public**, or everyone's `docker pull` will fail with
`unauthorized`. (Keep it private only if you intend every user to
`docker login ghcr.io` with a personal access token.)

> The image is built at release time and needs outbound network (it prerenders
> live data and downloads fonts).

## Run with Docker (local build)

The app ships as a self-contained container, so you do not need Node.js
installed to run it. With Docker installed:

```bash
docker compose up -d --build
```

Then open <http://localhost:3000>. To stop it: `docker compose down`. To let
other devices on your network reach it, use the host machine's IP, e.g.
`http://192.168.1.20:3000`. The image defines a `HEALTHCHECK`, so
`docker compose ps` reports `healthy` once it is serving.

Prefer plain Docker without Compose:

```bash
docker build -t tvapp .
docker run --rm -p 3000:3000 tvapp
```

The image is built with Next.js [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output),
so the production build runs via `node server.js` inside the container rather
than `next start`. The base image is digest-pinned for reproducible builds.
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
  layout.tsx                 shell + header nav (Live / Today / Sports)
  page.tsx                   home → live matches, grouped by sport
  schedule/page.tsx          today's matches across sports
  sports/[sport]/page.tsx    all matches for one sport
  matches/[id]/page.tsx      one match → stream picker + player
src/components/              presentational + interactive pieces
src/lib/
  live.ts                    grouping/search/sort for the home board (pure)
  version.ts                 footer version label (pure)
  streamed/                  typed API client (the only place that fetches)
```

## Documentation

- [`docs/ONBOARDING.md`](docs/ONBOARDING.md) — architecture, the wiring contract,
  a line-by-line walkthrough, and where to change things.
- [`docs/PRIMER.md`](docs/PRIMER.md) — a React/Next.js primer that teaches the
  concepts using this repo's own files.
- [`docs/streamed-api.md`](docs/streamed-api.md) — the Streamed API endpoints and
  object shapes this app relies on.

## Future ideas

- A single, persistent **search bar in the app shell** — one location that never
  moves or disappears — instead of search living only on the home board.
- A public hosted instance behind a simple login (currently Tailscale-only).

## Ads and safety

Streams play in third-party **iframes**, and some embed pages open ad popups
(sometimes gambling/adult/malware) when you press play. TVApp cannot sandbox these
frames — the providers detect a `sandbox` attribute and refuse to play — and a
parent page cannot block a cross-origin frame's popups. The header **Redirect
guard** toggle adds a browser confirmation before a top-level redirect (it does
not catch popups).

The **companion extension** in [`extension/`](extension/README.md) closes that gap:
it neutralizes `window.open` inside the `embed.st` frames, so the play-triggered
popups no longer open, without affecting playback or other sites. Match pages show
a dismissible prompt when it isn't detected; open **`/guard`** in the running app
to download the extension (with a handshake so the prompt disappears once it's
installed). Load it once via your browser's "Load unpacked" — see
[`extension/README.md`](extension/README.md).

For a no-install path on Windows, **`/help`** offers a downloadable launcher: it
fetches Chrome for Testing plus the guard on first run and opens TVApp with the
guard already loaded (no extension steps). This needs a reachable TVApp origin —
the Tailscale HTTPS host works.

Layer network-level filtering on top for defense in depth (it also covers any TV
on the same network):

- **DNS filtering** — NextDNS, AdGuard DNS, or Pi‑hole with the ads + malware +
  adult categories enabled, set at the router.
- **Desktop** — a content blocker such as uBlock Origin.

## Legal

TVApp does not host any video. It indexes and links to third-party streams
returned by the Streamed API. Respect the rights of content owners in your
region.
