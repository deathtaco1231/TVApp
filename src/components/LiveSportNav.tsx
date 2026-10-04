"use client";

import Link from "next/link";

import type { SportGroup } from "@/lib/live";

export function LiveSportNav({
  groups,
  activeId,
  onJump,
}: {
  groups: SportGroup[];
  activeId: string | null;
  onJump: (id: string) => void;
}) {
  return (
    <nav aria-label="Jump to sport">
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {groups.map((group) => {
          const active = group.id === activeId;
          return (
            <li
              key={group.id}
              className="flex shrink-0 items-center gap-1 lg:shrink"
            >
              <button
                type="button"
                onClick={() => onJump(group.id)}
                aria-current={active ? "true" : undefined}
                className={
                  active
                    ? "flex flex-1 items-center justify-between gap-3 rounded-lg bg-foreground px-3 py-1.5 text-sm whitespace-nowrap text-background"
                    : "flex flex-1 items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap text-zinc-600 transition hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
                }
              >
                <span className="truncate">{group.name}</span>
                <span
                  className={
                    active
                      ? "text-xs text-background/70"
                      : "text-xs text-zinc-400"
                  }
                >
                  {group.matches.length}
                </span>
              </button>

              <Link
                href={`/sports/${group.id}`}
                aria-label={`${group.name} full schedule`}
                title={`${group.name} full schedule`}
                className="rounded-md px-2 py-1.5 text-zinc-400 transition hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-100"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M3 10h18" />
                </svg>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
