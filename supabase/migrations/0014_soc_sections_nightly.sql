-- Schedule of Classes: the frequent run (soc-seats) now only scans seat counts; the full parse
-- (meetings, instructors, notes) runs once a night as soc-sections.
-- Same prerequisites as 0003_cron_refresh.sql (pg_cron, pg_net, Vault secret 'cron_secret').
-- Re-runnable: an existing job of the same name is replaced.

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'turboterp-soc-sections') then
    perform cron.unschedule('turboterp-soc-sections');
  end if;
end
$$;

-- The full section parse: 08:00 UTC (4:00am EDT), before the 08:30 UTC course-list run.
-- A run that hits its time budget saves a cursor; the next night continues from it.
select cron.schedule(
  'turboterp-soc-sections',
  '0 8 * * *',
  $job$
  select net.http_post(
    url := 'https://turboterp.com/api/cron/soc-sections',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    timeout_milliseconds := 300000
  );
  $job$
);
