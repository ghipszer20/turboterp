// Turns the engine's Analysis into what the Audit screen renders (ported from
// apps/web/app/advisor/AuditView.tsx): per program, requirement rows with a met/needed status,
// "Still needed" lines, open slots, the program GPA row and the catalog citation. Pure (no React
// Native), so it is unit-tested in Node.
import type { Analysis } from "@turboterp/app-core/analysis";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";
import { blockedNotice } from "@turboterp/app-core/programs";
import { metText, REQ_STATUS_LABEL, type DisplayStatus } from "@turboterp/app-core/req-status";
import type { GatewayCourseStatus, GatewayOverallStatus, GatewayResult, RequirementResult } from "@turboterp/audit";
import type { MilestoneTiming } from "@turboterp/tracks";
import type { Status } from "../ui/theme";

/** The app's three-color scale for a requirement: met, partly or in progress, still needed. */
export function toneOf(status: DisplayStatus): Status {
  return status === "satisfied" ? "open" : status === "missing" ? "closed" : "soon";
}

export type ReqRow = {
  kind: "req";
  id: string;
  name: string;
  statusLabel: string;
  tone: Status;
  /** Courses counted toward it. */
  counted: string[];
  /** Grade notes: courses below the minimum grade, the minimum-GPA check. */
  notes: string[];
  gap: { text: string; suggestions: string[]; note: string | null } | null;
};
export type SlotRow = {
  kind: "slot";
  /** `${programId}/${slotId}`, the key plan-state's toggle-slot expects. */
  key: string;
  name: string;
  credits: number | null;
  note: string | null;
  confirmed: boolean;
  statusLabel: string;
};
export type AuditRow = ReqRow | SlotRow;

export type ProgramSection = {
  id: string;
  name: string;
  unverified: boolean;
  summary: string;
  citation: string | null;
  rows: AuditRow[];
};

type RequirementEntry = Analysis["audits"][number]["requirements"][number];

function gradeNotes(result: RequirementResult): string[] {
  const notes = (result.belowMinimum ?? []).map((b) => `${b.course} (${b.grade}) doesn't count: this requirement needs ${b.minGrade} or better.`);
  if (result.gpa)
    notes.push(
      `GPA in these courses: ${result.gpa.value.toFixed(2)} (needs ${result.gpa.min.toFixed(1)} or higher).${
        result.gpa.atRisk ? " Below the minimum so far: the courses you still have planned need to raise it." : ""
      }`,
    );
  return notes;
}

function reqRow({ requirement, result, display, gap }: RequirementEntry): ReqRow {
  return {
    kind: "req",
    id: requirement.id,
    name: requirement.name,
    statusLabel: REQ_STATUS_LABEL[display],
    tone: toneOf(display),
    counted: result.assigned,
    notes: gradeNotes(result),
    gap: gap ? { text: `Still needed: ${gap.need}`, suggestions: gap.suggestions, note: gap.note ?? null } : null,
  };
}

