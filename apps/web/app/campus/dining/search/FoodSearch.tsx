"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Chip } from "@/components/Segmented";
import { Card, EmptyState, SearchField } from "@/components/ui";
import { groupSearchHits, parseDiningQuery, type SearchMatch } from "@/lib/dining";
import styles from "./FoodSearch.module.css";

const MAX_GROUPS = 4;
const ITEMS_PER_GROUP = 6;

type Hall = { id: number; name: string };
type State = { key: string; status: "done"; results: SearchMatch[] } | { key: string; status: "error" };

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
      .then((d: { results: SearchMatch[] }) => setState({ key, status: "done", results: d.results }))
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) setState({ key, status: "error" });
      });
    return () => ctrl.abort();
  }, [query, key, date, hallId, meal]);

  const current = state && state.key === key ? state : null;
  const scope = `${halls.find((h) => h.id === hallId)?.name ?? "all halls"} ${meal ? meal.toLowerCase() : "today"}`;
  const seeAll = `/campus/dining?${new URLSearchParams({
    q: query ?? "",
    ...(hallId ? { hall: String(hallId) } : {}),
    ...(meal ? { meal } : {}),
  })}`;

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
        <Card>
          <div aria-live="polite">
            {!current ? (
              <EmptyState title="Searching">Looking through today&apos;s menus.</EmptyState>
            ) : current.status === "error" ? (
              <EmptyState title="Couldn’t search">UMD Dining didn&apos;t respond. Try again in a few minutes.</EmptyState>
            ) : current.results.length === 0 ? (
              <EmptyState title={`No ${query} at ${scope}.`}>Try a different word, hall or meal.</EmptyState>
            ) : (
              <>
                {groupSearchHits(current.results)
                  .slice(0, MAX_GROUPS)
                  .map((g) => (
                    <div key={`${g.hall}|${g.meal}|${g.station}`} className={styles.group}>
                      <p className={styles.where}>
                        {g.hall} · {g.meal} · {g.station}
                      </p>
                      <p className={styles.foods}>
                        {g.items.slice(0, ITEMS_PER_GROUP).join(", ")}
                        {g.items.length > ITEMS_PER_GROUP ? ` +${g.items.length - ITEMS_PER_GROUP} more` : ""}
                      </p>
                    </div>
                  ))}
                <Link href={seeAll} className={styles.more}>
                  See all on Dining
                </Link>
              </>
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
