"use client";

import { useState } from "react";

import { StreamOptions } from "@/components/StreamOptions";
import type { DashboardWidget as DashboardWidgetModel } from "@/lib/dashboard";
import { getStreamsForSources } from "@/lib/streamed/streams";
import type { APIMatch, Stream } from "@/lib/streamed/types";

function FocusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 3h5v5M4 20l17-17M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const actionClass =
  "widget-action inline-flex items-center justify-center rounded p-1 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100";

export function DashboardWidget({
  widget,
  match,
  sportName,
  focused,
  onFocus,
  onRemove,
  onSelectStream,
}: {
  widget: DashboardWidgetModel;
  match?: APIMatch;
  sportName: string;
  focused: boolean;
  onFocus: () => void;
  onRemove: () => void;
  onSelectStream: (stream: Stream) => void;
}) {
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(false);

  const blocked = blockedUrl === widget.embedUrl;
  const selectedKey = `${widget.source}:${widget.streamId}:${widget.streamNo}`;

  async function handleToggleSwap() {
    const next = !swapOpen;
    setSwapOpen(next);
    if (next && match && streams.length === 0 && !loading) {
      setLoading(true);
      try {
        setStreams(await getStreamsForSources(match.sources));
      } finally {
        setLoading(false);
      }
    }
  }

  function handleSelect(stream: Stream) {
    onSelectStream(stream);
    setSwapOpen(false);
  }

  return (
    <div
      className={
        focused
          ? "flex h-full flex-col overflow-hidden rounded-xl border border-transparent bg-zinc-950 text-zinc-100 ring-2 ring-amber-400"
          : "flex h-full flex-col overflow-hidden rounded-xl border border-black/15 bg-zinc-950 text-zinc-100 dark:border-white/15"
      }
    >
      <div
        className="widget-drag flex cursor-move items-center gap-2 border-b border-white/10 bg-zinc-900 px-2 py-1.5"
        onClick={onFocus}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xs font-medium">{widget.title}</span>
          <span className="truncate text-[10px] uppercase tracking-wide text-zinc-500">
            {sportName} · {widget.source} · {widget.hd ? "HD" : "SD"} ·{" "}
            {widget.language}
          </span>
        </div>

        <button
          type="button"
          onClick={onFocus}
          aria-pressed={focused}
          title="Focus this stream"
          aria-label="Focus this stream"
          className={actionClass}
        >
          <FocusIcon />
        </button>
        <button
          type="button"
          onClick={handleToggleSwap}
          disabled={!match}
          title={match ? "Change stream" : "Match unavailable"}
          aria-label="Change stream"
          className={`${actionClass} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <ShuffleIcon />
        </button>
        <a
          href={widget.embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open raw link"
          aria-label="Open raw link"
          className={actionClass}
        >
          <ExternalIcon />
        </a>
        <button
          type="button"
          onClick={onRemove}
          title="Remove"
          aria-label="Remove stream"
          className={actionClass}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="relative flex-1 bg-black">
        {blocked ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-xs text-zinc-300">
            <p>This source refused to be embedded.</p>
            <a
              href={widget.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="widget-action rounded-full bg-white px-3 py-1.5 font-medium text-black"
            >
              Open in a new tab
            </a>
          </div>
        ) : (
          <iframe
            key={widget.embedUrl}
            title={`${widget.title} — ${widget.source} stream ${widget.streamNo}`}
            src={widget.embedUrl}
            className="widget-action h-full w-full"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            onError={() => setBlockedUrl(widget.embedUrl)}
          />
        )}

        {swapOpen ? (
          <div className="absolute inset-0 z-20 flex flex-col bg-background p-3 text-foreground">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold">Change stream</span>
              <button
                type="button"
                onClick={() => setSwapOpen(false)}
                aria-label="Close stream picker"
                className="rounded p-1 text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-100"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <p className="text-xs text-zinc-500">Loading streams…</p>
              ) : (
                <StreamOptions
                  streams={streams}
                  selectedKey={selectedKey}
                  onSelect={handleSelect}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
