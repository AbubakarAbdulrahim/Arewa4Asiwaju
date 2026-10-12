-- Phase 5: private registration intents, verified membership issuance,
-- idempotent card records, private PDF storage, and durable retry state.

ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;

CREATE TABLE public.registration_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash TEXT,
  registration_data JSONB NOT NULL,
  consent_version TEXT NOT NULL,
  consent_sha256 TEXT NOT NULL CHECK (consent_sha256 ~ '^[a-f0-9]{64}$'),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes'),
  completed_at TIMESTAMPTZ
);
CREATE INDEX registration_intents_email_created_idx ON public.registration_intents(email_hash, created_at DESC);
CREATE INDEX registration_intents_expiry_idx ON public.registration_intents(expires_at) WHERE status = 'pending';

CREATE TABLE public.registration_rate_limits (
  key_hash TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count >= 0)
);

CREATE TABLE public.card_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_card_id UUID NOT NULL UNIQUE REFERENCES public.id_cards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error_code TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.registration_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_intents FORCE ROW LEVEL SECURITY;
ALTER TABLE public.registration_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_rate_limits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.card_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_generation_jobs FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.registration_intents, public.registration_rate_limits, public.card_generation_jobs FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.registration_intents, public.registration_rate_limits, public.card_generation_jobs TO service_role;

