import {
  buildLauncherScript,
  CHROME_FOR_TESTING_VERSION,
  sanitizeBaseUrl,
} from "@/lib/launcher";

describe("sanitizeBaseUrl", () => {
  it("keeps the scheme and host, dropping paths and queries", () => {
    expect(sanitizeBaseUrl("http://tvapp:3000/matches/1?x=2")).toBe(
      "http://tvapp:3000",
    );
    expect(sanitizeBaseUrl("https://tv.example.ts.net/")).toBe(
      "https://tv.example.ts.net",
    );
  });

  it("rejects non-http schemes and junk", () => {
    expect(sanitizeBaseUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeBaseUrl("file:///etc/passwd")).toBeNull();
    expect(sanitizeBaseUrl("not a url")).toBeNull();
    expect(sanitizeBaseUrl(null)).toBeNull();
  });
});

describe("buildLauncherScript", () => {
  const script = buildLauncherScript("http://tvapp:3000");

  it("bakes in the instance URL and pinned Chrome for Testing version", () => {
    expect(script).toContain('set "BASE=http://tvapp:3000"');
    expect(script).toContain(`set "CFT_VERSION=${CHROME_FOR_TESTING_VERSION}"`);
  });

  it("fetches its own guard zip and launches Chrome with it", () => {
    expect(script).toContain("%BASE%/api/guard/extension");
    expect(script).toContain("--load-extension=");
    expect(script).toContain("chrome-win64\\chrome.exe");
  });

  it("skips first-run setup screens", () => {
    expect(script).toContain("--no-first-run");
    expect(script).toContain("--no-default-browser-check");
    expect(script).toContain("--disable-search-engine-choice-screen");
  });

  it("uses Windows line endings", () => {
    expect(script).toContain("\r\n");
    expect(script.endsWith("\r\n")).toBe(true);
  });
});
