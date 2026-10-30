-- Owner, 2026-10-08: the typed name on an agreement record must be readable for legal purposes.
-- It is stored encrypted (AES-256-GCM, key derived from CONSENT_NAME_SECRET on Vercel), next to the
-- keyed hash used for matching. Read it with: npm run agreements -w @turboterp/web
-- Safe to run once 0007 is applied (no rows existed before this column).
alter table public.consent_records add column if not exists name_encrypted text not null default '';
alter table public.consent_records alter column name_encrypted drop default;
