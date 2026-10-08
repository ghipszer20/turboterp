import { describe, expect, it, vi } from "vitest";
import { chooserCopy, createChooserFlow } from "../chooser";
import { summarize } from "../summary";

describe("chooser flow", () => {
  it("changes nothing until the confirm tap", () => {
    const resolve = vi.fn();
    const f = createChooserFlow("plan", false, resolve);
    f.choose("local");
    expect(f.state().step).toBe("confirm");
    expect(resolve).not.toHaveBeenCalled();
    f.back();
    expect(f.state().step).toBe("pick");
    expect(resolve).not.toHaveBeenCalled();
    f.choose("remote");
    f.confirm();
    expect(resolve).toHaveBeenCalledExactlyOnceWith("plan", "remote");
  });
  it("uploads without a confirm when the account has no copy", () => {
    const resolve = vi.fn();
    const f = createChooserFlow("plan", true, resolve);
    f.choose("local");
    expect(resolve).toHaveBeenCalledWith("plan", "local");
  });
  it("removing a device copy asks first", () => {
    const resolve = vi.fn();
    const f = createChooserFlow("schedule", true, resolve);
    f.choose("remote");
    expect(resolve).not.toHaveBeenCalled();
    expect(chooserCopy("schedule", true).confirm("remote")).toBe("Are you sure you want to delete the schedule on this device?");
    f.confirm();
    expect(resolve).toHaveBeenCalledWith("schedule", "remote");
  });
  it("words the confirm per document", () => {
    expect(chooserCopy("plan", false).confirm("local")).toBe("Are you sure you want to delete the other copy of your plan?");
    expect(chooserCopy("schedule", false).confirm("local")).toBe("Are you sure you want to delete the other copy of your schedule?");
    expect(chooserCopy("registration", false).confirm("remote")).toBe("Are you sure you want to delete the other copy of your registration prep?");
    expect(chooserCopy("plan", false).title).toBe("Your plan is different on this device and in your account.");
    expect(chooserCopy("plan", false).keepLocal).toBe("Keep this device's plan");
    expect(chooserCopy("plan", false).keepRemote).toBe("Use the plan saved to your account");
    expect(chooserCopy("plan", true).keepRemote).toBe("Remove it from this device");
  });
});

describe("summarize", () => {
  it("plan: programs and number of terms", () => {
    const raw = JSON.stringify({ v: 1, programs: ["cs-bs"], catalogYear: "2025", startTerm: "Fall 2025", terms: [{}, {}] });
    expect(summarize("plan", raw).lines).toEqual(["Programs: cs-bs", "2 terms"]);
  });
  it("schedule and registration", () => {
    expect(summarize("schedule", JSON.stringify({ v: 1, term: "202701", courses: ["CMSC131", "MATH140"] })).lines).toEqual(["Term 202701", "2 courses"]);
    expect(summarize("registration", JSON.stringify({ "202701": { checked: [] } })).lines).toEqual(["1 term"]);
  });
  it("bad input gives an empty summary", () => {
    expect(summarize("plan", "nope").lines).toEqual([]);
    expect(summarize("plan", null).lines).toEqual([]);
  });
});
