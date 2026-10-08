create table if not exists public.user_documents (
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('plan', 'schedule', 'registration')),
  body       jsonb not null check (octet_length(body::text) <= 65536),
  rev        bigint not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);
alter table public.user_documents enable row level security;
create policy user_documents_select on public.user_documents for select using ((select auth.uid()) = user_id);
create policy user_documents_insert on public.user_documents for insert with check ((select auth.uid()) = user_id);
create policy user_documents_update on public.user_documents for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy user_documents_delete on public.user_documents for delete using ((select auth.uid()) = user_id);
-- rev and updated_at are set by the server, not trusted from the client
create or replace function public.user_documents_bump() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then new.rev := 1; else new.rev := old.rev + 1; end if;
  new.updated_at := now();
  return new;
end $$;
create trigger user_documents_bump before insert or update on public.user_documents
  for each row execute function public.user_documents_bump();

create table if not exists public.consent_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  device_id   uuid not null,
  version     text not null,
  accepted_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  name_hash   text not null
);
create index if not exists consent_records_recorded on public.consent_records (recorded_at);
create index if not exists consent_records_device on public.consent_records (device_id, version);
alter table public.consent_records enable row level security; -- no policies: service role only

alter table public.email_sends drop constraint if exists email_sends_kind_check;
alter table public.email_sends add constraint email_sends_kind_check check (kind in ('report', 'plan', 'consent'));

-- Usage check for the daily email (service role only)
create or replace function public.usage_stats() returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'db_bytes', pg_database_size(current_database()),
    'documents', (select count(*) from public.user_documents),
    'consents', (select count(*) from public.consent_records),
    'accounts', (select count(*) from auth.users));
$$;
revoke all on function public.usage_stats() from public, anon, authenticated;
