// Wording for the one question account sync ever asks: at sign-in, when this browser's copy and the
// account's copy have never been synced with each other and differ. The dialog is the confirmation.
import type { DocKind } from "./decide";
import { summarize } from "./summary";

const NOUN: Record<DocKind, { title: string; keep: string }> = {
  plan: { title: "plan", keep: "plan" },
  schedule: { title: "schedule", keep: "schedule" },
  registration: { title: "registration checklist", keep: "checklist" },
};

export function chooserCopy(kind: DocKind) {
  const n = NOUN[kind];
  return {
    title: `Replace the ${n.title} saved in your account with this one?`,
    replace: "Replace it",
    keep: `Keep my saved ${n.keep}`,
  };
}

/** "This device: <summary> \u00b7 Your account: <summary>" */
export function copyLine(kind: DocKind, local: string | null, remote: string | null, nameOf?: (id: string) => string) {
  const one = (raw: string | null) => summarize(kind, raw, nameOf).lines.join(", ");
  return `This device: ${one(local)} \u00b7 Your account: ${one(remote)}`;
}
