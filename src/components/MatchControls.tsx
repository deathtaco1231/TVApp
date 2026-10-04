"use client";

import { SORT_OPTIONS, type MatchSort } from "@/lib/live";

export function MatchControls({
  popularOnly,
  onPopularOnlyChange,
  sort,
  onSortChange,
}: {
  popularOnly: boolean;
  onPopularOnlyChange: (value: boolean) => void;
  sort: MatchSort;
  onSortChange: (value: MatchSort) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={popularOnly}
          onChange={(event) => onPopularOnlyChange(event.target.checked)}
          className="size-4 rounded border-black/20 accent-foreground dark:border-white/20"
        />
        Popular only
      </label>

      <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        <span className="text-zinc-500">Sort</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as MatchSort)}
          className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-black/40 dark:border-white/15 dark:bg-zinc-900 dark:focus:border-white/40"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
