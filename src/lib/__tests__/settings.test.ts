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

  it("defaults the guard notice to expanded when the field is absent or mistyped", () => {
    expect(
      parseSettings(JSON.stringify({ version: SETTINGS_VERSION })).guardMinimized,
    ).toBe(false);
    expect(
      parseSettings(
        JSON.stringify({ version: SETTINGS_VERSION, guardMinimized: "yes" }),
      ).guardMinimized,
    ).toBe(false);
  });

  it("reads a persisted boolean", () => {
    const parsed = parseSettings(
      JSON.stringify({ version: SETTINGS_VERSION, guardMinimized: true }),
    );

    expect(parsed.guardMinimized).toBe(true);
  });
});

describe("serializeSettings", () => {
  it("round-trips through parseSettings", () => {
    const settings = { guardMinimized: true };

    expect(parseSettings(serializeSettings(settings))).toEqual(settings);
  });
});
