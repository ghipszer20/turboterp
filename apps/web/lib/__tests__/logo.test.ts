import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LOGO_MARK_SVG } from "../logo";

// Everything inside the <svg>, with the red tile and comments removed and whitespace collapsed,
// so the drawing can be compared between the two files.
function drawing(svg: string): string {
  return svg
    .replace(/<defs>[\s\S]*?<\/defs>/g, "")
    .replace(/<rect width="128" height="128"[^>]*\/>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>[\s\S]*$/, "")
    .replace(/\s+/g, " ")
    .replace(/> </g, "><")
    .trim();
}

describe("logo mark", () => {
  it("app/icon.svg and LOGO_MARK_SVG hold the same drawing", () => {
    const icon = readFileSync(join(__dirname, "../../app/icon.svg"), "utf8");
    expect(drawing(icon)).toBe(drawing(LOGO_MARK_SVG));
  });

  it("is centered at 110% with the speed lines inside the tile (owner, 2026-10-05)", () => {
    expect(LOGO_MARK_SVG).toContain('transform="translate(-11.52 -15.36) scale(1.1)"');
    expect(LOGO_MARK_SVG).toContain('d="M8.7 60.54H23.66M12.86 74.84H23.66"');
    expect(LOGO_MARK_SVG).toContain('stroke-width="5.4"');
  });
});
