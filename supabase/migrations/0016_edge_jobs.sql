-- The 5-minute seats refresh and the every-minute Seat Alerts job now run as Supabase Edge Functions
-- (supabase/functions/soc-seats and supabase/functions/seat-alerts), not on Vercel.
-- Same prerequisites as 0003_cron_refresh.sql (pg_cron, pg_net, Vault secret 'cron_secret') plus two
-- more Vault secrets, created once by hand and never committed (values: supabase/functions/README.md):
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<the project anon key>', 'anon_key');
-- Authentication follows Supabase's pattern for cron -> Edge Function calls: the anon key as the Bearer
-- JWT (the gateway checks it), and the shared cron secret in x-cron-secret (the function checks it,
-- because the anon key is public).
-- Re-runnable: existing jobs of the same names are replaced, and the old jobs that pointed at Vercel
-- are removed.

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
declare
  job text;
begin
  -- 'turboterp-soc-seats' and 'turboterp-seat-alerts' used to call https://turboterp.com/api/cron/...
  foreach job in array array[
    'turboterp-soc-seats',
    'turboterp-seat-alerts',
    'turboterp-soc-seats-0',
    'turboterp-soc-seats-1',
    'turboterp-soc-seats-2',
    'turboterp-soc-seats-3'
  ] loop
    if exists (select 1 from cron.job where jobname = job) then
      perform cron.unschedule(job);
    end if;
  end loop;
end
$$;

-- Seats: the term's departments are split into 4 chunks, each its own call, one minute apart
-- (chunk n runs at minutes n, n+5, n+10, ...). The function merges the chunks into the one
-- schedule/<term>/seats file.
select cron.schedule(
  'turboterp-soc-seats-' || n,
  n || '-59/5 * * * *',
  format($job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/soc-seats',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{"chunk": %s}'::jsonb,
    timeout_milliseconds := 150000
  );
  $job$, n)
)
from generate_series(0, 3) as n;

-- Seat Alerts: every minute.
select cron.schedule(
  'turboterp-seat-alerts',
  '* * * * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/seat-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 150000
  );
  $job$
);
