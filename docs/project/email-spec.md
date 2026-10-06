# Email: sign-in mail, issue reports, "Email my plan" (spec)

Owner-approved design, 2026-10-06. Provider: **Brevo** (owner pick; free tier 300 emails/day).

## Goal
1. Sign-in links actually reach students (Supabase's built-in sender only delivers to the project team and is heavily rate-limited).
2. "Report an issue" sends from the server to the owner's inbox, not through the student's mail app.
3. A signed-in student can email their own 4-year plan (PDF) and a short audit summary to themselves.

Out of scope: emailed agreement records (rulings.md, 2026-09-26). The owner didn't pick it this round, so it stays a known to-do. Also out: seat alerts and marketing mail.

## Settings (server-only env vars; never in the repo)
- `BREVO_API_KEY`: the Brevo API key (v3).
- `EMAIL_FROM`: `noreply@turboterp.com` (display name "TurboTerp").
- `REPORT_TO_EMAIL`: where issue reports go. The owner's value is in their own notes and on Vercel, not in the repo.

If any of these is missing, as in local dev and tests, nothing is sent. The routes answer `503 {error:"not-configured"}`, and the UI says sending isn't available yet.

## 1. Sign-in emails (owner setup, no code)
A checklist for the owner, `docs/project/email-setup.md`, written by the main session:
- Create the Brevo account and verify turboterp.com (Brevo code TXT, DKIM and DMARC records at the DNS host).
- Create an SMTP key and an API key.
- Supabase → Authentication → SMTP: host `smtp-relay.brevo.com`, port 587, the Brevo login and SMTP key, sender `noreply@turboterp.com`, name "TurboTerp". Raise "Rate limit for sending emails" (e.g. 30/hour).
- Supabase → Authentication → URL configuration: Site URL `https://turboterp.com`; redirect URLs `https://turboterp.com/**` and `https://www.turboterp.com/**`. This closes the "Auth URL settings" to-do.
- Vercel: add the three env vars above for Production and redeploy (the owner runs the deploy).

## 2. Shared sender: `apps/web/lib/email/`
- `sendEmail({ to, subject, text, replyTo?, attachment? }) → Promise<{ ok: true } | { ok: false; reason: "not-configured" | "rejected" | "network" }>`.
  - Calls `POST https://api.brevo.com/v3/smtp/email` with the `api-key` header, using `fetch` (no SDK).
  - Plain-text body. `attachment` is `{ name, base64 }`.
  - Takes its settings and `fetch` as parameters (with defaults from `process.env` and the global `fetch`), so tests inject them.
- Rate limiting is a pure decision function plus a Supabase store.
  - Migration `0006_email_sends.sql` creates the table `email_sends(kind text, key text, at timestamptz)`.
  - The table has RLS on and no public policies. Only the service role writes to it.
  - `key` is a SHA-256 of the IP (for reports) or the user id (for plan emails), never the raw value.
  - Rows older than a day are deleted when new rows are inserted. No cron is needed.
  - Limits: 5 reports per key per hour, and 5 plan emails per key per day.
  - **If the store can't be reached, the request is refused** (fail closed): an error rather than an unlimited sender.

## 3. Issue reports
- `POST /api/report` with JSON `{ what, page?, replyTo?, website? }`.
  - `website` is a hidden trap field. If it's filled in, the route answers 200 and sends nothing.
  - Validation: `what` 1–5000 characters after trimming; `page` ≤ 200; `replyTo`, if given, must pass `isEmail` (`lib/auth/email.ts`). A bad request gets 400.
  - The mail goes to `REPORT_TO_EMAIL`, with subject `TurboTerp report: <first 60 chars>`. The body holds the report, the page, the reply email and the time sent. The Reply-To header is the student's email when given.
  - Rate limited (section 2): 429 → "Too many reports from here just now. Try again later."
- `app/report/ReportForm.tsx` posts to the route and shows a "Sending…" state, then "Sent. Thanks!" or the error text. The form is still usable without a contact email: the mailto path and `buildReportMailto` go away if nothing else uses them.
  - The GitHub Issues card stays as it is.
  - Typed text is kept when sending fails.

## 4. "Email my plan"
- `app/advisor/ExportMenu.tsx` gets an "Email to me" item, shown only when signed in (`lib/auth/use-session.ts`).
  - The browser builds the PDF with the existing `buildPdf` and a summary of plain-text lines from the audit the Advisor already shows (credits earned and planned, requirements met / left).
  - It then sends `POST /api/email/plan` with `Authorization: Bearer <Supabase access token>` and JSON `{ pdfBase64, summary: string[] }`.
- The server checks the token with Supabase (`auth.getUser(token)`) and sends only to that user's confirmed email. Any address in the request is ignored.
  - Rejected requests: a PDF over 2 MB decoded, a file that doesn't start with `%PDF-`, more than 40 summary lines or any line over 200 characters.
  - Subject: "Your TurboTerp 4-year plan". The PDF is attached as `turboterp-plan.pdf`. The body is the summary lines and the export's footer disclaimer (`FOOTER` in `plan-export.ts`).
  - Answers: 401 when not signed in; rate limited (section 2) with 429 → "You've emailed your plan 5 times today. Try again tomorrow."
- The menu item shows "Sending…", then "Sent to <email>" or the error.

## 5. Legal (`apps/web/lib/legal.ts`)
- Privacy "Other services involved": add Brevo, which sends sign-in emails, issue reports and plan emails.
- Explain what a report email contains and that a plan email holds the student's plan and goes only to their own address.
- Mention the rate-limit record: a scrambled IP or account id with a time, deleted after a day.
- Bump `PRIVACY_VERSION`. No new localStorage keys.

## Testing
Test-first. Brevo is always mocked (an injected `fetch`), so tests never send real mail.
- Unit tests: the Brevo request body, each failure reason, validation, the trap field, the rate-limit decision, and plan-email checks (size, `%PDF-`, summary caps, ignoring a client-sent address).
- Route handlers are tested with injected dependencies (sender, store, auth check).
- The legal test still passes, with Brevo named.
- Full local suite (test, typecheck, lint, build). Screenshots of `/report` (form and sent state) and the export menu with "Email to me".
- After the owner sets the env vars and deploys: one live report and one live plan email, checked in the inboxes.

## Build order
Branch `feat/email`, Sonnet builders run one after the other (section 18):
- (a) `lib/email` + migration 0006 + `/api/report` + ReportForm + legal.
- (b) "Email my plan".

The main session writes `email-setup.md`. The owner applies migration 0006 and does the Brevo, Supabase and Vercel steps.
