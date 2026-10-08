// The "which copy?" flow for one document, free of React: pick a copy, then confirm. Nothing is
// resolved (and so nothing deleted) until the confirm.
import type { DocKind } from "./decide";

export type Choice = "local" | "remote";
export type ChooserState = { step: "pick" | "confirm"; choice: Choice | null };

const NOUN: Record<DocKind, string> = { plan: "plan", schedule: "schedule", registration: "registration prep" };

/** `noRemote`: the account has no copy (this browser holds a copy that may be another account's). */
export function chooserCopy(kind: DocKind, noRemote: boolean) {
  const n = NOUN[kind];
  return {
    title: noRemote
      ? `This device has a ${n} that isn't saved to your account. It may belong to someone who used this browser before.`
      : `Your ${n} is different on this device and in your account.`,
    keepLocal: `Keep this device's ${n}`,
    keepRemote: noRemote ? "Remove it from this device" : `Use the ${n} saved to your account`,
    confirm: (choice: Choice) =>
      noRemote && choice === "remote"
        ? `Are you sure you want to delete the ${n} on this device?`
        : `Are you sure you want to delete the other copy of your ${n}?`,
  };
}

export function createChooserFlow(kind: DocKind, noRemote: boolean, resolve: (kind: DocKind, keep: Choice) => void) {
  let state: ChooserState = { step: "pick", choice: null };
  return {
    state: () => state,
    choose(choice: Choice) {
      // Keeping this device's copy when the account has none deletes nothing: no confirm needed.
      if (noRemote && choice === "local") return resolve(kind, choice);
      state = { step: "confirm", choice };
    },
    back() {
      state = { step: "pick", choice: null };
    },
    confirm() {
      if (state.step === "confirm" && state.choice) resolve(kind, state.choice);
    },
  };
}
