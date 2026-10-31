import { describe, expect, it } from "vitest";
import type { DayHours } from "@turboterp/campus-data/hours";
import { clockAt, pickDay } from "@turboterp/app-core/campus-clock";
import { campusTagForKey, campusTagsForKeys } from "../campus-tags";
import { hoursStatus } from "@turboterp/app-core/status";

// 9:00-17:00, as a cached page would hold it.
const hours: DayHours = { kind: "ranges", label: "9am-5pm", ranges: [{ start: 9 * 60, end: 17 * 60 }] };

describe("campus clock", () => {
  it("reads campus date and minutes from the given instant", () => {
    // 2026-10-30 14:30 EDT = 18:30 UTC
    expect(clockAt(new Date("2026-10-30T18:30:00Z"))).toEqual({ today: "2026-10-30", tomorrow: "2026-10-31", minutes: 14 * 60 + 30 });
  });

  it("the same cached hours read Open or Closed by the browser's clock", () => {
    const noon = clockAt(new Date("2026-10-30T16:00:00Z"));
    const night = clockAt(new Date("2026-10-31T02:00:00Z"));
    expect(hoursStatus(hours, noon.minutes).status).toBe("open");
    expect(hoursStatus(hours, night.minutes).status).toBe("closed");
  });

  it("picks today's entry, else the newest", () => {
    const days = { "2026-10-30": "a", "2026-10-31": "b" };
    expect(pickDay(days, "2026-10-31")).toEqual({ date: "2026-10-31", value: "b" });
    expect(pickDay(days, "2026-11-02")).toEqual({ date: "2026-10-31", value: "b" });
    expect(pickDay({}, "2026-11-02")).toBeNull();
  });
});

describe("campus tags", () => {
  it("maps snapshot keys to tags", () => {
    expect(campusTagForKey("rooms/2026-10-30/1-2")).toBe("campus:rooms");
    expect(campusTagForKey("dining/stamp")).toBe("campus:dining");
    expect(campusTagForKey("libraries/hours")).toBe("campus:hours");
    expect(campusTagForKey("status/rooms/catalog")).toBeNull();
    expect(campusTagsForKeys(["rooms/a", "rooms/b", "recwell/areas", "buildings"])).toEqual(["campus:rooms", "campus:recwell"]);
  });
});
