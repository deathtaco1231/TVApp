import { streamedFetch } from "./client";
import type { Sport } from "./types";

export function getSports(): Promise<Sport[]> {
  return streamedFetch<Sport[]>("/sports");
}
