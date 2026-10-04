# React + Next.js Primer for TVApp

You are new to React and Next.js and have inherited this codebase. This primer
teaches the concepts you need, using **only examples from this repository**.
Because TVApp was scaffolded with `create-next-app`, it is a fairly typical modern
Next.js app — what you learn here transfers directly.

- Companion document: [`ONBOARDING.md`](./ONBOARDING.md)
- Repository root: the folder containing `package.json`
- Official docs: <https://nextjs.org/docs> · React: <https://react.dev>

This stack renders a UI, so the UI/framework headings are used below.

## Table of contents

1. What React and Next.js are (and are not)
2. Syntax / idioms you will see
3. The mental model: server vs client, and when code runs
4. Core building blocks: components
5. Props vs state
6. Effects, async, and data
7. The Next.js-specific glue this repo relies on
8. Lists and conditional output
9. TypeScript in this repo
10. Concept → file cross-reference
11. Exercises
12. Further reading

---

## 1. What React and Next.js are

**React** is a library for building a UI out of small functions called
*components*. You describe what the UI should look like for a given set of data,
and React figures out how to update the DOM when that data changes. It is *not* a
framework: it does not decide your routing, data fetching, or build. Plain React
in the browser would need a bundler and a router bolted on (e.g. Vite + React
Router).

**Next.js** is that framework. It adds file-based routing, server rendering,
bundling, image optimization, and data fetching on top of React. In TVApp, Next
decides that the folder `src/app/matches/[id]/` is the URL `/matches/:id`. React
decides how a `MatchCard` looks.

What Next.js does **not** do for TVApp: it does not provide the sports data. That
comes from the external Streamed API, reached through `src/lib/streamed/`.

## 2. Syntax / idioms you will see

Components are functions returning **JSX**, a syntax that looks like HTML inside
JavaScript. Curly braces embed JavaScript expressions:

```tsx
// src/components/LiveBrowser.tsx:96-100
<p className="mt-3 text-sm text-zinc-500" aria-live="polite">
  {totalVisible} match{totalVisible === 1 ? "" : "es"}
  {query ? ` for "${query}"` : ""}
</p>
```

`className`, not `class` — JSX is JavaScript, where `class` is a reserved word.
Conditional rendering uses `&&` or the ternary `? :`:

```tsx
// src/components/MatchCard.tsx:49
{match.popular ? <span className="text-amber-500">Popular</span> : null}
```

TypeScript files are `.tsx` when they contain JSX and `.ts` otherwise. TVApp uses
`<Type>` and interfaces heavily — see section 9.

## 3. The mental model: server vs client, and when code runs

This is the single most important idea in modern Next.js, and it is everywhere in
this repo.

- A component is a **Server Component by default**. It runs on the server, may be
  `async`, and can talk to databases or APIs directly. It never ships to the
  browser. All pages and `SportFilter` are server components; `MatchCard` is
  presentational and is used from both server and client trees.
- A component with **`"use client"` at the very top** becomes a **Client
  Component**. It runs in the browser, can use hooks like `useState`, and handles
  clicks and typing. `LiveBrowser` (`src/components/LiveBrowser.tsx:1`),
  `LiveSportNav`, `MatchStreams` (`src/components/MatchStreams.tsx:1`), and
  `StreamPlayer` (`src/components/StreamPlayer.tsx:1`) are client components.

Why the split? Data fetching and rendering are cheaper and safer on the server; a
browser needs client components only for interactivity. `LiveBrowser` needs to
keep search text and track the section in view, and `MatchStreams` needs to
remember which stream you picked, so both are client components. `MatchCard` just
displays data, so it stays server-friendly.

**When code re-runs:** every time React re-renders a client component (because its
state or props changed), the function body runs again top to bottom. That is why
state is declared with `useState`, not with plain variables — a plain `let` would
reset on every render.

## 4. Core building blocks: components

A component is a function whose name starts with a capital letter and which
returns JSX. It may take a single `props` object.

Simplest form — one line of JSX, no state:

```tsx
// src/components/MatchCard.tsx:38
export function MatchCard({ match }: { match: APIMatch }) {
```

`{ match }` destructures the props object; the `: { match: APIMatch }` is the
TypeScript type saying "this component needs one `match` prop". Components can
also be declared as `export default function` — pages must be, because Next.js
imports them by default export (`src/app/page.tsx:9`).

Small helper components live in the same file when they are private:
`TeamBadge` is defined and used only inside `MatchCard.tsx` (`:17-36`, `:54`).

## 5. Props vs state

