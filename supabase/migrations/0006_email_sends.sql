-- Rate-limit record for server-sent email (issue reports, "Email my plan").
-- `key` is a SHA-256 of the IP (reports) or the user id (plan emails), never the raw value.
-- RLS is on with no policies: only the service role (which bypasses RLS) can read or write.
-- Rows older than a day are deleted by the app whenever it inserts a new row.

create table if not exists public.email_sends (
  kind text not null check (kind in ('report', 'plan')),
  key  text not null,
  at   timestamptz not null default now()
);

create index if not exists email_sends_lookup on public.email_sends (kind, key, at);

alter table public.email_sends enable row level security;
