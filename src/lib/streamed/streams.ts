import { streamedFetch } from "./client";
import type { MatchSource, Stream } from "./types";

export function streamsPath(source: string, id: string): string {
  return `/stream/${encodeURIComponent(source)}/${encodeURIComponent(id)}`;
}

export function streamKey(stream: Stream): string {
  return `${stream.source}:${stream.id}:${stream.streamNo}`;
}

export function getStreams(source: string, id: string): Promise<Stream[]> {
  return streamedFetch<Stream[]>(streamsPath(source, id));
}

export async function getStreamsForSources(
  sources: MatchSource[],
): Promise<Stream[]> {
  const perSource = await Promise.all(
    sources.map(async ({ source, id }) => {
      try {
        const streams = await getStreams(source, id);
        return streams.map((stream) => ({
          ...stream,
          source: stream.source || source,
        }));
      } catch (cause) {
        console.warn(
          `[streamed] failed to load streams for source "${source}" (${id}):`,
          cause,
        );
        return [] as Stream[];
      }
    }),
  );

  return perSource.flat();
}
