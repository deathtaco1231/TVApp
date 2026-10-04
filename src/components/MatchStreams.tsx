"use client";

import { useMemo, useState } from "react";

import { StreamPlayer } from "@/components/StreamPlayer";
import type { Stream } from "@/lib/streamed/types";

export function streamKey(stream: Stream): string {
  return `${stream.source}:${stream.id}:${stream.streamNo}`;
}

export function MatchStreams({ streams }: { streams: Stream[] }) {
  const [selectedKey, setSelectedKey] = useState(() =>
    streams.length > 0 ? streamKey(streams[0]) : "",
  );

  const selected = useMemo(
    () => streams.find((stream) => streamKey(stream) === selectedKey) ?? streams[0],
    [streams, selectedKey],
  );

  if (streams.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-black/15 p-6 text-sm text-zinc-500 dark:border-white/15">
        No streams are available for this match yet. Check back closer to kickoff.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {selected ? <StreamPlayer stream={selected} /> : null}

      <ul className="flex flex-wrap gap-2">
        {streams.map((stream) => {
          const key = streamKey(stream);
          const active = selected ? key === streamKey(selected) : false;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => setSelectedKey(key)}
                aria-pressed={active}
                className={
                  active
                    ? "rounded-full border border-transparent bg-foreground px-3 py-1 text-sm text-background"
                    : "rounded-full border border-black/10 px-3 py-1 text-sm text-zinc-600 transition hover:border-black/30 dark:border-white/15 dark:text-zinc-300 dark:hover:border-white/40"
                }
              >
                {stream.source} · {stream.language} · {stream.hd ? "HD" : "SD"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
