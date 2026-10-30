-- The fast refresh (study rooms; dining menus once 12 hours old) moves from every 3 minutes to every 30.
-- Today and Campus pages are cached and rebuilt when this job revalidates them, so a slower job means fewer rebuilds.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'turboterp-fast') then
    perform cron.unschedule('turboterp-fast');
  end if;
end
$$;

select cron.schedule(
  'turboterp-fast',
  '*/30 * * * *',
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
