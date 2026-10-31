// A course: description, requirements, Gen Ed, this term's sections with live seats, the grade
// distribution, and each instructor's PlanetTerp rating and reviews.
import { useMemo, type ReactNode } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card, OfflineState, Screen, Skeleton, Text, spacing, useTheme } from "../../../../src/ui";
import { CourseFacts, GenEdBadges, GradeChart, GradeSection, LinkRow, PlanetTermCredit, RatingBadge, ReviewsBlock, useInstructorReviews } from "../../../../src/course/components";
import { instructorViews, restrictionLine, reviewsSummaryView, sectionViews, type InstructorView } from "../../../../src/course/model";
import { loadCourseBasics, loadCourseSchedule, useLoad } from "../../../../src/course/useCourse";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
      <Text variant="title" accessibilityRole="header">{title}</Text>
      {children}
    </View>
  );
}

export default function CourseScreen() {
  const { id: raw } = useLocalSearchParams<{ id: string }>();
  const id = String(raw ?? "").toUpperCase();
  const router = useRouter();
  const { c } = useTheme();
  const basics = useLoad(`b/${id}`, () => loadCourseBasics(id));
  const sched = useLoad(`s/${id}`, () => loadCourseSchedule(id));
  const b = basics.state.status === "ready" ? basics.state.data : null;
  const s = sched.state.status === "ready" ? sched.state.data : null;
  const instructors = useMemo(() => (s ? instructorViews(s.sections, s.ratings, s.reviewNames, s.grades) : []), [s]);
  const sections = useMemo(() => (s ? sectionViews(s.sections, s.ratings, s.overlay) : []), [s]);
  const title = b?.title ?? s?.title ?? null;
  const credits = b?.credits ?? s?.credits ?? null;
  const restriction = restrictionLine(b?.details?.restriction ?? s?.restriction ?? null);
  const offline = basics.state.status === "offline" && sched.state.status === "offline";
  const open = (code: string) => router.push({ pathname: "/schedule/course/[id]", params: { id: code } });

  return (
    <Screen title={id} subtitle={[title, credits ? `${credits} credits` : null].filter(Boolean).join(" · ") || undefined}>
      <LinkRow label="‹ Back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/schedule"))} />
      {offline ? (
        <OfflineState
          onRetry={() => {
            basics.retry();
            sched.retry();
          }}
        />
      ) : null}
      {basics.state.status === "loading" && sched.state.status === "loading" ? <Skeleton rows={4} /> : null}
      {b || s ? (
        <>
          {b ? <GenEdBadges genEd={b.genEd} /> : null}
          {restriction ? (
            <Text variant="sub" tone="text2" style={{ marginTop: spacing.sm }}>{restriction}</Text>
          ) : null}
          <Section title="About">
            {b ? <CourseFacts basics={b} restriction={s?.restriction} onOpenCourse={open} /> : <Text variant="sub" tone="text3">Description unavailable offline.</Text>}
          </Section>
          <Section title={s?.term ? "Sections" : "Sections this term"}>
            {!s ? (
              <Text variant="sub" tone="text3">Sections unavailable offline.</Text>
            ) : sections.length === 0 ? (
              <Text variant="sub" tone="text3">Not scheduled this term.</Text>
            ) : (
              <Card>
                {sections.map((v, i) => (
                  <View key={v.id} accessible accessibilityLabel={`Section ${v.id}, ${v.instructorLabel}, ${v.seats}, ${v.meetings.map((m) => `${m.when} ${m.place}`).join(", ")}`} style={{ padding: spacing.md, gap: 2, borderTopWidth: i ? 0.5 : 0, borderTopColor: c.separator }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                      <Text variant="headline">{v.id}</Text>
                      <Text variant="sub" numberOfLines={1} style={{ flexShrink: 1 }}>{v.instructorLabel}</Text>
                      <RatingBadge rating={v.rating} />
                      <View style={{ flex: 1 }} />
                      <Text variant="foot" tone={v.full || v.lowSeats ? "danger" : "text2"}>{v.seats}</Text>
                    </View>
                    {v.meetings.map((m, j) => (
                      <Text key={j} variant="foot" tone="text2">{[m.when, m.place].filter(Boolean).join(" · ")}</Text>
                    ))}
                  </View>
                ))}
              </Card>
            )}
          </Section>
          <Section title="Grade distribution">
            <GradeSection dist={(s?.grades ?? b?.grades)?.overall} loading={!s && !b} />
            <PlanetTermCredit />
          </Section>
          {instructors.length ? (
            <Section title="Instructors">
              {instructors.map((p) => (
                <InstructorCard key={p.name} p={p} term={s?.term ?? null} />
              ))}
            </Section>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function InstructorCard({ p, term }: { p: InstructorView; term: string | null }) {
  const router = useRouter();
  const { c } = useTheme();
  const reviews = useInstructorReviews(p.hasReviews ? term : null, p.name);
  const view = typeof reviews === "object" && reviews.status === "ready" ? reviewsSummaryView(reviews.summary) : null;
  return (
    <Card style={{ padding: spacing.lg, gap: spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <Text
          variant="headline"
          accessibilityRole="link"
          onPress={() => router.push({ pathname: "/schedule/professor/[name]", params: { name: p.name } })}
          style={{ color: c.accent, flexShrink: 1 }}
        >
          {p.name}
        </Text>
        <RatingBadge rating={p.rating} />
      </View>
      {p.grade ? (
        <View style={{ gap: 2 }}>
          <Text variant="caption" tone="text3">GRADES IN THIS COURSE</Text>
          <GradeChart view={p.grade} />
        </View>
      ) : null}
      {p.hasReviews && reviews === "loading" ? <Skeleton rows={2} /> : null}
      {view ? <ReviewsBlock view={view} bars={false} /> : null}
      {!p.hasReviews ? <Text variant="foot" tone="text3">No PlanetTerp reviews on file.</Text> : null}
    </Card>
  );
}
