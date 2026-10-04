import {
  addWidget,
  createWidget,
  DASHBOARD_VERSION,
  findNextSlot,
  mergeCatalog,
  parseDashboard,
  removeWidget,
  serializeDashboard,
  streamSelectionKey,
  updateWidgetLayout,
  updateWidgetStream,
  updateWidgetsLayout,
  type DashboardWidget,
  type WidgetLayout,
} from "@/lib/dashboard";
import type { APIMatch, Stream } from "@/lib/streamed/types";

function makeMatch(
  overrides: Partial<APIMatch> & Pick<APIMatch, "id" | "category">,
): APIMatch {
  return {
    title: "Home vs Away",
    date: 1,
    popular: false,
    sources: [],
    ...overrides,
  };
}

function makeStream(overrides: Partial<Stream> = {}): Stream {
  return {
    id: "s1",
    streamNo: 1,
    language: "English",
    hd: true,
    embedUrl: "https://embed.example/stream",
    source: "alpha",
    ...overrides,
  };
}

function makeWidget(
  overrides: Partial<DashboardWidget> = {},
): DashboardWidget {
  return {
    id: "w1",
    matchId: "m1",
    title: "Home vs Away",
    category: "hockey",
    source: "alpha",
    streamId: "s1",
    streamNo: 1,
    language: "English",
    hd: true,
    embedUrl: "https://embed.example/stream",
    layout: { x: 0, y: 0, w: 4, h: 5 },
    ...overrides,
  };
}

describe("streamSelectionKey", () => {
  it("combines match, source, stream id, and stream number", () => {
    expect(
      streamSelectionKey({
        matchId: "m1",
        source: "alpha",
        streamId: "s1",
        streamNo: 2,
      }),
    ).toBe("m1::alpha::s1::2");
  });
});

describe("createWidget", () => {
  it("maps match and stream fields into a widget", () => {
    const widget = createWidget(
      makeMatch({ id: "m9", category: "football", title: "A vs B" }),
      makeStream({ source: "bravo", id: "x", streamNo: 3, hd: false }),
      { x: 4, y: 0, w: 4, h: 5 },
      "w9",
    );

    expect(widget).toEqual({
      id: "w9",
      matchId: "m9",
      title: "A vs B",
      category: "football",
      source: "bravo",
      streamId: "x",
      streamNo: 3,
      language: "English",
      hd: false,
      embedUrl: "https://embed.example/stream",
      layout: { x: 4, y: 0, w: 4, h: 5 },
    });
  });
});

describe("addWidget", () => {
  it("appends a new widget", () => {
    const result = addWidget([], makeWidget());

    expect(result).toHaveLength(1);
  });

  it("ignores a duplicate instance id", () => {
    const existing = makeWidget();
    const duplicate = makeWidget({ streamId: "other", streamNo: 2 });

    expect(addWidget([existing], duplicate)).toEqual([existing]);
  });

  it("ignores a duplicate stream selection", () => {
    const existing = makeWidget();
    const duplicate = makeWidget({ id: "w2" });

    expect(addWidget([existing], duplicate)).toEqual([existing]);
  });

  it("allows the same match with a different stream", () => {
    const existing = makeWidget();
    const other = makeWidget({ id: "w2", streamId: "s2", streamNo: 2 });

    expect(addWidget([existing], other)).toHaveLength(2);
  });
});

describe("removeWidget", () => {
  it("removes only the matching widget", () => {
    const widgets = [makeWidget(), makeWidget({ id: "w2", streamId: "s2" })];

    expect(removeWidget(widgets, "w1").map((w) => w.id)).toEqual(["w2"]);
  });
});

describe("updateWidgetLayout", () => {
  it("replaces the layout of the matching widget", () => {
    const widgets = [makeWidget(), makeWidget({ id: "w2", streamId: "s2" })];
    const layout: WidgetLayout = { x: 6, y: 2, w: 5, h: 6 };

    const result = updateWidgetLayout(widgets, "w2", layout);

    expect(result[0].layout).toEqual({ x: 0, y: 0, w: 4, h: 5 });
    expect(result[1].layout).toEqual(layout);
  });
});

