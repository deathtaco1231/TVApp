# Streamed API reference (as used by TVApp)

Upstream documentation: <https://streamed.pk/docs>

- **Base URL:** `https://streamed.pk/api`
- **Auth:** none
- **Format:** JSON
- **CORS:** responds with `Access-Control-Allow-Origin: *` → the browser can call
  it directly. Verified with a `GET /api/sports` from a `http://localhost:3000`
  origin.
- **Caching:** responses carry `Cache-Control: public, max-age=60`. TVApp mirrors
  this with a 60s `revalidate` (see `src/lib/streamed/client.ts`).
- **Ordering:** `/matches/live` returns matches sorted by `date` **descending**
  (verified). There is no live-status, score, or minute field — TVApp sorts
  client-side instead (`src/lib/live.ts`).
- **Rate limits:** none advertised today; the docs warn this may change.

## Endpoints

| Endpoint | Returns | TVApp wrapper |
|---|---|---|
| `GET /api/sports` | `Sport[]` | `getSports()` |
| `GET /api/matches/{sport}` | `APIMatch[]` for one sport | `getMatchesBySport(sport)` |
| `GET /api/matches/all` | `APIMatch[]` across all sports | `getAllMatches()` |
| `GET /api/matches/all-today` | `APIMatch[]` scheduled today | `getTodayMatches()` |
| `GET /api/matches/live` | `APIMatch[]` currently live | `getLiveMatches()` |
| `GET /api/matches/{filter}/popular` | popular-only variant | pass `popular = true` |
| `GET /api/stream/{source}/{id}` | `Stream[]` | `getStreams(source, id)` |
| `GET /api/images/badge/{badge}.webp` | team badge image | `badgeUrl(badge)` |
| `GET /api/images/poster/{home}/{away}.webp` | match poster image | `posterUrl(home, away)` |
| `GET /api/images/proxy/{poster}.webp` | proxied image | `proxyImageUrl(poster)` |

## Object shapes

```ts
interface Sport {
  id: string;    // e.g. "football"; used in matches endpoints
  name: string;  // e.g. "Football"
}

interface APIMatch {
  id: string;              // unique match id
  title: string;           // "Team A vs Team B"
  category: string;        // sport id
  date: number;            // Unix timestamp in milliseconds
  poster?: string;         // poster id/path (see "Gotchas")
  popular: boolean;
  teams?: {
    home?: { name: string; badge: string };
    away?: { name: string; badge: string };
  };
  sources: { source: string; id: string }[];  // source + source-specific id
}

interface Stream {
  id: string;        // source-specific stream id
  streamNo: number;
  language: string;  // e.g. "English"
  hd: boolean;
  embedUrl: string;  // iframe src for the player
  source: string;    // e.g. "alpha"
  viewers?: number;  // current viewer count for this stream
}
```

`source` values seen in the docs: `alpha`, `bravo`, `charlie`, `delta`, `echo`,
`foxtrot`, `golf`, `hotel`, `intel`.

## How playback works

Streams are **iframes**. A match lists one or more `sources`; for each you call
`/api/stream/{source}/{id}`, and each returned `Stream` has an `embedUrl` you drop
straight into an `<iframe src>`. Real-world example (obtained from the site's
"embed" button):

```html
<iframe
  title="Milwaukee Brewers vs San Diego Padres Player"
  src="https://embed.st/embed/admin/ppv-san-diego-padres-vs-milwaukee-brewers/1"
  allow="encrypted-media; picture-in-picture; fullscreen"
  allowfullscreen
  width="100%" height="100%" frameborder="0"></iframe>
```

TVApp renders exactly this in `src/components/StreamPlayer.tsx` and also shows the
raw `embedUrl` as a link, which is handy for casting to a TV.

## Gotchas

1. **Poster URLs are ambiguous in the docs.** The matches page shows
   `poster: "man-utd-liverpool-poster"` (an id) and an example that concatenates
   it as `https://streamed.pk${match.poster}.webp`, while the images page defines
   `/api/images/poster/{homeBadge}/{awayBadge}.webp` and
   `/api/images/proxy/{poster}.webp`. TVApp sidesteps this by preferring the
   **team badges**, whose URL shape is unambiguous.
2. **There is no single-match endpoint** (`/api/matches/{id}` does not exist).
   The match page therefore fetches `/api/matches/all` and finds the match by id.
3. **Embed hosts may block framing.** Some sources send `X-Frame-Options`/CSP that
   prevents the iframe from rendering. The player keeps a visible "open raw link"
   fallback for that case.
4. **`Source` strings must match the endpoints exactly.** A renamed or unsupported
   source makes `/api/stream/...` return 404; TVApp silently drops that source
   (see `getStreamsForSources`) so one dead source does not break the page.
5. **Viewer counts are per-stream, not per-match.** `viewers` appears on
   `/api/stream/{source}/{id}` responses but not on match objects. Sorting the
   match list by viewers would need one request per source per match (no batch
   endpoint), so TVApp only displays it on the match page.
