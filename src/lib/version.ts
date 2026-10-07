export function isBetaVersion(version: string): boolean {
  const major = Number.parseInt(version.split(".")[0] ?? "", 10);
  return Number.isFinite(major) && major === 0;
}

export function formatVersionLabel(version: string): string {
  const clean = version.trim();
  if (!clean) {
    return "";
  }
  return isBetaVersion(clean) ? `v${clean} · BETA` : `v${clean}`;
}
