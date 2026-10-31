import { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { planTermName } from "@turboterp/app-core/schedule/plan-link";
import { ratingTone, type RatingTone } from "@turboterp/app-core/schedule/sections";
import { Badge, Button, Card, EmptyState, ErrorState, OfflineState, Skeleton, StatusBadge, Text, spacing, radius, useTheme, type Status } from "../../../src/ui";
import { SORT_CHOICES, sortRows, type CourseRow, type SortChoice } from "../../../src/schedule/results";
import { useCourseIndex, useCourseResults, useDebounced, useTermCourses } from "../../../src/schedule/useScheduleSearch";

const TONE_STATUS: Record<RatingTone, Status> = { good: "open", fair: "soon", low: "closed", none: "unknown" };
const credits = (c: CourseRow["course"]) => (c.credits.min === c.credits.max ? `${c.credits.min}` : `${c.credits.min}–${c.credits.max}`);

function RatingBadge({ rating }: { rating: number | undefined }) {
  return <StatusBadge status={TONE_STATUS[ratingTone(rating)]} label={rating === undefined ? "N/A" : `${rating.toFixed(1)}★`} />;
}

const ResultRow = memo(function ResultRow({ row, picked, onToggle }: { row: CourseRow; picked: boolean; onToggle: (id: string) => void }) {
  const { c } = useTheme();
  const { course, summary } = row;
  const open = summary?.open;
  const detail = [`${credits(course)} cr`, open === undefined ? null : open > 0 ? `${open} open` : "Full"].filter(Boolean).join(" · ");
  return (
    <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 0.5, borderBottomColor: c.separator }}>
      <Link href={{ pathname: "/schedule/course/[id]", params: { id: course.id } }} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${course.id}, ${course.title}, ${detail}`}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 64,
            padding: spacing.md,
            gap: 2,
            backgroundColor: pressed ? c.surfacePressed : "transparent",
          })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Text variant="headline">{course.id}</Text>
            <RatingBadge rating={summary?.rating} />
          </View>
          <Text variant="sub" numberOfLines={2}>
            {course.title}
          </Text>
          <Text variant="foot" tone="text2">
            {detail}
          </Text>
        </Pressable>
      </Link>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={picked ? `Remove ${course.id}` : `Add ${course.id}`}
        onPress={() => onToggle(course.id)}
        style={{ minWidth: 64, minHeight: 64, alignItems: "center", justifyContent: "center" }}
      >
        <Text variant="headline" tone={picked ? "danger" : "accent"}>
          {picked ? "Remove" : "Add"}
        </Text>
      </Pressable>
    </View>
  );
});

function SortControl({ value, onChange }: { value: SortChoice; onChange: (v: SortChoice) => void }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
      {SORT_CHOICES.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={`Sort by ${o.label}`}
            onPress={() => onChange(o.value)}
            style={{
              minHeight: 36,
              paddingHorizontal: spacing.md,
              justifyContent: "center",
              borderRadius: radius.pill,
              backgroundColor: on ? c.accent : c.accentTint,
            }}
          >
            <Text variant="sub" style={{ color: on ? c.onAccent : c.accent }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function ScheduleSearchScreen() {
  const { c } = useTheme();
  const { state, reload } = useCourseIndex();
  const index = state.status === "ready" ? state.index : null;
  const { courses: picked, toggle } = useTermCourses(index?.term ?? null);
  const [text, setText] = useState("");
  const [sort, setSort] = useState<SortChoice>("default");
  const query = useDebounced(text);
  const { rows, hasQuery } = useCourseResults(index, query);
  const sorted = useMemo(() => sortRows(rows, sort, query), [rows, sort, query]);
  const pickedSet = useMemo(() => new Set(picked), [picked]);
  const titleOf = useMemo(() => new Map(index?.courses.map((x) => [x.id, x.title])), [index]);
  const termName = index ? planTermName(index.term) : null;

  const renderItem = useCallback(
    ({ item }: { item: CourseRow }) => <ResultRow row={item} picked={pickedSet.has(item.course.id)} onToggle={toggle} />,
    [pickedSet, toggle],
  );

  const header = (
    <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
      <View>
        {termName ? (
          <Text variant="caption" tone="text2">
            {termName.toUpperCase()} CLASSES
          </Text>
        ) : null}
        <Text variant="large" accessibilityRole="header">
          Schedule
        </Text>
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Add a course, e.g. CMSC351 or calculus"
        placeholderTextColor={c.text3}
        accessibilityLabel="Search courses"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={{
          minHeight: 48,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          fontSize: 17,
          color: c.text,
          backgroundColor: c.surface,
        }}
      />
      <SortControl value={sort} onChange={setSort} />
      {picked.length ? (
        <Card>
          <View style={{ padding: spacing.md, gap: spacing.sm }}>
            <Text variant="headline">Your courses ({picked.length})</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {picked.map((id) => (
                <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Remove ${id}`} onPress={() => toggle(id)}>
                  <Badge label={`${id} ✕`} tone="accent" />
                </Pressable>
              ))}
            </View>
            <Text variant="foot" tone="text2" numberOfLines={2}>
              {picked.map((id) => titleOf.get(id)).filter(Boolean).join(" · ")}
            </Text>
            <Link href="/schedule/builder" asChild>
              <Button label="Build my schedule" onPress={() => undefined} />
            </Link>
          </View>
        </Card>
      ) : null}
    </View>
  );

  const body =
    state.status === "loading" ? (
      <Skeleton rows={5} />
    ) : state.status === "offline" ? (
      <OfflineState onRetry={reload} />
    ) : state.status === "error" ? (
      <ErrorState title="Couldn't load classes" onRetry={reload} />
    ) : state.status === "missing" ? (
      <EmptyState title="No classes posted yet" body="The next term's schedule isn't available. Check back soon." />
    ) : hasQuery && sorted.length === 0 ? (
      <EmptyState title="No matching courses" body="Try a course code like CMSC131 or words from the title." />
    ) : !hasQuery ? (
      <Text variant="sub" tone="text2">
        Search by course code or title to add classes to your term.
      </Text>
    ) : null;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl, maxWidth: 720, width: "100%", alignSelf: "center" }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      data={index ? sorted : []}
      keyExtractor={(r) => r.course.id}
      renderItem={renderItem}
      extraData={pickedSet}
      ListHeaderComponent={header}
      ListEmptyComponent={<>{body}</>}
      initialNumToRender={12}
      windowSize={7}
      removeClippedSubviews
    />
  );
}
