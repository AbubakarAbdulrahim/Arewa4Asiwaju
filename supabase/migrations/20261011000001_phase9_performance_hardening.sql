-- Phase 9: indexes for the production member-search predicates observed in
-- admin_search_members. Keep scope/status/date filters and substring matching
-- off unbounded table scans as membership grows.

CREATE INDEX IF NOT EXISTS memberships_state_status_created_idx
  ON public.memberships (state_code, status, created_at DESC, id);

CREATE INDEX IF NOT EXISTS memberships_number_search_idx
  ON public.memberships USING gin (membership_number gin_trgm_ops);

CREATE INDEX IF NOT EXISTS profiles_phone_search_idx
  ON public.profiles USING gin (phone gin_trgm_ops);
