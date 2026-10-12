-- A4A Phase 3: close the broad legacy policies and establish the least-privilege
-- data foundation. This is additive so migration history remains immutable.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- Remove legacy policies first because they depend on the unsafe helpers below.
DO $$
DECLARE policy_row RECORD;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (ARRAY[
        'profiles', 'memberships', 'id_cards', 'consent_records', 'organisational_units',
        'role_assignments', 'events', 'event_registrations', 'announcements',
        'support_requests', 'notification_outbox', 'audit_logs', 'data_requests', 'membership_counters'
      ])
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  END LOOP;
END;
$$;

-- Signup must not create a partially populated profile from caller-controlled
-- user metadata. Registration creates the profile only after verified email.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Legacy public functions allowed callers to allocate numbers, activate cards,
-- and query card verification. None is used by the current application.
DROP FUNCTION IF EXISTS public.verify_card_token(TEXT);
DROP FUNCTION IF EXISTS public.issue_digital_id_card(UUID);
DROP FUNCTION IF EXISTS public.generate_next_membership_number(TEXT);
DROP FUNCTION IF EXISTS public.auth_user_role();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.user_state_scope();

-- Anchor legacy campus chapters to their state so scope checks have a real tree.
UPDATE public.organisational_units AS chapter
SET parent_id = state_unit.id
FROM public.organisational_units AS state_unit
WHERE chapter.type = 'campus_chapter'
  AND chapter.parent_id IS NULL
  AND state_unit.type = 'state'
  AND state_unit.state_code = chapter.state_code;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_id_auth_users_fkey'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_auth_users_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE RESTRICT NOT VALID;
  END IF;
END;
$$;
ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_id_auth_users_fkey;

ALTER TABLE public.profiles ALTER COLUMN institution_type DROP DEFAULT;
ALTER TABLE public.memberships
  ADD CONSTRAINT memberships_number_format_check
    CHECK (membership_number ~ '^A4A-[0-9]{4}-[A-Z0-9]{2,10}-[0-9]{6,}$') NOT VALID,
  ADD CONSTRAINT memberships_state_code_format_check
    CHECK (state_code ~ '^[A-Z0-9]{2,10}$') NOT VALID;
ALTER TABLE public.memberships VALIDATE CONSTRAINT memberships_number_format_check;
ALTER TABLE public.memberships VALIDATE CONSTRAINT memberships_state_code_format_check;

ALTER TABLE public.membership_counters
  ADD CONSTRAINT membership_counters_positive_check CHECK (current_seq > 0) NOT VALID;
ALTER TABLE public.membership_counters VALIDATE CONSTRAINT membership_counters_positive_check;

ALTER TABLE public.id_cards
  ADD CONSTRAINT id_cards_positive_version_check CHECK (card_version > 0) NOT VALID,
  ADD CONSTRAINT id_cards_revocation_consistency_check
    CHECK ((status IN ('revoked', 'replaced') AND revoked_at IS NOT NULL) OR status IN ('active', 'suspended')) NOT VALID;
ALTER TABLE public.id_cards VALIDATE CONSTRAINT id_cards_positive_version_check;
ALTER TABLE public.id_cards VALIDATE CONSTRAINT id_cards_revocation_consistency_check;
CREATE UNIQUE INDEX id_cards_membership_version_uidx
  ON public.id_cards (membership_id, card_version);

ALTER TABLE public.consent_records
  ADD COLUMN policy_version TEXT,
  ADD COLUMN policy_sha256 TEXT,
  ADD COLUMN source TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE public.consent_records
  ADD CONSTRAINT consent_policy_hash_check
    CHECK (policy_sha256 IS NULL OR policy_sha256 ~ '^[a-f0-9]{64}$') NOT VALID,
  ADD CONSTRAINT consent_source_check CHECK (source IN ('legacy', 'self_service', 'admin_recorded')) NOT VALID;
