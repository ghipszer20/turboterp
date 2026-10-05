import { describe, expect, it } from "vitest";
import type { AcademicEvent } from "@turboterp/campus-data";
import type { Section } from "@turboterp/course-data/schedules";
import { emptySaved, savePlan, setOwnSection, withCourses } from "../saved";
import {
  appointmentIcs,
  easternToDate,
  nextRegistrationTerm,
  parsePrep,
  registrationChecklist,
  serializePrep,
  setAppointment,
  toggleChecked,
  type Prep,
  type TermPrep,
} from "../registration";

const sec = (courseId: string, id: string, open: number, days: string[] = ["M"], start = 600, end = 650): Section => ({
  id,
  courseId,
  instructors: [],
  seats: { total: 30, open, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings: [{ type: "Lecture", days: days as never, start, end, building: null, room: null } as never],
});

const events: AcademicEvent[] = [
  { term: "Fall 2026", kind: "registration-appointments", label: "Registration appointments", start: "2026-04-01" },
  { term: "Spring 2027", kind: "registration-appointments", label: "Registration appointments", start: "2026-11-02", end: "2026-11-20" },
  { term: "Spring 2027", kind: "first-day", label: "First day", start: "2027-01-25" },
];

const saved = withCourses(emptySaved("202701"), ["CMSC351", "STAT400"]);
const base = {
  term: "202701",
  termName: "Spring 2027",
  events,
  prep: undefined as TermPrep | undefined,
  now: new Date("2026-10-05T12:00:00Z"),
  asOf: "2026-10-05T09:00:00Z",
};
const ready = (r: ReturnType<typeof registrationChecklist>) => {
  if (r.status !== "ready") throw new Error(r.status);
  return r;
};

describe("nextRegistrationTerm", () => {
  it("is the term of the first registration event not yet over", () => {
    expect(nextRegistrationTerm(events, new Date("2026-10-05T12:00:00Z"))).toBe("Spring 2027");
    expect(nextRegistrationTerm(events, new Date("2027-06-01T12:00:00Z"))).toBeNull();
  });
});

describe("registrationChecklist", () => {
  it("says to switch terms when the builder is on another term", () => {
    const r = registrationChecklist({ ...base, termName: "Fall 2026", saved, courses: [], sections: [] });
    expect(r).toEqual({ status: "wrong-term", message: "Switch to Spring 2027 to prepare" });
  });

  it("asks for courses, not 'unpublished', when none are added yet", () => {
    expect(registrationChecklist({ ...base, saved, courses: [], sections: [] }).status).toBe("no-courses");
  });

  it("says the schedule isn't published when there are no sections", () => {
    expect(registrationChecklist({ ...base, saved, courses: ["CMSC351"], sections: [] }).status).toBe("not-published");
  });

  it("uses Build-my-own picks first, else Plan A; flags full sections for the waitlist", () => {
    const sections = [sec("CMSC351", "0101", 3), sec("CMSC351", "0201", 0, ["Tu"]), sec("STAT400", "0101", 0, ["W"])];
    let s = savePlan(saved, "A", { CMSC351: "0101", STAT400: "0101" });
    s = setOwnSection(s, "CMSC351", "0201");
    const r = ready(registrationChecklist({ ...base, saved: s, courses: ["CMSC351", "STAT400"], sections }));
    expect(r.courses[0]!.chosen?.id).toBe("0201");
    expect(r.courses[0]!.seat).toMatchObject({ kind: "waitlist", note: expect.stringMatching(/waitlist automatically/i) });
    expect(r.courses[0]!.seat).toMatchObject({ note: expect.stringMatching(/check in daily/i) });
    expect(r.courses[1]!.chosen?.id).toBe("0101");
    expect(r.asOf).toBe("2026-10-05T09:00:00Z");
  });

  it("marks open seats", () => {
    const s = savePlan(saved, "A", { CMSC351: "0101" });
    const r = ready(registrationChecklist({ ...base, saved: s, courses: ["CMSC351"], sections: [sec("CMSC351", "0101", 3)] }));
    expect(r.courses[0]!.seat).toMatchObject({ kind: "open", open: 3 });
  });

  it("backups: plan B/C section when different", () => {
    const sections = [sec("CMSC351", "0101", 3), sec("CMSC351", "0201", 5, ["Tu"]), sec("CMSC351", "0301", 5, ["W"])];
    let s = savePlan(saved, "A", { CMSC351: "0101" });
    s = savePlan(s, "B", { CMSC351: "0201" });
    s = savePlan(s, "C", { CMSC351: "0101" });
    const r = ready(registrationChecklist({ ...base, saved: s, courses: ["CMSC351"], sections }));
    expect(r.courses[0]!.backups.map((b) => b.id)).toEqual(["0201"]);
  });

  it("backups: else up to 2 open sections that don't conflict with the rest", () => {
    const sections = [
      sec("CMSC351", "0101", 3, ["M"], 600, 650),
      sec("CMSC351", "0201", 5, ["Tu"]),
      sec("CMSC351", "0301", 5, ["M"], 810, 840), // conflicts with STAT400 0101
      sec("CMSC351", "0401", 0, ["W"]), // full
      sec("CMSC351", "0501", 5, ["Th"]),
      sec("CMSC351", "0601", 5, ["F"]),
      sec("STAT400", "0101", 2, ["M"], 800, 850),
    ];
    const s = savePlan(saved, "A", { CMSC351: "0101", STAT400: "0101" });
    const r = ready(registrationChecklist({ ...base, saved: s, courses: ["CMSC351", "STAT400"], sections }));
    expect(r.courses[0]!.backups.map((b) => b.id)).toEqual(["0201", "0501"]);
  });

  it("has the two manual check-offs, with state from prep", () => {
    const s = savePlan(saved, "A", { CMSC351: "0101" });
    const r = ready(
      registrationChecklist({ ...base, saved: s, courses: ["CMSC351"], sections: [sec("CMSC351", "0101", 1)], prep: { checked: ["holds"] } }),
    );
    expect(r.manual).toEqual([
      { id: "advisor", label: "Meet your advisor if your college requires it", done: false },
      { id: "holds", label: "Check Testudo for holds", done: true },
    ]);
  });

  it("carries the appointment and the registration windows", () => {
    const s = savePlan(saved, "A", { CMSC351: "0101" });
    const r = ready(
      registrationChecklist({
        ...base,
        saved: s,
        courses: ["CMSC351"],
        sections: [sec("CMSC351", "0101", 1)],
        prep: { checked: [], appointment: "2026-11-03T09:00" },
      }),
    );
    expect(r.appointment).toBe("2026-11-03T09:00");
    expect(r.windows.map((e) => e.kind)).toEqual(["registration-appointments"]);
  });
});

describe("registration prep storage", () => {
  it("round-trips per term", () => {
    let p: Prep = {};
    p = setAppointment(p, "202701", "2026-11-03T09:00");
    p = toggleChecked(p, "202701", "holds");
    expect(parsePrep(serializePrep(p))).toEqual(p);
    expect(toggleChecked(p, "202701", "holds")["202701"]!.checked).toEqual([]);
  });

  it("drops bad fields", () => {
    const raw = JSON.stringify({ "202701": { appointment: "tomorrow", checked: ["holds", 5] }, bad: 3, "202708": { checked: "x" } });
    expect(parsePrep(raw)).toEqual({ "202701": { checked: ["holds"] }, "202708": { checked: [] } });
    expect(parsePrep("nope")).toEqual({});
    expect(parsePrep(null)).toEqual({});
  });

  it("clears the appointment", () => {
    const p = setAppointment(setAppointment({}, "202701", "2026-11-03T09:00"), "202701", null);
    expect(p["202701"]).toEqual({ checked: [] });
  });
});

describe("easternToDate", () => {
  it("handles daylight and standard time", () => {
    expect(easternToDate("2026-11-02T09:00")?.toISOString()).toBe("2026-11-02T14:00:00.000Z");
    expect(easternToDate("2026-08-02T09:00")?.toISOString()).toBe("2026-08-02T13:00:00.000Z");
    expect(easternToDate("junk")).toBeNull();
  });
});

describe("appointmentIcs", () => {
  const ics = appointmentIcs("Spring 2027", "2026-11-03T09:00", new Date("2026-10-05T12:00:00Z"));
  it("is one event with a single alarm, 1 day before", () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(1);
    expect(ics).toContain("TRIGGER:-P1D");
    expect(ics).not.toContain("TRIGGER:-PT15M");
    expect(ics).toContain("DTSTART;TZID=America/New_York:20261103T090000");
    expect(ics).toContain("SUMMARY:Registration appointment (Spring 2027)");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
  it("keeps every line within 75 octets", () => {
    for (const l of ics.split("\r\n")) expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75);
  });
});
