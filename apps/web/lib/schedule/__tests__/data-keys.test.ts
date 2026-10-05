import { describe, expect, it } from "vitest";
import { scheduleDataKey } from "../data-keys";

describe("scheduleDataKey", () => {
  it("maps the current-term pointer with a short cache", () => {
    expect(scheduleDataKey(["current"])).toEqual({ key: "schedule/current", maxAge: 300 });
  });

  it("maps a term's course index", () => {
    expect(scheduleDataKey(["202701", "index"])).toEqual({ key: "schedule/202701/index", maxAge: 3600 });
  });

  it("maps a department's sections (seats change every 15 minutes, so 2 minutes)", () => {
    expect(scheduleDataKey(["202701", "sections", "CMSC"])).toEqual({
      key: "schedule/202701/sections/CMSC",
      maxAge: 120,
    });
  });

  it("maps a department's grades", () => {
    expect(scheduleDataKey(["202701", "grades", "STAT"])).toEqual({ key: "schedule/202701/grades/STAT", maxAge: 86400 });
  });

  it.each([
    [["2027", "index"]],
    [["202701", "sections", "cmsc"]],
    [["202701", "sections", "../x"]],
    [["202701", "sections"]],
    [["202701", "other", "CMSC"]],
    [["202701", "index", "extra"]],
    [[]],
  ])("rejects %j", (parts) => {
    expect(scheduleDataKey(parts)).toBeNull();
  });
});
