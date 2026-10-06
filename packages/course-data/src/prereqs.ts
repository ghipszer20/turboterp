// Turns Testudo prerequisite text into a requirement tree the audit can check.

export type Requirement =
  | { kind: "course"; course: string; minGrade?: string; concurrentOk?: boolean }
  | { kind: "all"; of: Requirement[] }
  | { kind: "any"; of: Requirement[] }
  /** Something a student confirms themselves: permission, placement, program, … */
  | { kind: "manual"; text: string };

// A grade requirement in any of its Testudo phrasings. Case-sensitive on the
// letter so the article "a" is never read as the grade A. Group 1 is the grade;
// the whole match (including "or higher/better") is removed from the clause.
const MIN_GRADE = new RegExp(
  "(?:(?:[Aa] )?[Mm]inimum (?:[Gg]rade )?(?:of )?(?:an? )?" +
    "|(?:[Aa] )?[Gg]rades? of (?:an? )?" +
    "|(?:completed )?with (?:an? )?(?:grade of )?" +
    "|(?:must )?(?:receive|earn(?:ed)?) an? )" +
    "([A-D][+-]?)(?![A-Za-z0-9])( or (?:[Hh]igher|[Bb]etter))?",
  "g",
);

type Token =
  | { type: "course"; value: string }
  | { type: "manual"; text: string }
  | { type: "and" | "or" | "comma" | "open" | "close" | "one" | "oneof" | "semi" };

// Case-sensitive on purpose: department codes are uppercase, so "than 300"
// never reads as a course. Connectors are matched in either case.
const TOKEN =
  /\b([A-Z]{4})\s?(\d{3}[A-Z]?)\b|\b([Aa][Nn][Dd]|[Oo][Rr])\b|(,)|([([])|([)\]])|\b((?:1|[Oo]ne)\s+(?:courses?\b|of the following))|(;)|(\/)|\b(\d{3}[A-Z]?)\b(?![-\w])(?!\s+(?:hours|credits|units|words|points))/g;

/** `tail`: a manual alternative appended to the end of the clause's list. */
function tokenize(text: string, tail?: string): Token[] {
  const raw: Token[] = [];
  for (const m of text.matchAll(TOKEN)) {
    const prev = raw.at(-1);
    const before = raw.at(-2);
    if (m[1]) raw.push({ type: "course", value: `${m[1].toUpperCase()}${m[2]}` });
    else if (m[4]) raw.push({ type: "comma" });
    else if (m[5]) raw.push({ type: "open" });
    else if (m[6]) raw.push({ type: "close" });
    else if (m[7]) raw.push({ type: /following/i.test(m[7]) ? "oneof" : "one" });
    else if (m[8]) raw.push({ type: "semi" });
    else if (m[9]) {
      // "CHEM131/271", "ENAE202/ENME202": a slash between courses is "or".
      if (prev?.type === "course") raw.push({ type: "or" });
    } else if (m[10]) {
      // "BSCI 331 and 332", "EPIB610, 611": a bare number after a course is in its department.
      if (prev && ["or", "and", "comma"].includes(prev.type) && before?.type === "course") {
        raw.push({ type: "course", value: `${before.value.slice(0, 4)}${m[10]}` });
      }
    } else raw.push({ type: m[3]!.toLowerCase() as "and" | "or" });
  }
  if (tail) raw.push({ type: "or" }, { type: "manual", text: tail });

  // "A, B, or C": a list's commas take the connector that ends the list at
  // the same nesting level. With no connector, commas mean "and", except in a
  // "1 course from (…)" list, where they mean "or".
  const out: Token[] = [];
  const groupDefaults: ("and" | "or")[] = ["and"];
  let pickOne = false;
  raw.forEach((t, i) => {
    if (t.type === "one") {
      pickOne = true;
      return;
    }
    if (t.type === "oneof") {
      // "one of the following: A, B, C": the rest of the clause is one choice list.
      if (raw[i + 1]?.type === "open") pickOne = true;
      else {
        out.push({ type: "open" });
        groupDefaults.push("or");
      }
      return;
    }
    if (t.type === "open") {
      groupDefaults.push(pickOne ? "or" : "and");
      pickOne = false;
    } else if (t.type === "close" && groupDefaults.length > 1) {
      groupDefaults.pop();
    }
    if (t.type !== "comma") {
      out.push(t);
      return;
    }
    const next = raw[i + 1];
    if (next?.type === "and" || next?.type === "or") return; // Oxford comma
    let depth = 0;
    for (const x of raw.slice(i + 1)) {
      if (x.type === "open") depth++;
      else if (x.type === "close" && depth-- === 0) break;
      else if (depth === 0 && (x.type === "and" || x.type === "or")) {
        out.push({ type: x.type });
        return;
      }
    }
    out.push({ type: groupDefaults.at(-1)! });
  });
  return out;
}

