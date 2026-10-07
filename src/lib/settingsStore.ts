"use client";

import { useSyncExternalStore } from "react";

import {
  DEFAULT_SETTINGS,
  parseSettings,
  serializeSettings,
  SETTINGS_KEY,
  type AppSettings,
} from "@/lib/settings";

const EMPTY: AppSettings = DEFAULT_SETTINGS;

let settings: AppSettings = EMPTY;
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
    window.localStorage.setItem(SETTINGS_KEY, serializeSettings(settings));
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
    settings = parseSettings(window.localStorage.getItem(SETTINGS_KEY));
  } catch {
    settings = EMPTY;
  }
}

function setSettings(next: AppSettings): void {
  settings = next;
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

function getSnapshot(): AppSettings {
  return settings;
}

function getServerSnapshot(): AppSettings {
  return EMPTY;
}

export function useSettings(): AppSettings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useRedirectGuard(): boolean {
  return useSettings().redirectGuard;
}

export function setRedirectGuard(enabled: boolean): void {
  hydrate();
  setSettings({ ...settings, redirectGuard: enabled });
}

export function useGuardDismissed(): boolean {
  return useSettings().guardDismissed;
}

export function dismissGuard(): void {
  hydrate();
  setSettings({ ...settings, guardDismissed: true });
}