ALTER TABLE public.consent_records VALIDATE CONSTRAINT consent_policy_hash_check;
ALTER TABLE public.consent_records VALIDATE CONSTRAINT consent_source_check;

-- NULL scopes need the same uniqueness guarantees as non-NULL scopes.
ALTER TABLE public.role_assignments ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.role_assignments
  ADD CONSTRAINT role_assignments_no_public_role_check CHECK (role <> 'public_visitor') NOT VALID,
  ADD CONSTRAINT role_assignments_coordinator_scope_check CHECK (
    role NOT IN ('state_coordinator', 'lga_coordinator', 'chapter_coordinator')
    OR org_unit_id IS NOT NULL
  ) NOT VALID;
ALTER TABLE public.role_assignments VALIDATE CONSTRAINT role_assignments_no_public_role_check;
ALTER TABLE public.role_assignments VALIDATE CONSTRAINT role_assignments_coordinator_scope_check;
CREATE UNIQUE INDEX role_assignments_global_scope_uidx
  ON public.role_assignments (user_id, role) WHERE org_unit_id IS NULL;
CREATE UNIQUE INDEX role_assignments_scoped_scope_uidx
  ON public.role_assignments (user_id, role, org_unit_id) WHERE org_unit_id IS NOT NULL;
CREATE INDEX role_assignments_org_role_idx ON public.role_assignments (org_unit_id, role);
CREATE INDEX memberships_scope_status_created_idx
  ON public.memberships (org_unit_id, status, created_at DESC);
CREATE INDEX profiles_residence_idx
  ON public.profiles (state_of_residence, lga_of_residence);
CREATE INDEX id_cards_membership_issued_idx
  ON public.id_cards (membership_id, issued_at DESC);
CREATE INDEX consent_records_profile_purpose_idx
  ON public.consent_records (profile_id, consent_purpose, consented_at DESC);

CREATE INDEX organisational_units_parent_idx ON public.organisational_units(parent_id);
CREATE UNIQUE INDEX organisational_units_single_national_uidx
  ON public.organisational_units (type) WHERE type = 'national';

CREATE OR REPLACE FUNCTION private.validate_organisational_unit_parent()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  parent_type public.org_unit_type;
  parent_state_code TEXT;
  allowed_parent BOOLEAN;
BEGIN
  IF NEW.type = 'national' THEN
    IF NEW.parent_id IS NOT NULL THEN
      RAISE EXCEPTION 'A national unit cannot have a parent' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF NEW.parent_id IS NULL THEN
      RAISE EXCEPTION 'Organisational units below national require a parent' USING ERRCODE = '23514';
    END IF;
    SELECT type, state_code INTO parent_type, parent_state_code
    FROM public.organisational_units WHERE id = NEW.parent_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Parent organisational unit does not exist' USING ERRCODE = '23503';
    END IF;
    allowed_parent := CASE NEW.type
      WHEN 'zone' THEN parent_type = 'national'
      WHEN 'state' THEN parent_type IN ('national', 'zone')
      WHEN 'lga' THEN parent_type = 'state'
      WHEN 'ward' THEN parent_type = 'lga'
      WHEN 'campus_chapter' THEN parent_type IN ('state', 'lga', 'ward')
      WHEN 'support_group' THEN parent_type IN ('state', 'lga', 'ward')
      ELSE FALSE
    END;
    IF NOT allowed_parent THEN
      RAISE EXCEPTION 'Invalid parent type for organisational unit type %', NEW.type USING ERRCODE = '23514';
    END IF;
    IF NEW.state_code IS NULL THEN
      NEW.state_code := parent_state_code;
    ELSIF parent_state_code IS NOT NULL AND NEW.state_code <> parent_state_code THEN
      RAISE EXCEPTION 'Child and parent state codes must match' USING ERRCODE = '23514';
    END IF;
    IF NEW.id IS NOT NULL AND EXISTS (
      WITH RECURSIVE ancestors(id, parent_id) AS (
        SELECT id, parent_id FROM public.organisational_units WHERE id = NEW.parent_id
        UNION
        SELECT unit.id, unit.parent_id
        FROM public.organisational_units AS unit
        JOIN ancestors ON ancestors.parent_id = unit.id
      )
      SELECT 1 FROM ancestors WHERE id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Organisational hierarchy cannot contain a cycle' USING ERRCODE = '23514';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER organisational_units_parent_guard
BEFORE INSERT OR UPDATE OF type, parent_id, state_code ON public.organisational_units
FOR EACH ROW EXECUTE FUNCTION private.validate_organisational_unit_parent();

CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER organisational_units_set_updated_at
BEFORE UPDATE ON public.organisational_units
FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- These policy helpers can only answer questions about the current JWT subject.
-- The private schema is not an exposed PostgREST schema.
CREATE OR REPLACE FUNCTION private.user_has_role(p_roles public.user_role[])
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.role_assignments AS assignment
    WHERE assignment.user_id = (SELECT auth.uid())
      AND assignment.role = ANY (p_roles)
  );