/** Recursive descent: or-expression of and-expressions of courses or (groups). */
function parseExpression(tokens: Token[], leaf: (course: string) => Requirement): Requirement | null {
  let pos = 0;
  const combine = (kind: "all" | "any", parts: Requirement[]): Requirement | null =>
    parts.length === 0 ? null : parts.length === 1 ? parts[0]! : { kind, of: parts };

  function atom(): Requirement | null {
    const t = tokens[pos];
    if (!t) return null;
    if (t.type === "course") {
      pos++;
      return leaf(t.value);
    }
    if (t.type === "manual") {
      pos++;
      return { kind: "manual", text: t.text };
    }
    if (t.type === "open") {
      pos++;
      const inner = semiExpr();
      if (tokens[pos]?.type === "close") pos++;
      return inner;
    }
    return null;
  }
  /** "X; and Y; or Z" inside parentheses: lowest precedence, "and" tighter than "or". */
  function semiExpr(): Requirement | null {
    const groups: Requirement[][] = [[]];
    for (;;) {
      const a = orExpr();
      if (a) groups.at(-1)!.push(a);
      if (tokens[pos]?.type !== "semi") break;
      pos++;
      const connector = tokens[pos]?.type;
      if (connector === "and" || connector === "or") pos++;
      if (connector === "or" && groups.at(-1)!.length > 0) groups.push([]);
    }
    return combine("any", groups.map((g) => combine("all", g)).filter((x): x is Requirement => x !== null));
  }
  function andExpr(): Requirement | null {
    const parts: Requirement[] = [];
    for (;;) {
      const a = atom();
      if (a) parts.push(a);
      if (tokens[pos]?.type === "and") pos++;
      else if (!a) break;
      else if (tokens[pos]?.type !== "course" && tokens[pos]?.type !== "open") break;
    }
    return combine("all", parts);
  }
  function orExpr(): Requirement | null {
    const parts: Requirement[] = [];
    for (;;) {
      const a = andExpr();
      if (a) parts.push(a);
      if (tokens[pos]?.type === "or") pos++;
      else break;
    }
    return combine("any", parts);
  }

  return semiExpr();
}

/** Split at separators that sit outside parentheses and brackets. */
function splitTopLevel(text: string, isSeparator: (text: string, i: number) => number): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (c === "(" || c === "[") depth++;
    else if ((c === ")" || c === "]") && depth > 0) depth--;
    else if (depth === 0) {
      const len = isSeparator(text, i);
      if (len > 0) {
        parts.push(text.slice(start, i));
        start = i + len;
        i += len - 1;
      }
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** A period that ends a sentence: followed by whitespace and a capital letter (not "2.0"). */
const sentenceEnd = (t: string, i: number) => (t[i] === "." ? (/^\.\s+(?=[A-Z])/.exec(t.slice(i))?.[0].length ?? 0) : 0);
const semicolon = (t: string, i: number) => (t[i] === ";" ? 1 : 0);

const clean = (s: string) => s.replace(/\s+/g, " ").replace(/[\s.;,]+$/, "").trim();

/** One clause: a course expression, or a manual requirement if it names no course. */
const CONCURRENT = /concurrent(ly)? enroll/i;

// Clauses that mention a course code but aren't about having taken it.
const MANUAL_WITH_COURSE = /\beligibility\b|\bplacement\b/i;

// "… MATH340 and permission of …": a trailing non-course requirement inside a clause.
const TRAILING_MANUAL =
  /\s+(and|or)\s+((?:permission|must\b|familiarity|approval|junior|senior|sophomore|students?\b)[\s\S]*|(?:other\s+\w+\s+)?(?:equivalent|comparable)(?:\s+\w+){0,2})[\s.]*$/i;

// A waiver offers a way around the prerequisite; its course codes are not requirements.
const WAIVER =
  /\bstudents? who (?:have taken|do not meet)\b[\s\S]*\bmay (?:contact|request)\b|\bcomparable (?:content|experience)\b/i;

// "(not to include MATH461, …)": courses named only to be excluded.
const EXCLUSION = /\((?:not|excluding|except)\b[^)]*\)/gi;

const ONE_OF_FOLLOWING = /\bone of the following\b/i;
const hasCourse = (tokens: Token[]) => tokens.some((t) => t.type === "course");

function parseClause(text: string): Requirement | null {
  const trailing = TRAILING_MANUAL.exec(text);
  const useTrailing =
    trailing !== null &&
    hasCourse(tokenize(text.slice(0, trailing.index))) &&
    !(WAIVER.test(text) && /^students?\b/i.test(trailing[2]!));
  if (!useTrailing && WAIVER.test(text)) {
    const rest = clean(text);
    return rest ? { kind: "manual", text: rest } : null;
  }
  if (useTrailing) {
    const headText = text.slice(0, trailing.index);
    const tail = clean(trailing[2]!);
    const isOr = trailing[1]!.toLowerCase() === "or";
    // "…, and one of the following: A, B, or equivalent": the alternative joins the list.
    if (isOr && tail && ONE_OF_FOLLOWING.test(headText)) return parseBody(headText, tail);
    return combine(isOr ? "any" : "all", parseClause(headText), tail ? { kind: "manual", text: tail } : null);
  }
  if (MANUAL_WITH_COURSE.test(text)) {
    const rest = clean(text);
    return rest ? { kind: "manual", text: rest } : null;
  }
  return parseBody(text);
}

