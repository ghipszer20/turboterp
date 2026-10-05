"use client";

// Runs generation in a Web Worker (main-thread fallback if workers are unavailable) and
// returns the latest answer; `pending` while the current request is still being worked on.

import { useEffect, useRef, useState } from "react";
import { runGeneration, type GenerateRequest, type GenerateResult } from "./generate";

export type Answer = { req: GenerateRequest; result: GenerateResult };

export function useLayouts(req: GenerateRequest | null): Shown {
  const worker = useRef<Worker | null | undefined>(undefined);
  const seq = useRef(0);
  const [answer, setAnswer] = useState<Answer | null>(null);

  useEffect(
    () => () => {
      worker.current?.terminate();
      worker.current = undefined;
    },
    [],
  );

  useEffect(() => {
    if (!req) return;
    let live = true;
    const id = ++seq.current;
    const accept = (result: GenerateResult) => {
      if (live) setAnswer({ req, result });
    };
    if (worker.current === undefined) {
      try {
        worker.current = new Worker(new URL("./generate.worker.ts", import.meta.url));
      } catch {
        worker.current = null;
      }
    }
    const w = worker.current;
    if (w) {
      // Replies to older requests (still queued in the worker) are ignored.
      w.onmessage = (e: MessageEvent<{ id: number; result: GenerateResult }>) => {
        if (e.data.id === id) accept(e.data.result);
      };
      w.postMessage({ id, req });
    } else {
      setTimeout(() => accept(runGeneration(req)), 0);
    }
    return () => {
      live = false;
    };
  }, [req]);

  return shownLayouts(req, answer);
}

/**
 * What the gallery shows: the latest answer together with the request it answers. While a newer
 * request is pending the old layouts stay on screen, and they only decode against their own
 * request's course list and sections (the removed course's sections leave the loaded data at
 * once, so pairing old layouts with current data crashed the page when a course was removed).
 */
export type Shown = { shown: Answer | null; pending: boolean };

export function shownLayouts(req: GenerateRequest | null, answer: Answer | null): Shown {
  if (!req) return { shown: null, pending: false };
  return { shown: answer, pending: answer?.req !== req };
}