$$;

CREATE OR REPLACE FUNCTION private.user_has_role_in_scope(
  p_roles public.user_role[],
  p_target_unit_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  WITH RECURSIVE target_ancestors(id, parent_id) AS (
    SELECT unit.id, unit.parent_id
    FROM public.organisational_units AS unit
    WHERE unit.id = p_target_unit_id
    UNION
    SELECT parent.id, parent.parent_id
    FROM public.organisational_units AS parent
    JOIN target_ancestors AS child ON child.parent_id = parent.id
  )
  SELECT EXISTS (
    SELECT 1
    FROM public.role_assignments AS assignment
    WHERE assignment.user_id = (SELECT auth.uid())
      AND assignment.role = ANY (p_roles)
      AND (
        assignment.org_unit_id IN (SELECT id FROM target_ancestors)
        OR (assignment.org_unit_id IS NULL AND assignment.role IN ('super_admin', 'membership_officer'))
      )
  );
$$;

CREATE OR REPLACE FUNCTION private.can_view_membership(
  p_profile_id UUID,
  p_unit_id UUID,
  p_state_code TEXT
)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) = p_profile_id
    OR private.user_has_role(ARRAY['super_admin', 'membership_officer']::public.user_role[])
    OR private.user_has_role_in_scope(
      ARRAY['state_coordinator', 'lga_coordinator', 'chapter_coordinator']::public.user_role[],
      COALESCE(
        p_unit_id,
        (SELECT unit.id FROM public.organisational_units AS unit
         WHERE unit.type = 'state' AND unit.state_code = p_state_code LIMIT 1)
      )
    );
$$;

CREATE OR REPLACE FUNCTION private.validate_role_assignment_scope()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  assigned_unit_type public.org_unit_type;
  assigned_state_code TEXT;
  type_is_valid BOOLEAN;
BEGIN
  IF NEW.role IN ('super_admin', 'membership_officer', 'auditor', 'data_protection_officer')
     AND NEW.org_unit_id IS NOT NULL THEN
    RAISE EXCEPTION 'This role must have national scope' USING ERRCODE = '23514';
  END IF;
  IF NEW.role IN ('state_coordinator', 'lga_coordinator', 'chapter_coordinator') THEN
    SELECT type, state_code INTO assigned_unit_type, assigned_state_code
    FROM public.organisational_units WHERE id = NEW.org_unit_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Coordinator role requires an organisational unit' USING ERRCODE = '23503';
    END IF;
    type_is_valid := CASE NEW.role
      WHEN 'state_coordinator' THEN assigned_unit_type = 'state'
      WHEN 'lga_coordinator' THEN assigned_unit_type = 'lga'
      WHEN 'chapter_coordinator' THEN assigned_unit_type IN ('ward', 'campus_chapter', 'support_group')
      ELSE FALSE
    END;
    IF NOT type_is_valid THEN
      RAISE EXCEPTION 'Coordinator role does not match assigned organisational unit type' USING ERRCODE = '23514';
    END IF;
    IF NEW.state_code IS NULL THEN
      NEW.state_code := assigned_state_code;
    ELSIF assigned_state_code IS NOT NULL AND NEW.state_code <> assigned_state_code THEN
      RAISE EXCEPTION 'Coordinator role state must match organisational unit' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER role_assignment_scope_guard
