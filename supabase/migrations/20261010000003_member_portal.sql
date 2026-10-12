-- Phase 6: member self-service permissions and transactional actions.

CREATE TABLE public.notification_preferences (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_announcements BOOLEAN NOT NULL DEFAULT FALSE,
  email_event_reminders BOOLEAN NOT NULL DEFAULT FALSE,
  sms_announcements BOOLEAN NOT NULL DEFAULT FALSE,
  sms_event_reminders BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.notification_preferences FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
CREATE POLICY notification_preferences_owner ON public.notification_preferences
  FOR ALL TO authenticated
  USING (profile_id = (SELECT auth.uid()))
  WITH CHECK (profile_id = (SELECT auth.uid()));

-- A member can edit only the personal fields supported by the onboarding flow.
-- Email, auth identifiers, membership state, roles, and contact details remain locked.
REVOKE UPDATE ON public.profiles FROM authenticated;

CREATE FUNCTION private.sync_member_full_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.full_name := trim(concat_ws(' ', trim(NEW.first_name), nullif(trim(NEW.middle_name), ''), trim(NEW.last_name)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER sync_member_full_name
BEFORE UPDATE OF first_name, middle_name, last_name ON public.profiles
FOR EACH ROW EXECUTE FUNCTION private.sync_member_full_name();

CREATE FUNCTION private.audit_member_profile_update()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  changed_fields TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF NEW.first_name IS DISTINCT FROM OLD.first_name THEN changed_fields := array_append(changed_fields, 'first_name'); END IF;
  IF NEW.middle_name IS DISTINCT FROM OLD.middle_name THEN changed_fields := array_append(changed_fields, 'middle_name'); END IF;
  IF NEW.last_name IS DISTINCT FROM OLD.last_name THEN changed_fields := array_append(changed_fields, 'last_name'); END IF;
  IF NEW.state_of_residence IS DISTINCT FROM OLD.state_of_residence THEN changed_fields := array_append(changed_fields, 'state_of_residence'); END IF;
  IF NEW.lga_of_residence IS DISTINCT FROM OLD.lga_of_residence THEN changed_fields := array_append(changed_fields, 'lga_of_residence'); END IF;
  IF cardinality(changed_fields) > 0 THEN
    INSERT INTO public.audit_logs(actor_id, action, target_type, target_id, details)
    VALUES (auth.uid(), 'member.profile_updated', 'profile', OLD.id::TEXT,
      jsonb_build_object('changed_fields', changed_fields));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER audit_member_profile_update
AFTER UPDATE OF first_name, middle_name, last_name, state_of_residence, lga_of_residence
ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.audit_member_profile_update();

CREATE FUNCTION public.update_my_member_profile(
  p_first_name TEXT,
  p_middle_name TEXT,
  p_last_name TEXT,
  p_state_of_residence TEXT,
  p_lga_of_residence TEXT
)
RETURNS TABLE(membership_id UUID, new_card_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  old_profile public.profiles%ROWTYPE;
  member_record_id UUID;
  card_record_id UUID;
  next_card_version INTEGER;
  recent_profile_replacements INTEGER;
  content_changed BOOLEAN;
  has_active_card BOOLEAN;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Sign-in required' USING ERRCODE = '42501'; END IF;
  IF p_first_name IS NULL OR length(trim(p_first_name)) NOT BETWEEN 2 AND 100
     OR length(COALESCE(trim(p_middle_name), '')) > 100
     OR p_last_name IS NULL OR length(trim(p_last_name)) NOT BETWEEN 2 AND 100
     OR p_state_of_residence IS NULL OR length(trim(p_state_of_residence)) NOT BETWEEN 2 AND 100
     OR p_lga_of_residence IS NULL OR length(trim(p_lga_of_residence)) NOT BETWEEN 2 AND 100
     OR length(trim(concat_ws(' ', trim(p_first_name), nullif(trim(p_middle_name), ''), trim(p_last_name)))) > 90 THEN
    RAISE EXCEPTION 'Profile data is invalid' USING ERRCODE = '22023';
  END IF;
  SELECT profile.* INTO old_profile FROM public.profiles AS profile
    WHERE profile.id = current_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member profile not found' USING ERRCODE = '42501'; END IF;

  content_changed := old_profile.first_name IS DISTINCT FROM trim(p_first_name)
    OR old_profile.middle_name IS DISTINCT FROM nullif(trim(p_middle_name), '')
    OR old_profile.last_name IS DISTINCT FROM trim(p_last_name)
    OR old_profile.state_of_residence IS DISTINCT FROM trim(p_state_of_residence)
    OR old_profile.lga_of_residence IS DISTINCT FROM trim(p_lga_of_residence);

  SELECT membership.id INTO member_record_id FROM public.memberships AS membership
    WHERE membership.profile_id = current_user_id AND membership.status = 'active' FOR UPDATE;
  IF member_record_id IS NOT NULL THEN
    SELECT EXISTS (SELECT 1 FROM public.id_cards AS card
      WHERE card.membership_id = member_record_id AND card.status = 'active') INTO has_active_card;
  END IF;
  IF content_changed AND member_record_id IS NOT NULL AND has_active_card THEN
    SELECT count(*) INTO recent_profile_replacements FROM public.id_cards AS card
      WHERE card.membership_id = member_record_id AND card.status = 'replaced'
        AND card.revocation_reason = 'Member profile updated'
        AND card.revoked_at > now() - interval '24 hours';
    IF recent_profile_replacements >= 2 THEN
      RAISE EXCEPTION 'Profile card replacement limit reached' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  UPDATE public.profiles AS profile SET
    first_name = trim(p_first_name), middle_name = nullif(trim(p_middle_name), ''),
    last_name = trim(p_last_name), state_of_residence = trim(p_state_of_residence),
    lga_of_residence = trim(p_lga_of_residence)
  WHERE profile.id = current_user_id;

  IF content_changed AND member_record_id IS NOT NULL AND has_active_card THEN
    UPDATE public.id_cards SET status = 'replaced', revoked_at = now(), revocation_reason = 'Member profile updated'
      WHERE id_cards.membership_id = member_record_id AND id_cards.status = 'active';
    SELECT COALESCE(MAX(card.card_version), 0) + 1 INTO next_card_version
      FROM public.id_cards AS card WHERE card.membership_id = member_record_id;
    INSERT INTO public.id_cards(membership_id, card_version, verification_token, status)
      VALUES (member_record_id, next_card_version,
        replace(gen_random_uuid()::TEXT, '-', '') || replace(gen_random_uuid()::TEXT, '-', ''), 'active')
      RETURNING id INTO card_record_id;
    INSERT INTO public.card_generation_jobs(id_card_id) VALUES (card_record_id);
    INSERT INTO public.audit_logs(actor_id, action, target_type, target_id, details)
      VALUES (current_user_id, 'membership_card.reissued_after_profile_update', 'id_card', card_record_id::TEXT,
        jsonb_build_object('membership_id', member_record_id, 'card_version', next_card_version));
  END IF;
  RETURN QUERY SELECT member_record_id, card_record_id;
END;
$$;
REVOKE ALL ON FUNCTION public.update_my_member_profile(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_my_member_profile(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

CREATE FUNCTION public.register_member_for_event(p_event_id UUID)
RETURNS TABLE(registration_id UUID, registered_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  member_id UUID;
  event_row public.events%ROWTYPE;
  registration public.event_registrations%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Sign-in required' USING ERRCODE = '42501'; END IF;
  SELECT id INTO member_id FROM public.memberships
  WHERE profile_id = current_user_id AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active membership required' USING ERRCODE = '42501'; END IF;
  SELECT * INTO event_row FROM public.events WHERE id = p_event_id AND is_published = TRUE FOR UPDATE;
  IF NOT FOUND OR event_row.start_date <= now() THEN
    RAISE EXCEPTION 'Event is unavailable for registration' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO registration FROM public.event_registrations
  WHERE event_id = p_event_id AND membership_id = member_id;
  IF FOUND THEN RETURN QUERY SELECT registration.id, registration.registered_at; RETURN; END IF;
  IF event_row.capacity IS NOT NULL AND (
    SELECT count(*) FROM public.event_registrations WHERE event_id = p_event_id
  ) >= event_row.capacity THEN
    RAISE EXCEPTION 'Event registration is full' USING ERRCODE = '23514';
  END IF;
  INSERT INTO public.event_registrations(event_id, membership_id, ticket_token)
  VALUES (p_event_id, member_id, replace(gen_random_uuid()::TEXT, '-', '') || replace(gen_random_uuid()::TEXT, '-', ''))
  RETURNING * INTO registration;
  RETURN QUERY SELECT registration.id, registration.registered_at;
END;
$$;

CREATE FUNCTION public.cancel_member_event_registration(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  member_id UUID;
  event_start TIMESTAMPTZ;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Sign-in required' USING ERRCODE = '42501'; END IF;
  SELECT id INTO member_id FROM public.memberships WHERE profile_id = current_user_id AND status = 'active';
  SELECT start_date INTO event_start FROM public.events WHERE id = p_event_id AND is_published = TRUE;
  IF member_id IS NULL OR event_start IS NULL OR event_start <= now() THEN RETURN FALSE; END IF;
  DELETE FROM public.event_registrations WHERE event_id = p_event_id AND membership_id = member_id;
  RETURN FOUND;
END;
$$;

CREATE FUNCTION public.submit_member_support_request(p_subject TEXT, p_message TEXT, p_category TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  member_id UUID;
  member_profile public.profiles%ROWTYPE;
  request_id UUID;
  recent_requests INTEGER;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Sign-in required' USING ERRCODE = '42501'; END IF;
  IF length(trim(p_subject)) NOT BETWEEN 3 AND 160 OR length(trim(p_message)) NOT BETWEEN 10 AND 4000
     OR p_category NOT IN ('membership', 'id_card', 'events', 'privacy', 'technical', 'general') THEN
    RAISE EXCEPTION 'Support request is invalid' USING ERRCODE = '22023';
  END IF;
  SELECT profile.* INTO member_profile FROM public.profiles AS profile WHERE profile.id = current_user_id;
  SELECT membership.id INTO member_id FROM public.memberships AS membership
    WHERE membership.profile_id = current_user_id AND membership.status = 'active' FOR UPDATE;
  IF NOT FOUND OR member_id IS NULL THEN RAISE EXCEPTION 'Active membership required' USING ERRCODE = '42501'; END IF;
  SELECT count(*) INTO recent_requests FROM public.support_requests
    WHERE membership_id = member_id AND created_at > now() - interval '24 hours';
  IF recent_requests >= 5 THEN RAISE EXCEPTION 'Support request limit reached' USING ERRCODE = 'P0001'; END IF;
  INSERT INTO public.support_requests(membership_id, name, email, subject, message, category)
  VALUES (member_id, member_profile.full_name, member_profile.email, trim(p_subject), trim(p_message), p_category)
  RETURNING id INTO request_id;
  RETURN request_id;
END;
$$;

CREATE FUNCTION public.submit_member_data_request(p_request_type TEXT, p_details TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  member_id UUID;
  request_id UUID;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Sign-in required' USING ERRCODE = '42501'; END IF;
  IF p_request_type NOT IN ('access', 'rectification', 'erasure', 'restriction')
     OR length(COALESCE(p_details, '')) > 1000 THEN
    RAISE EXCEPTION 'Privacy request is invalid' USING ERRCODE = '22023';
  END IF;
  SELECT id INTO member_id FROM public.memberships WHERE profile_id = current_user_id AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active membership required' USING ERRCODE = '42501'; END IF;
  IF EXISTS (SELECT 1 FROM public.data_requests WHERE membership_id = member_id
      AND request_type = p_request_type AND status IN ('pending', 'processing')) THEN
    RAISE EXCEPTION 'A matching request is already open' USING ERRCODE = '23505';
  END IF;
  INSERT INTO public.data_requests(membership_id, request_type, details)
  VALUES (member_id, p_request_type, nullif(trim(p_details), '')) RETURNING id INTO request_id;
  INSERT INTO public.audit_logs(actor_id, action, target_type, target_id, details)
  VALUES (current_user_id, 'member.data_request_submitted', 'data_request', request_id::TEXT,
    jsonb_build_object('request_type', p_request_type));
  RETURN request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.register_member_for_event(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_member_event_registration(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_member_support_request(TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_member_data_request(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_member_for_event(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_member_event_registration(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_member_support_request(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_member_data_request(TEXT, TEXT) TO authenticated;
