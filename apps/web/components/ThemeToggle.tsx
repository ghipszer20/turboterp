"use client";

import { useSyncExternalStore } from "react";
import { applyTheme, type Theme } from "@/lib/theme";
import { Segmented } from "./Segmented";
import styles from "./ThemeToggle.module.css";

// The theme lives on <html data-theme>, set before first paint by the
// pre-paint script. Subscribe to it so the control always shows what's applied.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const currentTheme = (): Theme => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
const unknownOnServer = (): Theme | null => null;

/**
 * Light / Dark appearance switch. `compact` (the phone top bar, where three info buttons share
 * the row) is one icon button that flips the appearance: a moon in light, a sun in dark.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(subscribe, currentTheme, unknownOnServer);

  if (compact) {
    const next: Theme = theme === "dark" ? "light" : "dark";
    return (
      <button
        type="button"
        className={styles.compact}
        data-ready={theme !== null}
        aria-label={`Switch to ${next} appearance`}
        onClick={() => applyTheme(next, document.documentElement, window.localStorage)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {theme === "dark" ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2.500v2M12 19.500v2M2.500 12h2M19.500 12h2M5.300 5.300l1.400 1.400M17.300 17.300l1.400 1.400M5.300 18.700l1.400-1.400M17.300 6.700l1.400-1.400" />
            </>
          ) : (
            <path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z" />
          )}
        </svg>
      </button>
    );
  }

  return (
    <div className={styles.toggle} data-ready={theme !== null}>
      <Segmented<Theme>
        label="Appearance"
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
        value={theme ?? "light"}
        onChange={(next) => applyTheme(next, document.documentElement, window.localStorage)}
      />
    </div>
  );
}
