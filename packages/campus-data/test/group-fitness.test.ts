import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { classKind, classPlace, parseGroupFitness } from "../src/group-fitness.ts";

const html = readFileSync(new URL("./fixtures/group-fitness.html", import.meta.url), "utf8");

describe("parseGroupFitness", () => {
  const classes = parseGroupFitness(html);

  it("reads every row of the seven day tables", () => {
    expect(classes.length).toBeGreaterThan(100);
    expect(new Set(classes.map((c) => c.day)).size).toBe(7);
  });

  it("parses the first row", () => {
    expect(classes[0]).toEqual({
      day: "Monday",
      name: "BodyPump",
      location: "ERC Fitness Studio",
      instructor: "Angeli N.",
      start: 450,
      end: 510,
      signupUrl: "https://activeterp.umd.edu/Program/GetProgramDetails?courseId=a2148a9f-ff7e-4f48-8ec1-1d30aba9511d",
    });
  });

  it("parses mixed-case am/pm and decodes entities", () => {
    expect(classes.some((c) => c.start === 17 * 60 + 15)).toBe(true);
    expect(classes.some((c) => c.name === "Strength & Conditioning")).toBe(true);
  });

  it("keeps the 4:00PM-4:00PM row with no end", () => {
    const bad = classes.filter((c) => c.start === 960 && c.end === undefined);
    expect(bad).toHaveLength(1);
  });

  it("only keeps ActiveTerp sign-up links", () => {
    expect(classes.every((c) => c.signupUrl === undefined || c.signupUrl.startsWith("https://activeterp.umd.edu/"))).toBe(true);
    const swapped = html.replace("https://activeterp.umd.edu/Program/GetProgramDetails?courseId=a2148a9f", "https://evil.example/x?a2148a9f");
    expect(parseGroupFitness(swapped)[0]?.signupUrl).toBeUndefined();
  });

  it("throws a clear error when the page shape changes", () => {
    expect(() => parseGroupFitness("<html><body>nothing</body></html>")).toThrow(/layout changed/);
    expect(() => parseGroupFitness("<table><thead><tr><th>Foo</th></tr></thead></table>")).toThrow(/layout changed/);
  });
});

describe("classKind", () => {
  it.each([
    ["Pilates", "Mind-body"],
    ["Barre", "Mind-body"],
    ["Paddleboard Yoga", "Mind-body"],
    ["Rhythm Ride 45", "Cycling"],
    ["Terp Ride 30", "Cycling"],
    ["Cycle Strength", "Cycling"],
    ["BodyPump", "Strength"],
    ["Les Mills Core", "Strength"],
    ["Strength & Conditioning", "Strength"],
    ["Zumba", "Dance & cardio"],
    ["DanceFit", "Dance & cardio"],
    ["UBOX 45", "Dance & cardio"],
    ["BodyCombat", "Dance & cardio"],
    ["Aqua Fit", "Aqua"],
    ["Something New", "Other"],
  ])("%s -> %s", (name, kind) => {
    expect(classKind(name)).toBe(kind);
  });
});

describe("classPlace", () => {
  it("maps studios to buildings", () => {
    expect(classPlace("ERC Fitness Studio")).toBe("Eppley");
    expect(classPlace("Ritchie MPR")).toBe("Ritchie");
    expect(classPlace("Regents Cycle studio")).toBe("Regents");
    expect(classPlace("Somewhere")).toBe("Other");
  });
});
