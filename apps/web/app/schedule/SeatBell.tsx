"use client";

import { useState } from "react";
import Link from "next/link";
import { bellMode, currentPushEnv, pushSupport } from "@/lib/seat-alerts/client";
import type { WatchesState } from "@/lib/seat-alerts/use-watches";
import { findWatch } from "@turboterp/app-core/seat-alerts/view";
import styles from "./seatbell.module.css";

function Bell({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7.5 2 7.5H4S6 15 6 9z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

/** "Notify me" (a full section) or "Alert for all sections" (the course header). Filled when watched; one tap removes. */
export function SeatBell({ state, courseId, sectionId, label }: { state: WatchesState; courseId: string; sectionId: string | null; label: string }) {
  const [error, setError] = useState<string | null>(null);
  if (state.phase === "loading" || state.phase === "unavailable") return null;
  const mode = state.mock ? "watch" : bellMode(pushSupport(currentPushEnv()));
  if (mode === "hidden") return null;
  if (mode === "link")
    return (
      <Link className={styles.bell} href="/alerts" title="Set up seat alerts">
        <Bell filled={false} />
        {label}
      </Link>
    );
  const watch = findWatch(state.data.watches, courseId, sectionId);
  return (
    <>
      <button
        type="button"
        className={styles.bell}
        data-on={!!watch || undefined}
        aria-pressed={!!watch}
        onClick={async () => {
          setError(null);
          if (watch) return state.remove(watch.id);
          if (state.phase === "needs-setup") {
            const setup = await state.enable();
            if (setup) return setError(setup);
          }
          const problem = await state.add(courseId, sectionId);
          if (problem) setError(problem === "limit" ? "20 watches is the limit" : "Couldn't add that watch");
        }}
      >
        <Bell filled={!!watch} />
        {watch ? "Watching" : label}
      </button>
      {error ? <span className={styles.err}>{error}</span> : null}
    </>
  );
}
