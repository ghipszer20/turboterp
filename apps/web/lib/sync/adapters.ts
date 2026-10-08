// The three documents as the sync engine sees them: raw text in, raw text out, validated with the
// app's own parsers. `replace` does not count as a student edit, so it never triggers a re-save.
import { parsePlan } from "../advisor/storage";
import { isValidSaved } from "../schedule/saved";
import { parsePrep } from "../schedule/registration";
import { prepStore } from "../schedule/registration-store";
import { savedStore } from "../schedule/saved-store";
import { readPlanRaw, replacePlanFromRemote } from "../../app/advisor/store";
import type { Deps } from "./engine";

const isPrep = (raw: string) => {
  try {
    const v = JSON.parse(raw) as unknown;
    return typeof v === "object" && v !== null && !Array.isArray(v) && Object.keys(parsePrep(raw)).length === Object.keys(v).length;
  } catch {
    return false;
  }
};

export function createDocAdapters(): Deps["docs"] {
  return {
    plan: { read: readPlanRaw, replace: replacePlanFromRemote, validate: (raw) => parsePlan(raw) !== null },
    schedule: { read: () => savedStore.getSnapshot(), replace: (raw) => savedStore.replace(raw), validate: isValidSaved },
    registration: { read: () => prepStore.getSnapshot(), replace: (raw) => prepStore.replace(raw), validate: isPrep },
  };
}
