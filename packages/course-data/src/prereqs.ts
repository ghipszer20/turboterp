// Turns Testudo prerequisite text into a requirement tree the audit can check.

export type Requirement =
  | { kind: "course"; course: string; minGrade?: string; concurrentOk?: boolean }
  /** Any course in `dept` numbered `minNumber` or above: "MATH115 or higher", "any 400-level STAT course". */
  | { kind: "dept-level"; dept: string; minNumber: number; minGrade?: string; concurrentOk?: boolean }
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
    "([A-D][+-]?)(?![A-Za-z0-9])( or (?:[Hh]igher|[Bb]etter))?" +
    "|(?<![\\w+-])([A-D][+-]?) or (?:[Hh]igher|[Bb]etter)",
  "g",
);

type Token =
  | { type: "course"; value: string }
  | { type: "level"; dept: string; min: number }
  | { type: "manual"; text: string }
  | { type: "comma"; dflt: "and" | "or" }
  | { type: "and" | "or" | "open" | "close" | "one" | "oneof" | "semi" | "both" | "either" };

// Case-sensitive on purpose: department codes are uppercase, so "than 300"
// never reads as a course. Connectors are matched in either case.
const BASE_TOKEN =
  /\b([A-Z]{4})\s?(\d{3}[A-Z]?)\b(?!\s*\(?or higher\b)|\b([Aa][Nn][Dd]|[Oo][Rr])\b|(,)|([([])|([)\]])|\b((?:1|[Oo]ne)\s+(?:courses?\b|of the following))|(;)|(\/)|\b(\d{3}[A-Z]?)\b(?![-\w])(?!\s+(?:hours|credits|units|words|points))|\b((?:other\s+\w+\s+)?(?:equivalent|comparable)(?:(?![A-Z]{4}\s?\d{3})[^;,()])*)|\b([A-Z]{4})\s?(\d{3})[A-Z]?\s*\(?or higher\b\)?(?:\s+[A-Z]{4}\s+course\b)?|\b(?:any|an?)\s+(\d)00[- ]level\s+([A-Z]{4})\s+courses?\b|\ban?\s+([A-Z]{4})\s+courses?\s+at\s+the\s+(\d)00[- ]level(?:\s+or\s+higher\b)?|\b(both|either)\b/g;

// Free text up to the next separator: no course code, one level of parentheses allowed.
const PROSE = "(?:(?![A-Z]{4}\\s?\\d{3})(?:[^;,()]|\\((?:(?![A-Z]{4}\\s?\\d{3})[^()])*\\)))*";
// Prose that stands for a requirement no course code names. Group 19 of TOKEN; it becomes a manual item.
const PROSE_ITEMS = [
  // "X or a minimum of 60 credits", "or approved prior study in Matlab", "or another course that …"
  "(?<=\\b[Oo]r\\s+)(?:a\\s+minimum\\s+of|(?:an?\\s+)?approved|another|enrolled\\s+in|course\\s+in|other|experience)\\b" + PROSE,
  // Requirements that name no course: "any statistics course", "at least one KNES core class", …
  "\\bany\\s+statistics\\s+course\\b",
  "\\bat\\s+least\\s+one\\s+KNES\\s+core\\s+class\\b",
  "\\btwo\\s+semesters\\s+of\\s+Chemistry\\b",
  "\\btake\\s+2\\s+courses\\s+from\\s+the\\s+STEP\\s+minor\\s+elective\\s+list\\b",
  "\\b(?:must\\s+have\\s+earned\\s+)?a\\s+minimum\\s+of\\s+\\d+\\s+credits\\b",
  "\\bability\\s+to\\s+write\\s+code\\b" + PROSE,
];
const TOKEN = new RegExp(`${BASE_TOKEN.source}|(${PROSE_ITEMS.join("|")})`, "g");

/** `tail`: a manual alternative appended to the end of the clause's list. */
function tokenize(text: string, tail?: string): Token[] {
  const raw: Token[] = [];
  for (const m of text.matchAll(TOKEN)) {
    const prev = raw.at(-1);
    const before = raw.at(-2);
    if (m[1]) raw.push({ type: "course", value: `${m[1].toUpperCase()}${m[2]}` });
    else if (m[4]) raw.push({ type: "comma", dflt: "and" });
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
    } else if (m[11]) raw.push({ type: "manual", text: clean(m[11]) });
    else if (m[12]) raw.push({ type: "level", dept: m[12], min: Number(m[13]) });
    else if (m[14]) raw.push({ type: "level", dept: m[15]!, min: Number(m[14]) * 100 });
    else if (m[16]) raw.push({ type: "level", dept: m[16], min: Number(m[17]) * 100 });
    else if (m[18]) raw.push({ type: m[18].toLowerCase() as "both" | "either" });
    else if (m[19]) raw.push({ type: "manual", text: clean(m[19]) });
    else raw.push({ type: m[3]!.toLowerCase() as "and" | "or" });
  }
  if (tail) raw.push({ type: "or" }, { type: "manual", text: tail });

  // Commas only record their group's default connector ("and", or "or" in a
  // "1 course from (…)" list); parseExpression reads the list's own conjunction.
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
    out.push(t.type === "comma" ? { type: "comma", dflt: groupDefaults.at(-1)! } : t);
  });
  return out;
}