- **Props** are values passed *into* a component from its parent. They are
  read-only. `MatchCard` receives `match` (`MatchCard.tsx:38`); `StreamPlayer`
  receives `stream` (`StreamPlayer.tsx:7`); `MatchStreams` receives `streams`
  (`MatchStreams.tsx:12`); `LiveBrowser` receives `matches` and `sports`
  (`LiveBrowser.tsx:10-16`).
- **State** is a component's own memory that can change over time, declared with
  the `useState` hook. Changing state tells React to re-render.

```tsx
// src/components/MatchStreams.tsx:13-15
const [selectedKey, setSelectedKey] = useState(() =>
  streams.length > 0 ? streamKey(streams[0]) : "",
);
```

`selectedKey` is the current value; `setSelectedKey` changes it. The function
passed to `useState` is a *lazy initializer* — it runs only on the first render.
When the user clicks a button, `setSelectedKey(key)` (`:42`) updates state and
React re-renders, so the chosen stream's button becomes highlighted and the player
switches.

A second, very common pattern is the **controlled input**, where the field's value
*is* state:

```tsx
// src/components/LiveBrowser.tsx:76-83
<input
  type="search"
  value={query}
  onChange={(event) => setQuery(event.target.value)}
  ...
/>
```

Typing calls `setQuery`, which re-renders `LiveBrowser`, which recomputes the
grouped list. This is React's "single source of truth" pattern.

**The rule:** never mutate props. If `StreamPlayer` changed `stream.embedUrl`
directly, siblings sharing that object would not know to update. Derive new values
instead, as `MatchStreams` and `LiveBrowser` do with `useMemo`
(`MatchStreams.tsx:17-20`, `LiveBrowser.tsx:21-24`).

## 6. Effects, async, and data

React has a hook called `useEffect` for syncing with external systems after a
render. Data is fetched in `async` server components during rendering:

```tsx
// src/app/page.tsx:13-18
try {
  [matches, sports] = await Promise.all([getLiveMatches(), getSports()]);
} catch (cause) {
  error = cause instanceof Error ? cause.message : "Failed to load live matches.";
}
```

`Promise.all` runs both requests in parallel. The `try/catch` means a network
failure downgrades to an error message instead of crashing the page. This is the
idiomatic Next.js App Router pattern: fetch on the server, render the result, and
let the framework cache it (section 7).

Client components receive already-fetched data as props, so they do not fetch at
all. TVApp uses `useEffect` in exactly one place — `LiveBrowser` subscribes to an
`IntersectionObserver` to highlight the section you have scrolled to
(`LiveBrowser.tsx:41-63`), and disconnects it on cleanup. That is the recommended
use of an effect: **subscribe to an external system and unsubscribe in the cleanup
function** — not to derive state. (The repo's ESLint config even rejects setting
state synchronously inside an effect body.)

## 7. The Next.js-specific glue this repo relies on

- **File-based routing.** A folder under `src/app/` is a URL segment. `page.tsx`
  is the route; `layout.tsx` wraps everything. Brackets make a dynamic segment:
  `src/app/matches/[id]/page.tsx` (`ONBOARDING.md` §2 has the full map).
- **Root layout.** `src/app/layout.tsx` renders the `<html>`/`<body>` shell, loads
  fonts, and draws the shared header/footer. It is `async` because it fetches the
  sport list for the header menu; the same fetch is memoized for the page.
- **`params` is a Promise.** In Next 16 you must `await` it:

  ```tsx
  // src/app/matches/[id]/page.tsx:11-16
  export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  ```

- **Caching with `revalidate`.** `export const revalidate = 60` (`page.tsx:7`)
  tells Next to serve a cached version for 60 seconds before refetching. The fetch
  wrapper sets the same window (`client.ts:25,29`).
- **`next/link`** does client-side navigation without a full page reload
  (`MatchCard.tsx:43`). **`next/image`** optimizes images (`MatchCard.tsx:27`);
  remote hosts must be allow-listed in `next.config.ts:4-11`.
- **`next/navigation`** exposes helpers like `notFound()`
  (`matches/[id]/page.tsx:2,27`), which renders the 404 page.
- **Environment/commands.** `npm run dev` starts a hot-reloading server; `npm run
  build` produces the production bundle. See the README.

## 8. Lists and conditional output

To render a list, `map` over an array and give each element a **stable, unique
`key`**:

```tsx
// src/components/LiveBrowser.tsx:144-146
{group.matches.map((match) => (
  <MatchCard key={match.id} match={match} />
))}
```

React uses `key` to match elements between renders. An unstable or duplicated key
causes elements to be reused for the wrong data. TVApp hits a subtle version of
this: stream `id`s repeat across sources, so it keys by a composite:

