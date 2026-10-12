-- Phase 8: notifications, aggregate reporting, privacy operations, and retention.
-- Local pgTAP verification is complete; the linked staging project remains pending.

ALTER TABLE public.notification_outbox
  ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS provider_message_id TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS notification_outbox_claim_idx
  ON public.notification_outbox (status, next_attempt_at, created_at);
CREATE INDEX IF NOT EXISTS data_requests_status_created_idx
  ON public.data_requests (status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  body TEXT NOT NULL CHECK (length(trim(body)) BETWEEN 1 AND 4000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS in_app_notifications_profile_created_idx
  ON public.in_app_notifications(profile_id, created_at DESC);
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notifications FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.in_app_notifications FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.in_app_notifications TO authenticated;
GRANT UPDATE (read_at) ON public.in_app_notifications TO authenticated;
GRANT ALL ON public.in_app_notifications TO service_role;
CREATE POLICY in_app_notifications_owner ON public.in_app_notifications
  FOR SELECT TO authenticated USING (profile_id=(SELECT auth.uid()));
CREATE POLICY in_app_notifications_mark_read ON public.in_app_notifications
  FOR UPDATE TO authenticated USING (profile_id=(SELECT auth.uid()))
  WITH CHECK (profile_id=(SELECT auth.uid()));

CREATE OR REPLACE FUNCTION private.notify_member_event_registration()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE member_profile_id UUID; event_title TEXT;
BEGIN
  SELECT membership.profile_id,event.title INTO member_profile_id,event_title
  FROM public.memberships membership JOIN public.events event ON event.id=NEW.event_id
  WHERE membership.id=NEW.membership_id;
  IF member_profile_id IS NOT NULL THEN
    INSERT INTO public.in_app_notifications(profile_id,title,body)
    VALUES(member_profile_id,'Event registration confirmed','Your registration for '||event_title||' is confirmed.');
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.notify_member_event_registration() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER event_registration_in_app_notification
AFTER INSERT ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION private.notify_member_event_registration();

CREATE OR REPLACE FUNCTION public.claim_notification_outbox(p_limit INTEGER DEFAULT 25)
RETURNS SETOF public.notification_outbox
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF COALESCE(auth.role(),'') <> 'service_role' THEN
    RAISE EXCEPTION 'Service role required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  WITH candidates AS (
    SELECT item.id FROM public.notification_outbox item
    WHERE item.status IN ('pending','retrying')
      AND item.next_attempt_at <= now()
      AND item.attempts < 5
    ORDER BY item.created_at, item.id
    FOR UPDATE SKIP LOCKED
    LIMIT LEAST(GREATEST(COALESCE(p_limit,25),1),100)
  )
  UPDATE public.notification_outbox item
  SET status='retrying', attempts=item.attempts+1, next_attempt_at=now()+interval '15 minutes'
  FROM candidates
  WHERE item.id=candidates.id
  RETURNING item.*;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_notification_delivery(
  p_id UUID, p_success BOOLEAN, p_provider_message_id TEXT DEFAULT NULL, p_error TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF COALESCE(auth.role(),'') <> 'service_role' THEN
    RAISE EXCEPTION 'Service role required' USING ERRCODE = '42501';
  END IF;
  UPDATE public.notification_outbox
  SET status=CASE WHEN p_success THEN 'sent' ELSE CASE WHEN attempts >= 5 THEN 'failed' ELSE 'retrying' END END,
      provider_message_id=NULLIF(trim(p_provider_message_id),''),
      last_error=CASE WHEN p_success THEN NULL ELSE left(NULLIF(trim(p_error),''),1000) END,
      sent_at=CASE WHEN p_success THEN now() ELSE sent_at END,
      delivered_at=CASE WHEN p_success THEN now() ELSE delivered_at END,
      next_attempt_at=CASE WHEN p_success OR attempts >= 5 THEN next_attempt_at ELSE now()+interval '15 minutes' END
  WHERE id=p_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reporting_summary()
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE result JSONB;
BEGIN
  IF NOT private.admin_has_any_role(ARRAY[
    'super_admin','membership_officer','state_coordinator','lga_coordinator',
    'chapter_coordinator','event_manager','auditor','data_protection_officer'
  ]::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to view reports' USING ERRCODE='42501';
  END IF;
  SELECT jsonb_build_object(
    'members_in_scope', (SELECT count(*) FROM public.memberships item WHERE private.can_view_membership(item.profile_id,item.org_unit_id,item.state_code)),
    'active_members_in_scope', (SELECT count(*) FROM public.memberships item WHERE item.status='active' AND private.can_view_membership(item.profile_id,item.org_unit_id,item.state_code)),
    'events_next_30_days', (
      SELECT count(*) FROM public.events item
      WHERE item.is_published AND item.start_date >= now() AND item.start_date < now()+interval '30 days'
        AND (private.admin_has_any_role(ARRAY['super_admin','event_manager']::public.user_role[])
          OR private.user_has_role_in_scope(ARRAY['state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[],COALESCE(item.org_unit_id,(SELECT unit.id FROM public.organisational_units unit WHERE unit.type='state' AND unit.state_code=item.state_code LIMIT 1))))
    ),
    'event_registrations_next_30_days', (
      SELECT count(*) FROM public.event_registrations registration
      JOIN public.events item ON item.id=registration.event_id
      WHERE item.is_published AND item.start_date >= now() AND item.start_date < now()+interval '30 days'
        AND (private.admin_has_any_role(ARRAY['super_admin','event_manager']::public.user_role[])
          OR private.user_has_role_in_scope(ARRAY['state_coordinator','lga_coordinator','chapter_coordinator']::public.user_role[],COALESCE(item.org_unit_id,(SELECT unit.id FROM public.organisational_units unit WHERE unit.type='state' AND unit.state_code=item.state_code LIMIT 1))))
    ),
    'privacy_open', CASE WHEN private.admin_has_any_role(ARRAY['super_admin','data_protection_officer']::public.user_role[]) THEN (SELECT count(*) FROM public.data_requests WHERE status IN ('pending','processing')) ELSE NULL END,
    'notifications_pending', CASE WHEN private.admin_has_any_role(ARRAY['super_admin']::public.user_role[]) THEN (SELECT count(*) FROM public.notification_outbox WHERE status IN ('pending','retrying')) ELSE NULL END,
    'notifications_failed', CASE WHEN private.admin_has_any_role(ARRAY['super_admin']::public.user_role[]) THEN (SELECT count(*) FROM public.notification_outbox WHERE status='failed') ELSE NULL END,
    'generated_at', now()
  ) INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_data_requests(
  p_status TEXT DEFAULT NULL, p_page INTEGER DEFAULT 1, p_page_size INTEGER DEFAULT 25
)
RETURNS TABLE(total_count BIGINT, items JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE page_num INTEGER := GREATEST(COALESCE(p_page,1),1); page_size INTEGER := LEAST(GREATEST(COALESCE(p_page_size,25),1),100);
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','data_protection_officer']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to view privacy requests' USING ERRCODE='42501';
  END IF;
  IF p_status IS NOT NULL AND p_status NOT IN ('pending','processing','completed','rejected') THEN
    RAISE EXCEPTION 'Invalid privacy request status' USING ERRCODE='22023';
  END IF;
  RETURN QUERY WITH filtered AS (
    SELECT request.id,request.request_type,request.status,request.details,request.created_at,request.completed_at,
      membership.membership_number,profile.full_name
    FROM public.data_requests request
    JOIN public.memberships membership ON membership.id=request.membership_id
    JOIN public.profiles profile ON profile.id=membership.profile_id
    WHERE p_status IS NULL OR request.status=p_status
  ), paged AS (SELECT * FROM filtered ORDER BY created_at DESC,id LIMIT page_size OFFSET (page_num-1)*page_size)
  SELECT (SELECT count(*) FROM filtered),COALESCE((SELECT jsonb_agg(to_jsonb(paged) ORDER BY created_at DESC,id) FROM paged),'[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_data_request(p_id UUID,p_status TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.admin_has_any_role(ARRAY['super_admin','data_protection_officer']::public.user_role[]) THEN
    RAISE EXCEPTION 'Not authorised to update privacy requests' USING ERRCODE='42501';
  END IF;
  IF p_status NOT IN ('processing','completed','rejected') THEN RAISE EXCEPTION 'Invalid privacy request status' USING ERRCODE='22023'; END IF;
  UPDATE public.data_requests SET status=p_status,completed_at=CASE WHEN p_status IN ('completed','rejected') THEN now() ELSE NULL END WHERE id=p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Privacy request not found' USING ERRCODE='P0002'; END IF;
  INSERT INTO public.audit_logs(actor_id,action,target_type,target_id,details)
  VALUES((SELECT auth.uid()),'privacy.request_status_changed','data_request',p_id::text,jsonb_build_object('status',p_status));
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_notification_retention(p_before TIMESTAMPTZ)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE removed INTEGER;
BEGIN
  IF COALESCE(auth.role(),'') <> 'service_role' THEN RAISE EXCEPTION 'Service role required' USING ERRCODE='42501'; END IF;
  IF p_before IS NULL OR p_before > now() THEN RAISE EXCEPTION 'Retention cutoff is invalid' USING ERRCODE='22023'; END IF;
  DELETE FROM public.notification_outbox WHERE status IN ('sent','failed') AND created_at < p_before;
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_notification_outbox(INTEGER) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.complete_notification_delivery(UUID,BOOLEAN,TEXT,TEXT) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.process_notification_retention(TIMESTAMPTZ) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.admin_reporting_summary() FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.admin_list_data_requests(TEXT,INTEGER,INTEGER) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.admin_update_data_request(UUID,TEXT) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.claim_notification_outbox(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_notification_delivery(UUID,BOOLEAN,TEXT,TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_notification_retention(TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_reporting_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_data_requests(TEXT,INTEGER,INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_data_request(UUID,TEXT) TO authenticated;
