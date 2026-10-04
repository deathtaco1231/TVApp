import { matchesPath } from "@/lib/streamed/matches";
import { streamsPath } from "@/lib/streamed/streams";
import { badgeUrl } from "@/lib/streamed/images";

describe("Streamed API path builders", () => {
  it("builds match paths for a sport and a special filter", () => {
    expect(matchesPath("football")).toBe("/matches/football");
    expect(matchesPath("live")).toBe("/matches/live");
    expect(matchesPath("all-today", true)).toBe("/matches/all-today/popular");
  });

  it("url-encodes source and id when building stream paths", () => {
    expect(streamsPath("alpha", "mu-liv-123")).toBe("/stream/alpha/mu-liv-123");
    expect(streamsPath("source with space", "a/b")).toBe(
      "/stream/source%20with%20space/a%2Fb",
    );
  });

  it("builds absolute badge image URLs", () => {
    expect(badgeUrl("man-utd-badge")).toBe(
      "https://streamed.pk/api/images/badge/man-utd-badge.webp",
    );
  });
});
