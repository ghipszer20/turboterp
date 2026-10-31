// Exports the 1024x1024 iOS app icon from the web icon (apps/web/app/icon.svg).
// iOS wants a square, fully opaque icon (the system rounds it), so the tile's rounded corners
// are dropped and the result is flattened. Uses sharp, which the web app already depends on.
//   node scripts/make-icon.mjs
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(resolve(here, "../../web/app/icon.svg"), "utf8").replace(/ rx="\d+"/, "");
mkdirSync(resolve(here, "../assets"), { recursive: true });
await sharp(Buffer.from(svg), { density: 576 })
  .resize(1024, 1024)
  .flatten({ background: "#A80A29" })
  .removeAlpha()
  .png()
  .toFile(resolve(here, "../assets/icon.png"));
console.log("wrote assets/icon.png");