```tsx
// src/components/MatchStreams.tsx:8-10, 36-39
export function streamKey(stream: Stream): string {
  return `${stream.source}:${stream.id}:${stream.streamNo}`;
}
// ...
<li key={key}>
```

Conditional output is just JavaScript. `LiveBrowser` shows a "no results" message
when filtering leaves nothing (`LiveBrowser.tsx:102-105`), and `MatchStreams`
omits the player when nothing is selected with
`{selected ? <StreamPlayer … /> : null}` (`MatchStreams.tsx:32`).

## 9. TypeScript in this repo

TypeScript adds types to JavaScript. Two ideas cover almost everything here:

- **Interfaces describe data shapes.** `src/lib/streamed/types.ts` defines
  `APIMatch`, `Stream`, `Sport`, and `MatchSource` (`:1-39`). They are the
  contract between the API and the UI.
- **Generics let functions stay flexible but typed.** `streamedFetch<T>` returns
  `Promise<T>` (`client.ts:23-26`); callers choose `T`, e.g.
  `streamedFetch<APIMatch[]>` (`matches.ts:14`).

The `@/*` import alias (`tsconfig.json:21-23`) maps to `src/*`, so
`@/lib/streamed/matches` means `src/lib/streamed/matches.ts`. Types are erased at
runtime — they describe the API but do not validate its responses.

## 10. Concept → file cross-reference

| Concept | Read this file | Specific spot |
|---|---|---|
| Component function | `src/components/MatchCard.tsx` | `:38` |
| Props | `src/components/StreamPlayer.tsx` | `:7` |
| State (`useState`) | `src/components/MatchStreams.tsx` | `:13-15` |
| Controlled input | `src/components/LiveBrowser.tsx` | `:76-83` |
| Derived value (`useMemo`) | `src/components/LiveBrowser.tsx` | `:21-24` |
| Client boundary (`"use client"`) | `src/components/LiveBrowser.tsx` | `:1` |
| Effect subscription (`useEffect`) | `src/components/LiveBrowser.tsx` | `:41-63` |
| Async server page | `src/app/page.tsx` | `:8-20` |
| Dynamic route + `await params` | `src/app/matches/[id]/page.tsx` | `:11-16` |
| File-based routing | `src/app/sports/[sport]/page.tsx` | whole file |
| Root layout & fonts | `src/app/layout.tsx` | `:1-29` |
| Lists and keys | `src/components/LiveBrowser.tsx` | `:144-146` |
| Pure, testable logic | `src/lib/live.ts` | `:33-70` |
| Data fetching seam | `src/lib/streamed/client.ts` | `:23-43` |
| Data types | `src/lib/streamed/types.ts` | `:1-39` |
| Testing pattern | `src/lib/__tests__/live.test.ts` | whole file |

## 11. Exercises

Each is small and does **not** require the API to be reachable; use `npm run dev`.

1. **Change card text.** In `src/components/MatchCard.tsx:64-68`, change the
   source-count label to `"N feeds"`. Observe the home page update via hot reload.
   *Teaches: editing a shared presentational component and JSX expressions.*
2. **Reorder the sport pills.** In `src/components/SportFilter.tsx`, give the
   "Live" link a different label. Observe it on a `/sports/[sport]` page.
   *Teaches: props and presentational components.*
3. **Trace a value.** Open `src/lib/streamed/matches.ts:6-8` and predict the output
   for `matchesPath("hockey", true)`, then check the equivalent assertion style in
   `__tests__/paths.test.ts`. *Teaches: pure functions and unit tests.*
4. **Change the ordering.** In `src/lib/live.ts:26-31`, make `compareMatches` sort
   by start time only (drop the popular-first rule) and watch the home sections
   reorder. Then add a case to `src/lib/__tests__/live.test.ts`. *Teaches: pure
   derivation and how one small function drives the whole board.*
5. **Add a test.** Add a case for `matchesPath("live", true)` to
   `src/lib/streamed/__tests__/paths.test.ts` and run `npm test`. *Teaches: the
   test loop.*
6. **Follow the player.** In `src/components/StreamPlayer.tsx:26-34`, identify
   which value becomes the iframe's `src`, and find where that field is populated
   in `src/lib/streamed/types.ts`. *Teaches: tracing data across files.*

## 12. Further reading

- Next.js App Router: <https://nextjs.org/docs/app>
- Server vs Client Components: <https://nextjs.org/docs/app/building-your-application/rendering>
- React "Thinking in React": <https://react.dev/learn/thinking-in-react>
- Within the repo: re-read [`ONBOARDING.md`](./ONBOARDING.md) §6 now that the
  constructs above are explained; then read `src/components/LiveBrowser.tsx` and
  `src/components/MatchStreams.tsx` end to end as your first "real" client
  components.
