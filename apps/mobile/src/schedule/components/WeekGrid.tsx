// A Monday-Friday week: hour axis, one column per day, blocks colored by course. Overlapping
// blocks sit side by side and never look different (owner). Ghost blocks (a section being
// previewed) are dashed; the course whose panel is open gets an accent outline.
import { memo, useMemo } from "react";
import { Pressable, View } from "react-native";
import { blockLabel, type BlockLabel } from "@turboterp/app-core/schedule/block-items";
import { dayBlocks, DAY_SHORT, hourLabel, WEEKDAYS, type BlockInput, type TimeScale } from "@turboterp/app-core/schedule/calendar";
import { Text, radius, useTheme } from "../../ui";
import { courseColors } from "../courseColors";

const AXIS = 30;

export type WeekGridProps = {
  scale: TimeScale;
  items: BlockInput<BlockLabel>[];
  /** Height of the day columns in px. */
  height: number;
  size: "mini" | "large";
  /** Course whose blocks get the accent outline. */
  outlined?: string | null;
  onBlockPress?: (courseId: string) => void;
  /** Days with a "Day off" filter are dimmed. */
  offDays?: readonly string[];
};

export const WeekGrid = memo(function WeekGrid({ scale, items, height, size, outlined, onBlockPress, offDays = [] }: WeekGridProps) {
  const { c, scheme } = useTheme();
  const days = useMemo(() => dayBlocks(items, scale), [items, scale]);
  const mini = size === "mini";
  const labelSize = mini ? 9 : 11;
  const view = mini ? "gallery" : "week";
  return (
    <View accessibilityLabel="Week schedule" style={{ gap: 2 }}>
      <View style={{ flexDirection: "row", paddingLeft: AXIS }}>
        {WEEKDAYS.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: "center" }}>
            <Text variant="caption" tone="text2" style={{ fontSize: mini ? 9 : 11 }}>
              {DAY_SHORT[d]}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", height }}>
        <View style={{ width: AXIS }}>
          {scale.hours.slice(0, -1).map((h) => (
            <Text
              key={h}
              variant="caption"
              tone="text3"
              style={{ position: "absolute", right: 4, top: `${((h - scale.start) / (scale.end - scale.start)) * 100}%`, fontSize: 9, lineHeight: 11, marginTop: -5 }}
            >
              {hourLabel(h)}
            </Text>
          ))}
        </View>
        {WEEKDAYS.map((d) => (
          <View
            key={d}
            style={{ flex: 1, borderLeftWidth: 0.5, borderLeftColor: c.separator, opacity: offDays.includes(d) ? 0.4 : 1 }}
          >
            {scale.hours.map((h) => (
              <View
                key={h}
                pointerEvents="none"
                style={{ position: "absolute", left: 0, right: 0, top: `${((h - scale.start) / (scale.end - scale.start)) * 100}%`, height: 0.5, backgroundColor: c.separator }}
              />
            ))}
            {days[d].map((b) => {
              const data = b.data!;
              const col = courseColors(scheme, data.color);
              const px = (height * b.height) / 100;
              const lines = blockLabel(b, view);
              const two = px >= (mini ? 22 : 30);
              const out = outlined === data.courseId && !b.ghost;
              return (
                <Pressable
                  key={`${b.id}-${d}`}
                  disabled={!onBlockPress || b.ghost}
                  accessibilityRole="button"
                  accessibilityLabel={`${data.courseId} section ${data.sectionId}`}
                  onPress={() => onBlockPress?.(data.courseId)}
                  style={{
                    position: "absolute",
                    top: `${b.top}%`,
                    height: `${b.height}%`,
                    left: `${(b.lane / b.lanes) * 100}%`,
                    width: `${100 / b.lanes}%`,
                    padding: 1,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: radius.sm / 3,
                      backgroundColor: b.ghost ? "transparent" : col.bg,
                      borderWidth: b.ghost || out ? 1.5 : 0,
                      borderStyle: b.ghost ? "dashed" : "solid",
                      borderColor: b.ghost ? col.solid : c.accent,
                      borderLeftWidth: b.ghost || out ? 1.5 : 2.5,
                      borderLeftColor: b.ghost ? col.solid : out ? c.accent : col.solid,
                      justifyContent: "center",
                      paddingHorizontal: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Text numberOfLines={1} style={{ color: col.fg, fontSize: labelSize, lineHeight: labelSize + 2, fontWeight: "700" }}>
                      {lines.top}
                    </Text>
                    {two ? (
                      <Text numberOfLines={1} style={{ color: col.fg, fontSize: labelSize - 1, lineHeight: labelSize + 1 }}>
                        {lines.bottom}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});
