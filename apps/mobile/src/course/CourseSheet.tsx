// A course's detail as a bottom sheet (ported from apps/web/app/advisor/CourseSheet.tsx): catalog facts,
// prerequisites as printed with tappable course codes, and the course-wide grade distribution. Reusable:
// pass the course code (null closes it). Tapping a code inside swaps to that course; "Full course page"
// opens the Schedule tab's course screen.
import { useEffect, useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, OfflineState, Skeleton, Text, radius, spacing, useTheme } from "../ui";
import { CourseFacts, GenEdBadges, GradeSection, PlanetTermCredit } from "./components";
import { loadCourseBasics, useLoad } from "./useCourse";

export function CourseSheet({ courseId, onClose, footer }: { courseId: string | null; onClose: () => void; footer?: ReactNode }) {
  const { c } = useTheme();
  const [shown, setShown] = useState<string | null>(courseId);
  useEffect(() => setShown(courseId), [courseId]);
  return (
    <Modal visible={courseId !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={onClose} accessibilityLabel="Close" />
      <View style={{ backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, maxHeight: "85%", paddingBottom: spacing.xl }}>
        {shown ? <Body id={shown} onOpenCourse={setShown} onClose={onClose} footer={footer} /> : null}
      </View>
    </Modal>
  );
}

function Body({ id, onOpenCourse, onClose, footer }: { id: string; onOpenCourse: (id: string) => void; onClose: () => void; footer?: ReactNode }) {
  const router = useRouter();
  const { state, retry } = useLoad(id, () => loadCourseBasics(id));
  const data = state.status === "ready" ? state.data : null;
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
      <View style={{ gap: 2 }}>
        <Text variant="caption" tone="text2">{id}</Text>
        <Text variant="title" accessibilityRole="header">
          {data ? (data.title ?? "Not in TurboTerp's course data") : "Loading…"}
        </Text>
        {data?.credits ? <Text variant="sub" tone="text2">{`${data.credits} credits`}</Text> : null}
      </View>
      {state.status === "loading" ? <Skeleton rows={4} /> : null}
      {state.status === "offline" ? <OfflineState onRetry={retry} /> : null}
      {data ? (
        <>
          <GenEdBadges genEd={data.genEd} />
          <Section title="Details">
            <CourseFacts basics={data} onOpenCourse={onOpenCourse} />
          </Section>
          <Section title="Grades">
            <GradeSection dist={data.grades?.overall} />
            <PlanetTermCredit />
          </Section>
        </>
      ) : null}
      {footer}
      <Button
        variant="secondary"
        label="Full course page"
        onPress={() => {
          onClose();
          router.push({ pathname: "/schedule/course/[id]", params: { id } });
        }}
      />
      <Button variant="secondary" label="Close" onPress={onClose} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="headline" accessibilityRole="header">{title}</Text>
      {children}
    </View>
  );
}
