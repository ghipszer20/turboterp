// Small, pure display helpers for library names (kept separate from data
// fetching in campus.ts so they're easy to unit test).

/**
 * A library's LibCal name, trimmed to fit a compact row without wrapping.
 * Only "Michelle Smith Performing Arts Library" is long enough to wrap at
 * phone width; the others pass through unchanged.
 */
export function compactLibraryName(name: string): string {
  return name.replace(/^Michelle Smith\s+/i, "");
}

/** The libraries Today shows, in order (the rest are one tap away on Libraries). */
export const MAIN_LIBRARIES: RegExp[] = [/mckeldin/i, /\bstem\b/i, /hornbake/i];