function citationOf(p: { catalogYear?: string; source?: string }): string | null {
  const parts = [p.catalogYear ? `Catalog ${p.catalogYear.replace("-", "–")}` : null, p.source ?? null].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function buildPrograms(analysis: Analysis, plan: Pick<AdvisorPlan, "programs">): ProgramSection[] {
  return analysis.audits.map((audit) => {
    const rows: AuditRow[] = audit.requirements.map((entry): AuditRow => {
      const r = entry.requirement;
      if (r.kind !== "openSlot") return reqRow(entry);
      const confirmed = entry.result.status === "satisfied";
      return {
        kind: "slot",
        key: `${audit.program.id}/${r.id}`,
        name: r.name,
        credits: r.credits ?? null,
        note: r.note ?? null,
        confirmed,
        statusLabel: confirmed ? "Confirmed" : "Confirm with your advisor",
      };
    });
    if (audit.gpa) {
      const status = audit.gpa.status;
      rows.push({
        kind: "req",
        id: audit.gpa.id,
        name: audit.gpa.name,
        statusLabel: REQ_STATUS_LABEL[status],
        tone: toneOf(status),
        counted: [],
        notes: gradeNotes(audit.gpa),
        gap: null,
      });
    }
    return {
      id: audit.program.id,
      name: audit.program.name,
      unverified: !audit.program.verified,
      summary: blockedNotice(audit.program.id, plan.programs) ?? metText(audit.satisfied, audit.total, audit.inProgress),
      citation: citationOf(audit.program),
      rows,
    };
  });
}

export const GATEWAY_COURSE_LABEL: Record<GatewayCourseStatus, string> = {
  met: "Met",
  "below-minimum": "Below the minimum grade",
  planned: "Planned",
  missing: "Not planned",
};
export const GATEWAY_TONE: Record<GatewayCourseStatus, Status> = { met: "open", planned: "soon", missing: "closed", "below-minimum": "closed" };
export const GPA_LABEL: Record<GatewayResult["gpa"], string> = { met: "Meets the minimum", below: "Below the minimum", unknown: "Not entered" };
export const OVERALL_LABEL: Record<GatewayOverallStatus, string> = {
  eligible: "Eligible to apply to the CS major",
  "not-yet": "Not eligible yet",
  ineligible: "Not eligible as your record stands",
};
export const OVERALL_TONE: Record<GatewayOverallStatus, Status> = { eligible: "open", "not-yet": "soon", ineligible: "closed" };

export type TrackSection = {
  id: string;
  name: string;
  unverified: boolean;
  summary: string | null;
  rows: ReqRow[];
  confirmYourself: string | null;
  scienceGpa: string[];
  milestones: { label: string; items: { id: string; when: string; name: string; detail: string }[] }[];
  disclaimer: string;
  noCourses: string | null;
};

const BCPM = [
  ["biology", "Biology"],
  ["chemistry", "Chemistry"],
  ["physics", "Physics"],
  ["math", "Math"],
] as const;

export function buildTracks(analysis: Analysis, plan: Pick<AdvisorPlan, "terms">, showsScienceGpa: (track: Analysis["tracks"][number]["track"]) => boolean): TrackSection[] {
  const termOrder = plan.terms.map((t) => t.name);
  const sg = analysis.scienceGpa;
  return analysis.tracks.map(({ track, requirements, satisfied, inProgress, milestones }) => {
    const manual = track.categories.filter((c) => !c.requirement);
    const sci = showsScienceGpa(track) && sg.gpa !== null;
    return {
      id: track.id,
      name: track.name,
      unverified: !track.verified,
      summary: requirements.length ? metText(satisfied, requirements.length, inProgress) : null,
      rows: requirements.map(reqRow),
      confirmYourself: manual.length ? `Also confirm yourself: ${manual.map((c) => c.name ?? c.source).join(", ")}.` : null,
      scienceGpa: sci
        ? [
            `Science GPA (BCPM): ${sg.gpa!.toFixed(2)} (${sg.credits} credits)`,
            BCPM.filter(([k]) => sg.byCategory[k].gpa !== null)
              .map(([k, label]) => `${label} ${sg.byCategory[k].gpa!.toFixed(2)}`)
              .join(" · "),
          ].filter(Boolean)
        : [],
      milestones: milestoneBuckets(milestones, termOrder).map((b) => ({
        label: b.label,
        items: b.items.map((m) => ({ id: m.milestone.id, when: `${m.monthName} ${m.year}`, name: m.milestone.name, detail: m.milestone.detail })),
      })),
      disclaimer: track.disclaimer,
      noCourses: requirements.length ? null : `No required UMD courses -- ${track.schools} weigh GPA, admission tests and the rest of the application.`,
    };
  });
}

/** A track's milestones on the plan's own timeline: one bucket per plan term with a milestone (in the
 * plan's order), then any after the last term, with the ones in an unplanned season first. */
export function milestoneBuckets(milestones: MilestoneTiming[], termOrder: string[]): { label: string; items: MilestoneTiming[] }[] {
  const byTerm = new Map<string, MilestoneTiming[]>();
  const other: MilestoneTiming[] = [];
  const after: MilestoneTiming[] = [];
  for (const m of milestones) {
    if (m.term) byTerm.set(m.term, [...(byTerm.get(m.term) ?? []), m]);
    else if (m.afterLast) after.push(m);
    else other.push(m);
  }
  const buckets = termOrder.filter((name) => byTerm.has(name)).map((name) => ({ label: name, items: byTerm.get(name)! }));
  if (other.length) buckets.unshift({ label: "Not on a planned term", items: other.sort((a, b) => a.year - b.year) });
  if (after.length) buckets.push({ label: "After your last planned term", items: after.sort((a, b) => a.year - b.year) });
  return buckets;
}

export type AuditViewModel = { programs: ProgramSection[] };

export function buildAuditView(analysis: Analysis, plan: Pick<AdvisorPlan, "programs">): AuditViewModel {
  return { programs: buildPrograms(analysis, plan) };
}
