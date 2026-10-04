"use client";

import { streamKey } from "@/lib/streamed/streams";
import type { Stream } from "@/lib/streamed/types";

export function StreamOptions({
  streams,
  selectedKey,
  disabledKeys,
  onSelect,
}: {
  streams: Stream[];
  selectedKey?: string;
  disabledKeys?: Set<string>;
  onSelect: (stream: Stream) => void;
}) {
  if (streams.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-black/15 p-4 text-sm text-zinc-500 dark:border-white/15">
        No streams are available for this match yet. Check back closer to
        kickoff.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {streams.map((stream) => {
        const key = streamKey(stream);
        const active = key === selectedKey;
        const isAdded = !active && disabledKeys?.has(key) === true;
        return (
          <li key={key}>
            <button
              type="button"
              disabled={isAdded}
              onClick={() => onSelect(stream)}
              aria-pressed={active}
              className={
                active
                  ? "flex w-full items-center justify-between gap-3 rounded-lg border border-transparent bg-foreground px-3 py-2 text-left text-sm text-background"
                  : "flex w-full items-center justify-between gap-3 rounded-lg border border-black/10 px-3 py-2 text-left text-sm text-zinc-600 transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:text-zinc-300 dark:hover:border-white/40"
              }
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{stream.source}</span>
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
              <span
                className={
                  active
                    ? "shrink-0 text-xs text-background/70"
                    : "shrink-0 text-xs text-zinc-500"
                }
              >
                {isAdded
                  ? "Added"
                  : stream.viewers !== undefined
                    ? `${stream.viewers} viewers`
                    : ""}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
