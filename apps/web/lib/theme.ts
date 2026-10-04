// Light / Dark appearance. The saved choice wins; on a first visit (or if the
// saved value is unreadable) the device's setting decides.

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "turboterp-theme";

export function resolveTheme(saved: string | null, systemPrefersDark: boolean): Theme {
  if (saved === "light" || saved === "dark") return saved;
  return systemPrefersDark ? "dark" : "light";
}

/** Switch the page's theme now and remember the choice on this device. */
export function applyTheme(
  theme: Theme,
  root: { setAttribute(name: string, value: string): void },
  storage: { setItem(key: string, value: string): void },
): void {
  root.setAttribute("data-theme", theme);
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked (e.g. private browsing): the choice lasts for this page only.
  }
}

/**
 * Inline <head> script: sets data-theme before first paint so the page never
 * flashes the wrong theme. Same rule as resolveTheme; survives blocked storage.
 */
export const THEME_INIT_SCRIPT = `(function(){var s=null;try{s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}var t=s==="light"||s==="dark"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t)})()`;
