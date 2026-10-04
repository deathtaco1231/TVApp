import type { APIMatch, Sport } from "@/lib/streamed/types";

export interface SportGroup {
  id: string;
  name: string;
  matches: APIMatch[];
}

export function sportNameById(sports: Sport[]): Map<string, string> {
  return new Map(sports.map((sport) => [sport.id, sport.name]));
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

export function compareMatches(a: APIMatch, b: APIMatch): number {
  if (a.popular !== b.popular) {
    return a.popular ? -1 : 1;
  }
  return b.date - a.date;
}

export function buildSportGroups(
  matches: APIMatch[],
  sports: Sport[],
  query = "",
  popularOnly = false,
): SportGroup[] {
  const names = sportNameById(sports);
  const needle = query.trim().toLowerCase();

  const filtered = matches.filter((match) => {
    if (popularOnly && !match.popular) {
      return false;
    }
    if (!needle) {
      return true;
    }
    const name = names.get(match.category) ?? match.category;
    return matchSearchText(match, name).includes(needle);
  });

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
      matches: groupMatches.sort(compareMatches),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
