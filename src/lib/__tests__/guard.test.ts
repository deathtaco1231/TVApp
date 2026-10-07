import {
  GUARD_MESSAGE_TYPE,
  GUARD_MESSAGE_VERSION,
  isEmbedOrigin,
  isGuardMessage,
} from "@/lib/guard";

describe("isEmbedOrigin", () => {
  it("accepts embed.st over https, with or without a subdomain", () => {
    expect(isEmbedOrigin("https://embed.st")).toBe(true);
    expect(isEmbedOrigin("https://embed.st/embed/admin/x/1")).toBe(true);
    expect(isEmbedOrigin("https://cdn.embed.st")).toBe(true);
  });

  it("rejects other origins, schemes, and junk", () => {
    expect(isEmbedOrigin("http://embed.st")).toBe(false);
    expect(isEmbedOrigin("https://evil.com")).toBe(false);
    expect(isEmbedOrigin("https://notembed.st")).toBe(false);
    expect(isEmbedOrigin("https://embed.st.evil.com")).toBe(false);
    expect(isEmbedOrigin("")).toBe(false);
  });
});

describe("isGuardMessage", () => {
  const valid = { type: GUARD_MESSAGE_TYPE, version: GUARD_MESSAGE_VERSION };

  it("accepts a well-formed message from an embed origin", () => {
    expect(isGuardMessage(valid, "https://embed.st")).toBe(true);
  });

  it("rejects a wrong type or version", () => {
    expect(isGuardMessage({ ...valid, type: "other" }, "https://embed.st")).toBe(
      false,
    );
    expect(isGuardMessage({ ...valid, version: 999 }, "https://embed.st")).toBe(
      false,
    );
    expect(isGuardMessage({ type: GUARD_MESSAGE_TYPE }, "https://embed.st")).toBe(
      false,
    );
  });

  it("rejects non-objects and untrusted origins", () => {
    expect(isGuardMessage(null, "https://embed.st")).toBe(false);
    expect(isGuardMessage("x", "https://embed.st")).toBe(false);
    expect(isGuardMessage(valid, "https://evil.com")).toBe(false);
    expect(isGuardMessage(valid, "http://embed.st")).toBe(false);
  });
});
