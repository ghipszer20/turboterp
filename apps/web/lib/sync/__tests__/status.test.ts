import { describe, expect, it } from "vitest";
import { createSaveStatus, statusText } from "../status";
import type { DocKind } from "../decide";

describe("save status", () => {
  it("saved -> saving -> saved, and error until the next edit", () => {
    let dirty: DocKind[] = [];
    const s = createSaveStatus(() => dirty);
    expect(s.get()).toBe("saved");
    dirty = ["plan"];
    s.notify();
    expect(s.get()).toBe("saving");
    s.onError("plan");
    expect(s.get()).toBe("error");
    s.localChanged("plan");
    expect(s.get()).toBe("saving");
    dirty = [];
    s.notify();
    expect(s.get()).toBe("saved");
  });
  it("tells subscribers", () => {
    const s = createSaveStatus(() => []);
    let n = 0;
    s.subscribe(() => n++);
    s.onError("plan");
    expect(n).toBe(1);
  });
  it("wording", () => {
    expect(statusText("saved")).toBe("Saved to your account");
    expect(statusText("saving")).toBe("Saving…");
    expect(statusText("error")).toBe("Couldn't save to your account. It's still on this device.");
  });
});
