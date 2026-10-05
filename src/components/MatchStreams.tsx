"use client";

import { useMemo, useState } from "react";

import { RedirectGuard } from "@/components/RedirectGuard";
import { StreamPlayer } from "@/components/StreamPlayer";
import { streamKey } from "@/lib/streamed/streams";
import type { Stream } from "@/lib/streamed/types";

export { streamKey };

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

  const selectedStreamKey = selected ? streamKey(selected) : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <RedirectGuard />
      <div className="min-w-0">
        {selected ? <StreamPlayer stream={selected} /> : null}
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <h2 className="text-sm font-semibold tracking-tight">Streams</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {streams.map((stream) => {
            const key = streamKey(stream);
            const active = key === selectedStreamKey;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  aria-pressed={active}
                  className={
                    active
                      ? "flex w-full items-center justify-between gap-3 rounded-lg border border-transparent bg-foreground px-3 py-2 text-left text-sm text-background"
                      : "flex w-full items-center justify-between gap-3 rounded-lg border border-black/10 px-3 py-2 text-left text-sm text-zinc-600 transition hover:border-black/30 dark:border-white/15 dark:text-zinc-300 dark:hover:border-white/40"
                  }
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">
                      {stream.source}
                    </span>
                    <span
                      className={
                        active
                          ? "text-xs text-background/70"
                          : "text-xs text-zinc-500"
                      }
                    >
                      {stream.language} · {stream.hd ? "HD" : "SD"}
                    </span>
                  </span>
                  {stream.viewers !== undefined ? (
                    <span
                      className={
                        active
                          ? "shrink-0 text-xs text-background/70"
                          : "shrink-0 text-xs text-zinc-500"
                      }
                    >
                      {stream.viewers} viewers
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
