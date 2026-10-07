export const SETTINGS_VERSION = 1;
export const SETTINGS_KEY = "tvapp.settings.v1";

export interface AppSettings {
  redirectGuard: boolean;
  guardDismissed: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  redirectGuard: true,
  guardDismissed: false,
};

export function serializeSettings(settings: AppSettings): string {
  return JSON.stringify({ version: SETTINGS_VERSION, ...settings });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseSettings(raw: string | null | undefined): AppSettings {
  if (!raw) {
    return DEFAULT_SETTINGS;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_SETTINGS;
  }
  if (!isRecord(parsed) || parsed.version !== SETTINGS_VERSION) {
    return DEFAULT_SETTINGS;
  }
  return {
    redirectGuard:
      typeof parsed.redirectGuard === "boolean"
        ? parsed.redirectGuard
        : DEFAULT_SETTINGS.redirectGuard,
    guardDismissed:
      typeof parsed.guardDismissed === "boolean"
        ? parsed.guardDismissed
        : DEFAULT_SETTINGS.guardDismissed,
  };
}
