import type { APIMatch, Stream } from "@/lib/streamed/types";

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardWidget {
  id: string;
  matchId: string;
  title: string;
  category: string;
  source: string;
  streamId: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  layout: WidgetLayout;
}

export const DASHBOARD_VERSION = 1;
export const DASHBOARD_COLS = 12;
export const DEFAULT_WIDGET_SIZE: Pick<WidgetLayout, "w" | "h"> = {
  w: 4,
  h: 5,
};
export const MIN_WIDGET_SIZE: Pick<WidgetLayout, "w" | "h"> = {
  w: 2,
  h: 2,
};

export type StreamSelection = Pick<
  DashboardWidget,
  "matchId" | "source" | "streamId" | "streamNo"
>;

export function streamSelectionKey(selection: StreamSelection): string {
  return [
    selection.matchId,
    selection.source,
    selection.streamId,
    selection.streamNo,
  ].join("::");
}

export function createWidget(
  match: APIMatch,
  stream: Stream,
  layout: WidgetLayout,
  id: string,
): DashboardWidget {
  return {
    id,
    matchId: match.id,
    title: match.title,
    category: match.category,
    source: stream.source,
    streamId: stream.id,
    streamNo: stream.streamNo,
    language: stream.language,
    hd: stream.hd,
    embedUrl: stream.embedUrl,
    layout,
  };
}

export function hasStreamSelection(
  widgets: DashboardWidget[],
  selection: StreamSelection,
): boolean {
  const key = streamSelectionKey(selection);
  return widgets.some((widget) => streamSelectionKey(widget) === key);
}

export function addWidget(
  widgets: DashboardWidget[],
  widget: DashboardWidget,
): DashboardWidget[] {
  if (widgets.some((existing) => existing.id === widget.id)) {
    return widgets;
  }
  if (hasStreamSelection(widgets, widget)) {
    return widgets;
  }
  return [...widgets, widget];
}

export function removeWidget(
  widgets: DashboardWidget[],
  id: string,
): DashboardWidget[] {
  return widgets.filter((widget) => widget.id !== id);
}

export function updateWidgetLayout(
  widgets: DashboardWidget[],
  id: string,
  layout: WidgetLayout,
): DashboardWidget[] {
  return widgets.map((widget) =>
    widget.id === id ? { ...widget, layout } : widget,
  );
}

export function updateWidgetsLayout(
  widgets: DashboardWidget[],
  layouts: { id: string; layout: WidgetLayout }[],
): DashboardWidget[] {
  if (layouts.length === 0) {
    return widgets;
  }
  const byId = new Map(layouts.map((entry) => [entry.id, entry.layout]));
  return widgets.map((widget) => {
    const layout = byId.get(widget.id);
    return layout ? { ...widget, layout } : widget;
  });
}

export function updateWidgetStream(
  widgets: DashboardWidget[],
  id: string,
  stream: Stream,
): DashboardWidget[] {
  return widgets.map((widget) =>
    widget.id === id
      ? {
          ...widget,
          source: stream.source,
          streamId: stream.id,
          streamNo: stream.streamNo,
          language: stream.language,
          hd: stream.hd,
          embedUrl: stream.embedUrl,
        }
      : widget,
  );
}

export function findNextSlot(
  widgets: DashboardWidget[],
  size: Pick<WidgetLayout, "w" | "h"> = DEFAULT_WIDGET_SIZE,
): WidgetLayout {
  const { w, h } = size;
  const width = Math.min(w, DASHBOARD_COLS);

  const occupied = new Set<string>();
  let maxRow = h;
  for (const widget of widgets) {
    const layout = widget.layout;
    maxRow = Math.max(maxRow, layout.y + layout.h);
    for (let cx = layout.x; cx < layout.x + layout.w; cx += 1) {
      for (let cy = layout.y; cy < layout.y + layout.h; cy += 1) {
        occupied.add(`${cx},${cy}`);
      }
    }
  }

  for (let y = 0; y <= maxRow; y += 1) {
    for (let x = 0; x + width <= DASHBOARD_COLS; x += 1) {
      let fits = true;
      for (let cx = x; cx < x + width && fits; cx += 1) {
        for (let cy = y; cy < y + h; cy += 1) {
          if (occupied.has(`${cx},${cy}`)) {
            fits = false;
            break;
          }
        }
      }
      if (fits) {
        return { x, y, w: width, h };
      }
    }
  }

  return { x: 0, y: maxRow, w: width, h };
}

export function mergeCatalog(
  live: APIMatch[],
  today: APIMatch[],
): APIMatch[] {
  const seen = new Set<string>();
  const merged: APIMatch[] = [];
  for (const match of [...live, ...today]) {
    if (seen.has(match.id)) {
      continue;
    }
    seen.add(match.id);
    merged.push(match);
  }
  return merged;
}

export function serializeDashboard(widgets: DashboardWidget[]): string {
  return JSON.stringify({ version: DASHBOARD_VERSION, widgets });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseLayout(value: unknown): WidgetLayout | null {
  if (!isRecord(value)) {
    return null;
  }
  const { x, y, w, h } = value;
  if (
    typeof x === "number" &&
    typeof y === "number" &&
    typeof w === "number" &&
    typeof h === "number" &&
    w > 0 &&
    h > 0
  ) {
    return { x, y, w, h };
  }
  return null;
}

function parseWidget(value: unknown): DashboardWidget | null {
  if (!isRecord(value)) {
    return null;
  }
  const layout = parseLayout(value.layout);
  const { id, matchId, title, category, source, streamId, streamNo } = value;
  if (
    typeof id !== "string" ||
    typeof matchId !== "string" ||
    typeof title !== "string" ||
    typeof category !== "string" ||
    typeof source !== "string" ||
    typeof streamId !== "string" ||
    typeof streamNo !== "number" ||
    typeof value.language !== "string" ||
    typeof value.hd !== "boolean" ||
    typeof value.embedUrl !== "string" ||
    !layout
  ) {
    return null;
  }
  return {
    id,
    matchId,
    title,
    category,
    source,
    streamId,
    streamNo,
    language: value.language,
    hd: value.hd,
    embedUrl: value.embedUrl,
    layout,
  };
}

export function parseDashboard(raw: string | null | undefined): DashboardWidget[] {
  if (!raw) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!isRecord(parsed) || parsed.version !== DASHBOARD_VERSION) {
    return [];
  }
  if (!Array.isArray(parsed.widgets)) {
    return [];
  }
  const widgets: DashboardWidget[] = [];
  const seenIds = new Set<string>();
  const seenSelections = new Set<string>();
  for (const entry of parsed.widgets) {
    const widget = parseWidget(entry);
    if (!widget) {
      continue;
    }
    if (seenIds.has(widget.id)) {
      continue;
    }
    const selectionKey = streamSelectionKey(widget);
    if (seenSelections.has(selectionKey)) {
      continue;
    }
    seenIds.add(widget.id);
    seenSelections.add(selectionKey);
    widgets.push(widget);
  }
  return widgets;
}
