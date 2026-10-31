// Engine bridge page (spike). Runs inside a WebView (or any browser context) and answers
// postMessage requests: { id, type: "audit" | "pdf-text", ... } -> { id, ok, result | error }.
// Replies go to window.ReactNativeWebView.postMessage (react-native-webview) or window.parent.
import { runSampleAudit } from "../src/sampleAudit";
import { extractPdfText } from "./pdf";

type Req = { id: number; type: "audit" } | { id: number; type: "pdf-text"; base64: string };

function reply(msg: unknown) {
  const text = JSON.stringify(msg);
  const rn = (window as unknown as { ReactNativeWebView?: { postMessage(s: string): void } }).ReactNativeWebView;
  if (rn) rn.postMessage(text);
  else window.parent.postMessage(text, "*");
}

async function handle(req: Req) {
  try {
    if (req.type === "audit") reply({ id: req.id, ok: true, result: await runSampleAudit() });
    else if (req.type === "pdf-text") reply({ id: req.id, ok: true, result: await extractPdfText(req.base64) });
    else reply({ id: (req as Req).id, ok: false, error: "unknown type" });
  } catch (e) {
    reply({ id: req.id, ok: false, error: String(e) });
  }
}

function onMessage(ev: MessageEvent) {
  try {
    const req = (typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data) as Req;
    if (req && typeof req.id === "number") void handle(req);
  } catch {
    /* ignore foreign messages */
  }
}
window.addEventListener("message", onMessage);
document.addEventListener("message", onMessage as EventListener); // Android WebView delivers here
reply({ ready: true });
