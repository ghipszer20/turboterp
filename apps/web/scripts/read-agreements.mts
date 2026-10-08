// Reads the signed Advisor agreements with their typed names unlocked. For the owner only, when a
// record is needed for legal purposes. Needs SUPABASE_SERVICE_ROLE_KEY and CONSENT_NAME_SECRET in
// apps/web/.env.local (the secret is the one in the owner's password manager / Vercel).
//
//   npm run agreements -w @turboterp/web -- [--from 2026-10-01] [--to 2026-10-31] [--name "lovelace"]
//
// Prints CSV to the screen: recorded_at, accepted_at, version, account_id, device_id, typed_name.
// Nothing is written to disk; save it with "> file.csv" if you need a copy, and keep that copy private.

import { parseArgs } from "node:util";
import { decryptName } from "../lib/consent/name-crypto.ts";

const { values } = parseArgs({ options: { from: { type: "string" }, to: { type: "string" }, name: { type: "string" } } });
const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const secret = process.env.CONSENT_NAME_SECRET;
if (!url || !serviceKey || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or CONSENT_NAME_SECRET in apps/web/.env.local");
  process.exit(1);
}

const filters = [
  values.from ? `recorded_at=gte.${encodeURIComponent(values.from)}` : "",
  values.to ? `recorded_at=lt.${encodeURIComponent(new Date(Date.parse(values.to) + 86_400_000).toISOString())}` : "",
].filter(Boolean);
const select = "select=recorded_at,accepted_at,version,user_id,device_id,name_encrypted&order=recorded_at.asc,id.asc";
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

const cell = (v: string | null) => {
  const s = v ?? "";
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

type Row = { recorded_at: string; accepted_at: string; version: string; user_id: string | null; device_id: string; name_encrypted: string };
const PAGE = 1000;
const wanted = values.name?.toLowerCase();
let shown = 0;
console.log("recorded_at,accepted_at,version,account_id,device_id,typed_name");
for (let offset = 0; ; offset += PAGE) {
  const res = await fetch(`${url}/rest/v1/consent_records?${[...filters, select].join("&")}&limit=${PAGE}&offset=${offset}`, { headers });
  if (!res.ok) {
    console.error(`Supabase answered ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const rows = (await res.json()) as Row[];
  for (const r of rows) {
    let name: string;
    try {
      name = decryptName(r.name_encrypted, secret);
    } catch {
      name = "(can't unlock: wrong CONSENT_NAME_SECRET or damaged record)";
    }
    if (wanted && !name.toLowerCase().includes(wanted)) continue;
    console.log([r.recorded_at, r.accepted_at, r.version, r.user_id, r.device_id, name].map(cell).join(","));
    shown++;
  }
  if (rows.length < PAGE) break;
}
console.error(`${shown} agreement${shown === 1 ? "" : "s"}`);
