-- Only UMD email addresses may create an account. Enforced on the server, not only in the page.
create or replace function public.enforce_umd_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null
     or new.email !~* '^[^[:space:]@]+@(terpmail\.)?umd\.edu$' then
    raise exception 'Sign-up is limited to @umd.edu and @terpmail.umd.edu addresses.';
  end if;
  return new;
end;
$$;

drop trigger if exists umd_only_signups on auth.users;
create trigger umd_only_signups
  before insert on auth.users
  for each row execute function public.enforce_umd_email();
