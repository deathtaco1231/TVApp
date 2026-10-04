"use client";

import { SORT_OPTIONS, type MatchSort } from "@/lib/live";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

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
      <button
        type="button"
        onClick={() => onPopularOnlyChange(!popularOnly)}
        aria-pressed={popularOnly}
        className={
          popularOnly
            ? "inline-flex items-center gap-1.5 rounded-lg border border-transparent bg-foreground px-3 py-1.5 text-sm font-medium text-background transition active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            : "inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:border-black/30 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 dark:border-white/15 dark:text-zinc-300 dark:hover:border-white/40"
        }
      >
        {popularOnly ? <CheckIcon /> : null}
        Popular only
      </button>

      <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        <span className="text-zinc-500">Sort</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as MatchSort)}
          className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-black/40 focus-visible:ring-2 focus-visible:ring-foreground/40 dark:border-white/15 dark:bg-zinc-900 dark:focus:border-white/40"
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
