import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import type { ClassKind, ClassPlace } from "@turboterp/campus-data/class-kinds";
import { RESERVE_CARDS } from "@turboterp/campus-data/recwell-reserve";
import { CLASS_KINDS, CLASS_PLACES } from "@turboterp/app-core/fitness-classes";
import { Card, EmptyState, ListRow, ScreenState, SectionHeader, StatusBadge, Text, spacing, tap } from "../../../src/ui";
import { Chip, ChipRow, RefreshPage } from "../../../src/dining/parts";
import { classDays, classRows, gymGroups } from "../../../src/campus/model";
import { openLink } from "../../../src/campus/open";
import { useGyms } from "../../../src/campus/useCampusData";
import { useMinuteClock } from "../../../src/today/useToday";

const ACTIVETERP = "https://activeterp.umd.edu/";

export default function Gym() {
  const gyms = useGyms();
  const { clock } = useMinuteClock();
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [kind, setKind] = useState<ClassKind | null>(null);
  const [place, setPlace] = useState<ClassPlace | null>(null);

  const areas = gyms.data?.areas;
  const classes = gyms.data?.classes;
  const groups = useMemo(() => (areas?.ok ? gymGroups(areas.data, clock) : []), [areas, clock]);
  const days = useMemo(() => classDays(clock.today), [clock.today]);
  const day = pickedDay ?? days[0]!.day;
  const rows = useMemo(
    () => (classes?.ok ? classRows(classes.data, { day, kind, place }, clock) : []),
    [classes, day, kind, place, clock],
  );

  return (
    <RefreshPage title="Fitness" subtitle="Campus" refreshing={gyms.refreshing} onRefresh={() => void gyms.refresh()}>
      <ScreenState
        loading={gyms.status === "loading"}
        offline={gyms.status === "offline"}
        error={gyms.status === "error"}
        hasData={!!gyms.data}
        onRetry={() => void gyms.refresh()}
      >
        {areas && !areas.ok ? (
          <Card>
            <EmptyState title="RecWell hours are unavailable" body="Pull down to try again." />
          </Card>
        ) : null}
        {groups.map((g) => (
          <View key={g.title} style={{ gap: spacing.sm }}>
            <SectionHeader title={g.title} />
            {g.sections.map((s) => (
              <View key={s.label ?? "base"} style={{ gap: spacing.xs }}>
                {s.label ? (
                  <Text variant="headline" accessibilityRole="header">
                    {s.label}
                  </Text>
                ) : null}
                <Card>
                  {s.tiles.map((t, i) => (
                    <ListRow
                      key={t.key}
                      title={t.title}
                      subtitle={t.text}
                      trailing={<StatusBadge status={t.status} />}
                      onPress={() => openLink(t.url)}
                      last={i === s.tiles.length - 1 && !s.fallback}
                    />
                  ))}
                  {s.fallback ? (
                    <ListRow title={s.label ?? ""} subtitle={s.fallback.description} onPress={() => openLink(s.fallback!.url)} last />
                  ) : null}
                </Card>
              </View>
            ))}
          </View>
        ))}

        <SectionHeader title="Classes" />
        {classes && !classes.ok ? (
          <Card>
            <EmptyState title="Classes are unavailable" body="Pull down to try again." />
          </Card>
        ) : (
          <>
            <Pressable onPress={() => openLink(ACTIVETERP)} accessibilityRole="link" accessibilityLabel="First time? Open ActiveTerp">
              <Text variant="sub" tone="text2">
                First time? Add the free Group Fitness Membership on ActiveTerp and sign the waiver.
              </Text>
            </Pressable>
            <ChipRow>
              {days.map((d) => (
                <Chip key={d.day} label={d.label} pressed={d.day === day} onPress={() => setPickedDay(d.day)} />
              ))}
            </ChipRow>
            <ChipRow>
              {CLASS_KINDS.map((k) => (
                <Chip key={k} label={k} pressed={kind === k} onPress={() => setKind(kind === k ? null : k)} />
              ))}
            </ChipRow>
            <ChipRow>
              {CLASS_PLACES.map((p) => (
                <Chip key={p} label={p} pressed={place === p} onPress={() => setPlace(place === p ? null : p)} />
              ))}
            </ChipRow>
            {rows.length === 0 ? (
              <Card>
                <EmptyState title="No classes match" body="Try another day or clear a filter." />
              </Card>
            ) : (
              <Card>
                {rows.map((r, i) => (
                  <ListRow
                    key={r.key}
                    title={r.title}
                    subtitle={r.note ? `${r.sub}\n${r.note}` : r.sub}
                    trailing={
                      r.signupUrl ? (
                        <Pressable
                          onPress={() => {
                            tap();
                            openLink(r.signupUrl!);
                          }}
                          accessibilityRole="link"
                          accessibilityLabel={`Sign up for ${r.title}`}
                          hitSlop={8}
                        >
                          <Text variant="sub" tone="accent" style={{ fontWeight: "600" }}>
                            Sign up
                          </Text>
                        </Pressable>
                      ) : null
                    }
                    last={i === rows.length - 1}
                  />
                ))}
              </Card>
            )}
          </>
        )}

        <SectionHeader title="Reserve" />
        {RESERVE_CARDS.map((rc) => (
          <Card key={rc.id} style={{ padding: spacing.lg, gap: spacing.xs }}>
            <Text variant="headline">{rc.title}</Text>
            <Text variant="sub" tone="text2">
              {rc.summary}
            </Text>
            <Text variant="sub" tone="text2">
              {rc.rules}
            </Text>
            {rc.links.map((l) => (
              <Pressable key={l.url} onPress={() => openLink(l.url)} accessibilityRole="link" accessibilityLabel={l.label}>
                <Text variant="sub" tone="accent" style={{ fontWeight: "600" }}>
                  {l.label}
                </Text>
              </Pressable>
            ))}
          </Card>
        ))}
      </ScreenState>
      <Text variant="caption" tone="text2">
        Hours from UMD RecWell. Closures can happen on short notice; check facility alerts at recwell.umd.edu/facility-alerts.
      </Text>
    </RefreshPage>
  );
}
