-- Open registration creates an active membership from the submitted form
-- without sending or requiring an email verification message. The Auth user
-- still exists so the member can later sign in to their private portal.
-- This trusted service-role function preserves the atomic membership, consent,
-- number allocation, audit, and card-generation records.

CREATE FUNCTION public.create_open_membership_with_card(
  p_auth_user_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_middle_name TEXT,
  p_last_name TEXT,
  p_state_of_residence TEXT,
  p_lga_of_residence TEXT,
  p_state_code TEXT,
  p_org_unit_id UUID,
  p_consent_policy_version TEXT,
  p_consent_policy_sha256 TEXT,
  p_consent_granted BOOLEAN
)
RETURNS TABLE (membership_id UUID, membership_number TEXT, id_card_id UUID, verification_token TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  account_email TEXT;
  org_state_code TEXT;
  existing_membership public.memberships%ROWTYPE;
  new_membership_id UUID;
  new_membership_number TEXT;
  new_card_id UUID;
  new_token TEXT;
  card_version INTEGER;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Trusted registration service required' USING ERRCODE = '42501';
  END IF;
  IF p_auth_user_id IS NULL OR p_email IS NULL OR p_first_name IS NULL
     OR p_last_name IS NULL OR p_state_of_residence IS NULL OR p_lga_of_residence IS NULL
     OR p_state_code IS NULL OR p_org_unit_id IS NULL OR p_consent_policy_version IS NULL
     OR p_consent_policy_sha256 IS NULL OR p_consent_granted IS DISTINCT FROM TRUE
     OR length(trim(p_first_name)) NOT BETWEEN 2 AND 100
     OR length(trim(p_last_name)) NOT BETWEEN 2 AND 100
     OR COALESCE(length(trim(p_middle_name)), 0) > 100
     OR length(trim(concat_ws(' ', trim(p_first_name), nullif(trim(p_middle_name), ''), trim(p_last_name)))) > 90
     OR length(trim(p_state_of_residence)) NOT BETWEEN 2 AND 100
     OR length(trim(p_lga_of_residence)) NOT BETWEEN 2 AND 100
     OR upper(trim(p_state_code)) !~ '^[A-Z0-9]{2,10}$'
     OR length(trim(p_consent_policy_version)) NOT BETWEEN 1 AND 64
     OR lower(p_consent_policy_sha256) !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Registration data is invalid' USING ERRCODE = '22023';
  END IF;

  SELECT lower(email) INTO account_email FROM auth.users
  WHERE id = p_auth_user_id FOR UPDATE;
  IF NOT FOUND OR account_email IS NULL OR account_email <> lower(trim(p_email)) THEN
    RAISE EXCEPTION 'A matching Auth account is required' USING ERRCODE = '42501';
  END IF;

  SELECT unit.state_code INTO org_state_code FROM public.organisational_units AS unit
  WHERE unit.id = p_org_unit_id AND unit.type = 'state';
  IF NOT FOUND OR org_state_code IS DISTINCT FROM upper(trim(p_state_code)) THEN
    RAISE EXCEPTION 'Selected state chapter is invalid' USING ERRCODE = '22023';
  END IF;

  SELECT membership.* INTO existing_membership FROM public.memberships AS membership
  WHERE membership.profile_id = p_auth_user_id FOR UPDATE;
  IF FOUND THEN
    IF existing_membership.status <> 'active' THEN
      RAISE EXCEPTION 'Membership is not active' USING ERRCODE = '42501';
    END IF;
    new_membership_id := existing_membership.id;
    new_membership_number := existing_membership.membership_number;
  ELSE
    INSERT INTO public.profiles (
      id, full_name, first_name, middle_name, last_name, email, phone,
      state_of_residence, lga_of_residence
    ) VALUES (
      p_auth_user_id,
      trim(concat_ws(' ', trim(p_first_name), nullif(trim(p_middle_name), ''), trim(p_last_name))),
      trim(p_first_name), nullif(trim(p_middle_name), ''), trim(p_last_name), account_email, NULL,
      trim(p_state_of_residence), trim(p_lga_of_residence)
    ) ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name, first_name = EXCLUDED.first_name,
      middle_name = EXCLUDED.middle_name, last_name = EXCLUDED.last_name,
      email = EXCLUDED.email, state_of_residence = EXCLUDED.state_of_residence,
      lga_of_residence = EXCLUDED.lga_of_residence, updated_at = now();

    new_membership_number := private.generate_next_membership_number(upper(trim(p_state_code)));
    INSERT INTO public.memberships (profile_id, membership_number, state_code, org_unit_id, status, verified_at)
    VALUES (p_auth_user_id, new_membership_number, upper(trim(p_state_code)), p_org_unit_id, 'active', now())
    RETURNING id INTO new_membership_id;
    INSERT INTO public.consent_records (profile_id, consent_purpose, is_granted, consented_at, policy_version, policy_sha256, source)
    VALUES (p_auth_user_id, 'membership_data_processing', TRUE, now(), trim(p_consent_policy_version), lower(p_consent_policy_sha256), 'self_service');
    INSERT INTO public.role_assignments (user_id, role) VALUES (p_auth_user_id, 'member') ON CONFLICT DO NOTHING;
    INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details)
    VALUES (p_auth_user_id, 'membership.registration_open', 'membership', new_membership_id::TEXT,
      jsonb_build_object('state_code', upper(trim(p_state_code)), 'contact_method', 'unverified_email'));
  END IF;

  SELECT card.id, card.verification_token, card.card_version INTO new_card_id, new_token, card_version
  FROM public.id_cards AS card
  WHERE card.membership_id = new_membership_id AND card.status = 'active'
  ORDER BY card.card_version DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    SELECT COALESCE(MAX(card.card_version), 0) + 1 INTO card_version
    FROM public.id_cards AS card WHERE card.membership_id = new_membership_id;
    new_token := replace(gen_random_uuid()::TEXT, '-', '') || replace(gen_random_uuid()::TEXT, '-', '');
    INSERT INTO public.id_cards (membership_id, card_version, verification_token, status)
    VALUES (new_membership_id, card_version, new_token, 'active') RETURNING id INTO new_card_id;
  END IF;
  INSERT INTO public.card_generation_jobs (id_card_id)
  VALUES (new_card_id)
  ON CONFLICT ON CONSTRAINT card_generation_jobs_id_card_id_key DO NOTHING;

  RETURN QUERY SELECT new_membership_id, new_membership_number, new_card_id, new_token;
END;
$$;

REVOKE ALL ON FUNCTION public.create_open_membership_with_card(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_open_membership_with_card(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN) TO service_role;
