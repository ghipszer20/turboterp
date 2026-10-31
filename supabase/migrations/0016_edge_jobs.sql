-- Edge jobs and quiet logs. Supabase log ingestion (Free plan: 1 GB a month) is the binding limit: a Storage request
-- writes ~4.4 KB of logs, a PostgREST/RPC request ~1 KB, an Edge Function call ~3-4 KB. So:
--   * hot snapshots (the seats row, room availability, the current term) live in a table, not in Storage;
--   * the seats refresh is ONE Edge Function call, and WHEN it runs is decided here in SQL, so a call that
--     isn't due is never made; the same for Seat Alerts (only while someone watches something) and campus jobs;
--   * Seat Alerts reads everything with one RPC;
--   * old cron run history is deleted nightly.
-- Prerequisites: pg_cron, pg_net, the Vault secret 'cron_secret' (0003) and two more, created once by hand and never
-- committed (values: supabase/functions/README.md):
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<the project anon key>', 'anon_key');
-- Edge Function calls are authenticated the way Supabase recommends for cron: the anon key as the Bearer JWT (the
-- gateway checks it) plus the shared cron secret in x-cron-secret (the function checks it; the anon key is public).
-- Re-runnable: tables and functions are create-if-missing / create-or-replace, jobs of the same names are replaced.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---- hot snapshots -------------------------------------------------------------------------------------------
-- The store (packages/campus-data/src/snapshots/supabase-store.ts) routes schedule/<term>/seats, schedule/current,
-- rooms/... and status/rooms/... here. Rows missing here are read from the old Storage object once and copied in.
create table if not exists public.snapshot_hot (
  key        text primary key,
  updated_at timestamptz not null,
  data       jsonb not null
);
alter table public.snapshot_hot enable row level security; -- no policies: service role only
revoke all on public.snapshot_hot from anon, authenticated;

-- ---- when the seats job is hot ---------------------------------------------------------------------------------
-- Rewritten daily by the Vercel 'daily' job from the academic calendar (priority/early registration until 14 days
-- after it, and the schedule-adjustment period; America/New_York dates converted in packages/campus-data/src/seat-windows.ts).
create table if not exists public.seat_hot_windows (
  starts_at timestamptz not null,
  ends_at   timestamptz not null,
  check (ends_at > starts_at)
);
alter table public.seat_hot_windows enable row level security; -- no policies: service role only
revoke all on public.seat_hot_windows from anon, authenticated;

create or replace function public.replace_seat_hot_windows(p_windows jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.seat_hot_windows where true;
  insert into public.seat_hot_windows (starts_at, ends_at)
  select (w ->> 'starts_at')::timestamptz, (w ->> 'ends_at')::timestamptz from jsonb_array_elements(p_windows) as w;
end $$;
revoke all on function public.replace_seat_hot_windows(jsonb) from public, anon, authenticated;
grant execute on function public.replace_seat_hot_windows(jsonb) to service_role;

-- ---- Seat Alerts: everything the run reads, in one request -----------------------------------------------------
-- The newest term anyone is watching (watches can only be made for the current term), its active watches, and the
-- saved states of the watched courses. Priority order (most-watched first) and the request cap are applied in the function.
create or replace function public.seat_alert_load() returns jsonb
language sql stable security definer set search_path = '' as $$
  with t as (select max(term) as term from public.seat_watches where done_at is null),
  w as (
    select s.id, s.device_id, s.term, s.course_id, s.section_id, s.last_alert_at
    from public.seat_watches s join t on s.term = t.term
    where s.done_at is null
  )
  select jsonb_build_object(
    'term', (select term from t),
    'watches', coalesce((select jsonb_agg(to_jsonb(w)) from w), '[]'::jsonb),
    'states', coalesce((
      select jsonb_agg(jsonb_build_object(
        'course_id', st.course_id, 'section_id', st.section_id, 'open', st.open,
        'waitlist', st.waitlist, 'holdfile', st.holdfile, 'checked_at', st.checked_at))
      from public.seat_state st
      where st.term = (select term from t) and st.course_id in (select course_id from w)
    ), '[]'::jsonb)
  );
$$;
revoke all on function public.seat_alert_load() from public, anon, authenticated;
grant execute on function public.seat_alert_load() to service_role;

-- ---- cron jobs -------------------------------------------------------------------------------------------------
do $$
declare
  job text;
begin
  -- 'turboterp-soc-seats' and 'turboterp-seat-alerts' used to call https://turboterp.com/api/cron/...;
  -- the -0..-3 names are from an earlier draft of this migration.
  foreach job in array array[
    'turboterp-soc-seats', 'turboterp-seat-alerts',
    'turboterp-soc-seats-0', 'turboterp-soc-seats-1', 'turboterp-soc-seats-2', 'turboterp-soc-seats-3',
    'turboterp-fast', 'turboterp-dining', 'turboterp-cron-cleanup'
  ] loop
    if exists (select 1 from cron.job where jobname = job) then
      perform cron.unschedule(job);
    end if;
  end loop;
end
$$;

-- Seats: cron fires every 5 minutes; the function is called only inside a hot window, or when the minute is a
-- multiple of 15 (so every 15 minutes the rest of the time).
select cron.schedule(
  'turboterp-soc-seats',
  '*/5 * * * *',
  $job$
  select case
    when exists (select 1 from public.seat_hot_windows where now() between starts_at and ends_at)
      or extract(minute from now())::int % 15 = 0
    then net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/soc-seats',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 150000
    )
  end;
  $job$
);

-- Seat Alerts: every minute, but only while at least one watch is active.
select cron.schedule(
  'turboterp-seat-alerts',
  '* * * * *',
  $job$
  select case
    when exists (select 1 from public.seat_watches where done_at is null)
    then net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/seat-alerts',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 150000
    )
  end;
  $job$
);

-- Campus rooms (Vercel): every 30 minutes, 7:00 to 00:59 America/New_York.
select cron.schedule(
  'turboterp-fast',
  '*/30 * * * *',
  $job$
  select case
    when extract(hour from now() at time zone 'America/New_York') >= 7
      or extract(hour from now() at time zone 'America/New_York') < 1
    then net.http_post(
      url := 'https://turboterp.com/api/cron/fast',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
      ),
      timeout_milliseconds := 120000
    )
  end;
  $job$
);

-- Dining menus (Vercel): 6:00 and 14:00 America/New_York. Scheduled at both possible UTC hours of each
-- (EDT, EST); the New York hour gate lets exactly one through.
select cron.schedule(
  'turboterp-dining',
  '0 10,11,18,19 * * *',
  $job$
  select case
    when extract(hour from now() at time zone 'America/New_York') in (6, 14)
    then net.http_post(
      url := 'https://turboterp.com/api/cron/dining',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
      ),
      timeout_milliseconds := 120000
    )
  end;
  $job$
);

-- Keep cron's own run history (and its log noise) to a week.
select cron.schedule(
  'turboterp-cron-cleanup',
  '17 7 * * *',
  $job$ delete from cron.job_run_details where end_time < now() - interval '7 days'; $job$
);
