import { describe, expect, it } from "vitest";
import { buildingByCode, parseBuildings } from "../src/buildings.ts";
import { SourceError } from "../src/http.ts";

const raw = [
  { name: "Brendan Iribe Center", code: "", id: "432", long: -76.9364438800535, lat: 38.9891607057353 },
  { name: "South Campus Dining Hall", code: "SDH", id: "026", long: -76.9436837393588, lat: 38.983048 },
  // Blank/garbage rows the feed sometimes has: no coordinates, or no name.
  { name: "", code: "", id: "000", long: 0, lat: 0 },
  { name: "No Coords Hall", code: "", id: "999", long: "not-a-number", lat: 38.98 },
];

describe("parseBuildings", () => {
  it("keeps name, id, and lat/lon (renaming umd.io's long to lon)", () => {
    expect(parseBuildings(raw)).toEqual([
      { id: "432", name: "Brendan Iribe Center", code: "", lat: 38.9891607057353, lon: -76.9364438800535 },
      { id: "026", name: "South Campus Dining Hall", code: "SDH", lat: 38.983048, lon: -76.9436837393588 },
    ]);
  });

  it("drops rows with no name or invalid coordinates", () => {
    const names = parseBuildings(raw).map((b) => b.name);
    expect(names).not.toContain("");
    expect(names).not.toContain("No Coords Hall");
  });

  it("fails loudly if the feed isn't an array", () => {
    expect(() => parseBuildings({ buildings: [] })).toThrow(SourceError);
  });

  it("fails loudly on an empty feed", () => {
    expect(() => parseBuildings([])).toThrow(SourceError);
  });
});

describe("buildingByCode", () => {
  const list = parseBuildings(raw);
  it("matches umd.io codes, case-insensitively", () => {
    expect(buildingByCode(list, "sdh")?.id).toBe("026");
  });
  it("uses the override table for codes umd.io leaves blank", () => {
    expect(buildingByCode(list, "IRB")?.name).toBe("Brendan Iribe Center");
  });
  it("maps ATL (Atlantic Building) to the renamed Computer and Space Sciences Building", () => {
    const css = { id: "224", name: "Computer and Space Sciences Building", code: "CSS", lat: 38.9909812, lon: -76.9425669540912 };
    expect(buildingByCode([...list, css], "ATL")?.id).toBe("224");
  });
  it("knows TMH (Thurgood Marshall Hall, opened 2023, not in umd.io) by hand-entered coordinates", () => {
    const tmh = buildingByCode(list, "TMH");
    expect(tmh?.name).toBe("Thurgood Marshall Hall");
    expect(tmh?.lat).toBeCloseTo(38.985, 4);
    expect(tmh?.lon).toBeCloseTo(-76.93861, 4);
  });
  it("returns undefined for unknown, off-campus, TBA or empty codes", () => {
    for (const c of ["PFR", "BLD3", "TBA", "", null, undefined]) expect(buildingByCode(list, c)).toBeUndefined();
  });
});
