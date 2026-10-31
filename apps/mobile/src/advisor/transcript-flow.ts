// Transcript import, minus the screen: source -> engine -> parse. The review step and applying the
// import are in transcript-review.ts. Nothing here touches the network; the transcript stays on
// the device (the engine bridge page may not fetch).
import { parseTranscriptText, type ParsedTranscript, type Source } from "@turboterp/app-core/transcript-parse";
import type { EngineError, EngineResult, Job, JobResult } from "../engine/protocol";

export type TranscriptSource =
  | { kind: "pdf"; base64: string }
  | { kind: "images"; base64s: string[] }
  | { kind: "paste"; text: string };

export type FlowEngine = { run<T extends Job["type"]>(job: Extract<Job, { type: T }>): Promise<EngineResult<JobResult<T>>> };

export type FlowResult =
  | { ok: true; parsed: ParsedTranscript; source: Source }
  | { ok: false; message: string; cancelled?: boolean };

export type CancelToken = { cancelled: boolean };

/** Plain wording for each engine failure. */
export function engineErrorText(e: EngineError): string {
  switch (e.code) {
    case "too-large":
      return "That file is too large to read on this phone. Try the paste box, or a smaller file.";
    case "timeout":
      return "Reading took too long and was stopped. Try fewer pages or a clearer photo, or use the paste box.";
    case "bad-input":
      return "Couldn't read that file. Try the paste box instead.";
    case "terminated":
      return "The reader was stopped by the phone running low on memory. Close other apps and try again, or use the paste box.";
    default:
      return "Couldn't read that file right now. Try again, or use the paste box.";
  }
}

const cancelled = (): FlowResult => ({ ok: false, cancelled: true, message: "" });

export async function readTranscript(
  source: TranscriptSource,
  engine: FlowEngine,
  onProgress: (detail: string) => void,
  token: CancelToken = { cancelled: false },
): Promise<FlowResult> {
  if (source.kind === "paste") {
    if (!source.text.trim()) return { ok: false, message: "Paste the transcript text first." };
    return { ok: true, parsed: parseTranscriptText(source.text, "paste"), source: "paste" };
  }

  let text: string;
  let from: Source;
  if (source.kind === "pdf") {
    onProgress("Reading the PDF...");
    const r = await engine.run({ type: "transcriptPdf", pdfBase64: source.base64 });
    if (token.cancelled) return cancelled();
    if (!r.ok) return { ok: false, message: engineErrorText(r.error) };
    if (r.value.hasTextLayer) {
      text = r.value.text;
      from = "pdf";
    } else {
      onProgress("No text found in this PDF, so reading it with on-device OCR. This can take a minute...");
      const o = await engine.run({ type: "transcriptOcr", source: "pdf", dataBase64: source.base64 });
      if (token.cancelled) return cancelled();
      if (!o.ok) return { ok: false, message: engineErrorText(o.error) };
      text = o.value.text;
      from = "ocr";
    }
  } else {
    if (source.base64s.length === 0) return { ok: false, message: "No photos were chosen." };
    const parts: string[] = [];
    for (let i = 0; i < source.base64s.length; i++) {
      onProgress(`Reading photo ${i + 1} of ${source.base64s.length} with on-device OCR...`);
      const o = await engine.run({ type: "transcriptOcr", source: "image", dataBase64: source.base64s[i]! });
      if (token.cancelled) return cancelled();
      if (!o.ok) return { ok: false, message: engineErrorText(o.error) };
      parts.push(o.value.text);
    }
    text = parts.join("\n");
    from = "ocr";
  }
  if (!text.trim()) return { ok: false, message: "No text could be read from that file. Try the paste box instead." };
  return { ok: true, parsed: parseTranscriptText(text, from), source: from };
}
