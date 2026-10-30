// Is a Testudo restriction sentence (a course's "Restriction" line or a section's note) a limit
// to a special program (Science in the Evening, Scholars, Honors, an LLP, an off-campus site)?
// Plain major, department, college or class-standing limits are not: the schedule builder only
// warns about programs a student might not be in, never blocks (tests: test/program-restriction.test.ts).
//
// Browser-safe: pure string work.

export type ProgramRestriction = {
  /** Plain program name, or null when the text is a program limit but no name could be pulled out. */
  program: string | null;
  /** Testudo's sentence (null when the limit came only from the section number). */
  text: string | null;
};

/** Specific programs first: the first match wins. */
const PROGRAMS: [name: string, pattern: RegExp][] = [
  ["Science in the Evening", /science in the evening|\bSIE\b/i],
  ["Freshman Connection", /freshman connection/i],
  ["Universities at Shady Grove", /universities at shady grove/i],
  ["QUEST", /\bquest\b/i],
  ["Gemstone", /\bgemstone\b/i],
  ["FIRE", /first-year innovation (&|and) research|\(FIRE\)/i],
  ["ACES", /\bACES\b/],
  ["College Park Scholars", /college park scholars/i],
  ["Design Cultures & Creativity", /design cultures (&|and) creativity/i],
  ["Integrated Life Sciences", /integrated life sciences/i],
  ["Honors Humanities", /honors humanities/i],
  ["University Honors", /university honors/i],
];

/** A living-learning program's own name: "Virtus Living and Learning Community", "Flexus Living-Learning Program". */
const LLP = /((?:[A-Z][\w'’]*\s+(?:&\s+)?)+)([Ll]iving[-\s/]*(?:and[-\s/]*)?[Ll]earning\s+(?:[Cc]ommunity|[Pp]rogram))/;
/** "Honors College" limits not covered above (a college name followed by "Honors College" is a program). */
const HONORS_COLLEGE = /\bhonors college\b/i;
/** Verbs that introduce a program the student joined; a bare "must be in the X program" is usually a major. */
const JOINED = /\b(?:matriculated into|enrolled in|admitted to|participants? in)\s+(?:the\s+)?([^;.]*?\b(?:program|community)\b)/i;
const NOT_A_PROGRAM_NAME = /\b(?:master|doctor|ph\.?d|graduate|major|minor|certificate)\b/i;

const BY_SECTION: [pattern: RegExp, name: string][] = [
  [/^SE[SF]/i, "Science in the Evening"],
  [/^FC/i, "Freshman Connection"],
  [/^ESG/i, "Universities at Shady Grove"],
];

export function programRestriction(text: string | null, sectionId?: string): ProgramRestriction | null {
  const t = text?.replace(/\s+/g, " ").trim() || null;
  if (t) {
    for (const [name, pattern] of PROGRAMS) if (pattern.test(t)) return { program: name, text: t };
    const llp = LLP.exec(t);
    if (llp) return { program: `${llp[1]!.trim()} ${llp[2]}`.replace(/\s+/g, " "), text: t };
    if (HONORS_COLLEGE.test(t)) return { program: "Honors College", text: t };
    const joined = JOINED.exec(t);
    if (joined && !NOT_A_PROGRAM_NAME.test(joined[1]!)) return { program: null, text: t };
  }
  const id = sectionId?.trim() ?? "";
  for (const [pattern, name] of BY_SECTION) if (pattern.test(id)) return { program: name, text: t };
  return null;
}
