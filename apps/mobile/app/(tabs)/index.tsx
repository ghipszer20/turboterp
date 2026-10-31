import { useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Link } from "expo-router";
import { Card, ListRow, ScreenState, SectionHeader, Text, spacing, tap, useTheme } from "../../src/ui";
import { dateLabel, diningTiles, heroModel, seatAlertsCard, upcomingDates, type HeroModel } from "../../src/today/model";
import { useMinuteClock, useToday } from "../../src/today/useToday";
import { useNextClass } from "../../src/today/useNextClass";

// Seat Alerts watches live in the Seat Alerts tab's own store (a later task); until it exposes a
// count the card stays hidden, exactly as on the web when nothing is being watched.
const WATCHING = 0;

export default function Today() {
  const { c } = useTheme();
  const { status, data, refreshing, refresh } = useToday();
  const { clock, now } = useMinuteClock();
  const next = useNextClass(now);

  const view = useMemo(() => {
    if (!data) return null;
    const dates = upcomingDates(data, clock);
    return { dining: diningTiles(data, clock), dates, hero: heroModel(next, dates[0] ?? null) };
  }, [data, clock, next]);
  const alerts = seatAlertsCard(WATCHING);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ alignItems: "center", paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
    >
      <View style={{ width: "100%", maxWidth: 720, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <Text variant="caption" tone="text2">
          {dateLabel(clock).toUpperCase()}
        </Text>
        <Text variant="large" accessibilityRole="header" style={{ marginBottom: spacing.md }}>
          Today
        </Text>
        <ScreenState
          loading={status === "loading"}
          offline={status === "offline"}
          error={status === "error"}
          hasData={!!view}
          onRetry={() => void refresh()}
        >
          {view ? (
            <>
              {alerts ? (
                <Link href="/seat-alerts" asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`${alerts.title}. ${alerts.sub}`}
                    onPress={tap}
                    style={{ marginBottom: spacing.md }}
                  >
                    <Card style={{ padding: spacing.lg }}>
                      <Text variant="headline">{alerts.title}</Text>
                      <Text variant="sub" tone="text2">
                        {alerts.sub}
                      </Text>
                    </Card>
                  </Pressable>
                </Link>
              ) : null}
              <Hero hero={view.hero} />
              <SectionHeader title="Dining" />
              <Card>
                {view.dining.map((t, i) => (
                  <ListRow key={t.key} title={t.title} subtitle={t.sub} href="/campus/dining" last={i === view.dining.length - 1} />
                ))}
              </Card>
              {view.dates.length > 0 ? (
                <>
                  <SectionHeader title="Coming up" />
                  <Card>
                    {view.dates.map((d, i) => (
                      <ListRow key={d.key} title={d.title} subtitle={d.sub} last={i === view.dates.length - 1} />
                    ))}
                  </Card>
                </>
              ) : null}
            </>
          ) : null}
        </ScreenState>
      </View>
    </ScrollView>
  );
}

function Hero({ hero }: { hero: HeroModel }) {
  const { c } = useTheme();
  const body = (
    <Card style={{ padding: spacing.lg, backgroundColor: c.accentTint }}>
      <Text variant="caption" style={{ color: c.accent }}>
        {hero.label.toUpperCase()}
      </Text>
      <Text variant="title">{hero.title}</Text>
      {hero.sub ? (
        <Text variant="sub" tone="text2">
          {hero.sub}
        </Text>
      ) : null}
    </Card>
  );
  const label = [hero.label, hero.title, hero.sub].filter(Boolean).join(", ");
  if (!hero.href) {
    return (
      <View accessible accessibilityLabel={label}>
        {body}
      </View>
    );
  }
  return (
    <Link href={hero.href} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={label} onPress={tap}>
        {body}
      </Pressable>
    </Link>
  );
}
