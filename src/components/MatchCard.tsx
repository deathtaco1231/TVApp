import Image from "next/image";
import Link from "next/link";

import { badgeUrl } from "@/lib/streamed/images";
import type { APIMatch } from "@/lib/streamed/types";

function formatKickoff(date: number): string {
  return new Date(date).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TeamBadge({ badge, name }: { badge?: string; name?: string }) {
  if (!badge) {
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-black/10 text-xs text-zinc-500 dark:bg-white/10">
        {name?.charAt(0) ?? "?"}
      </span>
    );
  }

  return (
    <Image
      src={badgeUrl(badge)}
      alt={name ?? "Team badge"}
      width={32}
      height={32}
      className="size-8 object-contain"
      unoptimized
    />
  );
}

export function MatchCard({ match }: { match: APIMatch }) {
  const home = match.teams?.home;
  const away = match.teams?.away;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 transition hover:border-black/30 hover:shadow-sm dark:border-white/15 dark:bg-zinc-900 dark:hover:border-white/40"
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500">
        <span>{match.category}</span>
        {match.popular ? <span className="text-amber-500">Popular</span> : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TeamBadge badge={home?.badge} name={home?.name} />
          <span className="truncate text-sm font-medium">{home?.name ?? match.title}</span>
        </div>
        <span className="text-xs font-semibold text-zinc-400">vs</span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-medium">{away?.name ?? ""}</span>
          <TeamBadge badge={away?.badge} name={away?.name} />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
        <span>{formatKickoff(match.date)}</span>
        <span>
          {match.sources.length} source{match.sources.length === 1 ? "" : "s"}
        </span>
      </div>
    </Link>
  );
}
