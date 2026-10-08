# Account Sync and Agreement Records: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development, adapted to PROJECT_MEMORY section 18: Sonnet builders, one per task, at most 2 at once, no reviewer subagents. The main session reviews and merges. Ask the owner before each dispatch unless overtime mode is on.

**Goal:** a signed-in student's 4-year plan, schedule and registration prep follow them across devices; every signed Advisor agreement is kept on the server as a legal record; and this storage becomes the per-user foundation for later features (grade feedback, LLM advisor, seat alerts). All of it must hold up at tens of thousands of daily users on Supabase and Vercel.

**Architecture:** one Supabase table holds each user's documents (one row per user per kind: plan, schedule or registration). The browser reads and writes it directly through Supabase's API, with row-level security, so a save costs no Vercel function. Before downloading, it compares a small revision number, so unchanged documents are never fetched again. Writes wait until the student stops editing (debounced). Agreements go to a second table that only the server can write, through one rate-limited route. One email a day sends the owner that day's agreement records and a usage check. Google sign-in takes most sign-in traffic off the email quota.

**Tech stack:** Next.js 16 (apps/web), @supabase/supabase-js (already used in `lib/auth/client.ts`), Supabase Postgres + RLS + pg_cron (pattern: `supabase/migrations/0003_cron_refresh.sql`), Brevo (`lib/email/send.ts`), Vitest.

## Context

TurboTerp went public on 2026-10-08. Accounts exist, but the plan, saved schedules and the signed agreement live only in the browser's localStorage (`app/advisor/store.ts`, `lib/schedule/saved-store.ts`, `lib/schedule/registration-store.ts`, consent in `lib/advisor/consent.ts`). The three problems:
1. **Lost work:** students lose their plan when they switch devices or clear browser data, and signing in doesn't help.
2. **No legal record:** the only copy of each signed agreement sits in the student's own browser.
3. **No per-user server storage:** every planned personal feature needs it.

## Owner decisions (2026-10-08, this session)

- **Agreement records:** stored in the database (version, time, account or device, keyed hash of the typed name, and the typed name encrypted so the owner can read it: owner follow-up 2026-10-08, migration 0008); **one daily digest email** with a CSV goes to the records address. This replaces the per-signature email from 2026-09-26.
- **Sign-in at scale:** add **"Continue with Google"** next to the email link.
- **Supabase Pro ($25/month from donations)** is fine if a limit gets close. The owner notes that UMD has about 44k students, so the 50k monthly-user cap won't be reached. Database size (500 MB) and downloads (5 GB a month) are the limits that matter, and the design keeps both low.
- **Account deletion:** plans, schedules and email are deleted. The agreement record stays, **unlinked from the account**, and the privacy page says so.
- **Assumption (not asked):** signing out removes the synced copies from that browser, which matters on shared lab computers. The agreement stays on the device.

## Global constraints

- Deleting something important takes two taps: "Are you sure you want to delete ...?" naming what is deleted (rulings, 2026-10-04). Replacing one copy of a plan with another counts as deleting a plan.
- Before collection changes go live, update `lib/legal.ts` privacy text and bump `PRIVACY_VERSION` (legal.md). Every new localStorage key goes in `STORAGE_KEYS` (a test enforces this).
- Secrets only in `.env.local` / Vercel env: `CONSENT_NAME_SECRET`, `RECORDS_EMAIL`, existing `SUPABASE_SERVICE_ROLE_KEY`.
- Migrations are applied only with the owner's go. Deploys are run by the owner from the main checkout.
- Data from the server is untrusted: every downloaded document goes through the existing validators (`parsePlan`, `parsePrep`, the saved-schedule parser) before use.
- UI changes need owner approval with `npm run ui-check` screenshots.
- Verification is local only (no GitHub Actions).

## Scale design (why this holds at tens of thousands of daily users)

