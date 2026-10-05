// The TurboTerp mark: a terrapin in profile, mid-stride, with speed lines (owner pick,
// 2026-10-04). An original drawing; not Testudo or any UMD logo. app/icon.svg holds the same
// drawing on its red tile, so change both together.

/** The white mark alone on a transparent 128 x 128 canvas, as an SVG document. */
export const LOGO_MARK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">` +
  `<g transform="translate(27.2 0) skewX(-14) translate(10.2 12.8) scale(.84)" fill="#fff">` +
  `<path d="M25 78a37 33 0 0 1 74 0z"/>` +
  `<rect x="25" y="74" width="74" height="10" rx="5"/>` +
  `<path d="M92 76c2-9 7-15 14-15a9 9 0 0 1 0 18c-3 0-5 2-7 5H92z"/>` +
  `<rect x="36" y="76" width="13" height="19" rx="6.500" transform="rotate(28 42.500 80)"/>` +
  `<rect x="74" y="76" width="13" height="19" rx="6.500" transform="rotate(-28 80.500 80)"/>` +
  `</g>` +
  `<path d="M18 66H32M14 76H28M20 86H30" fill="none" stroke="#fff" stroke-width="4.500" stroke-linecap="round"/>` +
  `</svg>`;

export const LOGO_MARK_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(LOGO_MARK_SVG).toString("base64")}`;
