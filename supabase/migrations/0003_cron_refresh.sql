-- Scheduled data refresh: Supabase cron calls the site's protected cron endpoints.
-- Prerequisite: a Vault secret named 'cron_secret' whose value equals CRON_SECRET on Vercel
--   select vault.create_secret('<the secret>', 'cron_secret');   -- run once by hand, never commit the value
-- Re-runnable: existing jobs of the same names are replaced.

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'turboterp-fast') then
    perform cron.unschedule('turboterp-fast');
  end if;
  if exists (select 1 from cron.job where jobname = 'turboterp-daily') then
    perform cron.unschedule('turboterp-daily');
  end if;
end
$$;

-- Study rooms (and menus once 30 minutes old): every 3 minutes.
select cron.schedule(
  'turboterp-fast',
  '*/3 * * * *',
  $job$
  select net.http_post(
    url := 'https://turboterp.com/api/cron/fast',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    timeout_milliseconds := 120000
  );
  $job$
);

-- Everything, plus pruning old dated snapshots: 09:00 UTC (5am EDT).
select cron.schedule(
  'turboterp-daily',
  '0 9 * * *',
  $job$
  select net.http_post(
    url := 'https://turboterp.com/api/cron/daily',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    timeout_milliseconds := 120000
  );
  $job$
);