function parseBody(text: string, tail?: string): Requirement | null {
  const stripped = text.replace(EXCLUSION, " ");
  const grade = [...stripped.matchAll(MIN_GRADE)][0]?.[1];
  const body = stripped.replace(MIN_GRADE, " ");
  const concurrent = CONCURRENT.test(text);
  const parsed = hasCourse(tokenize(body))
    ? parseExpression(tokenize(body, tail), (course) => ({
        kind: "course",
        course,
        ...(grade ? { minGrade: grade } : {}),
        ...(concurrent ? { concurrentOk: true } : {}),
      }))
    : null;
  if (parsed) return parsed;
  const rest = clean(text);
  return rest ? { kind: "manual", text: rest } : null;
}

const LEADING_CONNECTOR = /^\s*(and\/or|and|or)\b\s*/i;

const combine = (kind: "all" | "any", left: Requirement | null, right: Requirement | null): Requirement | null => {
  if (!left) return right;
  if (!right) return left;
  return { kind, of: [left, right] };
};

export function parsePrerequisite(text: string | null): Requirement | null {
  if (!text) return null;
  // Sentences: "… . Or must be in …" is an alternative to everything before
  // it; "… . And …" or a sentence with no connector adds to it.
  let result: Requirement | null = null;
  for (const sentence of splitTopLevel(text, sentenceEnd)) {
    const m = /^(or|and)\b\s*/i.exec(sentence);
    const body = sentence.slice(m?.[0].length ?? 0);
    const joined = parseSemicolonClauses(body);
    // A waiver sentence is an alternative even with no connector.
    const waiver = !m && WAIVER.test(body) && splitTopLevel(body, semicolon).length === 1;
    result = combine(m?.[1]?.toLowerCase() === "or" || waiver ? "any" : "all", result, joined);
  }
  return result;
}

function parseSemicolonClauses(text: string): Requirement | null {
  // Semicolon clauses: "X; or Y; and Z". "and" binds tighter than "or";
  // "and/or" reads as "or"; no connector reads as "and".
  const groups: Requirement[][] = [[]];
  const segments = splitTopLevel(text, semicolon);
  // After "one of the following: A and B; C and D; or E", clauses with no
  // connector of their own take the list's final connector, "or".
  const listDefault = ONE_OF_FOLLOWING.test(segments[0]!) ? "or" : "and";
  segments.forEach((raw, i) => {
    const bare = raw.replace(LEADING_CONNECTOR, "");
    const fallback = WAIVER.test(bare) ? "or" : listDefault;
    const connector = i === 0 ? "and" : (LEADING_CONNECTOR.exec(raw)?.[1]?.toLowerCase() ?? fallback);
    const clause = parseClause(bare);
    if (!clause) return;
    if (connector !== "and" && groups.at(-1)!.length > 0) groups.push([]);
    groups.at(-1)!.push(clause);
  });

  const terms = groups
    .filter((g) => g.length > 0)
    .map((g): Requirement => (g.length === 1 ? g[0]! : { kind: "all", of: g }));
  if (terms.length === 0) return null;
  return terms.length === 1 ? terms[0]! : { kind: "any", of: terms };
}

// ---- checking ----

export type CheckResult = "met" | "unmet" | "confirm";

/** What the student has done with a course: finished (with a grade) or taking it now. */
export type CourseRecord = { grade?: string; concurrent?: boolean };

// UMD letter grades, lowest to highest.
const GRADE_ORDER = ["F", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
const gradeRank = (g: string) => GRADE_ORDER.indexOf(g.trim().toUpperCase());

export function checkRequirement(req: Requirement, history: Record<string, CourseRecord>): CheckResult {
  if (req.kind === "course") {
    const record = history[req.course];
    if (!record) return "unmet";
    if (record.concurrent) return req.concurrentOk ? "met" : "unmet";
    if (req.minGrade && record.grade && gradeRank(record.grade) < gradeRank(req.minGrade)) return "unmet";
    return "met";
  }
  if (req.kind === "manual") return "confirm";
  const results = req.of.map((r) => checkRequirement(r, history));
  if (req.kind === "all") {
    if (results.includes("unmet")) return "unmet";
    return results.includes("confirm") ? "confirm" : "met";
  }
  if (results.includes("met")) return "met";
  return results.includes("confirm") ? "confirm" : "unmet";
}
