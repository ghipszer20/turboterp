// Search the term's classes, then watch one full section or all sections (same flow as the web).
import { useMemo, useState } from "react";
import { Linking, Pressable, TextInput, View } from "react-native";
import { searchCourses } from "@turboterp/app-core/schedule/search";
import { meetingSummary } from "@turboterp/app-core/schedule/sections";
import { findWatch, MAX_WATCHES } from "@turboterp/app-core/seat-alerts/view";
import { Card, Text, spacing, tap, useTheme } from "../ui";
import { useBuilderData } from "../schedule/useBuilder";
import { useCourseIndex } from "../schedule/useScheduleSearch";
import { addErrorText, sectionAction, showAllSections } from "./model";
import { useAlerts } from "./store";

const TESTUDO = "https://app.testudo.umd.edu/soc/";

export function AddClass() {
  const { c } = useTheme();
  const alerts = useAlerts();
  const { state } = useCourseIndex();
  const index = state.status === "ready" ? state.index : null;
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const data = useBuilderData(index?.term ?? null, course ? [course] : [], false);
  const results = useMemo(() => (query.trim() && index ? searchCourses(index.courses, query, 6) : []), [index, query]);
  const sections = useMemo(() => data.sections.filter((s) => s.courseId === course).sort((a, b) => a.id.localeCompare(b.id)), [data.sections, course]);
  const watches = alerts.data.watches;
  const atLimit = watches.length >= MAX_WATCHES;

  const watch = async (sectionId: string | null) => {
    if (!course) return;
    setError(null);
    const problem = await alerts.add(course, sectionId);
    if (problem) setError(addErrorText(problem));
  };
  const link = (label: string, onPress: () => void, disabled = false) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={() => (tap(), onPress())} hitSlop={8} style={{ minHeight: 44, justifyContent: "center", opacity: disabled ? 0.4 : 1 }}>
      <Text variant="sub" tone="accent">
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View>
      <Text variant="headline" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        Add a class
      </Text>
      <Card style={{ padding: spacing.md, gap: spacing.sm }}>
        <TextInput
          accessibilityLabel="Search classes"
          placeholder={state.status === "ready" || state.status === "loading" ? "Code or title (e.g. CMSC351)" : "Classes aren't available right now"}
          placeholderTextColor={c.text3}
          editable={state.status === "ready"}
          autoCapitalize="characters"
          autoCorrect={false}
          value={query}
          onChangeText={(t) => (setQuery(t), setCourse(null), setError(null))}
          style={{ minHeight: 44, color: c.text, fontSize: 17, borderBottomWidth: 0.5, borderBottomColor: c.separator }}
        />
        {!course
          ? results.map((r) => (
              <Pressable key={r.id} accessibilityRole="button" accessibilityLabel={`${r.id} ${r.title}`} onPress={() => (setCourse(r.id), setQuery(r.id))} style={{ minHeight: 44, justifyContent: "center" }}>
                <Text variant="headline">{r.id}</Text>
                <Text variant="foot" tone="text2" numberOfLines={1}>
                  {r.title}
                </Text>
              </Pressable>
            ))
          : null}
        {course ? (
          <>
            {data.loaded && showAllSections(sections)
              ? link(
                  findWatch(watches, course, null) ? `Alerts on for all sections of ${course}` : `Alert for all sections of ${course}`,
                  () => void watch(null),
                  atLimit || !!findWatch(watches, course, null),
                )
              : null}
            {!data.loaded ? <Text variant="foot" tone="text3">Loading sections…</Text> : null}
            {data.loaded && !sections.length ? <Text variant="foot" tone="text3">No sections this term.</Text> : null}
            {sections.map((s) => {
              const action = sectionAction(s, watches);
              return (
                <View key={s.id} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="headline">Section {s.id}</Text>
                    <Text variant="foot" tone="text2">{s.instructors.join(", ") || "Instructor TBA"}</Text>
                    <Text variant="foot" tone="text2">{meetingSummary(s)}</Text>
                    <Text variant="foot" tone={s.seats.open > 0 ? "accent" : "text2"}>{`${s.seats.open} open · waitlist ${s.seats.waitlist}`}</Text>
                  </View>
                  {action === "open"
                    ? link("Open", () => void Linking.openURL(TESTUDO))
                    : action === "watching"
                      ? <Text variant="foot" tone="text2">Watching</Text>
                      : link("Notify me", () => void watch(s.id), atLimit)}
                </View>
              );
            })}
          </>
        ) : null}
        {error ? (
          <Text variant="foot" tone="danger" accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </Card>
    </View>
  );
}
