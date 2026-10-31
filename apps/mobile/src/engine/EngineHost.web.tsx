// The web export only exists for screenshots: no WebView there, and no 18 MB engine page in the bundle.
// Metro picks this file over EngineHost.tsx on web; engine jobs fail with "unavailable" after the ready timeout.
import { createEngineClient, type EngineClient } from "./client";

/** The one engine for the app (inert on web). */
export const engine: EngineClient = createEngineClient({
  send: () => undefined,
  reload: () => undefined,
});

export function EngineHost() {
  return null;
}
