"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { LiveSportNav } from "@/components/LiveSportNav";
import { MatchCard } from "@/components/MatchCard";
import { buildSportGroups } from "@/lib/live";
import type { APIMatch, Sport } from "@/lib/streamed/types";

export function LiveBrowser({
  matches,
  sports,
}: {
  matches: APIMatch[];
  sports: Sport[];
}) {
  const [query, setQuery] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const groups = useMemo(
    () => buildSportGroups(matches, sports, query, popularOnly),
    [matches, sports, query, popularOnly],
  );

  const groupIds = groups.map((group) => group.id).join(",");
  const firstGroupId = groups[0]?.id ?? null;

  const highlightedId =
    activeId && groups.some((group) => group.id === activeId)
      ? activeId
      : firstGroupId;

  const totalVisible = groups.reduce(
    (sum, group) => sum + group.matches.length,
    0,
  );

  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    if (sectionRefs.current.size === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        const first = visible[0];
        if (first) {
          setActiveId(first.target.id.replace(/^sport-/, ""));
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    sectionRefs.current.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [groupIds]);

  const handleJump = (id: string) => {
    setActiveId(id);
    sectionRefs.current.get(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search teams, matches, or sports..."
          aria-label="Search live matches"
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:border-black/40 sm:max-w-sm dark:border-white/15 dark:bg-zinc-900 dark:focus:border-white/40"
        />

        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={popularOnly}
            onChange={(event) => setPopularOnly(event.target.checked)}
            className="size-4 rounded border-black/20 accent-foreground dark:border-white/20"
          />
          Popular only
        </label>
      </div>

      <p className="mt-3 text-sm text-zinc-500" aria-live="polite">
        {totalVisible} match{totalVisible === 1 ? "" : "es"}
        {query ? ` for "${query}"` : ""}
        {popularOnly ? " · popular only" : ""}
      </p>

      {groups.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
          No live matches match your filters.
        </p>
      ) : (
        <div className="mt-6 lg:grid lg:grid-cols-[200px_1fr] lg:gap-8">
          <aside className="sticky top-0 z-10 -mx-4 border-b border-black/10 bg-background/85 px-4 py-2 backdrop-blur lg:top-6 lg:z-auto lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
            <LiveSportNav
              groups={groups}
              activeId={highlightedId}
              onJump={handleJump}
            />
          </aside>

          <div className="mt-6 flex flex-col gap-10 lg:mt-0">
            {groups.map((group) => (
              <section
                key={group.id}
                id={`sport-${group.id}`}
                aria-labelledby={`sport-${group.id}-heading`}
                className="scroll-mt-24"
                ref={(element) => {
                  if (element) {
                    sectionRefs.current.set(group.id, element);
                  } else {
                    sectionRefs.current.delete(group.id);
                  }
                }}
              >
                <div className="flex items-baseline justify-between">
                  <h2
                    id={`sport-${group.id}-heading`}
                    className="text-lg font-semibold tracking-tight"
                  >
                    {group.name}
                  </h2>
                  <span className="text-xs text-zinc-500">
                    {group.matches.length}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
