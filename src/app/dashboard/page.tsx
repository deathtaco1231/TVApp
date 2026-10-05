import { Dashboard } from "@/components/Dashboard";
import { mergeCatalog } from "@/lib/dashboard";
import { getLiveMatches, getTodayMatches } from "@/lib/streamed/matches";
import { getSports } from "@/lib/streamed/sports";
import type { APIMatch, Sport } from "@/lib/streamed/types";

export const revalidate = 60;

export default async function DashboardPage() {
  let matches: APIMatch[] = [];
  let liveMatches: APIMatch[] = [];
  let sports: Sport[] = [];
  let error: string | null = null;

  try {
    const [live, today, fetchedSports] = await Promise.all([
      getLiveMatches(),
      getTodayMatches(),
      getSports(),
    ]);
    liveMatches = live;
    matches = mergeCatalog(live, today);
    sports = fetchedSports;
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.message
        : "Failed to load the stream catalog.";
  }

  return (
    <div className="w-full px-3 py-4 sm:px-4 lg:px-6">
      {error ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-600 dark:text-red-400">
            Could not reach the Streamed API: {error}
          </p>
        </>
      ) : (
        <Dashboard matches={matches} sports={sports} liveMatches={liveMatches} />
      )}
    </div>
  );
}
