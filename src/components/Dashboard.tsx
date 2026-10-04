"use client";

import { useMemo, useState } from "react";
import ReactGridLayout, {
  noCompactor,
  useContainerWidth,
  type Layout,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";

import { AddStreamPanel } from "@/components/AddStreamPanel";
import { DashboardWidget } from "@/components/DashboardWidget";
import {
  DASHBOARD_COLS,
  MIN_WIDGET_SIZE,
  createWidget,
  findNextSlot,
  streamSelectionKey,
} from "@/lib/dashboard";
import {
  addDashboardWidget,
  clearDashboard,
  newWidgetId,
  removeDashboardWidget,
  setDashboardLayouts,
  setDashboardWidgetStream,
  useDashboardWidgets,
} from "@/lib/dashboardStore";
import { sportNameById } from "@/lib/live";
import type { APIMatch, Sport, Stream } from "@/lib/streamed/types";

const ROW_HEIGHT = 40;
const GRID_MARGIN: [number, number] = [12, 12];

const primaryButton =
  "rounded-lg bg-foreground text-sm font-medium text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[.98]";

export function Dashboard({
  matches,
  sports,
  liveMatches,
}: {
  matches: APIMatch[];
  sports: Sport[];
  liveMatches: APIMatch[];
}) {
  const widgets = useDashboardWidgets();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [interacting, setInteracting] = useState(false);
  const { width, containerRef, mounted } = useContainerWidth();

  const matchById = useMemo(
    () => new Map(matches.map((match) => [match.id, match])),
    [matches],
  );
  const names = useMemo(() => sportNameById(sports), [sports]);
  const liveIds = useMemo(
    () => new Set(liveMatches.map((match) => match.id)),
    [liveMatches],
  );
  const addedKeys = useMemo(
    () => new Set(widgets.map((widget) => streamSelectionKey(widget))),
    [widgets],
  );

  const layout: Layout = useMemo(
    () =>
      widgets.map((widget) => ({
        i: widget.id,
        x: widget.layout.x,
        y: widget.layout.y,
        w: widget.layout.w,
        h: widget.layout.h,
        minW: MIN_WIDGET_SIZE.w,
        minH: MIN_WIDGET_SIZE.h,
      })),
    [widgets],
  );

  function handleLayoutChange(next: Layout) {
    const changes = next
      .map((item) => ({
        item,
        widget: widgets.find((widget) => widget.id === item.i),
      }))
      .filter(
        ({ item, widget }) =>
          widget !== undefined &&
          (widget.layout.x !== item.x ||
            widget.layout.y !== item.y ||
            widget.layout.w !== item.w ||
            widget.layout.h !== item.h),
      )
      .map(({ item }) => ({
        id: item.i,
        layout: { x: item.x, y: item.y, w: item.w, h: item.h },
      }));

    if (changes.length > 0) {
      setDashboardLayouts(changes);
    }
  }

  function handleAdd(match: APIMatch, stream: Stream) {
    const id = newWidgetId();
    addDashboardWidget(createWidget(match, stream, findNextSlot(widgets), id));
    setFocusedId(id);
  }

  function handleSelectStream(id: string, stream: Stream) {
    setDashboardWidgetStream(id, stream);
  }

  function handleRemove(id: string) {
    removeDashboardWidget(id);
    setFocusedId((current) => (current === id ? null : current));
  }

  function handleClear() {
    if (window.confirm("Remove all streams from the dashboard?")) {
      clearDashboard();
      setFocusedId(null);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {widgets.length} stream{widgets.length === 1 ? "" : "s"} on the board
        </p>
        <div className="flex items-center gap-2">
          {widgets.length > 0 ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-zinc-600 transition hover:border-black/30 active:scale-[.98] dark:border-white/15 dark:text-zinc-300 dark:hover:border-white/40"
            >
              Clear all
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className={`${primaryButton} px-3 py-1.5`}
          >
            Add stream
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-zinc-500">
        Drag a tile by its header to move it and use the bottom-right corner to
        resize. Each stream plays its own audio — use the Focus button to
        highlight the one you are watching.
      </p>

      <div ref={containerRef} className="relative mt-4">
        {mounted && widgets.length > 0 ? (
          <ReactGridLayout
            width={width}
            layout={layout}
            compactor={noCompactor}
            gridConfig={{
              cols: DASHBOARD_COLS,
              rowHeight: ROW_HEIGHT,
              margin: GRID_MARGIN,
              containerPadding: [0, 0],
            }}
            dragConfig={{
              enabled: true,
              handle: ".widget-drag",
              cancel: ".widget-action",
            }}
            resizeConfig={{ enabled: true, handles: ["se"] }}
            onLayoutChange={handleLayoutChange}
            onDragStart={() => setInteracting(true)}
            onDragStop={() => setInteracting(false)}
            onResizeStart={() => setInteracting(true)}
            onResizeStop={() => setInteracting(false)}
          >
            {widgets.map((widget) => (
              <div key={widget.id} className="h-full">
                <DashboardWidget
                  widget={widget}
                  match={matchById.get(widget.matchId)}
                  sportName={names.get(widget.category) ?? widget.category}
                  focused={focusedId === widget.id}
                  onFocus={() => setFocusedId(widget.id)}
                  onRemove={() => handleRemove(widget.id)}
                  onSelectStream={(stream) =>
                    handleSelectStream(widget.id, stream)
                  }
                />
              </div>
            ))}
          </ReactGridLayout>
        ) : null}

        {interacting ? <div className="absolute inset-0 z-30" /> : null}

        {widgets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-black/15 p-12 text-center dark:border-white/15">
            <p className="text-sm text-zinc-500">
              Your dashboard is empty. Add a few games to build your own
              multi-stream wall.
            </p>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={`${primaryButton} px-4 py-2`}
            >
              Add your first stream
            </button>
          </div>
        ) : null}
      </div>

      {pickerOpen ? (
        <AddStreamPanel
          matches={matches}
          sports={sports}
          liveIds={liveIds}
          addedKeys={addedKeys}
          onAdd={handleAdd}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  );
}
