// Which RecWell facilities the Today screen and the Gyms & Rec page surface,
// and how sheet-only tabs get folded into the Eppley Recreation Center group.
//
// The RecWell sheet gives the Natatorium, the Outdoor Aquatic Center, the
// outdoor Adventure Program tab, and the Eppley Tennis & Pickleball Courts
// their own groups, but they're all physically part of the Eppley Recreation
// Center (ERC) complex: the Natatorium and the tennis/pickleball courts are
// attached to or next to the ERC building, and the climbing wall/bouldering
// grotto sits "behind the Eppley Recreation Center (ERC)" per its own page at
// recwell.umd.edu (checked 2026-09-26). `regroupEppleyAreas` folds them into
// one "Eppley Recreation Center" group with a `subsection` label so the gym
// page can show them as sub-sections instead of separate top-level groups.

import type { RecWellAreaToday } from "@turboterp/campus-data";

/** Matched against "<facility> | <area>" from `recWellOnDate`. */
export const MAIN_GYMS = [
  /^Eppley Recreation Center \| Eppley Recreation Center$/i,
  /^Ritchie Coliseum \| Ritchie Coliseum$/i,
  /^School of Public Health \| Fitness Center$/i,
];

// Long facility names, shortened for the Today card's one-line rows.
const GROUP_SHORT_NAME: Record<string, string> = {
  "School of Public Health": "SPH",
};

/** The Today card's row title for a gym: the building name alone, or "<short group> <area>". */
export function gymRowTitle(group: string, name: string): string {
  if (name === group) return name;
  return `${GROUP_SHORT_NAME[group] ?? group} ${name}`;
}

export type EppleySubsection = "Aquatics" | "Climbing" | "Pickleball Courts";

export type RegroupedArea = RecWellAreaToday & { subsection?: EppleySubsection };

const norm = (s: string) => s.trim().toLowerCase();

// The RecWell sheet has these two areas' URLs swapped: the "Climbing Wall"
// row links to the Challenge Course page and vice versa (confirmed against
// each page's own <title> on recwell.umd.edu, 2026-09-26). We only surface
// the Climbing Wall as its own sub-section, so fix its link rather than pass
// the swap through.
const CLIMBING_WALL_URL =
  "https://recwell.umd.edu/programs-activities/adventure-program/climbing-wall-bouldering-grotto";

/**
 * Fold RecWell areas that belong to the Eppley Recreation Center complex --
 * but arrive under their own sheet group -- into an "Eppley Recreation
 * Center" group with a `subsection` label. Everything else passes through
 * unchanged (`subsection` left undefined).
 */
export function regroupEppleyAreas(areas: RecWellAreaToday[]): RegroupedArea[] {
  return areas.map((a) => {
    const group = norm(a.group);
    const name = norm(a.name);

    // Natatorium (indoor tab) + Outdoor Aquatic Center (outdoor tab): every
    // pool, plus the sauna/steam room that live in the same Natatorium
    // building. Those two aren't pools, but they're kept rather than
    // dropped -- the ask was to fold the tab into Eppley, not to remove
    // amenities that were listed on it.
    if (group === "natatorium" || group === "outdoor aquatic center") {
      return { ...a, group: "Eppley Recreation Center", subsection: "Aquatics" };
    }

    // Only the outdoor Climbing Wall & Bouldering Grotto -- the "climbing
    // area" behind Eppley. The Challenge Course sits next to it (also
    // behind the ERC) but is a separate ropes/team-building program, not a
    // climbing area, so it's left in its own "Adventure Program" group. The
    // indoor Bouldering Zone (Level 0 of the ERC building itself) is already
    // in the Eppley group under its own tab and is untouched here.
    if (group === "adventure program" && a.setting === "outdoor" && name === "climbing wall") {
      return {
        ...a,
        group: "Eppley Recreation Center",
        subsection: "Climbing",
        url: CLIMBING_WALL_URL,
      };
    }

    if (group === "eppley tennis & pickleball courts") {
      return { ...a, group: "Eppley Recreation Center", subsection: "Pickleball Courts" };
    }

    return a;
  });
}

/** Short description + official link for a sub-section with no areas for the day (no hours to show). */
export const EPPLEY_SUBSECTION_FALLBACK: Record<EppleySubsection, { description: string; url: string }> = {
  Aquatics: {
    description: "Indoor pools at the Natatorium and the seasonal Outdoor Aquatic Center.",
    url: "https://recwell.umd.edu/natatorium",
  },
  Climbing: {
    description: "Outdoor climbing wall and bouldering grotto on the level behind the ERC.",
    url: CLIMBING_WALL_URL,
  },
  "Pickleball Courts": {
    description: "Outdoor pickleball and tennis courts next to the ERC.",
    url: "https://recwell.umd.edu/eppley-tennis-and-pickleball-courts",
  },
};