/** The same connector "and"/"or" tightness at every level: "or" binds tighter than "and". */
type Chain = { groups: Requirement[][]; conjs: ("and" | "or")[]; bare: boolean };

const joinReq = (kind: "all" | "any", parts: Requirement[]): Requirement | null =>
  parts.length === 0 ? null : parts.length === 1 ? parts[0]! : { kind, of: parts };

/**
 * Recursive descent. A comma list ("A, B, and C or D") holds items; the item
 * kind follows the list's conjunction. An item is a chain of "and"s over
 * groups of "or"s ("or" binds tighter), and groups of atoms or (parentheses).
 */
function parseExpression(
  tokens: Token[],
  leaf: (course: string) => Requirement,
  levelLeaf: (dept: string, minNumber: number) => Requirement,
): Requirement | null {
  let pos = 0;
  const parenthesized = new WeakSet<Requirement>();

  function atom(): Requirement | null {
    const t = tokens[pos];
    if (!t) return null;
    if (t.type === "course") {
      pos++;
      return leaf(t.value);
    }
    if (t.type === "level") {
      pos++;
      return levelLeaf(t.dept, t.min);
    }
    if (t.type === "manual") {
      pos++;
      return { kind: "manual", text: t.text };
    }
    if (t.type === "open") {
      pos++;
      const inner = semiExpr();
      if (tokens[pos]?.type === "close") pos++;
      if (inner) parenthesized.add(inner);
      return inner;
    }
    // "both A and B" and "either A or B" are one group.
    if (t.type === "both" || t.type === "either") {
      pos++;
      const first = atom();
      const joiner = t.type === "both" ? "and" : "or";
      if (!first || tokens[pos]?.type !== joiner) return first;
      const parts = [first];
      while (tokens[pos]?.type === joiner) {
        pos++;
        const next = atom();
        if (next) parts.push(next);
      }
      return joinReq(t.type === "both" ? "all" : "any", parts);
    }
    return null;
  }
  /** "X; and Y; or Z" inside parentheses: lowest precedence, "and" tighter than "or". */
  function semiExpr(): Requirement | null {
    const groups: Requirement[][] = [[]];
    for (;;) {
      const a = listExpr();
      if (a) groups.at(-1)!.push(a);
      if (tokens[pos]?.type !== "semi") break;
      pos++;
      const connector = tokens[pos]?.type;
      if (connector === "and" || connector === "or") pos++;
      if (connector === "or" && groups.at(-1)!.length > 0) groups.push([]);
    }
    return joinReq("any", groups.map((g) => joinReq("all", g)).filter((x): x is Requirement => x !== null));
  }
  function orGroup(conjs: ("and" | "or")[]): Requirement[] {
    const atoms: Requirement[] = [];
    for (;;) {
      const a = atom();
      if (a) atoms.push(a);
      if (tokens[pos]?.type === "or") {
        conjs.push("or");
        pos++;
      } else break;
    }
    return atoms;
  }
  function chain(): Chain {
    const groups: Requirement[][] = [];
    const conjs: ("and" | "or")[] = [];
    for (;;) {
      const group = orGroup(conjs);
      if (group.length > 0) groups.push(group);
      if (tokens[pos]?.type === "and") {
        conjs.push("and");
        pos++;
      } else if (group.length === 0) break;
      else if (tokens[pos]?.type !== "course" && tokens[pos]?.type !== "level" && tokens[pos]?.type !== "open") break;
    }
    // Parallel pairs: "A and B or (C and D)", where the chain opens with a bare "and" run as long as
    // the parenthesized group, reads (A and B) or (C and D) (PLSC201/271; the catalog writes the same
    // PLSC alternatives as "PLSC110 and PLSC111; or (PLSC112 and PLSC113)").
    const pair = groups[0] ? groups.findIndex((g) => g.length === 2) : -1;
    const paren = pair > 0 ? groups[pair]![1]! : undefined;
    if (
      paren?.kind === "all" &&
      parenthesized.has(paren) &&
      paren.of.length === pair + 1 &&
      groups.slice(0, pair + 1).every((g, i) => (i < pair ? g.length === 1 : true))
    ) {
      const run = groups.slice(0, pair + 1).map((g) => g[0]!);
      groups.splice(0, pair + 1, [{ kind: "all", of: run }, paren]);
    }
    return { groups, conjs, bare: groups.length === 1 && groups[0]!.length === 1 && conjs.length === 0 };
  }
  const groupReq = (g: Requirement[]) => joinReq("any", g)!;
  /** Comma-separated items; the list's conjunction decides whether they are all or any. */
  function listExpr(): Requirement | null {
    const items: Chain[] = [chain()];
    let oxford: "and" | "or" | undefined;
    let dflt: "and" | "or" = "and";
    while (tokens[pos]?.type === "comma") {
      dflt = (tokens[pos] as { dflt: "and" | "or" }).dflt;
      pos++;
      const conj = tokens[pos]?.type;
      if (conj === "and" || conj === "or") {
        oxford = conj; // ", and C" / ", or C"
        pos++;
      }
      items.push(chain());
    }
    const filled = items.filter((it) => it.groups.length > 0);
    if (filled.length === 0) return null;
    // "A, B, and C or D" = all of A, B, (C or D); "A and B, or C" = any of (A and B), C;
    // "A, B or C" with bare codes = any; no final conjunction = all.
    let op: "all" | "any";
    if (items.length === 1) op = "all";
    else if (oxford) op = oxford === "and" ? "all" : "any";
    else {
      const last = items.at(-1)!;
      const firstConj = last.conjs[0];
      const restBare = items.slice(0, -1).every((it) => it.bare);
      if (restBare && firstConj) op = firstConj === "or" ? "any" : "all";
      else if (restBare && !firstConj) op = dflt === "or" ? "any" : "all";
      else op = "all";
    }
    const parts: Requirement[] = [];
    for (const it of filled) {
      if (op === "all") parts.push(...it.groups.map(groupReq));
      else if (it.groups.length === 1) parts.push(...it.groups[0]!);
      else parts.push(joinReq("all", it.groups.map(groupReq))!);
    }
    return joinReq(op, parts);
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
// Not after an initial ("Robert H. Smith") or "e.g."/"i.e."/"ex.".
const ABBREVIATION = /(?:(?<![A-Za-z])[A-Z]|(?<![A-Za-z.])(?:e\.g|i\.e|ex))$/;
const sentenceEnd = (t: string, i: number) =>
  t[i] === "." && !ABBREVIATION.test(t.slice(0, i)) ? (/^\.\s+(?=[A-Z])/.exec(t.slice(i))?.[0].length ?? 0) : 0;
const semicolon = (t: string, i: number) => (t[i] === ";" ? 1 : 0);

const clean = (s: string) => s.replace(/\s+/g, " ").replace(/[\s.;,]+$/, "").trim();

/** One clause: a course expression, or a manual requirement if it names no course. */
const CONCURRENT = /concurrent(ly)? enroll/i;

// Clauses that mention a course code but aren't about having taken it.
const MANUAL_WITH_COURSE = /\beligibility\b|\bplacement\b/i;

// "… MATH340 and permission of …": a trailing non-course requirement inside a clause.
const TRAILING_MANUAL =
  /\s+(and|or)\s+((?:(?:by\s+)?permission|must\b|familiarity|approval|junior|senior|sophomore|students?\b)[\s\S]*|(?:other\s+\w+\s+)?(?:equivalent|comparable)(?:\s+\w+){0,2})[\s.)]*$/i;

// A waiver offers a way around the prerequisite; its course codes are not requirements.
const WAIVER =
  /\bstudents? who (?:have taken|do not meet)\b[\s\S]*\bmay (?:contact|request)\b|\bcomparable (?:content|experience)\b/i;

// "(not to include MATH461, …)": courses named only to be excluded.
const EXCLUSION = /\((?:not|excluding|except)\b[^)]*\)/gi;

