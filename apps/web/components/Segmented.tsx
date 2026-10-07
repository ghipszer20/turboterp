"use client";

import styles from "./Segmented.module.css";

type Option<T extends string | number> = { value: T; label: string };

/** iOS-style segmented control. */
export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.segmented} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={styles.segment}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Toggleable filter chip. */
export function Chip({
  pressed,
  onClick,
  children,
  disabled = false,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
  disabled?: boolean;
}) {
  return (
    <button type="button" aria-pressed={pressed} className={styles.chip} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
