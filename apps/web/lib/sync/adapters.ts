// The documents as the sync engine sees them: raw text in, raw text out, validated with the
// app's own parsers. `replace` does not count as a student edit, so it never triggers a re-save.
import { parsePlan } from "@turboterp/app-core/storage";
import { isValidSaved } from "@turboterp/app-core/schedule/saved";
import { savedStore } from "../schedule/saved-store";
import { readPlanRaw, replacePlanFromRemote } from "../../app/advisor/store";
import type { Deps } from "@turboterp/app-core/sync/engine";

/** The retired registration checklist's storage key: no longer written, but still removed when this browser's synced data is cleared. */
export const LEGACY_REGISTRATION_KEY = "turboterp-registration";

function removeLegacyRegistration() {
  try {
    window.localStorage.removeItem(LEGACY_REGISTRATION_KEY);
  } catch {
    // blocked: nothing to remove
  }
}

export function createDocAdapters(): Deps["docs"] {
  return {
    plan: { read: readPlanRaw, replace: replacePlanFromRemote, validate: (raw) => parsePlan(raw) !== null },
    schedule: { read: () => savedStore.getSnapshot(), replace: (raw) => {
        savedStore.replace(raw);
        if (raw === null) removeLegacyRegistration();
      },
      validate: isValidSaved },
  };
}
