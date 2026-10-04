import type { APIMatch, Sport } from "@/lib/streamed/types";

export interface SportGroup {
  id: string;
  name: string;
  matches: APIMatch[];
}

export type MatchSort = "popular" | "soonest" | "latest" | "sources";

export const SORT_OPTIONS: { value: MatchSort; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "soonest", label: "Soonest" },
  { value: "latest", label: "Latest" },
  { value: "sources", label: "Most sources" },
];

export function sportNameById(sports: Sport[]): Map<string, string> {
  return new Map(sports.map((sport) => [sport.id, sport.name]));
}

export function hasTeamInfo(match: APIMatch): boolean {
  return Boolean(match.teams?.home?.name || match.teams?.away?.name);
}

export function matchSearchText(match: APIMatch, sportName: string): string {
  return [
    match.title,
    match.category,
    sportName,
    match.teams?.home?.name,
    match.teams?.away?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterMatches(
  matches: APIMatch[],
  sports: Sport[],
  query = "",
  popularOnly = false,
): APIMatch[] {
  const names = sportNameById(sports);
  const needle = query.trim().toLowerCase();

  return matches.filter((match) => {
    if (popularOnly && !match.popular) {
      return false;
    }
    if (!needle) {
      return true;
    }
    const name = names.get(match.category) ?? match.category;
    return matchSearchText(match, name).includes(needle);
  });
}

export function sortMatches(
  matches: APIMatch[],
  sort: MatchSort = "popular",
): APIMatch[] {
  const sorted = [...matches];

  switch (sort) {
    case "soonest":
      return sorted.sort((a, b) => a.date - b.date);
    case "latest":
      return sorted.sort((a, b) => b.date - a.date);
    case "sources":
      return sorted.sort(
        (a, b) => b.sources.length - a.sources.length || a.date - b.date,
      );
    case "popular":
    default:
      return sorted.sort(
        (a, b) => Number(b.popular) - Number(a.popular) || a.date - b.date,
      );
  }
}

export function buildSportGroups(
  matches: APIMatch[],
  sports: Sport[],
  query = "",
  popularOnly = false,
  sort: MatchSort = "popular",
): SportGroup[] {
  const names = sportNameById(sports);
  const filtered = filterMatches(matches, sports, query, popularOnly);

  const byCategory = new Map<string, APIMatch[]>();
  for (const match of filtered) {
    const bucket = byCategory.get(match.category);
    if (bucket) {
      bucket.push(match);
    } else {
      byCategory.set(match.category, [match]);
    }
  }

  return Array.from(byCategory.entries())
    .map(([id, groupMatches]) => ({
      id,
      name: names.get(id) ?? id,
      matches: sortMatches(groupMatches, sort),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
