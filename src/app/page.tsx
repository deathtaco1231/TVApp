import { LiveBrowser } from "@/components/LiveBrowser";
import { getLiveMatches } from "@/lib/streamed/matches";
import { getSports } from "@/lib/streamed/sports";
import type { APIMatch, Sport } from "@/lib/streamed/types";

export const revalidate = 60;

export default async function HomePage() {
  let matches: APIMatch[] = [];
  let sports: Sport[] = [];
  let error: string | null = null;

  try {
    [matches, sports] = await Promise.all([getLiveMatches(), getSports()]);
  } catch (cause) {
    error =
      cause instanceof Error ? cause.message : "Failed to load live matches.";
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 2xl:max-w-[1600px]">
      <h1 className="text-2xl font-semibold tracking-tight">Live now</h1>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-600 dark:text-red-400">
          Could not reach the Streamed API: {error}
        </p>
      ) : (
        <LiveBrowser matches={matches} sports={sports} />
      )}
    </div>
  );
}
