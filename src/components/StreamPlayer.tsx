"use client";

import { useState } from "react";

import type { Stream } from "@/lib/streamed/types";

export function StreamPlayer({ stream }: { stream: Stream }) {
  const [blocked, setBlocked] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative mx-auto aspect-video w-full max-w-[calc((100vh-16rem)*16/9)] overflow-hidden rounded-xl bg-black">
        {blocked ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-zinc-300">
            <p>This source refused to be embedded in the page.</p>
            <a
              href={stream.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-4 py-2 font-medium text-black"
            >
              Open the stream in a new tab
            </a>
          </div>
        ) : (
          <iframe
            key={stream.embedUrl}
            title={`${stream.source} stream ${stream.streamNo} (${stream.language})`}
            src={stream.embedUrl}
            className="h-full w-full"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            onError={() => setBlocked(true)}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
        <span>Source: {stream.source}</span>
        <span aria-hidden>·</span>
        <span>{stream.hd ? "HD" : "SD"}</span>
        <span aria-hidden>·</span>
        <span>{stream.language}</span>
        {stream.viewers !== undefined ? (
          <>
            <span aria-hidden>·</span>
            <span>{stream.viewers} viewers</span>
          </>
        ) : null}
        <a
          href={stream.embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto underline"
        >
          Open raw link
        </a>
      </div>
    </div>
  );
}
