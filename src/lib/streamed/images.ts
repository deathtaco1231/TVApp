import { STREAMED_ORIGIN } from "./client";

export function badgeUrl(badge: string): string {
  return `${STREAMED_ORIGIN}/api/images/badge/${encodeURIComponent(badge)}.webp`;
}

export function posterUrl(homeBadge: string, awayBadge: string): string {
  return `${STREAMED_ORIGIN}/api/images/poster/${encodeURIComponent(
    homeBadge,
  )}/${encodeURIComponent(awayBadge)}.webp`;
}

export function proxyImageUrl(poster: string): string {
  return `${STREAMED_ORIGIN}/api/images/proxy/${encodeURIComponent(poster)}.webp`;
}
