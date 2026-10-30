import { gpaTone, ratingTone } from "@/lib/schedule/sections";
import styles from "./builder.module.css";

/** PlanetTerp average rating ("4.6★"), colored by tone; "N/A" when unrated (owner, 2026-10-30). */
export function RatingBadge({ rating }: { rating: number | undefined }) {
  return (
    <span
      className={styles.rating}
      data-tone={ratingTone(rating)}
      title={rating === undefined ? "No PlanetTerp rating" : `PlanetTerp rating ${rating.toFixed(1)} of 5`}
    >
      {rating === undefined ? "N/A" : `${rating.toFixed(1)}★`}
    </span>
  );
}

/** The teacher's average GPA in the course ("Avg. GPA 3.4"), colored by tone; "Avg. GPA N/A" without grade data. */
export function GpaBadge({ gpa }: { gpa: number | undefined }) {
  return (
    <span
      className={styles.rating}
      data-tone={gpaTone(gpa)}
      title={gpa === undefined ? "No grade data for this teacher" : `This teacher's average GPA in the course: ${gpa.toFixed(2)}`}
    >
      Avg. GPA {gpa === undefined ? "N/A" : gpa.toFixed(1)}
    </span>
  );
}
