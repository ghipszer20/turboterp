-- Seat Alerts without accounts (docs/project/seat-alerts-tab.md). DEPLOY TOGETHER WITH THE CODE: the old code reads user_id.
-- A device is one push subscription plus a secret (stored hashed). Existing watches and subscriptions are dropped (owner is the only user).
delete from public.seat_watches;
drop table public.push_subscriptions;

create table public.alert_devices (
  id              uuid primary key default gen_random_uuid(),
  secret_hash     text not null,
  endpoint        text not null unique check (endpoint ~ '^https://'),
  p256dh          text not null,
  auth            text not null,
  created_at      timestamptz not null default now(),
  last_success_at timestamptz
);
alter table public.alert_devices enable row level security; -- no policies: service role only

drop index if exists public.seat_watches_one_active;
alter table public.seat_watches drop column user_id;
alter table public.seat_watches add column device_id uuid not null references public.alert_devices(id) on delete cascade;
create unique index seat_watches_one_active on public.seat_watches (device_id, term, course_id, coalesce(section_id, '')) where done_at is null;

create or replace function public.seat_watches_limit() returns trigger language plpgsql as $$
begin
  if new.done_at is null and (select count(*) from public.seat_watches where device_id = new.device_id and term = new.term and done_at is null) >= 20 then
    raise exception 'seat watch limit' using errcode = 'P0001';
  end if;
  return new;
end $$;