| Cost | Design |
|---|---|
| Server work per save | Browser → Supabase directly (no Vercel function). RLS uses `(select auth.uid()) = user_id` (Supabase's fast form). Lookups by primary key `(user_id, kind)`. |
| Downloads (5 GB/month free) | On load and on tab focus (at most once a minute), fetch only `kind, rev` (a few bytes). Download a body only when its `rev` is newer than the local copy's. Saves use `return=minimal`. |
| Database size (500 MB free) | One row per user per kind, overwritten in place (no history). Body capped at 64 KB by a check constraint. A plan is about 5–15 KB. |
| Write volume | Saves wait 3 s after the last change, plus a flush when the tab is hidden. |
| Live connections | No Supabase Realtime (200-connection free cap). Other devices catch up on focus. |
| Email quota (300/day) | Google sign-in. Agreement records go out in one email a day, not one per signature. |
| Abuse | `/api/consent` rate-limited per scrambled IP (existing `email_sends` pattern). Account deletion needs a valid session. |
| Watching it | The daily email reports database size, row counts and accounts against free-tier limits, warning at 70%. |

---

## Task 0 (main session, before any builder): record decisions and next steps

**Files:** `PROJECT_MEMORY.md` §14, `docs/project/roadmap.md` "Known to-dos", `docs/project/rulings.md`, `docs/project/legal.md`; copy this plan to `docs/project/account-sync-plan.md`.
- [ ] Add the owner decisions above to rulings.md ("Accounts and sync") and legal.md (agreement records: database + daily digest, replacing the per-signature email; unlinked after deletion).
- [ ] Add **"Next after account sync"** at the top of roadmap Known to-dos, with a one-line pointer in §14:
  1. **Monitoring:** error reporting (e.g. Sentry free tier or Vercel log drains) and privacy-friendly usage counts (Vercel Web Analytics, cookieless). The privacy page says "No analytics", so the wording must change first.
  2. **Real-student audit check:** with consent, compare about 5 students' official UMD audits with TurboTerp's (the roadmap's "watch ~5 students" step, which never happened).
  3. **Repo history:** the repo is public and old commits contain the owner's name and terpmail; do a history rewrite or start a fresh repo.
  4. **Email volume:** once Google sign-in ships, watch Brevo's 300/day. Move to a paid plan if sign-in links plus reports go past about 200 a day.
- [ ] Commit to `feat/ui-rework` (the working branch).

## Task 1 (builder): database tables, agreement-record route and daily records email

**Branch:** `feat/consent-records`.
**Files:** create `supabase/migrations/0007_user_data.sql`, `lib/consent/record.ts` (pure handler with injected dependencies, following the pattern of `lib/email/plan.ts` `handlePlanEmail`), `app/api/consent/route.ts`, `lib/consent/digest.ts`; modify `lib/email/rate-limit.ts` (add `"consent"` to `SendKind` and `LIMITS`: 10 per hour) and the daily cron job handler (`app/api/cron/[job]`) to call the digest. Tests in `lib/__tests__/` or `lib/consent/__tests__/`.

**Migration (write exactly; the main session reviews; the owner applies):**
```sql
create table if not exists public.user_documents (
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('plan', 'schedule', 'registration')),
  body       jsonb not null check (octet_length(body::text) <= 65536),
  rev        bigint not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);
alter table public.user_documents enable row level security;
create policy user_documents_select on public.user_documents for select using ((select auth.uid()) = user_id);
create policy user_documents_insert on public.user_documents for insert with check ((select auth.uid()) = user_id);
create policy user_documents_update on public.user_documents for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy user_documents_delete on public.user_documents for delete using ((select auth.uid()) = user_id);
-- rev and updated_at are set by the server, not trusted from the client
create or replace function public.user_documents_bump() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then new.rev := 1; else new.rev := old.rev + 1; end if;
  new.updated_at := now();
  return new;
end $$;
create trigger user_documents_bump before insert or update on public.user_documents
  for each row execute function public.user_documents_bump();

create table if not exists public.consent_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  device_id   uuid not null,
  version     text not null,
  accepted_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  name_hash   text not null
);
create index if not exists consent_records_recorded on public.consent_records (recorded_at);
create index if not exists consent_records_device on public.consent_records (device_id, version);
alter table public.consent_records enable row level security; -- no policies: service role only

alter table public.email_sends drop constraint if exists email_sends_kind_check;
alter table public.email_sends add constraint email_sends_kind_check check (kind in ('report', 'plan', 'consent'));

-- Usage check for the daily email (service role only)
create or replace function public.usage_stats() returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'db_bytes', pg_database_size(current_database()),
    'documents', (select count(*) from public.user_documents),
    'consents', (select count(*) from public.consent_records),
    'accounts', (select count(*) from auth.users));
$$;
revoke all on function public.usage_stats() from public, anon, authenticated;
grant execute on function public.usage_stats() to service_role;
```

**Interfaces produced:**
- `POST /api/consent` body `{ name: string, version: string, acceptedAt: string, deviceId: string }`, optional `Authorization: Bearer <access token>`. Returns `{ ok: true }` (200), 400 for invalid input, 429 when rate-limited, 503 when not configured or the store fails.
- `handleConsentRecord(request, deps: { getUser, store: ConsentStore, limits: SendStore, secret: string, now: () => Date })`, where `ConsentStore = { link(deviceId, version, userId): Promise<boolean>; insert(row): Promise<void> }`.
- `nameHash(name, secret)` = HMAC-SHA256 hex of the name trimmed, with spaces collapsed and lowercased. A plain SHA of a name can be reversed by guessing; a keyed hash can't.
- `buildConsentDigest(rows, usage, day)` returns `{ subject, text, csv }`.
- `ConsentRecord` in `lib/advisor/consent.ts` gains optional `deviceId: string` and `recorded: boolean`. `parseConsent` accepts both and still accepts old records without them.

**Tests (write first, see them fail):**
- Rejects a version other than `CONSENT_VERSION`, a name under 2 characters, a non-UUID `deviceId`, and `acceptedAt` more than 1 day from `now()`.
- The stored row holds `nameHash`, never the raw name (assert the name string appears nowhere in the stored row).
- Signed in, with an unlinked row for the same device and version: `link` is used, with no duplicate insert. Signed in with nothing to link: insert with `user_id`. Signed out: insert with `user_id: null`.
- Rate limiter returns "limited": 429. Store throws: 503 (fail closed, like `checkAndRecord`).
- Digest: covers the previous UTC day only; the CSV header is `recorded_at,accepted_at,version,account_id,device_id,name_hash`; quotes and commas are escaped; zero records → "No new agreements" (still sent, so the usage check arrives); usage at 70% or more of 500 MB → a "WARNING" line in the subject.
- The daily cron sends the digest to `RECORDS_EMAIL` and skips quietly when it is unset. Check whether `lib/email/send.ts` supports attachments. If it doesn't, add Brevo's `attachment` field (base64), with a test.

**Done:** the package tests, typecheck, lint and build pass; pushed. The owner applies 0007 and sets `CONSENT_NAME_SECRET` and `RECORDS_EMAIL` on Vercel.

## Task 2 (builder, can run alongside Task 1): sync core

**Branch:** `feat/sync-core`.
**Files:** create `apps/web/lib/sync/decide.ts` (pure), `lib/sync/remote.ts` (Supabase calls), `lib/sync/engine.ts` (debounce, revs, conflict), and `lib/sync/meta.ts` (the `turboterp-sync` localStorage key: `{ userId, revs: { plan?: number, schedule?: number, registration?: number } }`). Add the key to `STORAGE_KEYS` in `lib/legal.ts`.

**Interfaces produced:**
```ts
export type DocKind = "plan" | "schedule" | "registration";
export type RemoteRev = { kind: DocKind; rev: number };
export type SaveResult = { ok: true; rev: number } | { ok: false; reason: "conflict" | "too-large" | "offline" | "auth" | "error" };
// remote.ts (client from getAuthClient())
fetchRevs(): Promise<RemoteRev[]>                                  // select kind, rev
fetchDoc(kind: DocKind): Promise<{ body: unknown; rev: number } | null>
saveDoc(kind: DocKind, body: unknown, expectedRev: number | null): Promise<SaveResult>
//   expectedRev null → insert (a unique violation → "conflict"); otherwise update .eq("rev", expectedRev); 0 rows → "conflict"
// decide.ts
decideOnSignIn(local: string | null, remote: string | null): "nothing" | "upload" | "download" | "ask"
decideOnFocus(localRev: number | undefined, remoteRev: number | undefined, localDirty: boolean): "nothing" | "download" | "ask"
// engine.ts
createSyncEngine(deps: { remote; meta; docs: Record<DocKind, { read(): string | null; replace(raw: string | null): void; validate(raw: string): boolean }>; now; setTimer; clearTimer; onAsk(kind, local, remote): void; onError(kind, reason): void })
  → { start(userId): Promise<void>; localChanged(kind): void; flush(): Promise<void>; checkRemote(): Promise<void>; resolve(kind, keep: "local" | "remote"): Promise<void>; stop(clearLocal: boolean): void }
```

**Tests (fake timers, fake remote):**
- `decideOnSignIn`: both empty → nothing; only local → upload; only remote → download; equal JSON → nothing; differ → ask.
- `localChanged` three times within 3 s → one `saveDoc`. `flush()` saves at once.
- After a successful save, `meta.revs[kind]` holds the returned rev. `checkRemote` with an equal rev makes no `fetchDoc` call (protects the download budget).
- Remote rev is newer and local is unchanged: download and `replace`. Remote newer and local changed: `onAsk`.
- Save returns "conflict": `onAsk` (never overwrites silently).
- A downloaded body that fails `validate`: not applied; `onError(kind, "error")`; local copy kept.
- "too-large": `onError`; local copy kept; no retry loop. "offline": retry when `online` fires.
- `checkRemote` throttled to once per 60 s.
- `stop(true)` removes the plan, schedule, registration and sync-meta keys but not consent or theme.
- A different `userId` in meta at `start`: treated as a first sign-in (never upload one account's copy into another's without asking).

**Done:** tests, typecheck and lint pass; pushed. Nothing is wired into the UI yet.

## Task 3 (builder, after Tasks 1 and 2 are merged): connect the app, the chooser and sign-out

**Branch:** `feat/sync-wiring`. **This is a UI change: owner approval with screenshots.**
**Files:** modify `app/advisor/store.ts` (`savePlan` → `engine.localChanged("plan")`, plus a `replacePlanFromRemote(raw)` setter), `lib/schedule/saved-store.ts` and `lib/schedule/registration-store.ts` (same two hooks), `app/advisor/SignInGate.tsx` (sign-out → `engine.stop(true)`). Create `lib/sync/SyncProvider.tsx` (mounted once in the root layout; starts the engine on `signed-in`, calls `checkRemote` on `visibilitychange` → visible and `flush` on hidden) and `app/advisor/KeepWhichCopy.tsx` (the chooser). Consent: `saveConsent` creates `deviceId` (`crypto.randomUUID()`) and POSTs `/api/consent`, then sets `recorded: true`. On load, a consent that is not `recorded` is sent again. After sign-in it is sent once more with the token, so the record gets linked.

**Chooser:** "Your plan is different on this device and in your account." Two cards, each showing programs, number of terms and "Last changed <date>": "Keep this device's plan" / "Use the plan saved to your account". Then a confirm: "Are you sure you want to delete the other copy of your plan?" Same wording for schedules and registration prep.

**Status line** in the Advisor header next to the account: "Saved to your account" / "Saving…" / "Couldn't save to your account. It's still on this device." No new colors.

**Tests:** a store change calls `localChanged` (spy). The chooser makes no change before the confirm tap. Sign-out clears the three keys. An unrecorded consent is sent on load. Storage blocked (`localStorage` throws): the app still works and sync still saves from memory.

**Screenshots (2):** the chooser and the confirm on a phone; the header status line.

## Task 4 (builder, after Task 3): Google sign-in, account deletion, privacy text

**Branch:** `feat/account-controls`. **UI change: owner approval.**
**Owner steps first** (Claude writes a step-by-step for the owner, with the `mattpocock-skills:wizard` skill if useful): create a Google Cloud OAuth client (consent-screen app name "TurboTerp", redirect `https://<project>.supabase.co/auth/v1/callback`), enable the Google provider in Supabase Auth, and add `https://turboterp.com/advisor` to the allowed redirect URLs.
**Files:** `app/advisor/SignInGate.tsx` (a "Continue with Google" button above the email form: `signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + "/advisor" } })`), create `app/api/account/delete/route.ts` + `lib/account/delete.ts` (pure handler: bearer token → `getUser` → service-role `auth.admin.deleteUser(id)`, so documents cascade and agreement records are unlinked), "Delete my account" in the account menu with "Are you sure you want to delete your account, your saved plan and schedules? Your signed agreement is kept as a record, without your account.", then `engine.stop(true)` and sign-out. `lib/legal.ts`: replace the "planned" privacy section with what is stored (documents, agreement record, keyed name hash, kept unlinked after deletion), add Google as a service, change "ask us to delete" to the in-app button, and bump `PRIVACY_VERSION` (and `TERMS_VERSION` if the terms change).
**Tests:** delete without a token → 401; a valid token deletes exactly that user's id; an admin error → 503 and the local data stays. The privacy text names `turboterp-sync` (existing test). The Google button is hidden when auth isn't configured.
**Screenshots (2):** the sign-in card with Google; the delete confirmation.

## Task 5 (main session): merge, verify, hand off the deploy

- [ ] After each merge: full tests, typecheck, lint and build locally; `graphify update .`.
- [ ] Two-browser check against the live Supabase project with a test account (local dev uses the same project; delete the test account afterwards): sign in on A and build a plan → sign in on B and the plan arrives → edit on B → focus A and it updates → edit both while offline → the chooser appears → delete the account → the rows are gone in the Supabase table editor and `consent_records.user_id` is null.
- [ ] Check in the Supabase dashboard (Reports → API) that a reload with no changes makes only the `rev` request.
- [ ] Owner: apply 0007, set env vars, set up Google, deploy. The first daily email arrives the next morning.
- [ ] Update PROJECT_MEMORY §14 and the status log.

## Review focus (failure modes the tests above pin)

1. **Two devices edit while one is offline:** the chooser appears. Never a silent overwrite (Task 2 conflict tests, Task 3 chooser test).
2. **A damaged or old-format document from the server:** it is ignored and the local copy kept (Task 2 `validate` test).
3. **Shared computer:** signing out leaves no plan behind for the next person (Task 2 `stop(true)`, Task 3 sign-out test).
4. **Signed in to a different account on the same browser:** never uploads the first account's plan to the second without asking (Task 2 `userId` test).
5. **Private browsing / storage blocked:** the app works and sync saves from memory (Task 3 test).