const ONE_OF_FOLLOWING = /\bone of the following\b/i;
const hasCourse = (tokens: Token[]) => tokens.some((t) => t.type === "course" || t.type === "level");

const EQUIVALENT = /^(?:other\s+\w+\s+)?(?:equivalent|comparable)/i;

/** Tokens of a clause body (grade phrases and exclusions removed), at parenthesis depth 0. */
function topLevelTokens(text: string): Token[] {
  const out: Token[] = [];
  let depth = 0;
  for (const t of tokenize(text.replace(EXCLUSION, " ").replace(MIN_GRADE, " "))) {
    if (t.type === "open") depth++;
    else if (t.type === "close") depth = Math.max(0, depth - 1);
    else if (depth === 0) out.push(t);
  }
  return out;
}
const isCommaList = (text: string) => topLevelTokens(text).some((t) => t.type === "comma");
const hasTopLevelConnector = (text: string) => topLevelTokens(text).some((t) => t.type === "and" || t.type === "or");

// "2 courses from (…)", "two 400-level MATH courses": there is no count kind, so the clause is a manual item.
const COUNTED = /(?<!take\s)\b(?:2|two)\s+(?:courses\s+from|\d00-level)\b/i;

/** "(…)" around the whole text: dropped. */
function unwrap(text: string): string {
  const t = text.trim();
  if (!t.startsWith("(") || !t.endsWith(")")) return t;
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "(") depth++;
    else if (t[i] === ")" && --depth === 0 && i < t.length - 1) return t;
  }
  return t.slice(1, -1).trim();
}

