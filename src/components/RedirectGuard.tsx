"use client";

import { useEffect } from "react";

import { useRedirectGuard } from "@/lib/settingsStore";

export function RedirectGuard() {
  const enabled = useRedirectGuard();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);

  return null;
}
