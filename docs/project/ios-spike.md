# iOS spike S0 (2026-10-31)

Question: can the shared packages run in an Expo / React Native app? Setup: `apps/mobile`, npm workspace `@turboterp/mobile`, Expo SDK 58 (React Native 0.88.1, Hermes compiler 1.0.0, React 19.3.0), expo-router 58.

## Setup findings
- **React versions:** web is pinned to React 19.2.8, Expo SDK 58 wants 19.3.0. npm nests the Expo copy in `apps/mobile/node_modules` (and `react-native` etc.); the web keeps 19.2.8 at the root. No conflict, `apps/web` untouched. Metro's default config already handles workspaces.
- **Raw `.ts` packages:** Metro resolves `@turboterp/audit` and `@turboterp/audit/programs/*.ts` with no extra config.
- `highs` ignores `wasmBinary` here; it honors the Emscripten `instantiateWasm` hook, and otherwise fetches `highs.wasm` via `import.meta.url`. A5 needs an optional loader hook in `audit.ts`, or the bundler alias used in `apps/mobile/bridge/highs-inline.ts`.

## Results
| Case | Result |
|---|---|
| (a) highs + audit on Hermes | **Not testable here, unverified.** The only Windows Hermes VM on npm (`hermes-engine-cli` 0.12.0) predates WebAssembly (`typeof WebAssembly` is `undefined`). RN 0.88 ships only `hermesc` (a compiler, no VM). Evidence for support is one secondary source (Callstack, "RN 0.84: WebAssembly"); the official 0.84 post doesn't mention it. Even with a WebAssembly global, the Emscripten glue (TextDecoder, fetch) is untested on Hermes. Needs a real device (Expo Go) to settle. |
| (b) audit in a WebView-style bridge | **Pass.** `bridge/entry.ts` bundles (esbuild, 6.6 MB, wasm inlined, nothing fetched) a real CS-major audit; headless Edge answers a postMessage request with every requirement `satisfied` (`test/bridge.test.ts`). |
| (c) pdfjs text extraction in the bridge | **Pass.** `pdfjs-dist` legacy build, worker bundled and run in-page (no worker or CDN), extracts text from a generated PDF. |
| (d) no Node-only modules reachable | **Pass.** `scripts/check-import-graph.mjs` (run by `npm run lint` and `test/import-graph.test.ts`) bundles the app and bridge entries and fails on `node:*`, builtins, `cheerio`, `@napi-rs/*` or `packages/catalog`. Allowed only inside `highs` and `pdfjs-dist` (dead, environment-guarded branches). A planted `node:fs` import was caught. |
| (e) `expo export --platform web` | **Pass.** Builds with the workspace audit imported (entry bundle 1.1 MB). The audit was not run in the web export. |

## Decision
**The audit and transcript run through the WebView engine bridge (A5 as planned). Capacitor fallback is not needed.** The bridge is proven in a browser context; native Hermes WebAssembly can't be proven without a device, so the app doesn't depend on it. If a later Expo Go check shows `highs` running on Hermes, the audit can move native and A5 shrinks to transcript + exports.

Not covered: real WKWebView behavior (memory kill, `file://` asset loading, bundled-asset wasm, startup time of a 6.6 MB page). A5 must test these on a device; its plan-section-8 rules (reload after process termination, size caps, timeouts, warm-start after first render) stand.
