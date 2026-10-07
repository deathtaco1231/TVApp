"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { isGuardMessage } from "@/lib/guard";
import { dismissGuard, useGuardDismissed } from "@/lib/settingsStore";

const GRACE_MS = 2500;

export function GuardNotice() {
  const dismissed = useGuardDismissed();
  const [detected, setDetected] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (isGuardMessage(event.data, event.origin)) {
        setDetected(true);
      }
    }
    window.addEventListener("message", handleMessage);
    const timer = window.setTimeout(() => setReady(true), GRACE_MS);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearTimeout(timer);
    };
  }, []);

  if (detected || dismissed || !ready) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
      <p className="text-amber-700 dark:text-amber-300">
        Stream embeds can open ad popups when you press play. Install the popup
        guard to block them.
      </p>
      <div className="flex items-center gap-2">
        <Link
          href="/guard"
          className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          Install guard
        </Link>
        <button
          type="button"
          onClick={dismissGuard}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-zinc-600 transition hover:border-black/30 dark:border-white/15 dark:text-zinc-300 dark:hover:border-white/40"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
