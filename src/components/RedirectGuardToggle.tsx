"use client";

import { setRedirectGuard, useRedirectGuard } from "@/lib/settingsStore";

export function RedirectGuardToggle() {
  const enabled = useRedirectGuard();

  return (
    <label
      className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
      title="Show a browser confirmation before a stream can redirect the page"
    >
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => setRedirectGuard(event.target.checked)}
        className="size-4"
      />
      <span>Redirect guard</span>
    </label>
  );
}
