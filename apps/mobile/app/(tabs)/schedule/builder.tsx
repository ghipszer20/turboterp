// The schedule builder: a gallery of generated schedules for the chosen courses, the week view of
// one schedule (tap a block to change its section), "Build my own", and Plans A/B/C.
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Platform, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import type { Section } from "@turboterp/course-data/schedules";
import { sectionBlocks } from "@turboterp/app-core/schedule/block-items";
import { timeScale, untimed, type TimeScale } from "@turboterp/app-core/schedule/calendar";
import { courseColor } from "@turboterp/app-core/schedule/colors";
import { DEFAULT_FILTERS, relaxConstraint, relaxOptions, toScheduleFilters, type FilterState } from "@turboterp/app-core/schedule/filters";
import type { GenerateRequest } from "@turboterp/app-core/schedule/generate";
import { decodeLayout } from "@turboterp/app-core/schedule/gallery";
import { planTermName } from "@turboterp/app-core/schedule/plan-link";
import { removePlan, setOwnSection, type PlanId } from "@turboterp/app-core/schedule/saved";
import { instructorLabel, bestRating, pickSection, sectionChoices } from "@turboterp/app-core/schedule/sections";
import { Button, Card, EmptyState, ErrorState, OfflineState, Skeleton, Text, radius, spacing, useTheme } from "../../../src/ui";
import { FiltersPanel } from "../../../src/schedule/components/FiltersPanel";
import { PlanBar } from "../../../src/schedule/components/PlanBar";
import { SectionPanel } from "../../../src/schedule/components/SectionPanel";
import { WeekGrid } from "../../../src/schedule/components/WeekGrid";
import {
  groupByCourse,
  indexSections,
  picksToSections,
  planAfterRemove,
  planChips,
  planHasPicks,
  saveAsPlan,
  saveCheck,
  savedNote,
  sortNeedsGrades,
  sortRequest,
  type GallerySort,
} from "../../../src/schedule/builder-model";
import { courseColors } from "../../../src/schedule/courseColors";
import { savedStore, useSaved } from "../../../src/schedule/savedStore";
import { useBuilderData, useLayouts } from "../../../src/schedule/useBuilder";
import { useCourseIndex, useTermCourses } from "../../../src/schedule/useScheduleSearch";
import { ADD_TO_CALENDAR_NOTE, appleEvents } from "../../../src/schedule/calendarExport";
import { addToAppleCalendar, openSettings } from "../../../src/schedule/calendarNative";
import { renderSeatBell } from "../../../src/alerts/SeatBell";

type View_ = { kind: "gallery" } | { kind: "editor"; picks: Record<string, Section> } | { kind: "own" };
const MINI_HEIGHT = 200;
const STRIP_ROW = 22;
const CARD_PAD = spacing.md;
const CARD_GAP = spacing.lg;

type GalleryData = {
  layouts: NonNullable<ReturnType<typeof useLayouts>["shown"]>["result"]["layouts"];
  scale: TimeScale;
  sectionByKey: ReadonlyMap<string, Section>;
  ratings: Readonly<Record<string, number>>;
  courseIds: string[];
};