describe("updateWidgetsLayout", () => {
  it("applies many layouts at once and leaves others untouched", () => {
    const widgets = [makeWidget(), makeWidget({ id: "w2", streamId: "s2" })];

    const result = updateWidgetsLayout(widgets, [
      { id: "w2", layout: { x: 6, y: 3, w: 5, h: 6 } },
    ]);

    expect(result[0].layout).toEqual({ x: 0, y: 0, w: 4, h: 5 });
    expect(result[1].layout).toEqual({ x: 6, y: 3, w: 5, h: 6 });
  });

  it("returns the same array when given no layouts", () => {
    const widgets = [makeWidget()];

    expect(updateWidgetsLayout(widgets, [])).toBe(widgets);
  });
});

describe("updateWidgetStream", () => {
  it("swaps stream fields while keeping id and layout", () => {
    const widgets = [makeWidget()];

    const result = updateWidgetStream(
      widgets,
      "w1",
      makeStream({
        source: "charlie",
        id: "c9",
        streamNo: 4,
        language: "Spanish",
        hd: false,
        embedUrl: "https://embed.example/c9",
      }),
    );

    expect(result[0]).toEqual({
      ...makeWidget(),
      source: "charlie",
      streamId: "c9",
      streamNo: 4,
      language: "Spanish",
      hd: false,
      embedUrl: "https://embed.example/c9",
    });
  });
});

describe("findNextSlot", () => {
  it("places the first widget at the origin", () => {
    expect(findNextSlot([])).toEqual({ x: 0, y: 0, w: 4, h: 5 });
  });

  it("fills the next column on the same row", () => {
    const widgets = [makeWidget()];

    expect(findNextSlot(widgets)).toEqual({ x: 4, y: 0, w: 4, h: 5 });
  });

  it("wraps to the next row when the current row is full", () => {
    const widgets = [
      makeWidget({ id: "w1", streamId: "s1", layout: { x: 0, y: 0, w: 4, h: 5 } }),
      makeWidget({ id: "w2", streamId: "s2", layout: { x: 4, y: 0, w: 4, h: 5 } }),
      makeWidget({ id: "w3", streamId: "s3", layout: { x: 8, y: 0, w: 4, h: 5 } }),
    ];

    expect(findNextSlot(widgets)).toEqual({ x: 0, y: 5, w: 4, h: 5 });
  });

  it("fills the gap beside a shorter widget before stacking", () => {
    const widgets = [
      makeWidget({ id: "w1", streamId: "s1", layout: { x: 0, y: 0, w: 4, h: 2 } }),
      makeWidget({ id: "w2", streamId: "s2", layout: { x: 0, y: 2, w: 4, h: 5 } }),
    ];

    expect(findNextSlot(widgets)).toEqual({ x: 4, y: 0, w: 4, h: 5 });
  });

  it("stacks below when earlier rows are fully occupied", () => {
    const widgets = [
      makeWidget({ id: "w1", streamId: "s1", layout: { x: 0, y: 0, w: 12, h: 5 } }),
    ];

    expect(findNextSlot(widgets)).toEqual({ x: 0, y: 5, w: 4, h: 5 });
  });
});

describe("mergeCatalog", () => {
  it("puts live first and drops duplicates from today", () => {
    const live = [makeMatch({ id: "a", category: "hockey" })];
    const today = [
      makeMatch({ id: "a", category: "hockey" }),
      makeMatch({ id: "b", category: "football" }),
    ];

    expect(mergeCatalog(live, today).map((m) => m.id)).toEqual(["a", "b"]);
  });
});

describe("serializeDashboard / parseDashboard", () => {
  it("round-trips widgets", () => {
    const widgets = [makeWidget()];

    expect(parseDashboard(serializeDashboard(widgets))).toEqual(widgets);
  });

  it("returns an empty list for missing or invalid input", () => {
    expect(parseDashboard(null)).toEqual([]);
    expect(parseDashboard("")).toEqual([]);
    expect(parseDashboard("not json")).toEqual([]);
    expect(parseDashboard(JSON.stringify({ version: 999, widgets: [] }))).toEqual(
      [],
    );
  });

  it("drops malformed widgets and duplicate selections", () => {
    const raw = JSON.stringify({
      version: DASHBOARD_VERSION,
      widgets: [
        makeWidget(),
        makeWidget({ id: "w2" }),
        { id: "bad" },
      ],
    });

    expect(parseDashboard(raw).map((w) => w.id)).toEqual(["w1"]);
  });
});
