"use client";

// Loads the Advisor's static data (built by scripts/advisor-data.mts) once per page view and
// keeps it in memory: the plan catalog up front, course details and grade files one department
// at a time.

import { decodeCatalogFile } from "@turboterp/plan/catalog-file";
import type { PlanCatalog } from "@turboterp/plan/catalog";
import { decodeDepartment, type CourseGrades } from "@turboterp/ratings";
import { useEffect, useState } from "react";
import { decodeCourseDetails, type CourseDetails } from "@/lib/advisor/course-details";

type Index = { v: number; term: string; terms?: string[]; catalog: string; details: string; grades: string | null };

export type CatalogState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; catalog: PlanCatalog; term: string; terms: string[]; list: { id: string; title: string; credits: number; genEd: string[] }[] };

const BASE = "/data/advisor/";
let indexPromise: Promise<Index | null> | null = null;

function loadIndex(): Promise<Index | null> {
  indexPromise ??= fetch(`${BASE}index.json`, { cache: "no-cache" })
    .then((r) => (r.ok ? (r.json() as Promise<Index>) : null))
    .catch(() => null);
  return indexPromise;
}

let catalogPromise: Promise<CatalogState> | null = null;

function loadCatalog(): Promise<CatalogState> {
  catalogPromise ??= (async (): Promise<CatalogState> => {
    const index = await loadIndex();
    if (!index) return { status: "missing" };
    const res = await fetch(BASE + index.catalog);
    if (!res.ok) return { status: "missing" };
    const { catalog, term } = decodeCatalogFile(await res.json());
    const list = [...catalog.values()].map((c) => ({ id: c.id, title: c.title, credits: c.credits.min, genEd: c.genEd }));
    return { status: "ready", catalog, term, terms: index.terms ?? [term], list };
  })().catch(() => ({ status: "missing" }) as const);
  return catalogPromise;
}

export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>({ status: "loading" });
  useEffect(() => {
    let live = true;
    loadCatalog().then((s) => live && setState(s));
    return () => {
      live = false;
    };
  }, []);
  return state;
}

const department = (id: string) => id.replace(/\d.*$/, "");
const detailFiles = new Map<string, Promise<Record<string, CourseDetails>>>();
const gradeFiles = new Map<string, Promise<Record<string, CourseGrades>>>();

export async function loadCourseDetails(id: string): Promise<CourseDetails | null> {
  const index = await loadIndex();
  if (!index) return null;
  const dept = department(id);
  if (!detailFiles.has(dept)) {
    detailFiles.set(
      dept,
      fetch(`${BASE}${index.details}${dept}.json`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => (j ? decodeCourseDetails(j) : {}))
        .catch(() => ({})),
    );
  }
  return (await detailFiles.get(dept)!)[id] ?? null;
}

/** Course-wide grades, or null when PlanetTerp has no data (or no grade files were built). */
export async function loadCourseGrades(id: string): Promise<CourseGrades | null> {
  const index = await loadIndex();
  if (!index?.grades) return null;
  const dept = department(id);
  if (!gradeFiles.has(dept)) {
    gradeFiles.set(
      dept,
      fetch(new URL(`${index.grades}${dept}.json`, new URL(BASE, location.href)).href)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => (j ? decodeDepartment(j) : {}))
        .catch(() => ({})),
    );
  }
  return (await gradeFiles.get(dept)!)[id] ?? null;
}
