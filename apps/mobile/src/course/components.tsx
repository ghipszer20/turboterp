// Pieces shared by the course screen, the professor screen and the Advisor's course sheet.
import { useEffect, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { ratingTone, type RatingTone } from "@turboterp/app-core/schedule/sections";
import { genEdName } from "@turboterp/app-core/words";
import { Badge, Button, StatusBadge, Text, radius, spacing, useTheme, type Status } from "../ui";
import { gradeChartView, ratingLabel, splitCourseCodes, type GradeChartView, type ReviewsView } from "./model";
import { loadInstructorReviews, type CourseBasics } from "./useCourse";
import type { ReviewsState } from "@turboterp/app-core/schedule/instructor-reviews";
import type { Distribution } from "@turboterp/ratings";

const TONE_STATUS: Record<RatingTone, Status> = { good: "open", fair: "soon", low: "closed", none: "unknown" };

export function RatingBadge({ rating }: { rating: number | undefined | null }) {
  return <StatusBadge status={TONE_STATUS[ratingTone(rating)]} label={ratingLabel(rating)} />;
}

export const PLANETTERP_CREDIT = "Ratings, grades and reviews from PlanetTerp";

export function PlanetTermCredit() {
  return (
    <Text variant="foot" tone="text3">
      {PLANETTERP_CREDIT} (planetterp.com).
    </Text>
  );
}

export function openUrl(url: string) {
  void Linking.openURL(url).catch(() => undefined);
}

/** Requirement text as printed, with course codes as tappable links. */
export function CourseCodeText({ text, onOpenCourse, tone = "text" }: { text: string; onOpenCourse: (id: string) => void; tone?: "text" | "text2" }) {
  const { c } = useTheme();
  return (
    <Text variant="sub" tone={tone}>
      {splitCourseCodes(text).map((p, i) =>
        p.code ? (
          <Text
            key={i}
            variant="sub"
            accessibilityRole="link"
            accessibilityLabel={`Open ${p.code}`}
            onPress={() => onOpenCourse(p.code!)}
            style={{ color: c.accent, fontWeight: "600" }}
          >
            {p.text}
          </Text>
        ) : (
          p.text
        ),
      )}
    </Text>
  );
}

const SHADES = ["#248a3d", "#6aa84f", "#e0a800", "#e67e22", "#c0392b", "#8e8e93", "#8e8e93"];

/** Vertical bars per grade group (A, B, C, D, F, W), with average GPA and student count. */
export function GradeChart({ view }: { view: GradeChartView }) {
  const label = view.bars.map((b) => `${b.label} ${b.percent}%`).join(", ");
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="sub" tone="text2">
        {[view.gpa ? `Average GPA ${view.gpa}` : null, view.students, view.span].filter(Boolean).join(" · ")}
      </Text>
      <View accessible accessibilityRole="image" accessibilityLabel={`Grade distribution: ${label}`} style={{ flexDirection: "row", gap: spacing.xs, height: 96, alignItems: "flex-end" }}>
        {view.bars.map((b, i) => (
          <View key={b.label} style={{ flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 2 }}>
            <Text variant="caption" tone="text2">{`${b.percent}%`}</Text>
            <View style={{ width: "100%", height: `${Math.max(2, Math.round(b.height * 62))}%`, backgroundColor: SHADES[i] ?? SHADES[5], borderRadius: 4 }} />
            <Text variant="caption">{b.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function GradeSection({ dist, loading }: { dist: Distribution | null | undefined; loading?: boolean }) {
  if (loading) return <Text variant="sub" tone="text3">Loading grades…</Text>;
  const view = gradeChartView(dist);
  return view ? <GradeChart view={view} /> : <Text variant="sub" tone="text3">No grade data</Text>;
}

export function Stars({ view }: { view: ReviewsView }) {
  const { c } = useTheme();
  return (
    <View accessibilityLabel="Reviews by stars" style={{ gap: 4 }}>
      {view.rows.map((r) => (
        <View key={r.stars} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <Text variant="foot" style={{ width: 24 }}>{`${r.stars}★`}</Text>
          <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: c.surface2, overflow: "hidden" }}>
            <View style={{ width: `${r.percent}%`, height: 8, backgroundColor: c.accent }} />
          </View>
          <Text variant="foot" tone="text2" style={{ width: 28, textAlign: "right" }}>{r.count}</Text>
        </View>
      ))}
    </View>
  );
}

/** Review excerpts and the link to the professor's PlanetTerp page. */
export function ReviewsBlock({ view, bars = true }: { view: ReviewsView; bars?: boolean }) {
  const { c } = useTheme();
  const link = <Button variant="secondary" label="Read all reviews on PlanetTerp" onPress={() => openUrl(view.url)} />;
  if (view.empty) {
    return (
      <View style={{ gap: spacing.sm }}>
        <Text variant="sub" tone="text3">No reviews on PlanetTerp yet</Text>
        {link}
      </View>
    );
  }
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <RatingBadge rating={view.rating} />
        <Text variant="sub" tone="text2">{view.countLabel}</Text>
      </View>
      {bars ? <Stars view={view} /> : null}
      {view.courses.length ? (
        <Text variant="sub" tone="text2">
          <Text variant="sub" style={{ fontWeight: "600" }}>Courses reviewed </Text>
          {view.courses.join(", ")}
        </Text>
      ) : null}
      {view.excerpts.map((e, i) => (
        <View key={i} style={{ gap: 2, padding: spacing.md, borderRadius: radius.md, backgroundColor: c.surface2 }}>
          <Text variant="caption" tone="text2">{[`${e.rating}★`, e.course, e.year || null].filter(Boolean).join(" · ")}</Text>
          <Text variant="sub">{`“${e.text}”`}</Text>
        </View>
      ))}
      {link}
    </View>
  );
}

/** One instructor's review summary, loaded when shown. */
export function useInstructorReviews(term: string | null, name: string): ReviewsState | "loading" | "none" {
  const [state, setState] = useState<{ key: string; s: ReviewsState } | null>(null);
  const key = `${term}/${name}`;
  useEffect(() => {
    if (!term) return;
    let live = true;
    void loadInstructorReviews(term, name).then((s) => live && setState({ key, s }));
    return () => {
      live = false;
    };
  }, [term, name, key]);
  if (!term) return "none";
  return state?.key === key ? state.s : "loading";
}

export function CourseFacts({
  basics,
  restriction,
  onOpenCourse,
}: {
  basics: Pick<CourseBasics, "details">;
  restriction?: string | null;
  onOpenCourse: (id: string) => void;
}) {
  const d = basics.details;
  const facts: [string, string | null][] = [
    ["Prerequisite", d?.prerequisite ?? null],
    ["Corequisite", d?.corequisite ?? null],
    ["Restriction", d?.restriction ?? restriction ?? null],
    ["Credit only granted for", d?.creditOnlyGrantedFor ?? null],
  ];
  return (
    <View style={{ gap: spacing.md }}>
      {d?.description ? <Text variant="sub">{d.description}</Text> : <Text variant="sub" tone="text3">No description on file for this course.</Text>}
      {facts.map(([label, value]) =>
        value ? (
          <View key={label} style={{ gap: 2 }}>
            <Text variant="caption" tone="text3">{label.toUpperCase()}</Text>
            <CourseCodeText text={value} onOpenCourse={onOpenCourse} />
          </View>
        ) : null,
      )}
    </View>
  );
}

export function GenEdBadges({ genEd }: { genEd: string[] }) {
  return genEd.length ? (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
      {genEd.map((g) => (
        <Badge key={g} label={genEdName(g)} />
      ))}
    </View>
  ) : null;
}

export function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={{ minHeight: 44, justifyContent: "center" }}>
      <Text variant="body" style={{ color: c.accent }}>{label}</Text>
    </Pressable>
  );
}
