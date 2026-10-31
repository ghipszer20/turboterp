// "Your week": each weekday is a Day off or has the hours the student wants class in, plus the
// "same hours every day" shortcut and the sort. Collapsed by default so the gallery leads.
import { useState } from "react";
import { Pressable, View } from "react-native";
import { clock, DAY_NAME, WEEKDAYS } from "@turboterp/app-core/schedule/calendar";
import { applySameHours, setDayOff, type FilterState } from "@turboterp/app-core/schedule/filters";
import { Text, radius, spacing, useTheme } from "../../ui";
import { GALLERY_SORTS, stepWindow, WINDOW_FIRST, WINDOW_LAST, type GallerySort } from "../builder-model";

function Stepper({ label, minutes, onStep }: { label: string; minutes: number; onStep: (hours: number) => void }) {
  const { c } = useTheme();
  const btn = (text: string, hours: number, name: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${name}`}
      onPress={() => onStep(hours)}
      style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: c.surface2 }}
    >
      <Text variant="headline">{text}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      {btn("−", -1, "earlier")}
      <Text variant="sub" style={{ minWidth: 52, textAlign: "center" }} accessibilityLabel={`${label} ${clock(minutes)}`}>
        {clock(minutes)}
      </Text>
      {btn("+", 1, "later")}
    </View>
  );
}

function Pill({ label, on, onPress, a11y }: { label: string; on: boolean; onPress: () => void; a11y?: string }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y ?? label}
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={{
        minHeight: 36,
        paddingHorizontal: spacing.md,
        justifyContent: "center",
        borderRadius: radius.pill,
        backgroundColor: on ? c.accent : c.accentTint,
      }}
    >
      <Text variant="sub" style={{ color: on ? c.onAccent : c.accent }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function FiltersPanel({
  filters,
  onChange,
  sort,
  onSort,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  sort: GallerySort;
  onSort: (s: GallerySort) => void;
}) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  const restricted = Object.keys(filters.days).length;
  return (
    <View style={{ gap: spacing.md }}>
      <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
        {GALLERY_SORTS.map((o) => (
          <Pill key={o.value} label={o.label} on={o.value === sort} onPress={() => onSort(o.value)} a11y={`Sort by ${o.label}`} />
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={{ minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: c.surface }}
      >
        <Text variant="headline">Your week</Text>
        <Text variant="sub" tone="text2">
          {restricted ? `${restricted} day${restricted === 1 ? "" : "s"} set` : "Any day, any time"} {open ? "▴" : "▾"}
        </Text>
      </Pressable>
      {open ? (
        <View style={{ gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: c.surface }}>
          <Text variant="foot" tone="text2">
            Tap "Day off", or choose the hours you want class.
          </Text>
          {WEEKDAYS.map((d) => {
            const rule = filters.days[d];
            const off = rule === "off";
            const from = rule && rule !== "off" ? rule.from : WINDOW_FIRST;
            const to = rule && rule !== "off" ? rule.to : WINDOW_LAST;
            return (
              <View key={d} style={{ gap: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text variant="headline">{DAY_NAME[d]}</Text>
                  <Pill label={off ? "✓ Day off" : "Day off"} on={off} onPress={() => onChange(setDayOff(filters, d, !off))} a11y={`${DAY_NAME[d]} day off`} />
                </View>
                {off ? null : (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
                    <Stepper label={`${DAY_NAME[d]} earliest class`} minutes={from} onStep={(h) => onChange(stepWindow(filters, d, "from", h))} />
                    <Text variant="sub" tone="text2">
                      to
                    </Text>
                    <Stepper label={`${DAY_NAME[d]} latest class ends`} minutes={to} onStep={(h) => onChange(stepWindow(filters, d, "to", h))} />
                  </View>
                )}
              </View>
            );
          })}
          <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap", paddingTop: spacing.sm }}>
            <Pill label="9am–5pm every day" on={false} onPress={() => onChange(applySameHours(filters, 9 * 60, 17 * 60))} />
            {restricted ? <Pill label="Reset week" on={false} onPress={() => onChange({ ...filters, days: {} })} /> : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
