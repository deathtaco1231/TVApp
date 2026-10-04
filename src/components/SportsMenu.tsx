"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { Sport } from "@/lib/streamed/types";

const triggerClass =
  "text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100";

const activeTriggerClass =
  "text-sm font-medium text-zinc-900 underline decoration-2 underline-offset-4 dark:text-zinc-100";

export function SportsMenu({ sports }: { sports: Sport[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const active = pathname.startsWith("/sports");

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={active ? activeTriggerClass : triggerClass}
      >
        Sports
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 z-20 mt-2 max-h-80 w-56 overflow-y-auto rounded-lg border border-black/10 bg-background p-1 shadow-lg dark:border-white/15"
        >
          {sports.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-500">
              Sports unavailable
            </p>
          ) : (
            sports.map((sport) => (
              <Link
                key={sport.id}
                href={`/sports/${sport.id}`}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-zinc-100"
              >
                {sport.name}
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
