import { hasKickoff, isSameLocalDay } from "@/lib/dates";

function local(
  year: number,
  month: number,
  day: number,
  hours = 12,
  minutes = 0,
): number {
  return new Date(year, month, day, hours, minutes).getTime();
}

describe("hasKickoff", () => {
  it("is true for a positive finite timestamp", () => {
    expect(hasKickoff(local(2026, 9, 4))).toBe(true);
  });

  it("is false for zero, negative, and non-finite values", () => {
    expect(hasKickoff(0)).toBe(false);
    expect(hasKickoff(-1)).toBe(false);
    expect(hasKickoff(Number.NaN)).toBe(false);
    expect(hasKickoff(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe("isSameLocalDay", () => {
  it("is true for two times on the same local day", () => {
    expect(isSameLocalDay(local(2026, 9, 4, 1), local(2026, 9, 4, 23))).toBe(
      true,
    );
  });

  it("is false across local midnight", () => {
    expect(isSameLocalDay(local(2026, 9, 4, 23), local(2026, 9, 5, 1))).toBe(
      false,
    );
  });

  it("is false across a month boundary", () => {
    expect(isSameLocalDay(local(2026, 11, 31), local(2027, 0, 1))).toBe(false);
  });

  it("is false when either timestamp has no kickoff", () => {
    expect(isSameLocalDay(0, local(2026, 9, 4))).toBe(false);
    expect(isSameLocalDay(local(2026, 9, 4), 0)).toBe(false);
  });
});
