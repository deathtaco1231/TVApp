import { MatchBrowser } from "@/components/MatchBrowser";
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 2xl:max-w-[1600px]">
      <h1 className="text-2xl font-semibold tracking-tight">
        Today&apos;s matches
      </h1>

      <div className="mt-6">
        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-600 dark:text-red-400">
            Could not reach the Streamed API: {error}
          </p>
        ) : (
          <MatchBrowser matches={matches} sports={sports} grouped onlyToday />
        )}
      </div>
    </div>
  );
}
