export const GUARD_MESSAGE_TYPE = "tvapp-popup-guard";
export const GUARD_MESSAGE_VERSION = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isEmbedOrigin(origin: string): boolean {
  try {
    const { protocol, hostname } = new URL(origin);
    return (
      protocol === "https:" &&
      (hostname === "embed.st" || hostname.endsWith(".embed.st"))
    );
  } catch {
    return false;
  }
}

export function isGuardMessage(data: unknown, origin: string): boolean {
  if (!isRecord(data)) {
    return false;
  }
  return (
    data.type === GUARD_MESSAGE_TYPE &&
    data.version === GUARD_MESSAGE_VERSION &&
    isEmbedOrigin(origin)
  );
}
