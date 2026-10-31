// The one sync instance for the app, built from the real pieces. Created on first use.
import { AppState } from "react-native";
import type { DocKind } from "@turboterp/app-core/sync/decide";
import { createRemote } from "@turboterp/app-core/sync/remote";
import { kvStore } from "../storage";
import { getAuthClient } from "./client";
import { createMobileSync } from "./sync";

let instance: ReturnType<typeof createMobileSync> | null = null;

export const getAppSync = () =>
  (instance ??= createMobileSync({
    kv: kvStore,
    remote: createRemote(getAuthClient),
    // No "online" event in React Native: coming back to the foreground retries a failed save.
    listenOnline: (cb) => {
      const sub = AppState.addEventListener("change", (s) => s === "active" && cb());
      return () => sub.remove();
    },
  }));

/** Stores call this after the student (not the account) changed the plan or schedule. */
export const notifyLocalChange = (kind: DocKind): void => getAppSync().localChanged(kind);
