"use client";

import { useRef, useState } from "react";
import type { DietTag, Station } from "@turboterp/campus-data";
import { Chip, Segmented } from "@/components/Segmented";
import { ExternalIcon } from "@/components/icons";
import { Card, EmptyState, Section, SkeletonCard } from "@/components/ui";
import { resolveMeal, stationDisplayName, type DiningSlice } from "@/lib/dining";
import { FILLER } from "@/lib/status";
import styles from "./dining.module.css";

/** A hall and the names of the meals it serves today (null: its menu couldn't be loaded). */
type Hall = { id: number; name: string; meals: string[] | null };

type Props = {
  date: string;
  halls: Hall[];
  /** The one hall + meal rendered with the page. */
  initial: DiningSlice & { hallId: number };
  preferredMeal: string;
};

const sliceKey = (hallId: number, meal: string) => `${hallId}|${meal}`;

const DIETS: { tag: DietTag; label: string }[] = [
  { tag: "vegetarian", label: "Vegetarian" },
  { tag: "vegan", label: "Vegan" },
  { tag: "halal", label: "Halal-friendly" },
];

// Allergen flags as nutrition.umd.edu labels them ("Contains …").
const ALLERGENS = ["dairy", "gluten", "egg", "soy", "nuts", "sesame", "fish", "shellfish", "pork"];

export function DiningView({ date, halls, initial, preferredMeal }: Props) {
  const [hallId, setHallId] = useState(initial.hallId);
  const [mealName, setMealName] = useState(preferredMeal);
  const [diets, setDiets] = useState<DietTag[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  // Stations per hall + meal, filled on tap; "error" when that request failed.
  const [slices, setSlices] = useState<Record<string, Station[] | "error">>(() =>
    initial.meal ? { [sliceKey(initial.hallId, initial.meal)]: initial.stations } : {},
  );
  const loading = useRef(new Set<string>());

  const hall = halls.find((h) => h.id === hallId)!;
  const meal = resolveMeal(hall.meals, mealName);
  const loaded = meal ? slices[sliceKey(hallId, meal)] : [];

  function show(nextHallId: number, nextMeal: string) {
    setHallId(nextHallId);
    setMealName(nextMeal);
    const m = resolveMeal(halls.find((h) => h.id === nextHallId)!.meals, nextMeal);
    if (!m) return;
    const key = sliceKey(nextHallId, m);
    const have = slices[key];
    if ((have !== undefined && have !== "error") || loading.current.has(key)) return;
    loading.current.add(key);
    const params = new URLSearchParams({ date, hall: String(nextHallId), meal: m });
    fetch(`/api/dining?${params}`)
      .then((res) => (res.ok ? (res.json() as Promise<DiningSlice>) : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((slice) => setSlices((s) => ({ ...s, [key]: slice.stations })))
      .catch(() => setSlices((s) => ({ ...s, [key]: "error" })))
      .finally(() => loading.current.delete(key));
  }

  const stations = (Array.isArray(loaded) ? loaded : [])
    .map((s) => ({
      ...s,
      items: s.items.filter(
        (i) => diets.every((d) => i.diets.includes(d)) && avoid.every((a) => !i.contains.includes(a)),
      ),
    }))
    .filter((s) => s.items.length > 0)
    // Main stations first; sides, salad bar and desserts after (stable sort keeps UMD's order otherwise).
    .sort((a, b) => Number(FILLER.test(a.name)) - Number(FILLER.test(b.name)));

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <>
      <div className={styles.controls}>
        <Segmented
          label="Dining hall"
          options={halls.map((h) => ({ value: h.id, label: h.name }))}
          value={hallId}
          onChange={(id) => show(id, mealName)}
        />
        {hall.meals && hall.meals.length > 0 ? (
          <Segmented
            label="Meal"
            options={hall.meals.map((m) => ({ value: m, label: m }))}
            value={meal ?? ""}
            onChange={(m) => show(hallId, m)}
          />
        ) : null}
        <div className={styles.chips} aria-label="Diet">
          {DIETS.map((d) => (
            <Chip key={d.tag} pressed={diets.includes(d.tag)} onClick={() => setDiets(toggle(diets, d.tag))}>
              {d.label}
            </Chip>
          ))}
        </div>
        <details className={styles.avoid}>
          <summary>
            Avoid allergens{avoid.length ? ` · ${avoid.length}` : ""}
          </summary>
          <div className={styles.chips}>
            {ALLERGENS.map((a) => (
              <Chip key={a} pressed={avoid.includes(a)} onClick={() => setAvoid(toggle(avoid, a))}>
                {`No ${a}`}
              </Chip>
            ))}
          </div>
        </details>
      </div>

      {hall.meals === null || loaded === "error" ? (
        <Card>
          <EmptyState title={`Couldn’t load ${hall.name}`}>UMD Dining didn&apos;t respond. Try again in a few minutes.</EmptyState>
        </Card>
      ) : loaded === undefined ? (
        <SkeletonCard rows={8} />
      ) : stations.length === 0 ? (
        <Card>
          <EmptyState title={meal ? "Nothing matches your filters" : "No menu posted"}>
            {meal ? "Try removing a filter." : "This hall hasn't posted a menu for today."}
          </EmptyState>
        </Card>
      ) : (
        <div className={styles.grid}>
          {stations.map((s) => (
            <Section key={s.name}>
              <Card className={styles.stationCard}>
                <h2 className={styles.station}>{stationDisplayName(s.name)}</h2>
                <ul className={styles.items}>
                  {s.items.map((item, i) => (
                    <li key={`${i}-${item.name}`}>
                      <a
                        className={styles.item}
                        href={item.labelUrl ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${item.name}, nutrition label`}
                      >
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.tags}>
                          {item.diets.includes("vegan") ? (
                            <span className={styles.diet}>Vegan</span>
                          ) : item.diets.includes("vegetarian") ? (
                            <span className={styles.diet}>Vegetarian</span>
                          ) : null}
                          {item.diets.includes("halal") ? <span className={styles.diet}>Halal</span> : null}
                          {item.contains.length ? (
                            <span className={styles.contains}>Contains {item.contains.join(", ")}</span>
                          ) : null}
                        </span>
                        <ExternalIcon className={styles.ext} />
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            </Section>
          ))}
        </div>
      )}
    </>
  );
}
