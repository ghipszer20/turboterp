-- Sign-up is for students, whose mailboxes are @terpmail.umd.edu (owner, 2026-10-04): plain
-- @umd.edu addresses are no longer accepted. Replaces the rule from 0001.
create or replace function public.enforce_umd_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null
     or new.email !~* '^[^[:space:]@]+@terpmail\.umd\.edu$' then
    raise exception 'Sign-up is limited to @terpmail.umd.edu addresses.';
  end if;
  return new;
end;
$$;
