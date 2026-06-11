"use client";

import { useEffect } from "react";

/**
 * Suppresses React hydration mismatch warnings caused by browser extensions
 * (e.g. "bis_skin_checked" attribute added by color-picker extensions).
 * These are harmless — suppressHydrationWarning on <html>/<body> prevents
 * actual hydration issues, but React still logs warnings in dev mode.
 */
export function SuppressHydrationWarnings() {
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === "string" ? args[0] : "";
      if (
        msg.includes("A tree hydrated but some attributes") ||
        msg.includes("bis_skin_checked") ||
        msg.includes("hydration")
      ) {
        return;
      }
      originalError.call(console, ...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
