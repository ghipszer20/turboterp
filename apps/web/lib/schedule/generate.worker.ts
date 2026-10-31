// Web Worker: layout generation off the main thread, so typing, scrolling and filter taps
// never wait on it. The layout table's buffer is transferred, not copied.

import { runGeneration, type GenerateRequest } from "@turboterp/app-core/schedule/generate";

type Scope = {
  onmessage: ((e: MessageEvent<{ id: number; req: GenerateRequest }>) => void) | null;
  postMessage(message: unknown, transfer: Transferable[]): void;
};
const scope = self as unknown as Scope;

scope.onmessage = (e) => {
  const result = runGeneration(e.data.req);
  scope.postMessage({ id: e.data.id, result }, [result.layouts.table.buffer]);
};
