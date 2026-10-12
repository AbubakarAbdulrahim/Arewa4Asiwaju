-- Phase 7: authenticated administration procedures.  All administrative
-- reads and writes stay behind SECURITY DEFINER functions which inspect the
-- caller's JWT and role assignments.  The application uses the anon key and
-- the signed-in user's session; it does not use the service-role key here.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS org_unit_id UUID REFERENCES public.organisational_units(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS events_org_unit_start_idx ON public.events (org_unit_id, start_date DESC);
CREATE INDEX IF NOT EXISTS memberships_created_idx
  ON public.memberships (created_at DESC, id);
CREATE INDEX IF NOT EXISTS profiles_full_name_search_idx
  ON public.profiles USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_email_search_idx
  ON public.profiles USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS support_requests_status_created_idx
  ON public.support_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx
  ON public.audit_logs (created_at DESC, id);

CREATE TABLE IF NOT EXISTS public.leadership_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (length(trim(full_name)) BETWEEN 2 AND 160),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 2 AND 160),
  biography TEXT NOT NULL DEFAULT '' CHECK (length(biography) <= 4000),
  photo_url TEXT,
  organisational_unit_id UUID REFERENCES public.organisational_units(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leadership_published_order_idx ON public.leadership_profiles(is_published, display_order, full_name);

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 2 AND 160),
  alt_text TEXT NOT NULL CHECK (length(trim(alt_text)) BETWEEN 3 AND 300),
  description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 1500),
  asset_url TEXT NOT NULL CHECK (length(asset_url) <= 1000),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image','video','document')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_assets_public_created_idx ON public.media_assets(is_published, created_at DESC);

ALTER TABLE public.leadership_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.leadership_profiles, public.media_assets FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.leadership_profiles, public.media_assets TO service_role;

CREATE OR REPLACE FUNCTION public.get_public_leadership()
RETURNS TABLE(id UUID,full_name TEXT,title TEXT,biography TEXT,photo_url TEXT,unit_name TEXT)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT person.id,person.full_name,person.title,person.biography,person.photo_url,unit.name
  FROM public.leadership_profiles person
  LEFT JOIN public.organisational_units unit ON unit.id=person.organisational_unit_id
  WHERE person.is_published=TRUE
  ORDER BY person.display_order,person.full_name;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_leadership()
