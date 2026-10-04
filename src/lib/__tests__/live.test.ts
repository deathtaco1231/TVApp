import { buildSportGroups } from "@/lib/live";
import type { APIMatch, Sport } from "@/lib/streamed/types";

function makeMatch(
  overrides: Partial<APIMatch> & Pick<APIMatch, "id" | "category" | "date">,
): APIMatch {
  return {
    title: "Home vs Away",
    popular: false,
    sources: [],
    ...overrides,
  };
}

const sports: Sport[] = [
  { id: "hockey", name: "Hockey" },
  { id: "american-football", name: "American Football" },
];

describe("buildSportGroups", () => {
  it("orders groups alphabetically by sport display name", () => {
    const matches = [
      makeMatch({ id: "h1", category: "hockey", date: 1 }),
      makeMatch({ id: "a1", category: "american-football", date: 2 }),
    ];

    const groups = buildSportGroups(matches, sports);

    expect(groups.map((group) => group.name)).toEqual([
      "American Football",
      "Hockey",
    ]);
  });

  it("sorts popular matches first, then by start time descending", () => {
    const matches = [
      makeMatch({ id: "old", category: "hockey", date: 100 }),
      makeMatch({ id: "popular", category: "hockey", date: 50, popular: true }),
      makeMatch({ id: "new", category: "hockey", date: 200 }),
    ];

    const [group] = buildSportGroups(matches, sports);

    expect(group.matches.map((match) => match.id)).toEqual([
      "popular",
      "new",
      "old",
    ]);
  });

  it("filters by team name and match title, case-insensitively", () => {
    const matches = [
      makeMatch({
        id: "lakers",
        category: "american-football",
        date: 1,
        teams: { home: { name: "Lakers", badge: "l" } },
      }),
      makeMatch({ id: "other", category: "hockey", date: 2 }),
    ];

    const groups = buildSportGroups(matches, sports, "LAKERS");

    expect(groups).toHaveLength(1);
    expect(groups[0].matches.map((match) => match.id)).toEqual(["lakers"]);
  });

  it("filters by sport name", () => {
    const matches = [
      makeMatch({ id: "h1", category: "hockey", date: 1 }),
      makeMatch({ id: "a1", category: "american-football", date: 2 }),
    ];

    const groups = buildSportGroups(matches, sports, "hockey");

    expect(groups.map((group) => group.id)).toEqual(["hockey"]);
  });

  it("filters to popular matches when popularOnly is set", () => {
    const matches = [
      makeMatch({ id: "pop", category: "hockey", date: 1, popular: true }),
      makeMatch({ id: "plain", category: "hockey", date: 2 }),
    ];

    const groups = buildSportGroups(matches, sports, "", true);

    expect(groups[0].matches.map((match) => match.id)).toEqual(["pop"]);
  });

  it("falls back to the category id when a sport is not in the sports list", () => {
    const matches = [makeMatch({ id: "x", category: "cricket", date: 1 })];

    const [group] = buildSportGroups(matches, sports);

    expect(group.name).toBe("cricket");
  });

  it("returns no groups when nothing matches", () => {
    const matches = [makeMatch({ id: "h1", category: "hockey", date: 1 })];

    expect(buildSportGroups(matches, sports, "zzz")).toEqual([]);
  });
});
