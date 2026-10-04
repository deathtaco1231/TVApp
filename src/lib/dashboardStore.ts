"use client";

import { useSyncExternalStore } from "react";

import {
  addWidget,
  parseDashboard,
  removeWidget,
  serializeDashboard,
  updateWidgetLayout,
  updateWidgetStream,
  updateWidgetsLayout,
  type DashboardWidget,
  type WidgetLayout,
} from "@/lib/dashboard";
import type { Stream } from "@/lib/streamed/types";

const STORAGE_KEY = "tvapp.dashboard.v1";
const EMPTY: DashboardWidget[] = [];

let widgets: DashboardWidget[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function persist(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeDashboard(widgets));
  } catch {
    // Storage can be unavailable (private mode, quota); the session still works.
  }
}

function hydrate(): void {
  if (hydrated || typeof window === "undefined") {
    return;
  }
  hydrated = true;
  try {
    widgets = parseDashboard(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    widgets = EMPTY;
  }
}

function setWidgets(next: DashboardWidget[]): void {
  widgets = next;
  persist();
  emit();
}

function subscribe(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): DashboardWidget[] {
  return widgets;
}

function getServerSnapshot(): DashboardWidget[] {
  return EMPTY;
}

export function useDashboardWidgets(): DashboardWidget[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function newWidgetId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function addDashboardWidget(widget: DashboardWidget): void {
  hydrate();
  setWidgets(addWidget(widgets, widget));
}

export function removeDashboardWidget(id: string): void {
  hydrate();
  setWidgets(removeWidget(widgets, id));
}

export function setDashboardWidgetLayout(
  id: string,
  layout: WidgetLayout,
): void {
  hydrate();
  setWidgets(updateWidgetLayout(widgets, id, layout));
}

export function setDashboardLayouts(
  layouts: { id: string; layout: WidgetLayout }[],
): void {
  hydrate();
  setWidgets(updateWidgetsLayout(widgets, layouts));
}

export function setDashboardWidgetStream(id: string, stream: Stream): void {
  hydrate();
  setWidgets(updateWidgetStream(widgets, id, stream));
}

export function clearDashboard(): void {
  hydrate();
  setWidgets(EMPTY);
}
