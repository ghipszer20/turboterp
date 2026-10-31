import { useMemo, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import type { DietTag } from "@turboterp/campus-data";
import { Badge, Card, ListRow, ScreenState, SectionHeader, StatusBadge, Text, spacing, tap, useTheme } from "../../../../src/ui";
import { Chip, ChipRow, RefreshPage } from "../../../../src/dining/parts";
import { ALLERGENS, DIETS, dietLabel, hallCards, menuStations, stampRows } from "../../../../src/dining/model";
import { useDining, useStamp } from "../../../../src/dining/useDining";
import { useMinuteClock } from "../../../../src/today/useToday";
import { DINING_HALLS } from "@turboterp/app-core/dining";

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function Dining() {
  const { c } = useTheme();
  const { hall: hallParam } = useLocalSearchParams<{ hall?: string }>();
  const dining = useDining();
  const stamp = useStamp();
  const { clock } = useMinuteClock();
  const [pickedHall, setPickedHall] = useState<number | null>(null);
  const [pickedMeal, setPickedMeal] = useState<string | null>(null);
  const [diets, setDiets] = useState<DietTag[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [showAllergens, setShowAllergens] = useState(false);

  const cards = useMemo(() => (dining.data ? hallCards(dining.data.bundle, clock) : []), [dining.data, clock]);
  const askedId = Number(hallParam);
  const hallId = pickedHall ?? (DINING_HALLS.some((h) => h.id === askedId) ? askedId : DINING_HALLS[0].id);
  const card = cards.find((h) => h.id === hallId);
  const meal = card?.meals ? (pickedMeal && card.meals.includes(pickedMeal) ? pickedMeal : card.meals[0]) : undefined;
  const stations = useMemo(
    () => menuStations(card?.menu?.meals.find((m) => m.name === meal), diets, avoid),
    [card, meal, diets, avoid],
  );
  const stampList = useMemo(() => (stamp.data ? stampRows(stamp.data, clock) : []), [stamp.data, clock]);

  return (
    <RefreshPage
      title="Dining"
      subtitle="Today"
      refreshing={dining.refreshing || stamp.refreshing}
      onRefresh={() => void Promise.all([dining.refresh(), stamp.refresh()])}
    >
      <Link href="/campus/dining/search" asChild>
        <Pressable onPress={tap} accessibilityRole="link" accessibilityLabel="Find a food">
          <Card style={{ padding: spacing.lg, backgroundColor: c.accentTint }}>
            <Text variant="headline" tone="accent">
              Find a food
            </Text>
            <Text variant="sub" tone="text2">
              Search every hall's menu for today
            </Text>
          </Card>
        </Pressable>
      </Link>

      <ScreenState
        loading={dining.status === "loading"}
        offline={dining.status === "offline"}
        error={dining.status === "error"}
        hasData={!!dining.data}
        onRetry={() => void dining.refresh()}
      >
        <ChipRow>
          {DINING_HALLS.map((h) => (
            <Chip key={h.id} label={h.short} pressed={h.id === hallId} onPress={() => setPickedHall(h.id)} />
          ))}
        </ChipRow>
        {card?.meals && card.meals.length > 0 ? (
          <ChipRow>
            {card.meals.map((m) => (
              <Chip key={m} label={m} pressed={m === meal} onPress={() => setPickedMeal(m)} />
            ))}
          </ChipRow>
        ) : null}
        <ChipRow>
          {DIETS.map((d) => (
            <Chip key={d.tag} label={d.label} pressed={diets.includes(d.tag)} onPress={() => setDiets(toggle(diets, d.tag))} />
          ))}
          <Chip
            label={`Avoid allergens${avoid.length ? ` · ${avoid.length}` : ""}`}
            pressed={showAllergens}
            onPress={() => setShowAllergens(!showAllergens)}
          />
        </ChipRow>
        {showAllergens ? (
          <ChipRow>
            {ALLERGENS.map((a) => (
              <Chip key={a} label={`No ${a}`} pressed={avoid.includes(a)} onPress={() => setAvoid(toggle(avoid, a))} />
            ))}
          </ChipRow>
        ) : null}

        {!card?.menu || !card.meals ? (
          <Card style={{ padding: spacing.lg }}>
            <Text variant="headline">{`Couldn’t load ${card?.name ?? "this hall"}`}</Text>
            <Text variant="sub" tone="text2">
              UMD Dining didn’t respond. Pull down to try again.
            </Text>
          </Card>
        ) : stations.length === 0 ? (
          <Card style={{ padding: spacing.lg }}>
            <Text variant="headline">{meal ? "Nothing matches your filters" : "No menu posted"}</Text>
            <Text variant="sub" tone="text2">
              {meal ? "Try removing a filter." : "This hall hasn’t posted a menu for today."}
            </Text>
          </Card>
        ) : (
          stations.map((s) => (
            <View key={s.name}>
              <SectionHeader title={s.name} />
              <Card>
                {s.items.map((item, i) => {
                  const tags = dietLabel(item);
                  const row = (
                    <ListRow
                      key={`${i}-${item.name}`}
                      title={item.name}
                      trailing={tags.map((t) => (
                        <Badge key={t} label={t} tone="accent" />
                      ))}
                      onPress={item.labelUrl ? () => void Linking.openURL(item.labelUrl!) : undefined}
                      last={i === s.items.length - 1}
                    />
                  );
                  return row;
                })}
              </Card>
            </View>
          ))
        )}
      </ScreenState>

      <SectionHeader title="Stamp Student Union" />
      <ScreenState
        loading={stamp.status === "loading"}
        offline={stamp.status === "offline"}
        error={stamp.status === "error"}
        hasData={stampList.length > 0}
        onRetry={() => void stamp.refresh()}
      >
        <Card>
          {stampList.map((v, i) => (
            <ListRow
              key={v.key}
              title={v.name}
              subtitle={v.hours ? `${v.text} · ${v.hours}` : v.text}
              trailing={v.status === "unknown" ? undefined : <StatusBadge status={v.status} />}
              last={i === stampList.length - 1}
            />
          ))}
        </Card>
      </ScreenState>
    </RefreshPage>
  );
}
