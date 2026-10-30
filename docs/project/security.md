# Security review and posture

Review of 2026-10-30 (branch `fix/security-hardening`). Covers the web app, its API routes, the Supabase schema and the dependencies. Re-run this review before each public milestone and whenever a new API route, table or outside service is added.

## Controls in place
- **Auth on every write route.** Account delete, plan email and consent use the Supabase access token, checked server-side. Seat Alerts use a per-device secret, stored only as a SHA-256 hash and compared in constant time. Ownership is checked on every watch.
- **Database.** RLS is on for every table. `user_documents` is owner-only (select/insert/update/delete), with a 64 KB cap per row and server-set `rev`. Every other table is service-role only. `usage_stats()` can only be run by the service role.
- **Secrets.** Only in Vercel env vars and the gitignored `.env.local`. A scan of the full git history (2026-10-30) found no matches for the patterns checked: Supabase JWT and `sb_secret_` keys, Brevo keys, private-key blocks, and `*SECRET`/`*TOKEN`/`*KEY` assignments with long values. Re-scan with a dedicated tool (gitleaks or secretlint) before the repo goes public. The cron secret lives in Supabase Vault, and the cron check runs in constant time.
- **Abuse limits** (email_sends table, keys hashed):

  | What's limited | Limit |
  |---|---|
  | Reports | 5 per IP per hour |
  | Plan emails | 5 per user per day |
  | Agreement records | 10 per IP per hour |
  | New Seat Alerts devices | 20 per IP per hour (from 2026-10-30) |

  Push endpoints must be on a known push service.
- **Input checks.** Every route validates its input with strict patterns: course, section, term and UUID formats, plus capped lengths and sizes. A plan email must be a PDF of at most 2 MB, sent only to the signed-in user's own address.
- **Personal data.** Agreement names are encrypted with AES-256-GCM and matched by keyed hash. Sentry is off until its DSN is set, and its events are scrubbed of personal data.
- **HTTP headers** (`apps/web/lib/security-headers.ts`, from 2026-10-30):
  - A CSP that limits outside connections to Supabase and Sentry.
  - `frame-ancestors 'none'` and `X-Frame-Options: DENY`, so the site can't be framed.
  - `object-src 'none'`, plus `base-uri` and `form-action` limited to the site.
  - `nosniff`, Referrer-Policy, a Permissions-Policy turning off camera, microphone, location and payment, and COOP.
  - HSTS comes from Vercel (2 years).
- **"I got it" tokens** are HMACs with a 7-day expiry, signed with a key derived from `CRON_SECRET` (HKDF), so they're never signed with the raw cron secret.

## Accepted risks
- **CSP allows `'unsafe-inline'` scripts.** A nonce-based CSP would make every page dynamic and undo Cache Components and CDN caching. Every other directive is strict, React escapes all output, and the code uses no `eval` (production bundle checked).
- **`uuid` advisory (moderate) through `exceljs`.** It only affects v3/v5/v6 called with a `buf` argument. exceljs only calls `v4()`, and the fix is a breaking exceljs downgrade.
- **Rate limits count, then record.** A burst of parallel requests can slip a few past the limit. They're for damping abuse, not for access control.
- **The device limit fails open** if its table check fails, so a database problem never blocks Seat Alerts sign-ups.
- **The anon key is public** (as designed), so RLS is the guard. See the database item above.
- From the Security Advisor (rulings.md "iOS App Store decisions"):
  - `pg_net` in the public schema.
  - Leaked-password protection is off (there are no passwords).

## Owner steps
See owner-review.md, "Security hardening".
