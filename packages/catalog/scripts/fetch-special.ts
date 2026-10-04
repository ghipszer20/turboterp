// Fetch living-learning and special-program pages for special-programs/SOURCES.md.
//
//   node scripts/fetch-special.ts <url> [<url> …] [--text] [--links]
//
// One request at a time, 500 ms apart, each page fetched once: raw HTML is
// cached in .cache/special/ (git-ignored) and re-runs read the cache.
// --text prints each page's main text; --links prints its links.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import * as cheerio from "cheerio";
import { fetchBytes, fetchText } from "@turboterp/campus-data/http";

const CACHE = new URL("../.cache/special/", import.meta.url);
const PAUSE_MS = 500;
mkdirSync(CACHE, { recursive: true });

const isPdf = (url: string) => /\.pdf$/i.test(new URL(url).pathname);

export const cacheFile = (url: string) => {
  const u = new URL(url);
  const slug = `${u.hostname}${u.pathname}`.replace(/^\/+|\/+$/g, "").replace(/\.pdf$/i, "").replace(/[^A-Za-z0-9-]+/g, "_") || "root";
  return new URL(`${slug}.${isPdf(url) ? "pdf" : "html"}`, CACHE);
};

async function get(url: string): Promise<string> {
  const file = cacheFile(url);
  if (existsSync(file)) return isPdf(url) ? "" : readFileSync(file, "utf8");
  if (isPdf(url)) {
    writeFileSync(file, await fetchBytes("special", url));
    await sleep(PAUSE_MS);
    return "";
  }
  const html = await fetchText("special", url);
  writeFileSync(file, html);
  await sleep(PAUSE_MS);
  return html;
}

const args = process.argv.slice(2);
const urls = args.filter((a) => !a.startsWith("--"));
for (const url of urls) {
  let html: string;
  try {
    html = await get(url);
    if (isPdf(url)) {
      // PDFs are cached as-is; read them with `pdftotext -layout`.
      console.log(`=== ${url} -> ${cacheFile(url).pathname.split("/").pop()} (pdf)`);
      continue;
    }
  } catch (err) {
    console.log(`=== ${url}\nERROR ${err instanceof Error ? err.message : String(err)}`);
    continue;
  }
  console.log(`=== ${url} -> ${cacheFile(url).pathname.split("/").pop()} (${html.length} bytes)`);
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  const main = $("#textcontainer, main, #main, #content, .main-content, article").first();
  const root = main.length ? main : $("body");
  if (args.includes("--text")) {
    const blocks = root
      .find("h1, h2, h3, h4, h5, p, li, td, th, dt, dd")
      .toArray()
      .map((el) => {
        const t = $(el).clone().children("ul, ol").remove().end().text().replace(/\s+/g, " ").trim();
        return t ? `${el.tagName.toUpperCase()}: ${t}` : "";
      })
      .filter(Boolean);
    console.log([...new Set(blocks)].join("\n"));
  }
  if (args.includes("--links")) {
    const links = $("a[href]")
      .toArray()
      .map((a) => `${$(a).text().replace(/\s+/g, " ").trim()} -> ${new URL($(a).attr("href")!, url).href}`);
    console.log([...new Set(links)].join("\n"));
  }
}
