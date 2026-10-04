import Link from "next/link";

import type { Sport } from "@/lib/streamed/types";

function pill(active: boolean): string {
  const base =
    "rounded-full border px-3 py-1 text-sm transition whitespace-nowrap";
  return active
    ? `${base} border-transparent bg-foreground text-background`
    : `${base} border-black/10 text-zinc-600 hover:border-black/30 dark:border-white/15 dark:text-zinc-300 dark:hover:border-white/40`;
}

export function SportFilter({
  sports,
  activeSport,
}: {
  sports: Sport[];
  activeSport?: string;
}) {
  return (
    <nav aria-label="Filter by sport" className="flex flex-wrap gap-2">
      <Link href="/" className={pill(!activeSport)}>
        Live
      </Link>
      {sports.map((sport) => (
        <Link
          key={sport.id}
          href={`/sports/${sport.id}`}
          className={pill(activeSport === sport.id)}
        >
          {sport.name}
        </Link>
      ))}
    </nav>
  );
}
