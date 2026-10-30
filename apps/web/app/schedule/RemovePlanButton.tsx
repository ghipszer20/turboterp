"use client";

import type { PlanId } from "@/lib/schedule/saved";
import styles from "./builder.module.css";

/** The small "x" beside the last saved plan. Two taps: this click, then the confirm (owner, 2026-10-04). */
export function RemovePlanButton({ plan, onRemove }: { plan: PlanId; onRemove: (plan: PlanId) => void }) {
  return (
    <button
      type="button"
      className={styles.removePlan}
      aria-label={`Delete Plan ${plan}`}
      title={`Delete Plan ${plan}`}
      onClick={() => {
        if (confirm(`Are you sure you want to delete Plan ${plan}?`)) onRemove(plan);
      }}
    >
      ×
    </button>
  );
}
