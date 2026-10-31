// The section chooser for one course, as a bottom sheet over the week (phones). Tap a section to
// preview it as ghost blocks; "Switch"/"Place" commits it. In Build my own a section that would
// overlap a placed course says so and can't be committed (overlap blocking).
import type { ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import type { Section } from "@turboterp/course-data/schedules";
import { gradeSummary, ratingTone, type RatingTone, type SectionChoices } from "@turboterp/app-core/schedule/sections";
import { Button, StatusBadge, Text, radius, spacing, useTheme, type Status } from "../../ui";
import { sectionRow } from "../builder-model";
import type { GradesByCourse } from "../loader";
import { courseColors } from "../courseColors";

const TONE_STATUS: Record<RatingTone, Status> = { good: "open", fair: "soon", low: "closed", none: "unknown" };

/**
 * B5 (Seat Alerts) fills this in: it renders the bell for one section, or for the whole course
 * (`sectionId` null). The panel only provides the place; there is no alert logic here.
 */
export type SeatBellSlot = (args: { courseId: string; sectionId: string | null; full: boolean }) => ReactNode;

export type SectionPanelProps = {
  courseId: string;
  title: string;
  colorIndex: number;
  choices: SectionChoices;
  current: Section | null;
  preview: Section | null;
  ratings: Readonly<Record<string, number>>;
  /** undefined while loading; null when there's no file. */
  grades: GradesByCourse | null | undefined;
  /** Every section of the course; the full ones are listed (with the bell slot). */
  allSections: Section[];
  /** The other placed courses' sections (Build my own); a section overlapping one is blocked. */
  placed?: Section[];
  /** Seat Alerts bell slot (B5). */
  renderSeatBell?: SeatBellSlot;
  onPreview: (s: Section | null) => void;
  onCommit: (s: Section) => void;
  onClose: () => void;
  onRemove?: () => void;
  maxHeight: number;
};

function GradeBar({ summary, loading }: { summary: ReturnType<typeof gradeSummary>; loading: boolean }) {
  if (loading) return <Text variant="foot" tone="text3">Loading grades…</Text>;
  if (!summary) return <Text variant="foot" tone="text3">No grade data</Text>;
  const shades = ["#248a3d", "#6aa84f", "#e0a800", "#e67e22", "#c0392b", "#8e8e93"];
  return (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden" }} accessibilityLabel={summary.bars.map((b) => `${b.letter} ${Math.round(b.share * 100)}%`).join(", ")}>
        {summary.bars.map((b, i) => (b.share > 0 ? <View key={b.letter} style={{ flexGrow: b.share, backgroundColor: shades[i] }} /> : null))}
      </View>
      <Text variant="foot" tone="text2">
        {summary.gpa !== null ? `GPA ${summary.gpa.toFixed(2)} · ` : ""}
        {summary.students.toLocaleString("en-US")} students
      </Text>
    </View>
  );
}

export function SectionPanel(p: SectionPanelProps) {
  const { c, scheme } = useTheme();
  const swatch = courseColors(scheme, p.colorIndex);
  const placed = p.placed ?? [];

  const row = (s: Section) => {
    const r = sectionRow(s, p.ratings, placed);
    const isCurrent = p.current?.id === s.id;
    const isPreview = p.preview?.id === s.id;
    const blocked = r.clash.length > 0;
    return (
      <View key={s.id} style={{ borderBottomWidth: 0.5, borderBottomColor: c.separator, backgroundColor: isPreview ? c.accentTint : "transparent" }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isCurrent }}
          accessibilityLabel={`Section ${s.id}, ${r.instructors}, ${r.seats}, ${r.when}${blocked ? `, overlaps ${r.clash.join(", ")}` : ""}`}
          onPress={() => (isCurrent ? undefined : p.onPreview(isPreview ? null : s))}
          style={{ padding: spacing.md, gap: 4, minHeight: 64 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Text variant="headline">{r.id}</Text>
            <Text variant="sub" numberOfLines={1} style={{ flexShrink: 1 }}>
              {r.instructors}
            </Text>
            <StatusBadge status={TONE_STATUS[ratingTone(r.rating)]} label={r.rating === undefined ? "N/A" : `${r.rating.toFixed(1)}★`} />
            <View style={{ flex: 1 }} />
            <Text variant="foot" tone={r.lowSeats ? "danger" : "text2"}>
              {r.seats}
            </Text>
            {p.renderSeatBell?.({ courseId: p.courseId, sectionId: s.id, full: false })}
          </View>
          <Text variant="foot" tone="text2">
            {r.when}
            {r.rooms ? ` · ${r.rooms}` : ""}
          </Text>
          {blocked ? (
            <Text variant="foot" tone="danger">
              Overlaps {r.clash.join(", ")}
            </Text>
          ) : null}
          <GradeBar summary={gradeSummary(p.grades ?? null, p.courseId, s.instructors)} loading={p.grades === undefined} />
        </Pressable>
        {isPreview && !isCurrent ? (
          <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
            <Button label={p.current ? `Switch to ${s.id}` : `Place ${s.id}`} onPress={() => p.onCommit(s)} />
          </View>
        ) : null}
      </View>
    );
  };

  const full = p.allSections.filter((s) => s.seats.open === 0 && s.id !== p.current?.id);
  const empty = p.choices.sameLecture.length + p.choices.otherLectures.length === 0;
  return (
    <View
      accessibilityLabel={`${p.courseId} sections`}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: p.maxHeight,
        backgroundColor: c.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        borderTopWidth: 1,
        borderColor: c.separator,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md }}>
        <View style={{ width: 10, height: 36, borderRadius: 3, backgroundColor: swatch.solid }} />
        <View style={{ flex: 1 }}>
          <Text variant="headline">{p.courseId} · choose a section</Text>
          <Text variant="foot" tone="text2" numberOfLines={1}>
            {p.title}
          </Text>
        </View>
        {p.renderSeatBell?.({ courseId: p.courseId, sectionId: null, full: full.length > 0 })}
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={p.onClose} style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
          <Text variant="headline" tone="text2">
            ✕
          </Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {empty ? (
          <Text variant="sub" tone="text2" style={{ padding: spacing.md }}>
            Every section of {p.courseId} is full.
          </Text>
        ) : null}
        {p.choices.sameLecture.length ? (
          <>
            <Text variant="caption" tone="text2" style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
              SAME LECTURE, OTHER DISCUSSION
            </Text>
            {p.choices.sameLecture.map(row)}
          </>
        ) : null}
        {p.choices.otherLectures.length ? (
          <>
            <Text variant="caption" tone="text2" style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
              {p.current ? "OTHER LECTURE TIMES" : "SECTIONS WITH OPEN SEATS"}
            </Text>
            {p.choices.otherLectures.map(row)}
          </>
        ) : null}
        {full.length ? (
          <>
            <Text variant="caption" tone="text2" style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
              FULL SECTIONS
            </Text>
            {full.map((s) => (
              <View key={s.id} style={{ flexDirection: "row", alignItems: "center", padding: spacing.md, gap: spacing.sm, borderBottomWidth: 0.5, borderBottomColor: c.separator }}>
                <View style={{ flex: 1 }}>
                  <Text variant="headline">{s.id}</Text>
                  <Text variant="foot" tone="text2">
                    Full · waitlist {s.seats.waitlist} · {s.instructors.join(", ") || "TBA"}
                  </Text>
                </View>
                {p.renderSeatBell?.({ courseId: p.courseId, sectionId: s.id, full: true })}
              </View>
            ))}
          </>
        ) : null}
        <Text variant="foot" tone="text3" style={{ padding: spacing.md }}>
          Ratings and grades: PlanetTerp. Full sections can't be placed.
        </Text>
        {p.onRemove && p.current ? (
          <View style={{ paddingHorizontal: spacing.md }}>
            <Button label={`Take ${p.courseId} off the week`} variant="secondary" onPress={p.onRemove} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
