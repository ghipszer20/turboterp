import { describe, expect, it } from "vitest";
import { buildXlsx } from "./xlsx";
import { CATEGORY_COLORS, type PlanExport } from "./plan-export";

const data: PlanExport = {
  header: { name: "", date: "2026-09-29", disclaimer: "Unofficial, not affiliated with UMD, verify with your advisor", gradesHidden: false },
  terms: [
    { name: "Fall 2026", credits: 4, courses: [{ id: "CMSC131", title: "OOP I", credits: 4, grade: "A", category: "major" }] },
    { name: "Spring 2027", credits: 3, courses: [{ id: "ART100", title: "", credits: 3, grade: "", category: "elective" }] },
  ],
};

describe("buildXlsx", () => {
  it("writes only a Plan sheet with term columns and category fills", async () => {
    const buf = await buildXlsx(data);
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    expect(wb.worksheets.map((w) => w.name)).toEqual(["Plan"]);
    const plan = wb.getWorksheet("Plan")!;
    const cells: Record<string, string> = {};
    let fill = "";
    plan.eachRow((row) =>
      row.eachCell((cell) => {
        const v = String(cell.value ?? "");
        cells[v] = cell.address;
        if (v.startsWith("CMSC131")) fill = String((cell.fill as { fgColor?: { argb?: string } }).fgColor?.argb);
      }),
    );
    expect(Object.keys(cells)).toEqual(expect.arrayContaining(["Fall 2026", "Spring 2027", "2026–27"]));
    expect(fill).toContain(CATEGORY_COLORS.major);
  }, 60000);
});
