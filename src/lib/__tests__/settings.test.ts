import {
  DEFAULT_SETTINGS,
  parseSettings,
  serializeSettings,
  SETTINGS_VERSION,
} from "@/lib/settings";

describe("parseSettings", () => {
  it("returns defaults for missing or invalid input", () => {
    expect(parseSettings(null)).toBe(DEFAULT_SETTINGS);
    expect(parseSettings("")).toBe(DEFAULT_SETTINGS);
    expect(parseSettings("not json")).toBe(DEFAULT_SETTINGS);
    expect(parseSettings(JSON.stringify({ version: 999 }))).toBe(
      DEFAULT_SETTINGS,
    );
  });

  it("defaults the guard to on when the field is absent or mistyped", () => {
    const parsed = parseSettings(
      JSON.stringify({ version: SETTINGS_VERSION, redirectGuard: "yes" }),
    );

    expect(parsed.redirectGuard).toBe(true);
  });

  it("reads a persisted boolean", () => {
    const parsed = parseSettings(
      JSON.stringify({ version: SETTINGS_VERSION, redirectGuard: false }),
    );

    expect(parsed.redirectGuard).toBe(false);
  });
});

describe("serializeSettings", () => {
  it("round-trips through parseSettings", () => {
    const settings = { redirectGuard: false };

    expect(parseSettings(serializeSettings(settings))).toEqual(settings);
  });
});
