import {
  buildSportGroups,
  filterMatches,
  hasTeamInfo,
  sortMatches,
} from "@/lib/live";
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

  it("sorts popular matches first, then by soonest start time", () => {
    const matches = [
      makeMatch({ id: "old", category: "hockey", date: 100 }),
      makeMatch({ id: "popular", category: "hockey", date: 50, popular: true }),
      makeMatch({ id: "new", category: "hockey", date: 200 }),
    ];

    const [group] = buildSportGroups(matches, sports);

    expect(group.matches.map((match) => match.id)).toEqual([
      "popular",
      "old",
      "new",
    ]);
  });

  it("sorts each group with the requested sort", () => {
    const matches = [
      makeMatch({ id: "later", category: "hockey", date: 200 }),
      makeMatch({ id: "earlier", category: "hockey", date: 100 }),
    ];

    const [group] = buildSportGroups(matches, sports, "", false, "soonest");

    expect(group.matches.map((match) => match.id)).toEqual([
      "earlier",
      "later",
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

describe("filterMatches", () => {
  it("returns all matches when no filters are set", () => {
    const matches = [
      makeMatch({ id: "h1", category: "hockey", date: 1 }),
      makeMatch({ id: "a1", category: "american-football", date: 2 }),
    ];

    expect(filterMatches(matches, sports)).toHaveLength(2);
  });

  it("keeps only popular matches when popularOnly is set", () => {
    const matches = [
      makeMatch({ id: "pop", category: "hockey", date: 1, popular: true }),
      makeMatch({ id: "plain", category: "hockey", date: 2 }),
    ];

    expect(filterMatches(matches, sports, "", true).map((m) => m.id)).toEqual([
      "pop",
    ]);
  });

  it("matches the query against the resolved sport name", () => {
    const matches = [
      makeMatch({ id: "h1", category: "hockey", date: 1 }),
      makeMatch({ id: "a1", category: "american-football", date: 2 }),
    ];

    expect(filterMatches(matches, sports, "hockey").map((m) => m.id)).toEqual([
      "h1",
    ]);
  });
});

describe("sortMatches", () => {
  const matches = [
    makeMatch({
      id: "mid",
      category: "hockey",
      date: 200,
      sources: [{ source: "alpha", id: "a" }],
    }),
    makeMatch({
      id: "newest",
      category: "hockey",
      date: 300,
      popular: true,
      sources: [{ source: "alpha", id: "a" }],
    }),
    makeMatch({
      id: "oldest",
      category: "hockey",
      date: 100,
      sources: [
        { source: "alpha", id: "a" },
        { source: "bravo", id: "b" },
        { source: "charlie", id: "c" },
      ],
    }),
  ];

  it("orders soonest first", () => {
    expect(sortMatches(matches, "soonest").map((m) => m.id)).toEqual([
      "oldest",
      "mid",
      "newest",
    ]);
  });

  it("orders latest first", () => {
    expect(sortMatches(matches, "latest").map((m) => m.id)).toEqual([
      "newest",
      "mid",
      "oldest",
    ]);
  });

  it("orders by most sources, then soonest", () => {
    expect(sortMatches(matches, "sources").map((m) => m.id)).toEqual([
      "oldest",
      "mid",
      "newest",
    ]);
  });

  it("orders popular first by default, then soonest", () => {
    expect(sortMatches(matches).map((m) => m.id)).toEqual([
      "newest",
      "oldest",
      "mid",
    ]);
  });

  it("does not mutate the input array", () => {
    const original = [...matches];
    sortMatches(matches, "latest");
    expect(matches).toEqual(original);
  });
});

describe("hasTeamInfo", () => {
  it("is false for title-only matches with no teams", () => {
    const match = makeMatch({ id: "nfl", category: "american-football", date: 1 });

    expect(hasTeamInfo(match)).toBe(false);
  });

  it("is true when a home team is present", () => {
    const match = makeMatch({
      id: "home",
      category: "hockey",
      date: 1,
      teams: { home: { name: "Lakers", badge: "l" } },
    });

    expect(hasTeamInfo(match)).toBe(true);
  });

  it("is true when only an away team is present", () => {
    const match = makeMatch({
      id: "away",
      category: "hockey",
      date: 1,
      teams: { away: { name: "Celtics", badge: "c" } },
    });

    expect(hasTeamInfo(match)).toBe(true);
  });

  it("is false when team entries exist but have no name", () => {
    const match = makeMatch({
      id: "blank",
      category: "hockey",
      date: 1,
      teams: { home: { name: "", badge: "" } },
    });

    expect(hasTeamInfo(match)).toBe(false);
  });
});
