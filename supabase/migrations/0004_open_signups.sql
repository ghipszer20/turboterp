-- Owner, 2026-10-04: accounts take any email address. TurboTerp is an unofficial student project
-- and is not tied to a UMD account. Removes the sign-up rule from 0001 and 0002.
drop trigger if exists umd_only_signups on auth.users;
drop function if exists public.enforce_umd_email();
