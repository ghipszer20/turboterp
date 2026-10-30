-- Security Advisor "Function Search Path Mutable" (2026-10-30): pin both trigger functions to an
-- empty search_path. Their bodies already use schema-qualified names (public.seat_watches) or
-- pg_catalog built-ins (now()), so behavior is unchanged.
alter function public.user_documents_bump() set search_path = '';
alter function public.seat_watches_limit() set search_path = '';
