import { formatVersionLabel, isBetaVersion } from "@/lib/version";

describe("isBetaVersion", () => {
  it("is true for 0.x releases", () => {
    expect(isBetaVersion("0.1.0")).toBe(true);
    expect(isBetaVersion("0.2.0")).toBe(true);
  });

  it("is false at or above 1.0.0", () => {
    expect(isBetaVersion("1.0.0")).toBe(false);
    expect(isBetaVersion("2.3.1")).toBe(false);
  });

  it("is false for unparseable versions", () => {
    expect(isBetaVersion("")).toBe(false);
    expect(isBetaVersion("dev")).toBe(false);
  });
});

describe("formatVersionLabel", () => {
  it("appends BETA below 1.0.0", () => {
    expect(formatVersionLabel("0.1.0")).toBe("v0.1.0 · BETA");
  });

  it("omits BETA at or above 1.0.0", () => {
    expect(formatVersionLabel("1.0.0")).toBe("v1.0.0");
  });

  it("returns an empty string for a blank version", () => {
    expect(formatVersionLabel("   ")).toBe("");
  });
});
