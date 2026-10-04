import { streamedFetch } from "./client";
import type { APIMatch } from "./types";

export type MatchFilter = "all" | "all-today" | "live" | (string & {});

export function matchesPath(filter: MatchFilter, popular = false): string {
  return popular ? `/matches/${filter}/popular` : `/matches/${filter}`;
}

export function getMatches(
  filter: MatchFilter,
  popular = false,
): Promise<APIMatch[]> {
  return streamedFetch<APIMatch[]>(matchesPath(filter, popular));
}

export function getMatchesBySport(
  sport: string,
  popular = false,
): Promise<APIMatch[]> {
  return getMatches(sport, popular);
}

export function getLiveMatches(popular = false): Promise<APIMatch[]> {
  return getMatches("live", popular);
}

export function getTodayMatches(popular = false): Promise<APIMatch[]> {
  return getMatches("all-today", popular);
}

export function getAllMatches(popular = false): Promise<APIMatch[]> {
  return getMatches("all", popular);
}

export function findMatchById(
  matches: APIMatch[],
  id: string,
): APIMatch | undefined {
  return matches.find((match) => match.id === id);
}
