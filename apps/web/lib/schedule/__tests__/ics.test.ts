import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { allDayIcs, buildIcs, escapeText, foldLine } from "../ics";

describe("allDayIcs", () => {
  const now = new Date("2026-10-04T12:00:00Z");
  it("makes a one-day all-day event with an exclusive end", () => {
    const s = allDayIcs({ title: "Labor Day", start: "2026-09-07" }, now);
    expect(s).toContain("DTSTART;VALUE=DATE:20260907\r\n");
    expect(s).toContain("DTEND;VALUE=DATE:20260908\r\n");
    expect(s).toContain("SUMMARY:Labor Day\r\n");
    expect(s.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(s.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
  it("includes the last day of a range, across month ends", () => {
    const s = allDayIcs({ title: "Winter Break", start: "2026-12-28", end: "2027-01-31" }, now);
    expect(s).toContain("DTSTART;VALUE=DATE:20261228\r\n");
    expect(s).toContain("DTEND;VALUE=DATE:20270201\r\n");
  });
});
import { termDates } from "../term-dates";

const sec = (over: Partial<Section> = {}, meetings: Section["meetings"] = []): Section => ({
  id: "0101",
  courseId: "CMSC351",
  instructors: ["Ada Lovelace", "Alan Turing"],
  seats: { total: 10, open: 1, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings,
  ...over,
});
const mtg = (over = {}) => ({ days: ["Tu", "Th"], start: 9 * 60 + 30, end: 10 * 60 + 45, building: "IRB", room: "0324", type: "Lecture", ...over });
const unfold = (s: string) => s.replace(/\r\n /g, "");
const NOW = new Date("2026-09-28T12:00:00Z");
const ics = (sections: Section[], term = "202608") => unfold(buildIcs(term, sections, NOW));
const TZ = "America/New_York";

describe("term dates", () => {
  it("knows Fall 2026 and Spring 2027 only", () => {
    expect(termDates("202608")?.first).toBe("2026-08-31");
    expect(termDates("202701")?.noClasses).toContain("2027-03-16");
    expect(termDates("202801")).toBeNull();
  });
});

describe("text helpers", () => {
  it("escapes backslash, semicolon, comma and newline", () => {
    expect(escapeText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });
  it("folds at 75 octets, never splitting a multibyte character", () => {
    const lines = foldLine("SUMMARY:" + "é".repeat(100)).split("\r\n");
    expect(lines.length).toBeGreaterThan(1);
    for (const l of lines) expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75);
    expect(lines.slice(1).every((l) => l.startsWith(" "))).toBe(true);
    expect(unfold(lines.join("\r\n"))).toBe("SUMMARY:" + "é".repeat(100));
  });
  it("leaves short lines alone", () => expect(foldLine("A:b")).toBe("A:b"));
});

describe("buildIcs", () => {
  it("uses CRLF, a calendar wrapper and an America/New_York VTIMEZONE", () => {
    const out = buildIcs("202608", [sec({}, [mtg()])], NOW);
    expect(out.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(out.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(out.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
    expect(out).toContain("BEGIN:VTIMEZONE\r\nTZID:America/New_York");
  });

  it("emits summary, location, description, uid, dtstamp and TZID times", () => {
    const out = ics([sec({}, [mtg()])]);
    expect(out).toContain("SUMMARY:CMSC351 Lecture");
    expect(out).toContain("LOCATION:IRB 0324");
    expect(out).toContain("DESCRIPTION:Section 0101\\nInstructors: Ada Lovelace\\, Alan Turing");
    expect(out).toContain("UID:202608-CMSC351-0101-0@turboterp");
    expect(out).toContain("DTSTAMP:20260928T120000Z");
    expect(out).toContain(`DTSTART;TZID=${TZ}:20260901T093000`);
    expect(out).toContain(`DTEND;TZID=${TZ}:20260901T104500`);
  });

  it("starts on the first actual meeting weekday on/after the first day of classes", () => {
    // Aug 31 2026 is a Monday.
    expect(ics([sec({}, [mtg()])])).toContain(`DTSTART;TZID=${TZ}:20260901T093000`);
    expect(ics([sec({}, [mtg({ days: ["M", "W"] })])])).toContain(`DTSTART;TZID=${TZ}:20260831T093000`);
    expect(ics([sec({}, [mtg({ days: ["Su"] })])])).toContain(`DTSTART;TZID=${TZ}:20260906T093000`);
    expect(ics([sec({}, [mtg()])])).toContain("RRULE:FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=");
  });

  it("ends the rule at 23:59:59 Eastern on the last class day, in UTC", () => {
    expect(ics([sec({}, [mtg()])])).toContain("UNTIL=20261212T045959Z"); // EST
    expect(ics([sec({}, [mtg()])], "202701")).toContain("UNTIL=20270512T035959Z"); // EDT
  });

  it("excludes break days the meeting would fall on", () => {
    const out = ics([sec({}, [mtg({ days: ["M", "W"] })])]);
    expect(out).toContain(`EXDATE;TZID=${TZ}:20260907T093000`); // Labor Day (Mon)
    expect(out).toContain(`EXDATE;TZID=${TZ}:20261012T093000`); // Fall Break (Mon)
    expect(out).toContain(`EXDATE;TZID=${TZ}:20261125T093000`); // Thanksgiving (Wed)
    expect(out).not.toContain("20261013T093000"); // Tue: not a meeting day
  });

  it("does not exclude break days on other weekdays", () => {
    const out = ics([sec({}, [mtg({ days: ["Tu"] })])]);
    expect(out.match(/EXDATE/g)).toHaveLength(1); // only Fall Break Tuesday, not Labor Day or Thanksgiving
    expect(out).toContain("EXDATE;TZID=America/New_York:20261013T093000");
  });

  it("skips online/TBA meetings (start null)", () => {
    const out = ics([sec({}, [mtg({ start: null, end: null, days: [] })])]);
    expect(out).not.toContain("BEGIN:VEVENT");
  });

  it("makes one event per meeting, with a stable index in the uid", () => {
    const out = ics([sec({}, [mtg(), mtg({ type: "Discussion", days: ["F"], building: null, room: null })])]);
    expect(out.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(out).toContain("UID:202608-CMSC351-0101-1@turboterp");
    expect(out).toContain("SUMMARY:CMSC351 Discussion");
    expect(out.split("SUMMARY:CMSC351 Discussion")[1]!.split("END:VEVENT")[0]).not.toContain("LOCATION");
  });
});
