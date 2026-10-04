import { describe, expect, it } from "vitest";
import { parseHours, type RecWellAreaToday } from "@turboterp/campus-data";
import { gymRowTitle, MAIN_GYMS, regroupEppleyAreas } from "../gyms";

const area = (
  group: string,
  name: string,
  setting: "indoor" | "outdoor",
  url: string | null,
  hoursLabel = "6am to 9pm",
): RecWellAreaToday => ({ group, name, url, setting, hours: parseHours(hoursLabel) });

describe("MAIN_GYMS", () => {
  // Live sheet names fetched 2026-09-26 (see gid 883167948, "School of
  // Public Health" tab): group "School of Public Health", area "Fitness
  // Center". The pattern already matches this exactly -- this test is a
  // regression guard, not a fix, since the live data didn't need one.
  const keys = [
    "Eppley Recreation Center | Eppley Recreation Center",
    "Ritchie Coliseum | Ritchie Coliseum",
    "School of Public Health | Fitness Center",
  ];

  it("matches all three main gyms against their live group/area names", () => {
    for (const key of keys) {
      expect(MAIN_GYMS.some((p) => p.test(key))).toBe(true);
    }
  });

  it("does not match a School of Public Health area other than Fitness Center", () => {
    const sph = MAIN_GYMS[2]!;
    expect(sph.test("School of Public Health | Weight Room")).toBe(false);
    expect(sph.test("School of Public Health | Gym (Volleyball Informal Rec)")).toBe(false);
  });
});

describe("gymRowTitle", () => {
  it("shows just the building name when the area name repeats it", () => {
    expect(gymRowTitle("Eppley Recreation Center", "Eppley Recreation Center")).toBe("Eppley Recreation Center");
    expect(gymRowTitle("Ritchie Coliseum", "Ritchie Coliseum")).toBe("Ritchie Coliseum");
  });

  it("shortens School of Public Health so the row stays one line", () => {
    expect(gymRowTitle("School of Public Health", "Fitness Center")).toBe("SPH Fitness Center");
  });
});

describe("regroupEppleyAreas", () => {
  it("folds the Natatorium and Outdoor Aquatic Center into an Aquatics sub-section of Eppley", () => {
    const areas = [
      area("Natatorium", "Natatorium", "indoor", "https://recwell.umd.edu/natatorium"),
      area("Natatorium", "50 Meter Pool", "indoor", "https://recwell.umd.edu/natatorium"),
      area("Natatorium", "Sauna", "indoor", "https://recwell.umd.edu/natatorium"),
      area("Outdoor Aquatic Center", "Outdoor Aquatic Center", "outdoor", "https://recwell.umd.edu/outdoor-aquatic-center"),
    ];
    const result = regroupEppleyAreas(areas);
    expect(result.every((a) => a.group === "Eppley Recreation Center" && a.subsection === "Aquatics")).toBe(true);
    // Sauna isn't a pool, but it's kept -- it's part of the same Natatorium
    // tab and the ask was to fold the tab in, not to drop amenities from it.
    expect(result.map((a) => a.name)).toContain("Sauna");
  });

  it("folds only the outdoor Climbing Wall into Eppley, fixing its swapped URL, and leaves the Challenge Course alone", () => {
    const areas = [
      area(
        "Adventure Program",
        "Climbing Wall",
        "outdoor",
        "https://recwell.umd.edu/programs-activities/adventure-program/challenge-course", // sheet has this swapped
      ),
      area(
        "Adventure Program",
        "Challenge Course",
        "outdoor",
        "https://recwell.umd.edu/programs-activities/adventure-program/climbing-wall-bouldering-grotto", // sheet has this swapped
      ),
      // The indoor Bouldering Zone is a different area entirely and must not move.
      area(
        "Eppley Recreation Center",
        "Bouldering Zone",
        "indoor",
        "https://recwell.umd.edu/programs-activities/adventure-program/bouldering-zone",
      ),
    ];
    const result = regroupEppleyAreas(areas);
    const wall = result.find((a) => a.name === "Climbing Wall")!;
    const course = result.find((a) => a.name === "Challenge Course")!;
    const boulder = result.find((a) => a.name === "Bouldering Zone")!;

    expect(wall.group).toBe("Eppley Recreation Center");
    expect(wall.subsection).toBe("Climbing");
    expect(wall.url).toBe("https://recwell.umd.edu/programs-activities/adventure-program/climbing-wall-bouldering-grotto");

    expect(course.group).toBe("Adventure Program");
    expect(course.subsection).toBeUndefined();

    expect(boulder.group).toBe("Eppley Recreation Center");
    expect(boulder.subsection).toBeUndefined();
  });

  it("folds the Eppley Tennis & Pickleball Courts group into a Pickleball Courts sub-section", () => {
    const areas = [
      area(
        "Eppley Tennis & Pickleball Courts",
        "Eppley Tennis & Pickleball Courts",
        "outdoor",
        "https://recwell.umd.edu/eppley-tennis-and-pickleball-courts",
        "dawn to 1am",
      ),
      area(
        "Eppley Tennis & Pickleball Courts",
        "Pickleball (Informal Rec)",
        "outdoor",
        "https://recwell.umd.edu/eppley-tennis-and-pickleball-courts",
        "--",
      ),
    ];
    const result = regroupEppleyAreas(areas);
    expect(result.every((a) => a.group === "Eppley Recreation Center" && a.subsection === "Pickleball Courts")).toBe(
      true,
    );
  });

  it("leaves areas that aren't part of Eppley untouched", () => {
    const areas = [area("Ritchie Coliseum", "Ritchie Coliseum", "indoor", "https://recwell.umd.edu/ritchie-coliseum-0")];
    const result = regroupEppleyAreas(areas);
    expect(result).toEqual(areas.map((a) => ({ ...a, subsection: undefined })));
  });
});
