import { MatchCard } from "@/components/MatchCard";
import { SportFilter } from "@/components/SportFilter";
import { getMatchesBySport } from "@/lib/streamed/matches";
import { getSports } from "@/lib/streamed/sports";
import type { APIMatch, Sport } from "@/lib/streamed/types";

export const revalidate = 60;

export default async function SportPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport } = await params;

  let matches: APIMatch[] = [];
  let sports: Sport[] = [];
  let error: string | null = null;

  try {
    [matches, sports] = await Promise.all([
      getMatchesBySport(sport),
      getSports(),
    ]);
  } catch (cause) {
    error =
      cause instanceof Error ? cause.message : "Failed to load this sport.";
  }

  const sportName =
    sports.find((entry) => entry.id === sport)?.name ?? sport;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <SportFilter sports={sports} activeSport={sport} />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight capitalize">
        {sportName}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {matches.length} match{matches.length === 1 ? "" : "es"} available.
      </p>

      <div className="mt-6">
        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-600 dark:text-red-400">
            Could not reach the Streamed API: {error}
          </p>
        ) : matches.length === 0 ? (
          <p className="rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
            No {sportName} matches are scheduled right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
