import type { Section } from "@turboterp/course-data/schedules";
import { courseColor } from "@/lib/schedule/colors";
import { bestGpa, bestRating, instructorLabel } from "@/lib/schedule/sections";
import { InstructorName } from "./InstructorReviews";
import { GpaBadge, RatingBadge } from "./RatingBadge";
import cal from "./calendar.module.css";
import styles from "./builder.module.css";

/** The instructor label ("Name +2"): the first name opens its reviews, the "+2" stays text. */
function StripName({ label, main }: { label: string; main?: string }) {
  if (!main || !label.startsWith(main)) return <>{label}</>;
  return (
    <>
      <InstructorName name={main} />
      {label.slice(main.length)}
    </>
  );
}

/**
 * Teacher info, option B (owner): under each calendar, one row per course, color-matched
 * to its blocks: swatch, course, professor, PlanetTerp rating.
 */
export function TeacherStrip({
  picks,
  groups,
  courseIds,
  ratings,
  gpas,
  size = "mini",
}: {
  picks: Section[];
  groups?: Section[][];
  courseIds: string[];
  ratings: Readonly<Record<string, number>>;
  /** Given only when sorting by Best Teachers: adds a GPA box next to the rating. */
  gpas?: Readonly<Record<string, number>>;
  size?: "mini" | "zoom" | "large";
}) {
  return (
    <ul className={styles.strip} data-size={size}>
      {picks.map((s, k) => (
        <li key={s.courseId} className={cal.course} data-color={courseColor(courseIds, s.courseId)}>
          <span className={styles.swatch} />
          <b>{s.courseId}</b>
          <span className={styles.stripWho}>
            <StripName label={instructorLabel(s, groups?.[k])} main={s.instructors[0]} />
          </span>
          {gpas ? (
            <span className={styles.badges}>
              <RatingBadge rating={bestRating(s, ratings)} />
              <GpaBadge gpa={bestGpa(s, gpas)} />
            </span>
          ) : (
            <RatingBadge rating={bestRating(s, ratings)} />
          )}
        </li>
      ))}
    </ul>
  );
}