BEFORE INSERT OR UPDATE OF role, org_unit_id, state_code ON public.role_assignments
FOR EACH ROW EXECUTE FUNCTION private.validate_role_assignment_scope();

CREATE OR REPLACE FUNCTION public.assign_user_role(
  p_user_id UUID,
  p_role public.user_role,
  p_org_unit_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  assignment_id UUID;
  assignment_created BOOLEAN := FALSE;
  is_service_role BOOLEAN := COALESCE(auth.role() = 'service_role', FALSE);
BEGIN
  IF NOT is_service_role AND NOT private.user_has_role(ARRAY['super_admin']::public.user_role[]) THEN
    RAISE EXCEPTION 'Only a super administrator can assign roles' USING ERRCODE = '42501';
  END IF;
  IF p_role = 'public_visitor' THEN
    RAISE EXCEPTION 'Public visitors do not receive role assignments' USING ERRCODE = '23514';
  END IF;
  IF p_role = 'super_admin' AND NOT is_service_role THEN
    RAISE EXCEPTION 'Super administrator grants require a service-side operation' USING ERRCODE = '42501';
  END IF;
  IF p_role = 'super_admin' THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('a4a:super-admin-assignments', 0));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Target profile does not exist' USING ERRCODE = '23503';
  END IF;

  INSERT INTO public.role_assignments (user_id, role, org_unit_id, state_code, assigned_by)
  SELECT p_user_id, p_role, p_org_unit_id, unit.state_code, (SELECT auth.uid())
  FROM (SELECT 1) AS singleton
  LEFT JOIN public.organisational_units AS unit ON unit.id = p_org_unit_id
  ON CONFLICT DO NOTHING
  RETURNING id INTO assignment_id;

  IF assignment_id IS NULL THEN
    SELECT id INTO assignment_id FROM public.role_assignments
    WHERE user_id = p_user_id AND role = p_role AND org_unit_id IS NOT DISTINCT FROM p_org_unit_id;
  ELSE
    assignment_created := TRUE;
  END IF;
  IF assignment_created THEN
    INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details)
    VALUES (
      (SELECT auth.uid()), 'role_assignment.created', 'role_assignment', assignment_id::TEXT,
      jsonb_build_object('role', p_role::TEXT, 'org_unit_id', p_org_unit_id)
    );
  END IF;
  RETURN assignment_id;
END;
$$;

CREATE FUNCTION public.revoke_user_role(p_assignment_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  assignment_row public.role_assignments%ROWTYPE;
  is_service_role BOOLEAN := COALESCE(auth.role() = 'service_role', FALSE);
BEGIN
  IF NOT is_service_role AND NOT private.user_has_role(ARRAY['super_admin']::public.user_role[]) THEN
    RAISE EXCEPTION 'Only a super administrator can revoke roles' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO assignment_row FROM public.role_assignments WHERE id = p_assignment_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  IF assignment_row.role = 'super_admin' THEN
    IF NOT is_service_role THEN
      RAISE EXCEPTION 'Super administrator revocation requires a service-side operation' USING ERRCODE = '42501';
    END IF;
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('a4a:super-admin-assignments', 0));
    IF (SELECT count(*) FROM public.role_assignments WHERE role = 'super_admin') <= 1 THEN
      RAISE EXCEPTION 'The final super administrator cannot be revoked' USING ERRCODE = '23514';
    END IF;
  END IF;
  DELETE FROM public.role_assignments WHERE id = assignment_row.id;
  INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details)
  VALUES (
    (SELECT auth.uid()), 'role_assignment.revoked', 'role_assignment', assignment_row.id::TEXT,
    jsonb_build_object('role', assignment_row.role::TEXT, 'org_unit_id', assignment_row.org_unit_id)
  );
  RETURN TRUE;
