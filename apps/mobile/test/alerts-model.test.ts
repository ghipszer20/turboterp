import { describe, expect, it } from "vitest";
import type { WatchRow } from "@turboterp/app-core/seat-alerts/view";
import { addErrorText, sectionAction, showAllSections } from "../src/alerts/model";

const sec = (id: string, open: number) => ({ id, courseId: "CMSC351", seats: { open, total: 30, waitlist: 2, holdfile: 0 } });
const watch = (sectionId: string | null): WatchRow => ({ id: "w", term: "202608", courseId: "CMSC351", sectionId, lastAlertAt: null, doneAt: null });

describe("watch list view model", () => {
  it("open sections link out, full ones notify, watched ones say watching", () => {
    expect(sectionAction(sec("0101", 3), [])).toBe("open");
    expect(sectionAction(sec("0101", 0), [])).toBe("notify");
    expect(sectionAction(sec("0101", 0), [watch("0101")])).toBe("watching");
  });
  it("offers all-sections only while a section is full", () => {
    expect(showAllSections([sec("a", 1), sec("b", 0)])).toBe(true);
    expect(showAllSections([sec("a", 1)])).toBe(false);
  });
  it("words the add errors", () => {
    expect(addErrorText("limit")).toMatch(/20/);
    expect(addErrorText("weird")).toMatch(/Couldn't/);
  });
});
