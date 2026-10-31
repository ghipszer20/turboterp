// Class kind and place from a class name / studio. Pure (no HTML parser), so the iOS app can import it.

export type ClassKind = "Mind-body" | "Cycling" | "Strength" | "Dance & cardio" | "Aqua" | "Other";
export type ClassPlace = "Eppley" | "Ritchie" | "Regents" | "Other";

// First match wins, so "Cycle Strength" is Cycling and "Paddleboard Yoga" is Mind-body.
const KIND_KEYWORDS: [ClassKind, RegExp][] = [
  ["Aqua", /\b(aqua|water|swim|pool)\b/i],
  ["Cycling", /\b(ride|cycle|cycling|spin)\b/i],
  ["Mind-body", /(pilates|barre|yoga|stretch|meditat|tai chi)/i],
  ["Dance & cardio", /(zumba|dance|ubox|combat|hiit|cardio|kickbox|step)/i],
  ["Strength", /(pump|core|strength|conditioning|tone|bootcamp|sculpt)/i],
];

export function classKind(name: string): ClassKind {
  return KIND_KEYWORDS.find(([, re]) => re.test(name))?.[0] ?? "Other";
}

/** The building a studio is in ("ERC" is Eppley Recreation Center). */
export function classPlace(location: string): ClassPlace {
  if (/\b(erc|eppley)\b/i.test(location)) return "Eppley";
  if (/ritchie/i.test(location)) return "Ritchie";
  if (/regents/i.test(location)) return "Regents";
  return "Other";
}
