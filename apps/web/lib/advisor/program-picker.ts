// The program picker's search and grouping (SetupView, WhatIfView): pure, over registry metadata
// only, so it scales to every UMD program without loading any requirements.

import { blockedReason, type ProgramEntry, type ProgramKind } from "@turboterp/programs";
import { COLLEGES, collegeName } from "@turboterp/plan/credit-caps";

const KINDS: { kind: ProgramKind; label: string }[] = [
  { kind: "major", label: "Majors" },
  { kind: "minor", label: "Minors" },
  { kind: "certificate", label: "Certificates" },
  { kind: "special", label: "Special programs" },
];

export type KindTab = { kind: ProgramKind; label: string; count: number };
export type PickerGroup = { title: string; options: ProgramEntry[] };

/** The kinds that have at least one program, in a fixed order. */
export function kindTabs(options: ProgramEntry[]): KindTab[] {
  return KINDS.map((k) => ({ ...k, count: options.filter((o) => o.kind === k.kind).length })).filter((k) => k.count > 0);
}

const haystack = (o: ProgramEntry) => [o.name, o.short, o.track, o.id].filter(Boolean).join(" ").toLowerCase();

export type OptionState = { on: boolean; disabled: boolean; blocked?: string };

/**
 * One picker option against the programs already chosen: whether it's on, and whether a chosen
 * major closes it (ProgramMeta.notOpenTo; owner ruling, rulings.md "Minors"). A blocked option
 * can't be added, but one that is already chosen stays removable.
 */
export function optionState(option: ProgramEntry, selected: readonly string[]): OptionState {
  const on = selected.includes(option.id);
  const blocked = blockedReason(option, selected);
  return blocked === undefined ? { on, disabled: false } : { on, disabled: !on, blocked };
}

/**
 * Without a search: the chosen kind, grouped by college. With one: every kind, grouped by kind,
 * keeping programs whose name, short name, track or id contains every word of the search.
 */
export function pickerGroups(options: ProgramEntry[], { kind, query }: { kind: ProgramKind; query: string }): PickerGroup[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length) {
    const hits = options.filter((o) => words.every((w) => haystack(o).includes(w)));
    return KINDS.map((k) => ({ title: k.label, options: hits.filter((o) => o.kind === k.kind) })).filter((g) => g.options.length > 0);
  }
  const ofKind = options.filter((o) => o.kind === kind);
  return COLLEGES.map((c) => ({ title: collegeName(c.code), options: ofKind.filter((o) => o.college === c.code) })).filter((g) => g.options.length > 0);
}
