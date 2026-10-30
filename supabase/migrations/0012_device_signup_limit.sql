-- Seat Alerts: limit new-device sign-ups per IP (lib/seat-alerts/api.ts handleDeviceRegister).
-- Rows reuse email_sends (hashed key, pruned after a day); this only widens the kind check.
-- Numbered 0012 because 0011 is reserved for the iOS app's Expo push tokens (docs/project/ios-plan.md).
alter table public.email_sends drop constraint if exists email_sends_kind_check;
alter table public.email_sends add constraint email_sends_kind_check check (kind in ('report', 'plan', 'consent', 'device'));
