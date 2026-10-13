-- Allow authorised administrators to save an event and its public flyer URL
-- atomically, using the existing scoped event-management workflow.
CREATE OR REPLACE FUNCTION public.admin_save_event_with_banner(
  p_id UUID,
  p_title TEXT,
  p_slug TEXT,
  p_description TEXT,
  p_category TEXT,
  p_venue TEXT,
  p_state_code TEXT,
  p_lga_name TEXT,
  p_is_virtual BOOLEAN,
  p_virtual_link TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_capacity INTEGER,
  p_is_published BOOLEAN,
  p_org_unit_id UUID,
  p_banner_url TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  saved_id UUID;
  normalized_banner_url TEXT := NULLIF(trim(p_banner_url), '');
BEGIN
  IF normalized_banner_url IS NOT NULL
     AND (length(normalized_banner_url) > 1000 OR normalized_banner_url !~ '^https://') THEN
    RAISE EXCEPTION 'Event flyer URL is invalid' USING ERRCODE = '22023';
  END IF;

  saved_id := public.admin_save_event(
    p_id,
    p_title,
    p_slug,
    p_description,
    p_category,
    p_venue,
    p_state_code,
    p_lga_name,
    p_is_virtual,
    p_virtual_link,
    p_start_date,
    p_end_date,
    p_capacity,
    p_is_published,
    p_org_unit_id
  );

  UPDATE public.events
  SET banner_url = normalized_banner_url, updated_at = now()
  WHERE id = saved_id;

  INSERT INTO public.audit_logs(actor_id, action, target_type, target_id, details)
  VALUES (
    (SELECT auth.uid()),
    'event.flyer_updated',
    'event',
    saved_id::text,
    jsonb_build_object('has_banner_url', normalized_banner_url IS NOT NULL)
  );

  RETURN saved_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_event_with_banner(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT,
  TIMESTAMPTZ, TIMESTAMPTZ, INTEGER, BOOLEAN, UUID, TEXT
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_save_event_with_banner(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT,
  TIMESTAMPTZ, TIMESTAMPTZ, INTEGER, BOOLEAN, UUID, TEXT
) TO authenticated;
