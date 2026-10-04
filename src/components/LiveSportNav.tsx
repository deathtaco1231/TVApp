"use client";

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
            <li key={group.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onJump(group.id)}
                aria-current={active ? "true" : undefined}
                className={
                  active
                    ? "flex w-full items-center justify-between gap-3 rounded-lg bg-foreground px-3 py-1.5 text-sm whitespace-nowrap text-background"
                    : "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap text-zinc-600 transition hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
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
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
