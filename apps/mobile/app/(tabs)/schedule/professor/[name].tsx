// A professor: PlanetTerp rating, star breakdown, the courses their reviews cover (tap to open one), and reviews.
import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { Card, EmptyState, OfflineState, Screen, Skeleton, Text, spacing } from "../../../../src/ui";
import { LinkRow, PlanetTermCredit, ReviewsBlock } from "../../../../src/course/components";
import { reviewsSummaryView } from "../../../../src/course/model";
import { currentTerm, loadInstructorReviews, useLoad } from "../../../../src/course/useCourse";

export default function ProfessorScreen() {
  const { name: raw } = useLocalSearchParams<{ name: string }>();
  const name = String(raw ?? "");
  const router = useRouter();
  const { state, retry } = useLoad(`p/${name}`, async () => {
    const term = await currentTerm();
    return term ? await loadInstructorReviews(term, name) : null;
  });
  const result = state.status === "ready" ? state.data : null;
  const summary = result && result.status === "ready" ? result.summary : null;
  const view = useMemo(() => (summary ? reviewsSummaryView(summary) : null), [summary]);

  return (
    <Screen title={name} subtitle="Professor">
      <LinkRow label="‹ Back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/schedule"))} />
      {state.status === "loading" ? <Skeleton rows={4} /> : null}
      {state.status === "offline" ? <OfflineState onRetry={retry} /> : null}
      {state.status === "ready" && !view ? (
        <EmptyState title="No PlanetTerp reviews on file" body="This instructor has no review summary for the current term." />
      ) : null}
      {view ? (
        <View style={{ gap: spacing.xl, marginTop: spacing.md }}>
          <Card style={{ padding: spacing.lg }}>
            <ReviewsBlock view={view} />
          </Card>
          {view.courses.length ? (
            <View style={{ gap: spacing.xs }}>
              <Text variant="title" accessibilityRole="header">Courses</Text>
              {view.courses.map((id) => (
                <LinkRow key={id} label={id} onPress={() => router.push({ pathname: "/schedule/course/[id]", params: { id } })} />
              ))}
            </View>
          ) : null}
          <PlanetTermCredit />
        </View>
      ) : null}
    </Screen>
  );
}
