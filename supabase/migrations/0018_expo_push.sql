-- iOS app Seat Alerts push (docs/project/ios-plan.md, task A4s). A device in alert_devices is now EITHER a web-push
-- subscription OR an Expo push token, plus its platform. Still no link to a user, same as on the web. Re-runnable.
-- Numbered 0018 (0011 stayed reserved and unused). seat_alert_load() is unchanged: the run reads device data
-- through the store's subscriptionsFor (one request, as before), which now also selects expo_token.
alter table public.alert_devices add column if not exists platform text not null default 'web';
alter table public.alert_devices add column if not exists expo_token text;

alter table public.alert_devices alter column endpoint drop not null;
alter table public.alert_devices alter column p256dh drop not null;
alter table public.alert_devices alter column auth drop not null;

alter table public.alert_devices drop constraint if exists alert_devices_platform_check;
alter table public.alert_devices add constraint alert_devices_platform_check check (platform in ('web', 'ios'));

-- The old endpoint check (0010, unnamed: alert_devices_endpoint_check) allowed only https; null now passes it, which is intended.
-- A row has a complete web subscription (and no token) or an Expo token (and no web columns), matching its platform.
alter table public.alert_devices drop constraint if exists alert_devices_target_check;
alter table public.alert_devices add constraint alert_devices_target_check check (
  (platform = 'web' and endpoint is not null and p256dh is not null and auth is not null and expo_token is null)
  or (platform = 'ios' and expo_token is not null and endpoint is null and p256dh is null and auth is null)
);

alter table public.alert_devices drop constraint if exists alert_devices_expo_token_check;
alter table public.alert_devices add constraint alert_devices_expo_token_check check (expo_token is null or expo_token ~ '^Expo(nent)?PushToken\[[A-Za-z0-9_-]+\]$');

create unique index if not exists alert_devices_expo_token_key on public.alert_devices (expo_token) where expo_token is not null;