function parseClause(text: string): Requirement | null {
  if (COUNTED.test(text)) return { kind: "manual", text: clean(unwrap(text)) };
  const trailing = TRAILING_MANUAL.exec(text);
  const useTrailing =
    trailing !== null && hasCourse(tokenize(text.slice(0, trailing.index)));
  if (!useTrailing && WAIVER.test(text)) {
    const rest = clean(text);
    return rest ? { kind: "manual", text: rest } : null;
  }
  if (useTrailing) {
    const headText = text.slice(0, trailing.index);
    let tail = clean(trailing[2]!);
    // A closing parenthesis that belongs to the head is not part of the tail.
    while (tail.endsWith(")") && (tail.match(/\)/g)?.length ?? 0) > (tail.match(/\(/g)?.length ?? 0)) tail = tail.slice(0, -1).trim();
    const isOr = trailing[1]!.toLowerCase() === "or" || WAIVER.test(tail);
    // "…, and one of the following: A, B, or equivalent": the alternative joins the list.
    if (isOr && tail && ONE_OF_FOLLOWING.test(headText)) return parseBody(headText, tail);
    // "A, B, or permission": the tail is the list's last item. "A, B, and C or equivalent":
    // "or" binds tighter, so the alternative belongs to C alone.
    if (isOr && tail && isCommaList(headText) && (!hasTopLevelConnector(headText) || EQUIVALENT.test(tail))) {
      return parseBody(headText, tail);
    }
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
  const grade = [...stripped.matchAll(MIN_GRADE)].map((m) => m[1] ?? m[3])[0];
  const body = stripped.replace(MIN_GRADE, " ");
  const concurrent = CONCURRENT.test(text);
  const extras = { ...(grade ? { minGrade: grade } : {}), ...(concurrent ? { concurrentOk: true } : {}) };
  const parsed = hasCourse(tokenize(body))
    ? parseExpression(
        tokenize(body, tail),
        (course) => ({ kind: "course", course, ...extras }),
        (dept, minNumber) => ({ kind: "dept-level", dept, minNumber, ...extras }),
      )
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

/** A way around everything before it: "or permission of …", "or by permission", "students who … may contact …". */
const WAIVER_CLAUSE = /^(?:by\s+)?(?:permission|approval)\b/i;

// "and math eligibility is based on the Math Placement Test": explains the manual item before it.
const EXPLANATION = /^math eligibility is based on\b/i;

type Piece = { connector: "and" | "or"; req: Requirement; waiver: boolean; explains: boolean; text: string };

/**
 * Joins the pieces of one level (the sentences of a text, or the ";" clauses of a sentence):
 * "or" binds tighter than "and", so "A; and B; or C" is A and (B or C). A waiver is an
 * alternative to everything before it. `flat` keeps one list per kind; otherwise pairs nest.
 */
function assemble(pieces: Piece[], flat: boolean): Requirement | null {
  const join = (kind: "all" | "any", parts: Requirement[]): Requirement | null =>
    flat ? joinReq(kind, parts) : parts.reduce<Requirement | null>((acc, p) => combine(kind, acc, p), null);
  const runs: Requirement[][] = [];
  const fold = () => join("all", runs.map((r) => join("any", r)!));
  for (const p of pieces) {
    const run = runs.at(-1);
    const last = run?.at(-1);
    if (p.explains && last?.kind === "manual") {
      run![run!.length - 1] = { kind: "manual", text: `${last.text}; and ${p.text}` };
    } else if (p.connector === "or" && p.waiver && runs.length > 1) {
      runs.splice(0, runs.length, [fold()!, p.req]);
    } else if (p.connector === "or" && run) run.push(p.req);
    else runs.push([p.req]);
  }
  return fold();
}

export function parsePrerequisite(text: string | null): Requirement | null {
  if (!text) return null;
  // Sentences: "… . Or must be in …" is an alternative to the sentence before it;
  // "… . And …" or a sentence with no connector adds to it. "or" binds tighter than "and".
  const pieces: Piece[] = [];
  for (const sentence of splitTopLevel(text, sentenceEnd)) {
    const m = /^(or|and)\b\s*/i.exec(sentence);
    const body = sentence.slice(m?.[0].length ?? 0);
    const req = parseSemicolonClauses(body);
    if (!req) continue;
    // A waiver sentence is an alternative even with no connector.
    const waiver = !m && WAIVER.test(body) && splitTopLevel(body, semicolon).length === 1;
    const connector = m?.[1]?.toLowerCase() === "or" || waiver ? "or" : "and";
    pieces.push({ connector, req, waiver, explains: EXPLANATION.test(body.trim()), text: clean(body) });
  }
  return assemble(pieces, false);
}

function parseSemicolonClauses(text: string): Requirement | null {
  // Semicolon clauses: "X; or Y; and Z". "or" binds tighter than "and";
  // "and/or" reads as "or"; no connector reads as "and".
  // "TRACK I: … or TRACK 2: …": a track label starts a new clause even without a semicolon.
  const segments = splitTopLevel(text, semicolon).flatMap((s) => s.split(/(?=\s(?:or|and)\s+track\s+\w+\s*:)/i));
  // After "one of the following: A and B; C and D; or E", clauses with no
  // connector of their own take the list's final connector, "or".
  const listDefault = ONE_OF_FOLLOWING.test(segments[0]!) ? "or" : "and";
  const pieces: Piece[] = [];
  segments.forEach((raw, i) => {
    const bare = raw.replace(LEADING_CONNECTOR, "");
    const isWaiver = WAIVER.test(bare) || WAIVER_CLAUSE.test(bare.trim());
    const fallback = WAIVER.test(bare) ? "or" : listDefault;
    const connector = i === 0 ? "and" : (LEADING_CONNECTOR.exec(raw)?.[1]?.toLowerCase() ?? fallback);
    const req = parseClause(bare);
    if (!req) return;
    pieces.push({
      connector: connector === "and" ? "and" : "or",
      req,
      waiver: isWaiver,
      explains: EXPLANATION.test(bare.trim()),
      text: clean(bare),
    });
  });
  return assemble(pieces, true);
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
  if (req.kind === "dept-level") {
    const ok = Object.entries(history).some(([id, record]) => {
      const m = /^([A-Z]{4})(\d{3})/.exec(id);
      if (!m || m[1] !== req.dept || Number(m[2]) < req.minNumber) return false;
      if (record.concurrent) return !!req.concurrentOk;
      return !(req.minGrade && record.grade && gradeRank(record.grade) < gradeRank(req.minGrade));
    });
    return ok ? "met" : "unmet";
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
