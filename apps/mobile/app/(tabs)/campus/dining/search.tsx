import { useMemo, useState } from "react";
import { TextInput, View } from "react-native";
import { Card, EmptyState, ScreenState, SectionHeader, Text, radius, spacing, useTheme } from "../../../../src/ui";
import { Chip, ChipRow, RefreshPage } from "../../../../src/dining/parts";
import { parseDiningQuery, searchMeals, searchModel } from "../../../../src/dining/model";
import { useFoodIndex } from "../../../../src/dining/useDining";
import { useMinuteClock } from "../../../../src/today/useToday";
import { DINING_HALLS } from "@turboterp/app-core/dining";

export default function FindAFood() {
  const { c } = useTheme();
  const index = useFoodIndex();
  const { clock } = useMinuteClock();
  const [term, setTerm] = useState("");
  const [hallId, setHallId] = useState<number | null>(null);
  const [meal, setMeal] = useState<string | null>(null);

  const query = parseDiningQuery(term);
  const meals = useMemo(() => (index.data ? searchMeals(index.data, clock) : []), [index.data, clock]);
  const groups = useMemo(
    () => (index.data && query ? searchModel(index.data, clock, query, hallId, meal) : []),
    [index.data, clock, query, hallId, meal],
  );
  const scope = `${DINING_HALLS.find((h) => h.id === hallId)?.short ?? "all halls"} ${meal ? meal.toLowerCase() : "today"}`;

  return (
    <RefreshPage title="Find a food" subtitle="Today's menus" refreshing={index.refreshing} onRefresh={() => void index.refresh()}>
      <TextInput
        value={term}
        onChangeText={setTerm}
        placeholder="Search for a food"
        placeholderTextColor={c.text3}
        accessibilityLabel="Search for a food"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
        style={{
          minHeight: 44,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          backgroundColor: c.surface,
          color: c.text,
          fontSize: 17,
        }}
      />
      <ScreenState
        loading={index.status === "loading"}
        offline={index.status === "offline"}
        error={index.status === "error"}
        hasData={!!index.data}
        onRetry={() => void index.refresh()}
      >
        <ChipRow>
          <Chip label="All halls" pressed={hallId === null} onPress={() => setHallId(null)} />
          {DINING_HALLS.map((h) => (
            <Chip key={h.id} label={h.short} pressed={h.id === hallId} onPress={() => setHallId(h.id)} />
          ))}
        </ChipRow>
        {meals.length > 0 ? (
          <ChipRow>
            <Chip label="Any meal" pressed={meal === null} onPress={() => setMeal(null)} />
            {meals.map((m) => (
              <Chip key={m} label={m} pressed={m === meal} onPress={() => setMeal(m)} />
            ))}
          </ChipRow>
        ) : null}
        {!query ? (
          <Text variant="sub" tone="text2">
            Type at least two letters.
          </Text>
        ) : groups.length === 0 ? (
          <EmptyState title={`No ${query} at ${scope}.`} body="Try a different word, hall or meal." />
        ) : (
          groups.map((g) => (
            <View key={g.hall}>
              <SectionHeader title={g.hall} />
              <Card>
                {g.rows.map((r, i) => (
                  <View
                    key={`${r.meal}|${r.station}`}
                    accessible
                    accessibilityLabel={`${r.meal}, ${r.station}: ${r.items.join(", ")}`}
                    style={{
                      padding: spacing.lg,
                      borderBottomWidth: i === g.rows.length - 1 && !g.capped ? 0 : 0.5,
                      borderBottomColor: c.separator,
                    }}
                  >
                    <Text variant="caption" tone="text2">
                      {`${r.meal} · ${r.station}`}
                    </Text>
                    <Text variant="body">{r.items.join(", ")}</Text>
                  </View>
                ))}
                {g.capped ? (
                  <Text variant="sub" tone="text2" style={{ padding: spacing.lg }}>
                    More at this hall. Type more to narrow it down.
                  </Text>
                ) : null}
              </Card>
            </View>
          ))
        )}
      </ScreenState>
    </RefreshPage>
  );
}