RETURNS SETOF public.leadership_profiles
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','content_editor']::public.user_role[]) THEN RAISE EXCEPTION 'Not authorised to manage leadership profiles' USING ERRCODE='42501'; END IF;
  RETURN QUERY SELECT * FROM public.leadership_profiles ORDER BY display_order,full_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_leadership(
  p_id UUID,p_full_name TEXT,p_title TEXT,p_biography TEXT,p_photo_url TEXT,
  p_org_unit_id UUID,p_display_order INTEGER,p_is_published BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE saved_id UUID;
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','content_editor']::public.user_role[]) THEN RAISE EXCEPTION 'Not authorised to manage leadership profiles' USING ERRCODE='42501'; END IF;
  IF length(trim(p_full_name)) NOT BETWEEN 2 AND 160 OR length(trim(p_title)) NOT BETWEEN 2 AND 160
     OR length(COALESCE(p_biography,''))>4000 OR length(COALESCE(p_photo_url,''))>1000 OR p_display_order NOT BETWEEN 0 AND 10000 THEN
    RAISE EXCEPTION 'Leadership profile details are invalid' USING ERRCODE='22023';
  END IF;
  IF p_id IS NULL THEN
    INSERT INTO public.leadership_profiles(full_name,title,biography,photo_url,organisational_unit_id,display_order,is_published)
    VALUES(trim(p_full_name),trim(p_title),trim(COALESCE(p_biography,'')),NULLIF(trim(p_photo_url),''),p_org_unit_id,p_display_order,p_is_published) RETURNING id INTO saved_id;
  ELSE
    UPDATE public.leadership_profiles SET full_name=trim(p_full_name),title=trim(p_title),biography=trim(COALESCE(p_biography,'')),
      photo_url=NULLIF(trim(p_photo_url),''),organisational_unit_id=p_org_unit_id,display_order=p_display_order,
      is_published=p_is_published,updated_at=now() WHERE id=p_id RETURNING id INTO saved_id;
    IF saved_id IS NULL THEN RAISE EXCEPTION 'Leadership profile not found' USING ERRCODE='P0002'; END IF;
  END IF;
  INSERT INTO public.audit_logs(actor_id,action,target_type,target_id,details)
  VALUES((SELECT auth.uid()),CASE WHEN p_id IS NULL THEN 'leadership.created' ELSE 'leadership.updated' END,'leadership_profile',saved_id::text,jsonb_build_object('title',trim(p_title),'is_published',p_is_published));
  RETURN saved_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_media()
RETURNS SETOF public.media_assets
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','content_editor']::public.user_role[]) THEN RAISE EXCEPTION 'Not authorised to manage media' USING ERRCODE='42501'; END IF;
  RETURN QUERY SELECT * FROM public.media_assets ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_media(
  p_id UUID,p_title TEXT,p_alt_text TEXT,p_description TEXT,p_asset_url TEXT,p_asset_type TEXT,p_is_published BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE saved_id UUID;
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','content_editor']::public.user_role[]) THEN RAISE EXCEPTION 'Not authorised to manage media' USING ERRCODE='42501'; END IF;
  IF length(trim(p_title)) NOT BETWEEN 2 AND 160 OR length(trim(p_alt_text)) NOT BETWEEN 3 AND 300
     OR length(COALESCE(p_description,''))>1500 OR length(trim(p_asset_url))>1000
     OR p_asset_type NOT IN ('image','video','document') OR p_asset_url !~ '^https://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'Media details are invalid' USING ERRCODE='22023';
  END IF;
  IF p_id IS NULL THEN
    INSERT INTO public.media_assets(title,alt_text,description,asset_url,asset_type,is_published,created_by)
    VALUES(trim(p_title),trim(p_alt_text),trim(COALESCE(p_description,'')),trim(p_asset_url),p_asset_type,p_is_published,(SELECT auth.uid())) RETURNING id INTO saved_id;
  ELSE
    UPDATE public.media_assets SET title=trim(p_title),alt_text=trim(p_alt_text),description=trim(COALESCE(p_description,'')),asset_url=trim(p_asset_url),asset_type=p_asset_type,is_published=p_is_published,updated_at=now()
      WHERE id=p_id RETURNING id INTO saved_id;
    IF saved_id IS NULL THEN RAISE EXCEPTION 'Media record not found' USING ERRCODE='P0002'; END IF;
  END IF;
  INSERT INTO public.audit_logs(actor_id,action,target_type,target_id,details)
  VALUES((SELECT auth.uid()),CASE WHEN p_id IS NULL THEN 'media.created' ELSE 'media.updated' END,'media_asset',saved_id::text,jsonb_build_object('asset_type',p_asset_type,'is_published',p_is_published));
  RETURN saved_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_media()
RETURNS TABLE(id UUID,title TEXT,alt_text TEXT,description TEXT,asset_url TEXT,asset_type TEXT,created_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id,title,alt_text,description,asset_url,asset_type,created_at FROM public.media_assets WHERE is_published=TRUE ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_event_attendance(p_event_id UUID,p_page INTEGER DEFAULT 1,p_page_size INTEGER DEFAULT 50)
RETURNS TABLE(total_count BIGINT,items JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  event_scope UUID;
  page_num INTEGER := GREATEST(COALESCE(p_page,1),1);
  page_size INTEGER := LEAST(GREATEST(COALESCE(p_page_size,50),1),100);
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','event_manager','state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[]) THEN RAISE EXCEPTION 'Not authorised to view attendance' USING ERRCODE='42501'; END IF;
  SELECT COALESCE(event.org_unit_id,(SELECT unit.id FROM public.organisational_units unit WHERE unit.type='state' AND unit.state_code=event.state_code LIMIT 1))
    INTO event_scope FROM public.events event WHERE event.id=p_event_id;
  IF NOT FOUND THEN RETURN; END IF;
  IF NOT private.admin_has_any_role(ARRAY['super_admin','event_manager']::public.user_role[])
     AND NOT private.user_has_role_in_scope(ARRAY['state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[],event_scope) THEN RAISE EXCEPTION 'Event is outside your assigned scope' USING ERRCODE='42501'; END IF;
  RETURN QUERY WITH filtered AS (
    SELECT registration.id AS registration_id,membership.membership_number,profile.full_name AS member_name,
      registration.registered_at,registration.attended,registration.attended_at
    FROM public.event_registrations registration JOIN public.memberships membership ON membership.id=registration.membership_id
    JOIN public.profiles profile ON profile.id=membership.profile_id WHERE registration.event_id=p_event_id
  ), paged AS (SELECT * FROM filtered ORDER BY registered_at,id LIMIT page_size OFFSET (page_num-1)*page_size)
  SELECT (SELECT count(*) FROM filtered),COALESCE((SELECT jsonb_agg(to_jsonb(paged) ORDER BY registered_at,id) FROM paged),'[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION private.admin_has_any_role(p_roles public.user_role[])
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE((SELECT auth.jwt() ->> 'aal') = 'aal2',FALSE) AND EXISTS (
    SELECT 1 FROM public.role_assignments AS assignment
    WHERE assignment.user_id = (SELECT auth.uid())
      AND assignment.role = ANY (p_roles)
  );
$$;

CREATE OR REPLACE FUNCTION private.admin_session_is_strong()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE((SELECT auth.jwt() ->> 'aal') = 'aal2',FALSE);
$$;

-- Keep the Phase 3 ownership helpers available to ordinary members. MFA is
-- enforced for privileged admin procedures and scoped membership reads below,
-- while a member can still access their own portal at AAL1.
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
    OR (private.admin_session_is_strong() AND (
      private.user_has_role(ARRAY['super_admin', 'membership_officer']::public.user_role[])
      OR private.user_has_role_in_scope(
        ARRAY['state_coordinator', 'lga_coordinator', 'chapter_coordinator']::public.user_role[],
        COALESCE(
          p_unit_id,
          (SELECT unit.id FROM public.organisational_units AS unit
           WHERE unit.type = 'state' AND unit.state_code = p_state_code LIMIT 1)
        )
      )
    ));
$$;

CREATE OR REPLACE FUNCTION private.require_admin_mfa_for_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF COALESCE(auth.role(),'')='authenticated' AND NOT private.admin_session_is_strong() THEN
    RAISE EXCEPTION 'AAL2 authentication is required for role changes' USING ERRCODE='42501';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS role_assignment_admin_mfa_guard ON public.role_assignments;
CREATE TRIGGER role_assignment_admin_mfa_guard
BEFORE INSERT OR DELETE ON public.role_assignments
FOR EACH ROW EXECUTE FUNCTION private.require_admin_mfa_for_role_changes();

CREATE OR REPLACE FUNCTION public.admin_search_members(
  p_query TEXT DEFAULT NULL,
  p_status public.membership_status DEFAULT NULL,
  p_state_code TEXT DEFAULT NULL,
  p_org_unit_id UUID DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 25
)
RETURNS TABLE(total_count BIGINT, members JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_page INTEGER := GREATEST(COALESCE(p_page, 1), 1);
  page_size INTEGER := LEAST(GREATEST(COALESCE(p_page_size, 25), 1), 100);
  search_term TEXT := NULLIF(trim(p_query), '');
  caller_can_view_contact BOOLEAN := private.admin_has_any_role(ARRAY['super_admin','membership_officer']::public.user_role[]);
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','membership_officer','state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to search membership records' USING ERRCODE = '42501';
  END IF;
  IF length(COALESCE(search_term, '')) > 120 THEN
    RAISE EXCEPTION 'Search query is too long' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
  WITH filtered AS (
    SELECT membership.id, membership.profile_id, membership.membership_number,
      membership.status, membership.state_code, membership.org_unit_id,
      membership.created_at, profile.full_name, profile.email, profile.phone,
      unit.name AS unit_name
    FROM public.memberships AS membership
    JOIN public.profiles AS profile ON profile.id = membership.profile_id
    LEFT JOIN public.organisational_units AS unit ON unit.id = membership.org_unit_id
    WHERE private.can_view_membership(membership.profile_id, membership.org_unit_id, membership.state_code)
      AND (p_status IS NULL OR membership.status = p_status)
      AND (p_state_code IS NULL OR membership.state_code = upper(trim(p_state_code)))
      AND (p_org_unit_id IS NULL OR private.user_has_role_in_scope(
        ARRAY['super_admin','membership_officer','state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[],
        membership.org_unit_id
      ) AND membership.org_unit_id = p_org_unit_id)
      AND (search_term IS NULL OR membership.membership_number ILIKE '%' || search_term || '%'
        OR profile.full_name ILIKE '%' || search_term || '%'
        OR (caller_can_view_contact AND (profile.email ILIKE '%' || search_term || '%' OR profile.phone ILIKE '%' || search_term || '%')))
  ), paged AS (
    SELECT * FROM filtered ORDER BY created_at DESC, id LIMIT page_size OFFSET (current_page - 1) * page_size
  )
  SELECT (SELECT count(*) FROM filtered),
    COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'id', id, 'profile_id', profile_id, 'membership_number', membership_number,
      'status', status, 'state_code', state_code, 'org_unit_id', org_unit_id,
      'created_at', created_at, 'full_name', full_name,
      'email', CASE WHEN caller_can_view_contact THEN email ELSE NULL END,
      'phone', CASE WHEN caller_can_view_contact THEN phone ELSE NULL END,
      'org_unit_name', unit_name
    ) ORDER BY created_at DESC, id) FROM paged), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_membership_status(p_membership_id UUID, p_status public.membership_status)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE target public.memberships%ROWTYPE;
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','membership_officer']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to change membership status' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO target FROM public.memberships WHERE id = p_membership_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF target.profile_id = (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Administrators cannot change their own membership status' USING ERRCODE = '42501';
  END IF;
  IF target.status = p_status THEN RETURN TRUE; END IF;
  UPDATE public.memberships SET status = p_status, updated_at = now() WHERE id = target.id;
  INSERT INTO public.audit_logs(actor_id, action, target_type, target_id, details)
  VALUES ((SELECT auth.uid()), 'membership.status_changed', 'membership', target.id::text,
    jsonb_build_object('previous_status', target.status, 'new_status', p_status));
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_org_unit(
  p_id UUID, p_name TEXT, p_code TEXT, p_type public.org_unit_type,
  p_parent_id UUID, p_state_code TEXT, p_lga_name TEXT, p_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE saved_id UUID;
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin']::public.user_role[]) THEN
    RAISE EXCEPTION 'Only a super administrator can manage organisational units' USING ERRCODE = '42501';
  END IF;
  IF length(trim(p_name)) NOT BETWEEN 2 AND 160 OR length(trim(p_code)) NOT BETWEEN 2 AND 50
     OR length(COALESCE(p_description, '')) > 2000 OR length(COALESCE(p_lga_name, '')) > 100 THEN
    RAISE EXCEPTION 'Organisational unit details are invalid' USING ERRCODE = '22023';
  END IF;
  IF p_id IS NULL THEN
    INSERT INTO public.organisational_units(name, code, type, parent_id, state_code, lga_name, description)
    VALUES (trim(p_name), upper(trim(p_code)), p_type, p_parent_id, upper(NULLIF(trim(p_state_code), '')), NULLIF(trim(p_lga_name), ''), NULLIF(trim(p_description), ''))
    RETURNING id INTO saved_id;
  ELSE
    UPDATE public.organisational_units SET name=trim(p_name), code=upper(trim(p_code)), type=p_type,
      parent_id=p_parent_id, state_code=upper(NULLIF(trim(p_state_code), '')),
      lga_name=NULLIF(trim(p_lga_name), ''), description=NULLIF(trim(p_description), '')
      WHERE id=p_id RETURNING id INTO saved_id;
    IF saved_id IS NULL THEN RAISE EXCEPTION 'Organisational unit not found' USING ERRCODE = 'P0002'; END IF;
  END IF;
  INSERT INTO public.audit_logs(actor_id, action, target_type, target_id, details)
  VALUES ((SELECT auth.uid()), CASE WHEN p_id IS NULL THEN 'org_unit.created' ELSE 'org_unit.updated' END,
    'organisational_unit', saved_id::text, jsonb_build_object('name', trim(p_name), 'code', upper(trim(p_code)), 'type', p_type));
  RETURN saved_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_event(
  p_id UUID, p_title TEXT, p_slug TEXT, p_description TEXT, p_category TEXT,
  p_venue TEXT, p_state_code TEXT, p_lga_name TEXT, p_is_virtual BOOLEAN,
  p_virtual_link TEXT, p_start_date TIMESTAMPTZ, p_end_date TIMESTAMPTZ,
  p_capacity INTEGER, p_is_published BOOLEAN, p_org_unit_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  saved_id UUID;
  existing_scope UUID;
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','event_manager','state_coordinator']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to manage events' USING ERRCODE = '42501';
  END IF;
  IF length(trim(p_title)) NOT BETWEEN 3 AND 200 OR p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
     OR length(trim(p_description)) NOT BETWEEN 10 AND 12000 OR length(trim(p_venue)) NOT BETWEEN 2 AND 300
     OR p_start_date >= p_end_date OR p_start_date < now() - interval '1 day'
     OR (p_capacity IS NOT NULL AND p_capacity < 1)
     OR p_category NOT IN ('rally','symposium','training','outreach','meeting')
     OR (p_is_virtual AND NULLIF(trim(p_virtual_link), '') IS NULL) THEN
    RAISE EXCEPTION 'Event details are invalid' USING ERRCODE = '22023';
  END IF;
  IF NOT private.admin_has_any_role(ARRAY['super_admin','event_manager']::public.user_role[]) THEN
    IF p_org_unit_id IS NULL OR NOT private.user_has_role_in_scope(ARRAY['state_coordinator']::public.user_role[], p_org_unit_id) THEN
      RAISE EXCEPTION 'Event is outside your assigned scope' USING ERRCODE = '42501';
    END IF;
  END IF;
  IF p_org_unit_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.organisational_units unit
    WHERE unit.id=p_org_unit_id AND (unit.state_code IS NULL OR unit.state_code=upper(trim(p_state_code)))
  ) THEN
    RAISE EXCEPTION 'Event organisational scope does not match its state' USING ERRCODE = '23514';
  END IF;
  IF p_id IS NULL THEN
    INSERT INTO public.events(title,slug,description,category,venue,state_code,lga_name,is_virtual,virtual_link,start_date,end_date,capacity,is_published,created_by,org_unit_id)
    VALUES (trim(p_title),p_slug,trim(p_description),p_category,trim(p_venue),upper(trim(p_state_code)),NULLIF(trim(p_lga_name),''),p_is_virtual,NULLIF(trim(p_virtual_link),''),p_start_date,p_end_date,p_capacity,p_is_published,(SELECT auth.uid()),p_org_unit_id)
    RETURNING id INTO saved_id;
  ELSE
    SELECT COALESCE(event.org_unit_id,(SELECT unit.id FROM public.organisational_units unit WHERE unit.type='state' AND unit.state_code=event.state_code LIMIT 1))
      INTO existing_scope FROM public.events event WHERE event.id=p_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Event not found' USING ERRCODE = 'P0002'; END IF;
    IF NOT private.admin_has_any_role(ARRAY['super_admin','event_manager']::public.user_role[])
       AND NOT private.user_has_role_in_scope(ARRAY['state_coordinator']::public.user_role[], existing_scope) THEN
      RAISE EXCEPTION 'Event is outside your assigned scope' USING ERRCODE = '42501';
    END IF;
    IF NOT private.admin_has_any_role(ARRAY['super_admin','event_manager']::public.user_role[])
       AND NOT private.user_has_role_in_scope(ARRAY['state_coordinator']::public.user_role[], p_org_unit_id) THEN
      RAISE EXCEPTION 'New event scope is outside your assignment' USING ERRCODE = '42501';
    END IF;
    UPDATE public.events SET title=trim(p_title),slug=p_slug,description=trim(p_description),category=p_category,
      venue=trim(p_venue),state_code=upper(trim(p_state_code)),lga_name=NULLIF(trim(p_lga_name),''),
      is_virtual=p_is_virtual,virtual_link=NULLIF(trim(p_virtual_link),''),start_date=p_start_date,end_date=p_end_date,
      capacity=p_capacity,is_published=p_is_published,org_unit_id=p_org_unit_id,updated_at=now()
      WHERE id=p_id RETURNING id INTO saved_id;
  END IF;
  INSERT INTO public.audit_logs(actor_id,action,target_type,target_id,details)
  VALUES ((SELECT auth.uid()),CASE WHEN p_id IS NULL THEN 'event.created' ELSE 'event.updated' END,
    'event',saved_id::text,jsonb_build_object('is_published',p_is_published,'org_unit_id',p_org_unit_id));
  RETURN saved_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_attendance(p_registration_id UUID, p_attended BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE event_scope UUID;
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','event_manager','state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to manage attendance' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(event.org_unit_id,(SELECT unit.id FROM public.organisational_units unit WHERE unit.type='state' AND unit.state_code=event.state_code LIMIT 1)) INTO event_scope
  FROM public.event_registrations registration JOIN public.events event ON event.id=registration.event_id
  WHERE registration.id=p_registration_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF NOT private.admin_has_any_role(ARRAY['super_admin','event_manager']::public.user_role[])
     AND NOT private.user_has_role_in_scope(ARRAY['state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[], event_scope) THEN
    RAISE EXCEPTION 'Event is outside your assigned scope' USING ERRCODE = '42501';
  END IF;
  UPDATE public.event_registrations SET attended=p_attended, attended_at=CASE WHEN p_attended THEN now() ELSE NULL END WHERE id=p_registration_id;
  INSERT INTO public.audit_logs(actor_id,action,target_type,target_id,details)
  VALUES ((SELECT auth.uid()),'event.attendance_changed','event_registration',p_registration_id::text,jsonb_build_object('attended',p_attended));
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_announcement(
  p_id UUID, p_title TEXT, p_slug TEXT, p_excerpt TEXT, p_content TEXT,
  p_category TEXT, p_cover_image TEXT, p_is_published BOOLEAN, p_author_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE saved_id UUID;
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','content_editor']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to manage public content' USING ERRCODE = '42501';
  END IF;
  IF length(trim(p_title)) NOT BETWEEN 3 AND 200 OR p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
     OR length(trim(p_excerpt)) NOT BETWEEN 5 AND 500 OR length(trim(p_content)) NOT BETWEEN 10 AND 30000
     OR p_category NOT IN ('announcement','press_release','campaign','editorial')
     OR length(trim(p_author_name)) NOT BETWEEN 2 AND 150
     OR length(COALESCE(p_cover_image,'')) > 1000 THEN
    RAISE EXCEPTION 'Article details are invalid' USING ERRCODE = '22023';
  END IF;
  IF p_id IS NULL THEN
    INSERT INTO public.announcements(title,slug,excerpt,content,category,cover_image,is_published,published_at,author_name)
    VALUES (trim(p_title),p_slug,trim(p_excerpt),trim(p_content),p_category,NULLIF(trim(p_cover_image),''),p_is_published,CASE WHEN p_is_published THEN now() END,trim(p_author_name))
    RETURNING id INTO saved_id;
  ELSE
    UPDATE public.announcements SET title=trim(p_title),slug=p_slug,excerpt=trim(p_excerpt),content=trim(p_content),
      category=p_category,cover_image=NULLIF(trim(p_cover_image),''),is_published=p_is_published,
      published_at=CASE WHEN p_is_published THEN COALESCE(published_at,now()) ELSE NULL END,
      author_name=trim(p_author_name),updated_at=now()
      WHERE id=p_id RETURNING id INTO saved_id;
    IF saved_id IS NULL THEN RAISE EXCEPTION 'Article not found' USING ERRCODE = 'P0002'; END IF;
  END IF;
  INSERT INTO public.audit_logs(actor_id,action,target_type,target_id,details)
  VALUES ((SELECT auth.uid()),CASE WHEN p_id IS NULL THEN 'content.created' ELSE 'content.updated' END,
    'announcement',saved_id::text,jsonb_build_object('is_published',p_is_published,'category',p_category));
  RETURN saved_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_support_request(p_request_id UUID, p_status TEXT, p_response TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE old_status TEXT;
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','membership_officer']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to manage support requests' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('open','in_progress','resolved','closed') OR length(COALESCE(p_response,'')) > 4000 THEN
    RAISE EXCEPTION 'Support response is invalid' USING ERRCODE = '22023';
  END IF;
  SELECT status INTO old_status FROM public.support_requests WHERE id=p_request_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  UPDATE public.support_requests SET status=p_status,response=NULLIF(trim(p_response),''),
    responded_by=(SELECT auth.uid()),responded_at=now() WHERE id=p_request_id;
  INSERT INTO public.audit_logs(actor_id,action,target_type,target_id,details)
  VALUES ((SELECT auth.uid()),'support_request.updated','support_request',p_request_id::text,
    jsonb_build_object('previous_status',old_status,'new_status',p_status));
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE result JSONB;
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','membership_officer','state_coordinator','lga_coordinator','chapter_coordinator','event_manager','content_editor','auditor','data_protection_officer']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to view administration reports' USING ERRCODE = '42501';
  END IF;
  SELECT jsonb_build_object(
    'members', (SELECT count(*) FROM public.memberships membership WHERE private.can_view_membership(membership.profile_id,membership.org_unit_id,membership.state_code)),
    'active_members', (SELECT count(*) FROM public.memberships membership WHERE membership.status='active' AND private.can_view_membership(membership.profile_id,membership.org_unit_id,membership.state_code)),
    'pending_members', (SELECT count(*) FROM public.memberships membership WHERE membership.status='pending_verification' AND private.can_view_membership(membership.profile_id,membership.org_unit_id,membership.state_code)),
    'events', (SELECT count(*) FROM public.events event WHERE event.start_date >= now() AND (private.admin_has_any_role(ARRAY['super_admin','event_manager']::public.user_role[]) OR private.user_has_role_in_scope(ARRAY['state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[],COALESCE(event.org_unit_id,(SELECT unit.id FROM public.organisational_units unit WHERE unit.type='state' AND unit.state_code=event.state_code LIMIT 1))))),
    'open_support', CASE WHEN private.admin_has_any_role(ARRAY['super_admin','membership_officer']::public.user_role[]) THEN (SELECT count(*) FROM public.support_requests WHERE status IN ('open','in_progress')) ELSE NULL END,
    'units', CASE WHEN private.admin_has_any_role(ARRAY['super_admin']::public.user_role[]) THEN (SELECT count(*) FROM public.organisational_units) ELSE NULL END
  ) INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_units()
RETURNS SETOF public.organisational_units
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to view organisational units' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT unit.* FROM public.organisational_units unit
    WHERE private.admin_has_any_role(ARRAY['super_admin']::public.user_role[])
       OR unit.id IN (SELECT assignment.org_unit_id FROM public.role_assignments assignment WHERE assignment.user_id=(SELECT auth.uid()))
       OR private.user_has_role_in_scope(ARRAY['state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[], unit.id)
    ORDER BY unit.type, unit.name;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_events(p_page INTEGER DEFAULT 1, p_page_size INTEGER DEFAULT 25)
RETURNS TABLE(total_count BIGINT, items JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  page_num INTEGER := GREATEST(COALESCE(p_page,1),1);
  page_size INTEGER := LEAST(GREATEST(COALESCE(p_page_size,25),1),100);
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','event_manager','state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to view event management' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY WITH filtered AS (
    SELECT event.* FROM public.events event
    WHERE private.admin_has_any_role(ARRAY['super_admin','event_manager']::public.user_role[])
       OR private.user_has_role_in_scope(ARRAY['state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[],COALESCE(event.org_unit_id,(SELECT unit.id FROM public.organisational_units unit WHERE unit.type='state' AND unit.state_code=event.state_code LIMIT 1)))
  ), paged AS (SELECT * FROM filtered ORDER BY start_date DESC,id LIMIT page_size OFFSET (page_num-1)*page_size)
  SELECT (SELECT count(*) FROM filtered), COALESCE((SELECT jsonb_agg(to_jsonb(paged) ORDER BY start_date DESC,id) FROM paged),'[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_content(p_page INTEGER DEFAULT 1, p_page_size INTEGER DEFAULT 25)
RETURNS TABLE(total_count BIGINT, items JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  page_num INTEGER := GREATEST(COALESCE(p_page,1),1);
  page_size INTEGER := LEAST(GREATEST(COALESCE(p_page_size,25),1),100);
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','content_editor']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to view content management' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY WITH paged AS (
    SELECT * FROM public.announcements ORDER BY updated_at DESC,id LIMIT page_size OFFSET (page_num-1)*page_size
  ) SELECT (SELECT count(*) FROM public.announcements),COALESCE((SELECT jsonb_agg(to_jsonb(paged) ORDER BY updated_at DESC,id) FROM paged),'[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_support(p_status TEXT DEFAULT NULL, p_page INTEGER DEFAULT 1, p_page_size INTEGER DEFAULT 25)
RETURNS TABLE(total_count BIGINT, items JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  page_num INTEGER := GREATEST(COALESCE(p_page,1),1);
  page_size INTEGER := LEAST(GREATEST(COALESCE(p_page_size,25),1),100);
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','membership_officer']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to view support requests' USING ERRCODE = '42501';
  END IF;
  IF p_status IS NOT NULL AND p_status NOT IN ('open','in_progress','resolved','closed') THEN RAISE EXCEPTION 'Invalid status filter' USING ERRCODE='22023'; END IF;
  RETURN QUERY WITH filtered AS (SELECT * FROM public.support_requests WHERE p_status IS NULL OR status=p_status),
    paged AS (SELECT * FROM filtered ORDER BY created_at DESC,id LIMIT page_size OFFSET (page_num-1)*page_size)
  SELECT (SELECT count(*) FROM filtered),COALESCE((SELECT jsonb_agg(to_jsonb(paged) ORDER BY created_at DESC,id) FROM paged),'[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_audit(p_page INTEGER DEFAULT 1, p_page_size INTEGER DEFAULT 50)
RETURNS TABLE(total_count BIGINT, items JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  page_num INTEGER := GREATEST(COALESCE(p_page,1),1);
  page_size INTEGER := LEAST(GREATEST(COALESCE(p_page_size,50),1),100);
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','auditor','data_protection_officer']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to view audit records' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY WITH paged AS (SELECT * FROM public.audit_logs ORDER BY created_at DESC,id LIMIT page_size OFFSET (page_num-1)*page_size)
  SELECT (SELECT count(*) FROM public.audit_logs),COALESCE((SELECT jsonb_agg(to_jsonb(paged) ORDER BY created_at DESC,id) FROM paged),'[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_log_member_export(
  p_row_count INTEGER, p_purpose TEXT,
  p_status public.membership_status DEFAULT NULL, p_state_code TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','membership_officer']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to export membership records' USING ERRCODE = '42501';
  END IF;
  IF p_row_count NOT BETWEEN 0 AND 5000 OR length(trim(p_purpose)) NOT BETWEEN 12 AND 500 THEN
    RAISE EXCEPTION 'Export purpose or size is invalid' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.audit_logs(actor_id,action,target_type,target_id,details)
  VALUES ((SELECT auth.uid()),'membership.exported','membership','filtered_export',
    jsonb_build_object('row_count',p_row_count,'purpose',trim(p_purpose),'status_filter',p_status,'state_filter',upper(NULLIF(trim(p_state_code),''))));
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION private.admin_has_any_role(public.user_role[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.admin_session_is_strong() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_search_members(TEXT, public.membership_status, TEXT, UUID, INTEGER, INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_membership_status(UUID, public.membership_status) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_save_org_unit(UUID,TEXT,TEXT,public.org_unit_type,UUID,TEXT,TEXT,TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_save_event(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,BOOLEAN,TEXT,TIMESTAMPTZ,TIMESTAMPTZ,INTEGER,BOOLEAN,UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_attendance(UUID,BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_save_announcement(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,BOOLEAN,TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_support_request(UUID,TEXT,TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_overview() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_leadership() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_save_leadership(UUID,TEXT,TEXT,TEXT,TEXT,UUID,INTEGER,BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_media() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_save_media(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_event_attendance(UUID,INTEGER,INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_public_leadership() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_media() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_units() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_events(INTEGER,INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_content(INTEGER,INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_support(TEXT,INTEGER,INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_audit(INTEGER,INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_log_member_export(INTEGER,TEXT,public.membership_status,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_search_members(TEXT, public.membership_status, TEXT, UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_membership_status(UUID, public.membership_status) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_org_unit(UUID,TEXT,TEXT,public.org_unit_type,UUID,TEXT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_event(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,BOOLEAN,TEXT,TIMESTAMPTZ,TIMESTAMPTZ,INTEGER,BOOLEAN,UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_attendance(UUID,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_announcement(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,BOOLEAN,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_support_request(UUID,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_leadership() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_leadership(UUID,TEXT,TEXT,TEXT,TEXT,UUID,INTEGER,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_media() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_media(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_event_attendance(UUID,INTEGER,INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_leadership() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_media() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_units() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_events(INTEGER,INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_content(INTEGER,INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_support(TEXT,INTEGER,INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_audit(INTEGER,INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_log_member_export(INTEGER,TEXT,public.membership_status,TEXT) TO authenticated;

COMMENT ON FUNCTION public.admin_search_members(TEXT, public.membership_status, TEXT, UUID, INTEGER, INTEGER)
  IS 'Scoped, permission-checked, server-side member search with capped pagination and contact-field minimisation.';
