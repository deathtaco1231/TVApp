"use client";

import { useMemo, useState } from "react";

import { MatchCard } from "@/components/MatchCard";
import { MatchControls } from "@/components/MatchControls";
import {
  buildSportGroups,
  filterMatches,
  sortMatches,
  type MatchSort,
} from "@/lib/live";
import type { APIMatch, Sport } from "@/lib/streamed/types";

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

export function MatchBrowser({
  matches,
  sports,
  grouped = false,
}: {
  matches: APIMatch[];
  sports: Sport[];
  grouped?: boolean;
}) {
  const [popularOnly, setPopularOnly] = useState(false);
  const [sort, setSort] = useState<MatchSort>("popular");

  const filtered = useMemo(
    () => filterMatches(matches, sports, "", popularOnly),
    [matches, sports, popularOnly],
  );

  const groups = useMemo(
    () => (grouped ? buildSportGroups(filtered, sports, "", false, sort) : []),
    [grouped, filtered, sports, sort],
  );

  const flat = useMemo(
    () => (grouped ? [] : sortMatches(filtered, sort)),
    [grouped, filtered, sort],
  );

  const totalVisible = grouped
    ? groups.reduce((sum, group) => sum + group.matches.length, 0)
    : flat.length;

  return (
    <div className="flex flex-col gap-4">
      <MatchControls
        popularOnly={popularOnly}
        onPopularOnlyChange={setPopularOnly}
        sort={sort}
        onSortChange={setSort}
      />

      {popularOnly ? (
        <p className="text-sm text-zinc-500" aria-live="polite">
          {totalVisible} match{totalVisible === 1 ? "" : "es"} · popular only
        </p>
      ) : null}

      {totalVisible === 0 ? (
        <p className="rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
          No matches match your filters.
        </p>
      ) : grouped ? (
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <section
              key={group.id}
              id={`sport-${group.id}`}
              aria-labelledby={`sport-${group.id}-heading`}
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

              <div className={`mt-4 ${GRID}`}>
                {group.matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={GRID}>
          {flat.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
