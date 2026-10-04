"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { LiveBadge } from "@/components/LiveBadge";
import { MatchControls } from "@/components/MatchControls";
import { StreamOptions } from "@/components/StreamOptions";
import { hasKickoff, isSameLocalDay } from "@/lib/dates";
import {
  buildSportGroups,
  hasTeamInfo,
  sportNameById,
  type MatchSort,
} from "@/lib/live";
import { badgeUrl } from "@/lib/streamed/images";
import { getStreamsForSources } from "@/lib/streamed/streams";
import type { APIMatch, Sport, Stream } from "@/lib/streamed/types";

function formatKickoff(date: number): string {
  if (!hasKickoff(date)) {
    return "TBD";
  }
  return new Date(date).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStartTime(date: number): string {
  if (!hasKickoff(date)) {
    return "";
  }
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TeamBadge({ badge, name }: { badge?: string; name?: string }) {
  if (!badge) {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black/10 text-[10px] text-zinc-500 dark:bg-white/10">
        {name?.charAt(0) ?? "?"}
      </span>
    );
  }

  return (
    <Image
      src={badgeUrl(badge)}
      alt={name ?? "Team badge"}
      width={24}
      height={24}
      className="size-6 shrink-0 object-contain"
      unoptimized
    />
  );
}

function MatchRow({
  match,
  live,
  now,
  onSelect,
}: {
  match: APIMatch;
  live: boolean;
  now: number;
  onSelect: (match: APIMatch) => void;
}) {
  const home = match.teams?.home;
  const away = match.teams?.away;
  const showTeams = hasTeamInfo(match);

  return (
    <button
      type="button"
      onClick={() => onSelect(match)}
      className="flex w-full flex-col gap-2 rounded-lg border border-black/10 px-3 py-2 text-left transition hover:border-black/30 hover:shadow-sm dark:border-white/15 dark:hover:border-white/40"
    >
      {showTeams ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TeamBadge badge={home?.badge} name={home?.name} />
            <span className="truncate text-sm font-medium">
              {home?.name ?? "TBD"}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-zinc-400">vs</span>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <span className="truncate text-right text-sm font-medium">
              {away?.name ?? "TBD"}
            </span>
            <TeamBadge badge={away?.badge} name={away?.name} />
          </div>
        </div>
      ) : (
        <span className="line-clamp-2 text-sm font-medium">{match.title}</span>
      )}

      <span className="flex items-center justify-between gap-2 text-xs text-zinc-500">
        <span className="flex min-w-0 items-center gap-1.5">
          {live ? (
            <>
              <LiveBadge />
              {hasKickoff(match.date) ? (
                <>
                  <span className="text-zinc-400" aria-hidden>
                    ·
                  </span>
                  <span className="truncate">
                    {isSameLocalDay(match.date, now)
                      ? formatStartTime(match.date)
                      : formatKickoff(match.date)}
                  </span>
                </>
              ) : null}
            </>
          ) : (
            <span className="truncate">{formatKickoff(match.date)}</span>
          )}
        </span>
        <span className="shrink-0">
          {match.sources.length} source{match.sources.length === 1 ? "" : "s"}
          {match.popular ? (
            <>
              {" · "}
              <span className="text-amber-500">Popular</span>
            </>
          ) : null}
        </span>
      </span>
    </button>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={
        open
          ? "size-3.5 shrink-0 text-zinc-500 transition group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
          : "size-3.5 shrink-0 -rotate-90 text-zinc-500 transition group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
      }
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function AddStreamPanel({
  matches,
  sports,
  liveIds,
  addedKeys,
  onAdd,
  onClose,
}: {
  matches: APIMatch[];
  sports: Sport[];
  liveIds: Set<string>;
  addedKeys: Set<string>;
  onAdd: (match: APIMatch, stream: Stream) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
  const [sort, setSort] = useState<MatchSort>("popular");
  const [selectedMatch, setSelectedMatch] = useState<APIMatch | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(),
  );

  const [now] = useState(() => Date.now());
  const names = useMemo(() => sportNameById(sports), [sports]);
  const offered = useMemo(
    () =>
      matches.filter(
        (match) => liveIds.has(match.id) || isSameLocalDay(match.date, now),
      ),
    [matches, liveIds, now],
  );
  const groups = useMemo(
    () => buildSportGroups(offered, sports, query, popularOnly, sort),
    [offered, sports, query, popularOnly, sort],
  );
  const total = groups.reduce((sum, group) => sum + group.matches.length, 0);
  const searching = query.trim().length > 0;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSelectMatch(match: APIMatch) {
    setSelectedMatch(match);
    setStreams([]);
    setLoading(true);
    try {
      setStreams(await getStreamsForSources(match.sources));
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(stream: Stream) {
    if (!selectedMatch) {
      return;
    }
    onAdd(selectedMatch, stream);
    setSelectedMatch(null);
    setStreams([]);
  }

  function toggleGroup(id: string) {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function expandAll() {
    setCollapsedIds(new Set());
  }

  function collapseAll() {
    setCollapsedIds(new Set(groups.map((group) => group.id)));
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add a stream"
        className="relative flex h-full w-full max-w-md flex-col border-l border-black/10 bg-background shadow-xl dark:border-white/15"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
          <h2 className="text-sm font-semibold tracking-tight">
            {selectedMatch ? "Choose a stream" : "Add a stream"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-100"
          >
            Close
          </button>
        </div>

        {selectedMatch ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setSelectedMatch(null);
                  setStreams([]);
                }}
                className="text-sm text-zinc-500 hover:underline"
              >
                &larr; All matches
              </button>
              <p className="mt-2 font-medium">{selectedMatch.title}</p>
              <p className="text-xs text-zinc-500">
                {names.get(selectedMatch.category) ?? selectedMatch.category}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {loading ? (
                <p className="text-sm text-zinc-500">Loading streams…</p>
              ) : (
                <StreamOptions
                  streams={streams}
                  disabledKeys={addedKeys}
                  onSelect={handleAdd}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-col gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search teams, matches, or sports…"
                aria-label="Search matches"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:border-black/40 focus-visible:ring-2 focus-visible:ring-foreground/40 dark:border-white/15 dark:bg-zinc-900 dark:focus:border-white/40"
              />
              <MatchControls
                popularOnly={popularOnly}
                onPopularOnlyChange={setPopularOnly}
                sort={sort}
                onSortChange={setSort}
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-zinc-500" aria-live="polite">
                  {total} match{total === 1 ? "" : "es"}
                  {query ? ` for "${query}"` : ""}
                  {popularOnly ? " · popular only" : ""}
                </p>
                {groups.length > 0 ? (
                  <div className="flex shrink-0 items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={expandAll}
                      className="text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      Expand all
                    </button>
                    <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={collapseAll}
                      className="text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      Collapse all
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4">
              {groups.length === 0 ? (
                <p className="rounded-lg border border-dashed border-black/15 p-6 text-center text-sm text-zinc-500 dark:border-white/15">
                  No matches match your filters.
                </p>
              ) : (
                <div className="flex flex-col gap-6 py-3">
                  {groups.map((group) => {
                    const isOpen = searching || !collapsedIds.has(group.id);
                    const panelId = `sport-panel-${group.id}`;
                    return (
                      <section key={group.id}>
                        <div className="sticky top-0 z-10 -mx-4 border-b border-black/10 bg-zinc-100 px-4 py-1.5 dark:border-white/10 dark:bg-zinc-900">
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.id)}
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            className="group flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/15"
                          >
                            <span className="flex min-w-0 items-center gap-1.5">
                              <Chevron open={isOpen} />
                              <span className="truncate text-xs font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
                                {group.name}
                              </span>
                            </span>
                            <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                              {group.matches.length}
                            </span>
                          </button>
                        </div>
                        {isOpen ? (
                          <ul
                            id={panelId}
                            className="mt-2 flex flex-col gap-2"
                          >
                            {group.matches.map((match) => (
                              <li key={match.id}>
                                <MatchRow
                                  match={match}
                                  live={liveIds.has(match.id)}
                                  now={now}
                                  onSelect={handleSelectMatch}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
