-- Seat Alerts (docs/project/seat-alerts.md). Service role only: the API routes enforce ownership.
create table if not exists public.seat_watches (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  term          text not null check (term ~ '^\d{6}$'),
  course_id     text not null check (course_id ~ '^[A-Z]{4}\d{3}[A-Z]?$'),
  section_id    text check (section_id is null or section_id ~ '^[A-Z0-9]{1,6}$'),
  created_at    timestamptz not null default now(),
  done_at       timestamptz,
  last_alert_at timestamptz
);
create unique index if not exists seat_watches_one_active on public.seat_watches (user_id, term, course_id, coalesce(section_id, '')) where done_at is null;
create index if not exists seat_watches_active_term on public.seat_watches (term) where done_at is null;
alter table public.seat_watches enable row level security; -- no policies: service role only

create or replace function public.seat_watches_limit() returns trigger language plpgsql as $$
begin
  if new.done_at is null and (select count(*) from public.seat_watches where user_id = new.user_id and done_at is null) >= 20 then
    raise exception 'seat watch limit' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger seat_watches_limit before insert on public.seat_watches for each row execute function public.seat_watches_limit();

create table if not exists public.push_subscriptions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  endpoint        text not null unique check (endpoint ~ '^https://'),
  p256dh          text not null,
  auth            text not null,
  user_agent      text,
  created_at      timestamptz not null default now(),
  last_success_at timestamptz
);
create index if not exists push_subscriptions_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security; -- no policies: service role only

create table if not exists public.seat_state (
  term       text not null,
  section_id text not null,
  course_id  text not null,
  open       int not null,
  waitlist   int not null,
  holdfile   int not null,
  checked_at timestamptz not null,
  primary key (term, course_id, section_id)
);
alter table public.seat_state enable row level security; -- no policies: service role only

create table if not exists public.seat_alert_cursor (id int primary key check (id = 1), next_course text, updated_at timestamptz not null default now());
alter table public.seat_alert_cursor enable row level security;

create extension if not exists pg_cron;
create extension if not exists pg_net;
do $$ begin
  if exists (select 1 from cron.job where jobname = 'turboterp-seat-alerts') then perform cron.unschedule('turboterp-seat-alerts'); end if;
end $$;
select cron.schedule('turboterp-seat-alerts', '* * * * *', $job$
  select net.http_post(
    url := 'https://turboterp.com/api/cron/seat-alerts',
    headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
    timeout_milliseconds := 60000
  );
$job$);
