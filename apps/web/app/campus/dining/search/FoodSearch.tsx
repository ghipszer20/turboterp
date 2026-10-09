"use client";

import { useEffect, useState } from "react";
import { Chip } from "@/components/Segmented";
import { Card, EmptyState, SearchField } from "@/components/ui";
import { groupSearchByHall, parseDiningQuery, type SearchMatch } from "@/lib/dining";
import { HallResults } from "../HallResults";
import styles from "./FoodSearch.module.css";

type Hall = { id: number; name: string };
type State = { key: string; status: "done"; results: SearchMatch[]; cappedHalls: string[] } | { key: string; status: "error" };

/** Search every dining hall's menu for today, optionally limited to one hall and one meal. */
export function FoodSearch({ date, halls, meals }: { date: string; halls: Hall[]; meals: string[] }) {
  const [term, setTerm] = useState("");
  const [hallId, setHallId] = useState<number | null>(null);
  const [meal, setMeal] = useState<string | null>(null);
  const [state, setState] = useState<State | null>(null);

  const query = parseDiningQuery(term);
  const key = query ? JSON.stringify([query, hallId, meal]) : null;

  useEffect(() => {
    if (!query || !key) return;
    const ctrl = new AbortController();
    const params = new URLSearchParams({ date, q: query });
    if (hallId) params.set("hall", String(hallId));
    if (meal) params.set("meal", meal);
    fetch(`/api/dining/search?${params}`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((d: { results: SearchMatch[]; cappedHalls?: string[] }) => setState({ key, status: "done", results: d.results, cappedHalls: d.cappedHalls ?? [] }))
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) setState({ key, status: "error" });
      });
    return () => ctrl.abort();
  }, [query, key, date, hallId, meal]);

  const current = state && state.key === key ? state : null;
  const scope = `${halls.find((h) => h.id === hallId)?.name ?? "all halls"} ${meal ? meal.toLowerCase() : "today"}`;

  return (
    <div className={styles.wrap}>
      <SearchField placeholder="Search for a food" onSubmit={setTerm} />
      <div className={styles.chips} role="group" aria-label="Dining hall">
        <Chip pressed={hallId === null} onClick={() => setHallId(null)}>
          All halls
        </Chip>
        {halls.map((h) => (
          <Chip key={h.id} pressed={h.id === hallId} onClick={() => setHallId(h.id)}>
            {h.name}
          </Chip>
        ))}
      </div>
      {meals.length > 0 ? (
        <div className={styles.chips} role="group" aria-label="Meal">
          <Chip pressed={meal === null} onClick={() => setMeal(null)}>
            Any meal
          </Chip>
          {meals.map((m) => (
            <Chip key={m} pressed={m === meal} onClick={() => setMeal(m)}>
              {m}
            </Chip>
          ))}
        </div>
      ) : null}
      {query ? (
        <div aria-live="polite">
          {!current ? (
            <Card>
              <EmptyState title="Searching">Looking through today&apos;s menus.</EmptyState>
            </Card>
          ) : current.status === "error" ? (
            <Card>
              <EmptyState title="Couldn’t search">UMD Dining didn&apos;t respond. Try again in a few minutes.</EmptyState>
            </Card>
          ) : current.results.length === 0 ? (
            <Card>
              <EmptyState title={`No ${query} at ${scope}.`}>Try a different word, hall or meal.</EmptyState>
            </Card>
          ) : (
            <HallResults halls={groupSearchByHall(current.results, current.cappedHalls)} />
          )}
        </div>
      ) : null}
    </div>
  );
}