END;
$$;

-- Internal, atomic counter. Not directly callable by anon/authenticated.
CREATE FUNCTION private.generate_next_membership_number(p_state_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  membership_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
  next_sequence INTEGER;
  clean_state_code TEXT := upper(trim(p_state_code));
BEGIN
  IF clean_state_code !~ '^[A-Z0-9]{2,10}$' THEN
    RAISE EXCEPTION 'Invalid state code' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.membership_counters (year, state_code, current_seq)
  VALUES (membership_year, clean_state_code, 1)
  ON CONFLICT (year, state_code)
  DO UPDATE SET current_seq = public.membership_counters.current_seq + 1
  RETURNING current_seq INTO next_sequence;
  RETURN 'A4A-' || membership_year::TEXT || '-' || clean_state_code || '-' || lpad(next_sequence::TEXT, 6, '0');
END;
$$;

-- The only membership creation entry point. Caller is a trusted server route
-- using the service-role key, after email OTP verification and Zod validation.
CREATE FUNCTION public.create_verified_membership(
  p_auth_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT,
  p_state_of_residence TEXT,
  p_lga_of_residence TEXT,
  p_state_code TEXT,
  p_org_unit_id UUID,
  p_consent_policy_version TEXT,
  p_consent_policy_sha256 TEXT,
  p_consent_granted BOOLEAN,
  p_middle_name TEXT DEFAULT NULL,
  p_ward TEXT DEFAULT NULL
)
RETURNS TABLE (membership_id UUID, membership_number TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  verified_email TEXT;
  org_state_code TEXT;
  existing_membership public.memberships%ROWTYPE;
  new_membership_id UUID;
  new_membership_number TEXT;
  cleaned_state_code TEXT := upper(trim(p_state_code));
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'This operation is available only to the trusted registration service' USING ERRCODE = '42501';
  END IF;
  IF p_first_name IS NULL OR p_last_name IS NULL OR p_phone IS NULL
     OR p_state_of_residence IS NULL OR p_lga_of_residence IS NULL OR p_state_code IS NULL
     OR p_consent_policy_version IS NULL OR p_consent_policy_sha256 IS NULL
     OR p_consent_granted IS DISTINCT FROM TRUE
     OR length(trim(p_first_name)) NOT BETWEEN 2 AND 100
     OR length(trim(p_last_name)) NOT BETWEEN 2 AND 100
     OR length(trim(p_phone)) NOT BETWEEN 10 AND 16
     OR trim(p_phone) !~ '^\+?[0-9]{10,15}$'
     OR length(trim(p_state_of_residence)) NOT BETWEEN 2 AND 100
     OR length(trim(p_lga_of_residence)) NOT BETWEEN 2 AND 100
     OR cleaned_state_code !~ '^[A-Z0-9]{2,10}$'
     OR length(trim(p_consent_policy_version)) NOT BETWEEN 1 AND 64
     OR COALESCE(length(trim(p_middle_name)), 0) > 100
     OR COALESCE(length(trim(p_ward)), 0) > 150
     OR length(concat_ws(' ', trim(p_first_name), nullif(trim(p_middle_name), ''), trim(p_last_name))) > 255
     OR lower(p_consent_policy_sha256) !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Registration data is invalid' USING ERRCODE = '22023';
  END IF;

  SELECT lower(email) INTO verified_email
  FROM auth.users
  WHERE id = p_auth_user_id AND email_confirmed_at IS NOT NULL
  FOR UPDATE;
  IF NOT FOUND OR verified_email IS NULL THEN
    RAISE EXCEPTION 'A confirmed email account is required' USING ERRCODE = '42501';
  END IF;

  SELECT membership.* INTO existing_membership
  FROM public.memberships AS membership
  WHERE membership.profile_id = p_auth_user_id;
  IF FOUND THEN
    RETURN QUERY SELECT existing_membership.id, existing_membership.membership_number::TEXT;
    RETURN;
  END IF;

  SELECT unit.state_code INTO org_state_code
  FROM public.organisational_units AS unit
  WHERE unit.id = p_org_unit_id
    AND unit.type IN ('state', 'lga', 'ward', 'campus_chapter', 'support_group');
  IF NOT FOUND OR org_state_code IS DISTINCT FROM cleaned_state_code THEN
    RAISE EXCEPTION 'Selected organisational unit is outside the member state' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.profiles (
    id, full_name, first_name, last_name, middle_name, email, phone,
    state_of_residence, lga_of_residence, ward
  ) VALUES (
    p_auth_user_id,
    trim(concat_ws(' ', nullif(trim(p_first_name), ''), nullif(trim(p_middle_name), ''), nullif(trim(p_last_name), ''))),
    trim(p_first_name), trim(p_last_name), nullif(trim(p_middle_name), ''), verified_email, trim(p_phone),
    trim(p_state_of_residence), trim(p_lga_of_residence), nullif(trim(p_ward), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    middle_name = EXCLUDED.middle_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    state_of_residence = EXCLUDED.state_of_residence,
    lga_of_residence = EXCLUDED.lga_of_residence,
    ward = EXCLUDED.ward,
    updated_at = now();

  new_membership_number := private.generate_next_membership_number(cleaned_state_code);
  INSERT INTO public.memberships (profile_id, membership_number, state_code, org_unit_id)
  VALUES (p_auth_user_id, new_membership_number, cleaned_state_code, p_org_unit_id)
  RETURNING id INTO new_membership_id;

  INSERT INTO public.consent_records (
    profile_id, consent_purpose, is_granted, consented_at, policy_version, policy_sha256, source
  ) VALUES (
    p_auth_user_id, 'membership_data_processing', TRUE, now(),
    trim(p_consent_policy_version), lower(p_consent_policy_sha256), 'self_service'
  );
  INSERT INTO public.role_assignments (user_id, role) VALUES (p_auth_user_id, 'member')
  ON CONFLICT DO NOTHING;

  RETURN QUERY SELECT new_membership_id, new_membership_number;
END;
$$;

-- Revoke the inherited PUBLIC EXECUTE grant on all privileged entry points.
REVOKE ALL ON FUNCTION private.user_has_role(public.user_role[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.user_has_role_in_scope(public.user_role[], UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.can_view_membership(UUID, UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.generate_next_membership_number(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.user_has_role(public.user_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION private.user_has_role_in_scope(public.user_role[], UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_view_membership(UUID, UUID, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.assign_user_role(UUID, public.user_role, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_user_role(UUID, public.user_role, UUID) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.revoke_user_role(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_user_role(UUID) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.create_verified_membership(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_verified_membership(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN, TEXT, TEXT) TO service_role;

REVOKE ALL ON TABLE public.profiles, public.memberships, public.id_cards, public.consent_records,
  public.organisational_units, public.role_assignments, public.events, public.event_registrations,
  public.announcements, public.support_requests, public.notification_outbox, public.audit_logs,
  public.data_requests, public.membership_counters FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, first_name, last_name, middle_name, date_of_birth, gender,
  photo_url, avatar_url, state_of_origin, state_of_residence, lga_of_residence, ward,
  address, institution_type, institution_name, course_of_study, graduation_year)
  ON public.profiles TO authenticated;
GRANT SELECT (id, profile_id, membership_number, status, state_code, org_unit_id,
  verified_at, created_at, updated_at) ON public.memberships TO authenticated;
GRANT SELECT (id, membership_id, card_version, status, issued_at, expires_at, revoked_at)
  ON public.id_cards TO authenticated;
GRANT SELECT ON public.consent_records, public.role_assignments TO authenticated;
GRANT SELECT ON public.organisational_units, public.events, public.announcements TO anon, authenticated;
GRANT SELECT ON public.event_registrations, public.support_requests, public.data_requests TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON TABLE public.profiles, public.memberships, public.id_cards, public.consent_records,
  public.organisational_units, public.role_assignments, public.events, public.event_registrations,
  public.announcements, public.support_requests, public.notification_outbox, public.audit_logs,
  public.data_requests, public.membership_counters TO service_role;

DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'memberships', 'id_cards', 'consent_records', 'organisational_units',
    'role_assignments', 'events', 'event_registrations', 'announcements',
    'support_requests', 'notification_outbox', 'audit_logs', 'data_requests', 'membership_counters'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_name);
  END LOOP;
END;
$$;

CREATE POLICY profile_owner_select ON public.profiles
  FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY profile_owner_update ON public.profiles
  FOR UPDATE TO authenticated USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY membership_authorized_read ON public.memberships
  FOR SELECT TO authenticated
  USING (private.can_view_membership(profile_id, org_unit_id, state_code));

CREATE POLICY id_card_owner_read ON public.id_cards
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.memberships AS membership
    WHERE membership.id = id_cards.membership_id
      AND membership.profile_id = (SELECT auth.uid())
  ));

CREATE POLICY consent_owner_read ON public.consent_records
  FOR SELECT TO authenticated
  USING (profile_id = (SELECT auth.uid())
    OR private.user_has_role(ARRAY['data_protection_officer']::public.user_role[]));

CREATE POLICY organisational_units_public_read ON public.organisational_units
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY role_assignment_owner_read ON public.role_assignments
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid())
    OR private.user_has_role(ARRAY['super_admin']::public.user_role[]));

CREATE POLICY published_events_read ON public.events
  FOR SELECT TO anon, authenticated USING (is_published = TRUE);
CREATE POLICY published_announcements_read ON public.announcements
  FOR SELECT TO anon, authenticated USING (is_published = TRUE);

CREATE POLICY event_registration_owner_read ON public.event_registrations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.memberships AS membership
    WHERE membership.id = event_registrations.membership_id
      AND membership.profile_id = (SELECT auth.uid())
  ));

CREATE POLICY support_request_member_read ON public.support_requests
  FOR SELECT TO authenticated
  USING (membership_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.memberships AS membership
    WHERE membership.id = support_requests.membership_id
      AND membership.profile_id = (SELECT auth.uid())
  ));

CREATE POLICY data_request_owner_read ON public.data_requests
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.memberships AS membership
    WHERE membership.id = data_requests.membership_id
      AND membership.profile_id = (SELECT auth.uid())
  ));

CREATE POLICY audit_privileged_read ON public.audit_logs
  FOR SELECT TO authenticated
  USING (private.user_has_role(ARRAY['super_admin', 'auditor', 'data_protection_officer']::public.user_role[]));

-- Only safe public-content status is directly visible. All writes and all
-- sensitive inserts/updates go through trusted server workflows.

-- Legacy seed announcements and events were fabricated. Keep the rows for
-- auditability, but do not expose them as published content.
UPDATE public.announcements SET is_published = FALSE, published_at = NULL
WHERE slug IN ('launch-of-central-digital-portal', 'national-youth-leadership-tech-summit');
UPDATE public.events SET is_published = FALSE
WHERE slug IN ('arewa-youth-leadership-summit-2026', 'buk-campus-civic-symposium');

COMMENT ON FUNCTION public.create_verified_membership(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN, TEXT, TEXT)
  IS 'Idempotently creates profile, membership number, consent receipt, and member role after confirmed email; service_role only.';
COMMENT ON TABLE public.membership_counters
  IS 'Private transactional sequence state. Never grant access to anon or authenticated roles.';
