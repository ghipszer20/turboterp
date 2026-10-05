-- Schedule of Classes refresh: Supabase cron calls the site's protected cron endpoints.
-- Same prerequisites as 0003_cron_refresh.sql (pg_cron, pg_net, Vault secret 'cron_secret').
-- Re-runnable: existing jobs of the same names are replaced.

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'turboterp-soc-seats') then
    perform cron.unschedule('turboterp-soc-seats');
  end if;
  if exists (select 1 from cron.job where jobname = 'turboterp-soc-courses') then
    perform cron.unschedule('turboterp-soc-courses');
  end if;
end
$$;

-- Section seats, instructors and meetings from Testudo: every 5 minutes; the job skips runs that are not due (15 minutes, or 5 during schedule adjustment).
-- A run that hits its time budget saves a cursor; the next run continues from it.
select cron.schedule(
  'turboterp-soc-seats',
  '*/5 * * * *',
  $job$
  select net.http_post(
    url := 'https://turboterp.com/api/cron/soc-seats',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    timeout_milliseconds := 300000
  );
  $job$
);

-- The full course list (new, cancelled and retitled courses): 08:30 UTC (4:30am EDT).
select cron.schedule(
  'turboterp-soc-courses',
  '30 8 * * *',
  $job$
  select net.http_post(
    url := 'https://turboterp.com/api/cron/soc-courses',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    timeout_milliseconds := 300000
  );
  $job$
);
