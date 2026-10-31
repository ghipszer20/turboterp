-- Seat Alerts no longer walks courses alphabetically with a saved cursor: since 0016 it checks watched
-- courses most-watched first in every run (supabase/functions/seat-alerts). Nothing reads or writes
-- seat_alert_cursor any more (removed from apps/web/lib/seat-alerts/store.ts), so drop it.
-- Re-runnable.

drop table if exists public.seat_alert_cursor;
