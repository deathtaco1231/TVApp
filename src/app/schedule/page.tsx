import { MatchCard } from "@/components/MatchCard";
import { buildSportGroups } from "@/lib/live";
import { getTodayMatches } from "@/lib/streamed/matches";
import { getSports } from "@/lib/streamed/sports";
import type { APIMatch, Sport } from "@/lib/streamed/types";

export const revalidate = 60;

export default async function SchedulePage() {
  let matches: APIMatch[] = [];
  let sports: Sport[] = [];
  let error: string | null = null;

  try {
    [matches, sports] = await Promise.all([getTodayMatches(), getSports()]);
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.message
        : "Failed to load today's matches.";
  }

  const groups = buildSportGroups(matches, sports);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Today&apos;s matches
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {matches.length} match{matches.length === 1 ? "" : "es"} scheduled across{" "}
        {groups.length} sport{groups.length === 1 ? "" : "s"}.
      </p>

      <div className="mt-6">
        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-600 dark:text-red-400">
            Could not reach the Streamed API: {error}
          </p>
        ) : groups.length === 0 ? (
          <p className="rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
            No matches are scheduled for today.
          </p>
        ) : (
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

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