-- A private bucket has no anon/authenticated object policies. Application
-- routes issue short-lived signed URLs only after checking ownership.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('member-id-cards', 'member-id-cards', FALSE, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE FUNCTION public.consume_registration_rate_limit(p_key_hashes TEXT[], p_limit INTEGER, p_window_seconds INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_key_hash TEXT;
  current_window TIMESTAMPTZ;
  current_count INTEGER;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role'
     OR p_limit NOT BETWEEN 1 AND 100
     OR p_window_seconds NOT BETWEEN 1 AND 86400
     OR cardinality(p_key_hashes) NOT BETWEEN 1 AND 4 THEN
    RAISE EXCEPTION 'Invalid rate limit request' USING ERRCODE = '42501';
  END IF;
  FOR current_key_hash IN SELECT DISTINCT value FROM unnest(p_key_hashes) AS value ORDER BY value LOOP
    IF current_key_hash !~ '^[a-f0-9]{64}$' THEN
      RAISE EXCEPTION 'Invalid rate limit key' USING ERRCODE = '22023';
    END IF;
    INSERT INTO public.registration_rate_limits (key_hash, window_started_at, request_count)
    VALUES (current_key_hash, now(), 0) ON CONFLICT (key_hash) DO NOTHING;
    SELECT window_started_at, request_count INTO current_window, current_count
    FROM public.registration_rate_limits WHERE registration_rate_limits.key_hash = current_key_hash FOR UPDATE;
    IF current_window + make_interval(secs => p_window_seconds) <= now() THEN
      UPDATE public.registration_rate_limits SET window_started_at = now(), request_count = 1
      WHERE registration_rate_limits.key_hash = current_key_hash;
    ELSIF current_count >= p_limit THEN
      RETURN FALSE;
    ELSE
      UPDATE public.registration_rate_limits SET request_count = request_count + 1
      WHERE registration_rate_limits.key_hash = current_key_hash;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_registration_rate_limit(TEXT[], INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_registration_rate_limit(TEXT[], INTEGER, INTEGER) TO service_role;

CREATE FUNCTION public.claim_card_generation_job(p_id_card_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  job public.card_generation_jobs%ROWTYPE;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Trusted card service required' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO job FROM public.card_generation_jobs
  WHERE id_card_id = p_id_card_id FOR UPDATE;
  IF NOT FOUND OR job.status = 'completed' OR job.attempts >= 10 THEN
    RETURN FALSE;
  END IF;
  IF job.status = 'processing' AND job.started_at > now() - interval '5 minutes' THEN
    RETURN FALSE;
  END IF;
  UPDATE public.card_generation_jobs SET
    status = 'processing', attempts = attempts + 1, started_at = now(),
    last_error_code = NULL, updated_at = now()
  WHERE id = job.id;
  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_card_generation_job(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_card_generation_job(UUID) TO service_role;

CREATE FUNCTION public.create_verified_membership_with_card(
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
  verified_email TEXT;
  org_state_code TEXT;
  existing_membership public.memberships%ROWTYPE;
  new_membership_id UUID;
  new_membership_number TEXT;
  new_card_id UUID;
  new_token TEXT;
  card_version INTEGER;
  created_membership BOOLEAN := FALSE;
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

  SELECT lower(email) INTO verified_email FROM auth.users
  WHERE id = p_auth_user_id AND email_confirmed_at IS NOT NULL FOR UPDATE;
  IF NOT FOUND OR verified_email IS NULL OR verified_email <> lower(trim(p_email)) THEN
    RAISE EXCEPTION 'A confirmed matching email account is required' USING ERRCODE = '42501';
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
      trim(p_first_name), nullif(trim(p_middle_name), ''), trim(p_last_name), verified_email, NULL,
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
    VALUES
      (p_auth_user_id, 'membership_data_processing', TRUE, now(), trim(p_consent_policy_version), lower(p_consent_policy_sha256), 'self_service');
    INSERT INTO public.role_assignments (user_id, role) VALUES (p_auth_user_id, 'member') ON CONFLICT DO NOTHING;
    INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details)
    VALUES (p_auth_user_id, 'membership.registration_verified', 'membership', new_membership_id::TEXT,
      jsonb_build_object('state_code', upper(trim(p_state_code)), 'contact_method', 'verified_email'));
    created_membership := TRUE;
  END IF;

  SELECT card.id, card.verification_token, card.card_version INTO new_card_id, new_token, card_version
  FROM public.id_cards AS card
  WHERE card.membership_id = new_membership_id AND card.status = 'active'
  ORDER BY card.card_version DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    SELECT COALESCE(MAX(card.card_version), 0) + 1 INTO card_version
    FROM public.id_cards AS card WHERE card.membership_id = new_membership_id;
    -- Two core PostgreSQL UUIDv4 values provide 244 unpredictable bits without
    -- depending on extension resolution inside this fixed-search-path function.
    new_token := replace(gen_random_uuid()::TEXT, '-', '') || replace(gen_random_uuid()::TEXT, '-', '');
    INSERT INTO public.id_cards (membership_id, card_version, verification_token, status)
    VALUES (new_membership_id, card_version, new_token, 'active') RETURNING id INTO new_card_id;
    INSERT INTO public.card_generation_jobs (id_card_id) VALUES (new_card_id) ON CONFLICT ON CONSTRAINT card_generation_jobs_id_card_id_key DO NOTHING;
  ELSE
    INSERT INTO public.card_generation_jobs (id_card_id) VALUES (new_card_id) ON CONFLICT ON CONSTRAINT card_generation_jobs_id_card_id_key DO NOTHING;
  END IF;

  RETURN QUERY SELECT new_membership_id, new_membership_number, new_card_id, new_token;
END;
$$;
REVOKE ALL ON FUNCTION public.create_verified_membership_with_card(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_verified_membership_with_card(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN) TO service_role;

CREATE FUNCTION public.replace_membership_card(p_auth_user_id UUID, p_membership_id UUID)
RETURNS TABLE (id_card_id UUID, verification_token TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  membership_row public.memberships%ROWTYPE;
  new_card_id UUID;
  new_token TEXT;
  new_version INTEGER;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Trusted card service required' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO membership_row FROM public.memberships
  WHERE id = p_membership_id AND profile_id = p_auth_user_id FOR UPDATE;
  IF NOT FOUND OR membership_row.status <> 'active' THEN
    RAISE EXCEPTION 'Active member record required' USING ERRCODE = '42501';
  END IF;
  UPDATE public.id_cards SET status = 'replaced', revoked_at = now(), revocation_reason = 'Member requested replacement'
  WHERE membership_id = p_membership_id AND status = 'active';
  SELECT COALESCE(MAX(card_version), 0) + 1 INTO new_version FROM public.id_cards WHERE membership_id = p_membership_id;
  new_token := replace(gen_random_uuid()::TEXT, '-', '') || replace(gen_random_uuid()::TEXT, '-', '');
  INSERT INTO public.id_cards (membership_id, card_version, verification_token, status)
  VALUES (p_membership_id, new_version, new_token, 'active') RETURNING id INTO new_card_id;
  INSERT INTO public.card_generation_jobs (id_card_id) VALUES (new_card_id);
  INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details)
  VALUES (p_auth_user_id, 'membership_card.replaced', 'id_card', new_card_id::TEXT,
    jsonb_build_object('membership_id', p_membership_id, 'card_version', new_version));
  RETURN QUERY SELECT new_card_id, new_token;
END;
$$;
REVOKE ALL ON FUNCTION public.replace_membership_card(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_membership_card(UUID, UUID) TO service_role;
