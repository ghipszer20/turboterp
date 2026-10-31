import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { Card, ScreenState, SectionHeader, StatusBadge, Text, spacing, tap, useTheme } from "../../../src/ui";
import { RefreshPage } from "../../../src/dining/parts";
import { libraryGroups, type LibraryCard } from "../../../src/campus/model";
import { openLink } from "../../../src/campus/open";
import { useLibraries } from "../../../src/campus/useCampusData";
import { useMinuteClock } from "../../../src/today/useToday";

function LibraryRow({ lib, last }: { lib: LibraryCard; last: boolean }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ borderBottomWidth: last ? 0 : 0.5, borderBottomColor: c.separator }}>
      <Pressable
        onPress={() => {
          tap();
          setOpen(!open);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${lib.name}, ${lib.text}`}
        accessibilityState={{ expanded: open }}
        style={{ minHeight: 56, flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="body">{lib.name}</Text>
          <Text variant="sub" tone="text2">
            {lib.text}
          </Text>
        </View>
        <StatusBadge status={lib.status} />
      </Pressable>
      {open ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.xs }}>
          {lib.week.map((d) => (
            <View key={d.date} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="sub" tone="text2">
                {d.label}
              </Text>
              <Text variant="sub">{d.hours}</Text>
            </View>
          ))}
          <Pressable onPress={() => openLink(lib.url)} accessibilityRole="link" accessibilityLabel={`${lib.name} on UMD Libraries`}>
            <Text variant="sub" tone="accent" style={{ marginTop: spacing.sm }}>
              Open on UMD Libraries
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function Libraries() {
  const libs = useLibraries();
  const { clock } = useMinuteClock();
  const groups = useMemo(() => (libs.data ? libraryGroups(libs.data, clock) : []), [libs.data, clock]);

  return (
    <RefreshPage title="Libraries" subtitle="Campus" refreshing={libs.refreshing} onRefresh={() => void libs.refresh()}>
      <Link href="/campus/rooms" asChild>
        <Pressable onPress={tap} accessibilityRole="link" accessibilityLabel="Study rooms">
          <Card style={{ padding: spacing.lg }}>
            <Text variant="headline" tone="accent">
              Study rooms
            </Text>
            <Text variant="sub" tone="text2">
              Find an open room and book it
            </Text>
          </Card>
        </Pressable>
      </Link>
      <ScreenState
        loading={libs.status === "loading"}
        offline={libs.status === "offline"}
        error={libs.status === "error"}
        hasData={groups.length > 0}
        onRetry={() => void libs.refresh()}
      >
        {groups.map((g) => (
          <View key={g.title} style={{ gap: spacing.sm }}>
            <SectionHeader title={g.title} />
            <Card>
              {g.items.map((lib, i) => (
                <LibraryRow key={lib.id} lib={lib} last={i === g.items.length - 1} />
              ))}
            </Card>
          </View>
        ))}
      </ScreenState>
      <Text variant="caption" tone="text2">
        Hours from UMD Libraries. Tap a library for its week.
      </Text>
    </RefreshPage>
  );
}