function Segment<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: "row", padding: 3, borderRadius: radius.md, backgroundColor: c.surface2 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => onChange(o.value)}
            style={{ flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.md - 3, backgroundColor: on ? c.surface : "transparent" }}
          >
            <Text variant="sub" style={{ fontWeight: on ? "600" : "400" }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const LayoutCard = memo(function LayoutCard({ data, index, days, onOpen }: { data: GalleryData; index: number; days: string[]; onOpen: (picks: Section[]) => void }) {
  const { c, scheme } = useTheme();
  const groups = decodeLayout(data.layouts, index, data.sectionByKey);
  const picks = groups.map((g) => pickSection(g, data.ratings));
  const items = picks.flatMap((s) => sectionBlocks(s, { color: courseColor(data.courseIds, s.courseId), size: "mini" }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Schedule ${index + 1}: ${picks.map((s) => `${s.courseId} section ${s.id}`).join(", ")}`}
      onPress={() => onOpen(picks)}
      style={{
        height: cardHeight(data.courseIds.length) - CARD_GAP,
        padding: CARD_PAD,
        borderRadius: radius.lg,
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.separator,
        gap: spacing.sm,
      }}
    >
      <WeekGrid size="mini" scale={data.scale} items={items} height={MINI_HEIGHT} offDays={days} />
      <View>
        {picks.map((s, i) => {
          const col = courseColors(scheme, courseColor(data.courseIds, s.courseId));
          const r = bestRating(s, data.ratings);
          return (
            <View key={s.courseId} style={{ height: STRIP_ROW, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: col.solid }} />
              <Text variant="foot" style={{ fontWeight: "600" }}>
                {s.courseId}
              </Text>
              <Text variant="foot" tone="text2" numberOfLines={1} style={{ flex: 1 }}>
                {instructorLabel(s, groups[i])}
              </Text>
              <Text variant="foot" tone={r === undefined ? "text3" : "text2"}>
                {r === undefined ? "N/A" : `${r.toFixed(1)}★`}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
});

const cardHeight = (courses: number) => 18 + MINI_HEIGHT + STRIP_ROW * courses + CARD_PAD * 2 + spacing.sm + 2 + CARD_GAP;

export default function BuilderScreen() {
  const { scheme } = useTheme();
  const { c } = useTheme();
  const router = useRouter();
  const { height: winH } = useWindowDimensions();
  const { state, reload } = useCourseIndex();
  const index = state.status === "ready" ? state.index : null;
  const term = index?.term ?? null;
  const saved = useSaved(term);
  const { courses, prompt: planPrompt, updatePlan } = useTermCourses(term);
  const [dismissedPrompt, setDismissedPrompt] = useState<string | null>(null);
  const [calendarMsg, setCalendarMsg] = useState<{ text: string; settings?: boolean } | null>(null);
  const filters = saved?.filters ?? DEFAULT_FILTERS;
  const [sort, setSort] = useState<GallerySort>("default");
  const data = useBuilderData(term, courses, sortNeedsGrades(sort));
  const [view, setView] = useState<View_>({ kind: "gallery" });
  const [plan, setPlan] = useState<PlanId>("A");
  const [note, setNote] = useState<string | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(noteTimer.current), []);
  const [openCourse, setOpenCourse] = useState<string | null>(null);
  const [preview, setPreview] = useState<Section | null>(null);

  const update = (fn: Parameters<typeof savedStore.update>[1]) => (term ? savedStore.update(term, fn) : null);
  const sectionByKey = useMemo(() => indexSections(data.sections), [data.sections]);
  const sectionsByCourse = useMemo(() => groupByCourse(data.sections), [data.sections]);
  const ready = data.loaded && courses.length > 0;

  const request = useMemo<GenerateRequest | null>(() => {
    if (!ready || view.kind === "own") return null;
    return { courseIds: courses, sections: data.sections, filters: toScheduleFilters(filters), ...sortRequest(sort, data.ratings, data.gpas) };
  }, [ready, view.kind, courses, data.sections, data.ratings, data.gpas, filters, sort]);
  const { shown, pending } = useLayouts(request);
  const result = shown?.result ?? null;
  const count = result?.layouts.count ?? 0;
  const ids = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  const shownSections = useMemo(() => indexSections(shown?.req.sections ?? []), [shown]);

  const ownScale = useMemo(() => timeScale(data.sections.filter((s) => s.seats.open > 0).flatMap((s) => s.meetings)), [data.sections]);
  const ownPicks = useMemo(() => picksToSections(saved?.own ?? {}, courses, sectionByKey), [saved, courses, sectionByKey]);
  const picksNow = view.kind === "editor" ? view.picks : view.kind === "own" ? ownPicks : {};
  const check = saveCheck(picksNow);
  const chips = saved ? planChips(saved, courses) : [];

  const addToCalendar = async (placed: Section[]) => {
    const events = appleEvents(term ?? "", placed);
    if (!events.length) return setCalendarMsg({ text: "There are no timed classes to add yet." });
    setCalendarMsg({ text: "Adding…" });
    const r = await addToAppleCalendar(events);
    if (r.status === "added") setCalendarMsg({ text: "Added to Apple Calendar. If UMD changes a room or time, delete these events and add them again." });
    else if (r.status === "settings") setCalendarMsg({ text: "Calendar access is off for TurboTerp. Turn it on in Settings, then try again.", settings: true });
    else if (r.status === "denied") setCalendarMsg({ text: "TurboTerp needs permission to add events. Tap Add to calendar to try again." });
    else setCalendarMsg({ text: "Couldn't add the events. Try again." });
  };
  const confirmUpdatePlan = () => {
    if (!planPrompt) return;
    Alert.alert(`Update your ${planPrompt.termName} plan?`, planPrompt.text, [
      { text: "Cancel", style: "cancel" },
      { text: "Update plan", onPress: updatePlan },
    ]);
  };
  const promptCard =
    planPrompt && planPrompt.text !== dismissedPrompt ? (
      <Card style={{ padding: spacing.md, gap: spacing.sm }}>
        <Text variant="sub" accessibilityLiveRegion="polite">
          {`Your 4-year plan has different courses for ${planPrompt.termName}. Update your plan? ${planPrompt.text}`}
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Button label="Update plan" variant="secondary" onPress={confirmUpdatePlan} />
          <Button label="Not now" variant="secondary" onPress={() => setDismissedPrompt(planPrompt.text)} />
        </View>
      </Card>
    ) : null;

  const flash = (text: string) => {
    setNote(text);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 2500);
  };
  const onSave = () => {
    update((s) => saveAsPlan(s, plan, picksNow));
    flash(savedNote(plan));
  };
  const openPlan = (p: PlanId) => {
    if (!saved) return;
    setPlan(p);
    setOpenCourse(null);
    setPreview(null);
    const picks = picksToSections(saved.plans[p] ?? {}, courses, sectionByKey);
    if (Object.keys(picks).length) setView({ kind: "editor", picks });
  };
  const onRemove = (p: PlanId) => {
    if (!saved) return;
    update((s) => removePlan(s, p, (q) => planHasPicks(s, courses, q)));
    if (plan !== p) return;
    const next = planAfterRemove(p);
    if (next === "own") {
      setPlan("A");
      if (view.kind === "editor") setView({ kind: "own" });
    } else {
      setPlan(next);
      if (view.kind === "editor") openPlan(next);
    }
  };
  const setFilters = (f: FilterState) => update((s) => ({ ...s, filters: f }));
  const closePanel = () => {
    setOpenCourse(null);
    setPreview(null);
  };

  const back = (
    <Pressable accessibilityRole="button" accessibilityLabel="Back to course search" onPress={() => router.back()} style={{ minHeight: 44, justifyContent: "center", alignSelf: "flex-start" }}>
      <Text variant="headline" tone="accent">
        ‹ Schedule
      </Text>
    </Pressable>
  );
  const termName = term ? planTermName(term) : null;
  const title = (
    <View>
      {termName ? (
        <Text variant="caption" tone="text2">
          {termName.toUpperCase()} CLASSES
        </Text>
      ) : null}
      <Text variant="large" accessibilityRole="header">
        Build your week
      </Text>
    </View>
  );
  const frame = (body: React.ReactNode) => (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1, paddingTop: 56, paddingHorizontal: spacing.lg, gap: spacing.md }}>
        {back}
        {title}
        {body}
      </View>
    </View>
  );

  // ---- states ----
  if (state.status === "loading" || (state.status === "ready" && !saved)) return frame(<Skeleton rows={4} />);
  if (state.status === "offline") return frame(<OfflineState onRetry={reload} />);
  if (state.status === "error") return frame(<ErrorState title="Couldn't load courses" onRetry={reload} />);
  if (state.status === "missing") return frame(<EmptyState title="Course data isn't ready yet" body="This term's Schedule of Classes hasn't been prepared yet." />);
  if (courses.length === 0) return frame(<EmptyState title="Add your courses" body="Go back and search for your classes, like CMSC351 or ENGL394." />);
  if (data.failure && data.sections.length === 0) {
    return frame(data.failure === "offline" ? <OfflineState onRetry={data.retry} /> : <ErrorState title="Couldn't load sections" onRetry={data.retry} />);
  }
  if (!data.loaded) return frame(<Skeleton rows={4} />);

  const mode = (
    <Segment<"browse" | "own">
      label="How to build"
      options={[
        { value: "browse", label: "Browse layouts" },
        { value: "own", label: "Build my own" },
      ]}
      value={view.kind === "own" ? "own" : "browse"}
      onChange={(v) => {
        closePanel();
        setView(v === "own" ? { kind: "own" } : { kind: "gallery" });
      }}
    />
  );
  const savedRow = chips.some((x) => x.saved) ? (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
      <Text variant="foot" tone="text2">
        Saved:
      </Text>
      {chips
        .filter((x) => x.saved)
        .map((x) => (
          <Pressable key={x.id} accessibilityRole="button" accessibilityLabel={`Open Plan ${x.id}`} onPress={() => openPlan(x.id)} style={{ minHeight: 36, paddingHorizontal: spacing.md, justifyContent: "center", borderRadius: radius.pill, backgroundColor: c.accentTint }}>
            <Text variant="sub" tone="accent">{`Plan ${x.id}`}</Text>
          </Pressable>
        ))}
    </View>
  ) : null;

  // ---- week view (a layout, or Build my own) ----
  if (view.kind !== "gallery") {
    const own = view.kind === "own";
    const picks = own ? ownPicks : view.picks;
    const placed = courses.flatMap((id) => (picks[id] ? [picks[id]] : []));
    const items = placed.flatMap((s) => sectionBlocks(s, { color: courseColor(courses, s.courseId), size: "large" }));
    if (preview) items.push(...sectionBlocks(preview, { color: courseColor(courses, preview.courseId), size: "large", ghost: true }));
    const scale = own ? ownScale : (result?.scale ?? ownScale);
    const offGrid = untimed(items.filter((i) => !i.ghost));
    const current = openCourse ? (picks[openCourse] ?? null) : null;
    const commit = (courseId: string, s: Section | null) => {
      if (own) update((st) => setOwnSection(st, courseId, s?.id ?? null));
      else if (s) setView({ kind: "editor", picks: { ...picks, [courseId]: s } });
      setPreview(null);
    };
    const sheetMax = Math.round(winH * 0.55);
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView contentContainerStyle={{ paddingTop: 56, paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: openCourse ? sheetMax + spacing.xl : 48 }}>
          {back}
          {title}
          {mode}
          {savedRow}
          {own ? (
            <Text variant="headline">Your week</Text>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => { closePanel(); setView({ kind: "gallery" }); }} style={{ minHeight: 44, justifyContent: "center", alignSelf: "flex-start" }}>
              <Text variant="headline" tone="accent">
                ‹ All layouts
              </Text>
            </Pressable>
          )}
          {promptCard}
          <PlanBar plan={plan} chips={chips} onPlan={openPlanOrSwitch} canSave={check.canSave} blockedNote={check.blockedNote} note={note} onSave={onSave} onRemove={onRemove} />
          <Card style={{ padding: spacing.sm }}>
            <WeekGrid size="large" scale={scale} items={items} height={Math.max(360, Math.min(560, scale.hours.length * 52))} outlined={openCourse} onBlockPress={(id) => { setPreview(null); setOpenCourse(id); }} />
          </Card>
          {Platform.OS === "ios" && placed.length ? (
            <View style={{ gap: spacing.xs }}>
              <Button label="Add to calendar" variant="secondary" onPress={() => addToCalendar(placed)} />
              <Text variant="foot" tone="text3">
                {ADD_TO_CALENDAR_NOTE}
              </Text>
              {calendarMsg ? (
                <Text variant="foot" tone="text2" accessibilityLiveRegion="polite">
                  {calendarMsg.text}
                </Text>
              ) : null}
              {calendarMsg?.settings ? <Button label="Open Settings" variant="secondary" onPress={() => openSettings()} /> : null}
            </View>
          ) : null}
          {offGrid.length ? (
            <Text variant="foot" tone="text2">
              Not on the grid: {offGrid.map((i) => `${i.data!.courseId} ${i.data!.sub ?? ""} (${i.meeting.start === null ? "time TBA" : i.meeting.days.join("")})`).join("; ")}
            </Text>
          ) : null}
          <View style={{ gap: spacing.xs }}>
            {courses.map((id) => {
              const s = picks[id];
              const col = courseColors(scheme, courseColor(courses, id));
              return (
                <View key={id} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 48, borderBottomWidth: 0.5, borderBottomColor: c.separator }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: col.solid }} />
                  <Text variant="headline">{id}</Text>
                  <Text variant="sub" tone="text2" style={{ flex: 1 }}>
                    {s ? `Section ${s.id}` : "Not placed yet"}
                  </Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={`${s ? "Change" : "Choose a section for"} ${id}`} onPress={() => { setPreview(null); setOpenCourse(id); }} style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.sm }}>
                    <Text variant="headline" tone="accent">
                      {s ? "Change" : "Choose"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
          {!own ? (
            <Text variant="foot" tone="text3">
              Tap a class to see its other sections.
            </Text>
          ) : null}
        </ScrollView>
        {openCourse ? (
          <SectionPanel
            key={openCourse}
            courseId={openCourse}
            title={data.titles[openCourse] ?? ""}
            colorIndex={courseColor(courses, openCourse)}
            choices={sectionChoices(sectionsByCourse.get(openCourse) ?? [], current)}
            current={current}
            preview={preview}
            ratings={data.ratings}
            grades={data.gradesFor(openCourse)}
            allSections={sectionsByCourse.get(openCourse) ?? []}
            placed={own ? placed.filter((s) => s.courseId !== openCourse) : undefined}
            renderSeatBell={renderSeatBell}
            onPreview={(s) => setPreview(s && s.id !== current?.id ? s : null)}
            onCommit={(s) => commit(openCourse, s)}
            onClose={closePanel}
            onRemove={own ? () => commit(openCourse, null) : undefined}
            maxHeight={sheetMax}
          />
        ) : null}
      </View>
    );
  }

  // ---- gallery ----

  const galleryData: GalleryData | null = result && shown ? { layouts: result.layouts, scale: result.scale, sectionByKey: shownSections, ratings: shown.req.ratings, courseIds: shown.req.courseIds } : null;
  const offDays = Object.entries(filters.days).filter(([, r]) => r === "off").map(([d]) => d);
  const header = (
    <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
      {back}
      {title}
      {mode}
      {savedRow}
      {promptCard}
      <FiltersPanel filters={filters} onChange={setFilters} sort={sort} onSort={setSort} />
      <Text variant="sub" tone="text2" accessibilityLiveRegion="polite">
        {!result || pending ? "Finding every layout…" : `${count.toLocaleString("en-US")} ${count === 1 ? "layout fits" : "layouts fit"} your week${shown?.result.truncated ? " (showing the first 200,000)" : ""}`}
      </Text>
      {result && count === 0 && !pending ? (
        <Card style={{ padding: spacing.md, gap: spacing.sm }}>
          <Text variant="headline">No layouts fit your week</Text>
          {result.explanation ? <Text variant="sub">{result.explanation.message}</Text> : null}
          <Text variant="sub" tone="text2">
            Free up a day below, or swap a course.
          </Text>
          {result.explanation
            ? relaxOptions(result.explanation).map((o) => <Button key={o.label} label={o.label} variant="secondary" onPress={() => setFilters(relaxConstraint(filters, o.constraint))} />)
            : null}
          <Button label="Reset my week" variant="secondary" onPress={() => setFilters({ ...filters, days: {} })} />
        </Card>
      ) : null}
      {!result ? <Skeleton rows={3} /> : null}
    </View>
  );
  const rowH = cardHeight(courses.length);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={galleryData ? ids : []}
        keyExtractor={(i) => String(i)}
        getItemLayout={(_, i) => ({ length: rowH, offset: rowH * i, index: i })}
        initialNumToRender={3}
        windowSize={5}
        maxToRenderPerBatch={4}
        removeClippedSubviews
        contentContainerStyle={{ paddingTop: 56, paddingHorizontal: spacing.lg, paddingBottom: 48 }}
        ListHeaderComponent={header}
        style={{ opacity: pending ? 0.5 : 1 }}
        renderItem={({ item }) => <View style={{ height: rowH, paddingBottom: CARD_GAP }}><LayoutCard data={galleryData!} index={item} days={offDays} onOpen={(picks) => { closePanel(); setView({ kind: "editor", picks: Object.fromEntries(picks.map((s) => [s.courseId, s])) }); }} /></View>}
      />
    </View>
  );

  function openPlanOrSwitch(p: PlanId) {
    // Switching the plan letter only changes which plan "Save" writes to; a saved plan also opens.
    setPlan(p);
    if (saved && planHasPicks(saved, courses, p)) openPlan(p);
  }
}


