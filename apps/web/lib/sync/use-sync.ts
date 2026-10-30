"use client";

import { useSyncExternalStore } from "react";
import { getAppSync, type Ask } from "./app-sync";
import type { SaveStatus } from "./status";

const NO_ASKS: readonly Ask[] = [];

export const useSyncAsks = (): readonly Ask[] =>
  useSyncExternalStore(
    (fn) => getAppSync().subscribeAsks(fn),
    () => getAppSync().getAsks(),
    () => NO_ASKS,
  );

export const useSaveStatus = (): SaveStatus =>
  useSyncExternalStore(
    (fn) => getAppSync().status.subscribe(fn),
    () => getAppSync().status.get(),
    () => "saved" as SaveStatus,
  );
