// Stand-in for the `highs` package inside the bridge bundle: same default export, but the 3.5 MB
// wasm is embedded in the bundle (esbuild "binary" loader) and handed to the `instantiateWasm` hook, so
// nothing is fetched at run time (works from a file:// or bundled-asset WebView, and offline).
// @ts-expect-error package subpath without types
import realLoad from "highs-real-js";
// @ts-expect-error binary loader
import wasm from "highs-wasm";

export default function loadHighs(opts: Record<string, unknown> = {}) {
  // This highs build ignores `wasmBinary`; the `instantiateWasm` hook is honored.
  const instantiateWasm = (
    imports: WebAssembly.Imports,
    done: (i: WebAssembly.Instance, m: WebAssembly.Module) => void,
  ) => {
    void WebAssembly.instantiate(wasm as BufferSource, imports).then((r) => done(r.instance, r.module));
    return {};
  };
  return (realLoad as (o: unknown) => Promise<unknown>)({ ...opts, instantiateWasm });
}
