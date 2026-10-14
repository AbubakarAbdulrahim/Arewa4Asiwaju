-- Add ward-aware registration, LG-scoped membership numbers, and optional PVC number storage.
-- The public route supplies a checked LGA code and ward pair; only service_role can call the workflow.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS voter_card_number VARCHAR(50);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_voter_card_number_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_voter_card_number_check
      CHECK (
        voter_card_number IS NULL OR
        (voter_card_status = 'yes' AND voter_card_number ~ '^[A-Z0-9 /-]{1,50}$')
      ) NOT VALID;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.membership_lga_counters (
  year INTEGER NOT NULL,
  state_code VARCHAR(10) NOT NULL,
  lga_code VARCHAR(5) NOT NULL,
  current_seq INTEGER NOT NULL DEFAULT 0 CHECK (current_seq > 0),
  PRIMARY KEY (year, state_code, lga_code)
);
ALTER TABLE public.membership_lga_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.membership_lga_counters FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.membership_lga_counters TO service_role;

ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_number_format_check;
ALTER TABLE public.memberships
  ADD CONSTRAINT memberships_number_format_check
  CHECK (membership_number ~ '^A4A-[0-9]{4}-[A-Z0-9]{2,10}-([A-Z0-9]{3,5}[0-9]{3,}|[0-9]{6,})$') NOT VALID;
ALTER TABLE public.memberships VALIDATE CONSTRAINT memberships_number_format_check;

CREATE OR REPLACE FUNCTION private.generate_next_membership_number(p_state_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  membership_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
  next_sequence INTEGER;
  clean_state_code TEXT := upper(trim(p_state_code));
  clean_lga_code TEXT := NULLIF(upper(trim(current_setting('a4a.registration_lga_code', true))), '');
BEGIN
  IF clean_state_code !~ '^[A-Z0-9]{2,10}$' THEN
    RAISE EXCEPTION 'Invalid state code' USING ERRCODE = '22023';
  END IF;

  IF clean_lga_code IS NOT NULL THEN
    IF clean_lga_code !~ '^[A-Z0-9]{3,5}$' THEN
      RAISE EXCEPTION 'Invalid LGA code' USING ERRCODE = '22023';
    END IF;
    INSERT INTO public.membership_lga_counters (year, state_code, lga_code, current_seq)
    VALUES (membership_year, clean_state_code, clean_lga_code, 1)
    ON CONFLICT (year, state_code, lga_code)
    DO UPDATE SET current_seq = public.membership_lga_counters.current_seq + 1
    RETURNING current_seq INTO next_sequence;

    RETURN 'A4A-' || membership_year::TEXT || '-' || clean_state_code || '-' || clean_lga_code ||
      CASE WHEN next_sequence < 1000 THEN lpad(next_sequence::TEXT, 3, '0') ELSE next_sequence::TEXT END;
  END IF;

  -- Keep the prior allocator path for non-registration maintenance operations.
  INSERT INTO public.membership_counters (year, state_code, current_seq)
  VALUES (membership_year, clean_state_code, 1)
  ON CONFLICT (year, state_code)
  DO UPDATE SET current_seq = public.membership_counters.current_seq + 1
  RETURNING current_seq INTO next_sequence;
  RETURN 'A4A-' || membership_year::TEXT || '-' || clean_state_code || '-' || lpad(next_sequence::TEXT, 6, '0');
END;
$$;
REVOKE ALL ON FUNCTION private.generate_next_membership_number(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.generate_next_membership_number(TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.create_open_membership_with_photo(
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
  p_consent_granted BOOLEAN,
  p_photo_storage_path TEXT,
  p_institution_type TEXT,
  p_institution_name TEXT,
  p_registration_details JSONB
)
RETURNS TABLE (membership_id UUID, membership_number TEXT, id_card_id UUID, verification_token TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  issued RECORD;
  clean_institution TEXT := NULLIF(trim(p_institution_name), '');
  details JSONB := COALESCE(p_registration_details, '{}'::JSONB);
  parsed_dob DATE;
  gender_value TEXT := NULLIF(details->>'gender', '');
  voter_value TEXT := NULLIF(details->>'voter_card_status', '');
  voter_number TEXT := NULLIF(upper(trim(details->>'voter_card_number')), '');
  lga_code TEXT := upper(trim(COALESCE(details->>'lga_code', '')));
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Trusted registration service required' USING ERRCODE = '42501';
  END IF;
  IF p_photo_storage_path IS DISTINCT FROM ('members/' || p_auth_user_id::TEXT || '/profile.jpg')
     OR COALESCE(length(clean_institution), 0) > 255
     OR (p_institution_type IS NOT NULL AND p_institution_type NOT IN ('tertiary','artisan','youth_corps','general'))
     OR COALESCE(details->>'phone', '') !~ '^\+?[0-9 ()-]{7,30}$'
     OR COALESCE(length(details->>'ward'), 0) NOT BETWEEN 1 AND 150
     OR COALESCE(length(details->>'occupation'), 0) > 120
     OR COALESCE(length(details->>'address'), 0) > 500
     OR COALESCE(length(details->>'course_of_study'), 0) > 255
     OR COALESCE(length(details->>'study_level'), 0) > 80
     OR lga_code !~ '^[A-Z0-9]{3,5}$'
     OR gender_value NOT IN ('male', 'female', 'other', 'prefer_not_to_say')
     OR (voter_value IS NOT NULL AND voter_value NOT IN ('yes', 'no', 'prefer_not_to_say'))
     OR (voter_value = 'yes' AND (voter_number IS NULL OR voter_number !~ '^[A-Z0-9 /-]{1,50}$'))
     OR (voter_value IS DISTINCT FROM 'yes' AND voter_number IS NOT NULL)
     OR details->>'is_student' NOT IN ('yes', 'no') THEN
    RAISE EXCEPTION 'Registration profile data is invalid' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(details->>'date_of_birth', '') IS NOT NULL THEN
    IF details->>'date_of_birth' !~ '^\d{4}-\d{2}-\d{2}$' THEN
      RAISE EXCEPTION 'Registration date is invalid' USING ERRCODE = '22023';
    END IF;
    parsed_dob := (details->>'date_of_birth')::DATE;
    IF parsed_dob > CURRENT_DATE THEN
      RAISE EXCEPTION 'Registration date is invalid' USING ERRCODE = '22023';
    END IF;
  END IF;
  IF details->>'is_student' = 'yes'
     AND (clean_institution IS NULL OR p_institution_type IS NULL
       OR NULLIF(details->>'course_of_study', '') IS NULL
       OR NULLIF(details->>'study_level', '') IS NULL) THEN
    RAISE EXCEPTION 'Student institution details are required' USING ERRCODE = '22023';
  END IF;

  -- The nested membership workflow sees this transaction-local, trusted LGA code.
  PERFORM set_config('a4a.registration_lga_code', lga_code, true);
  SELECT * INTO issued FROM public.create_open_membership_with_card(
    p_auth_user_id, p_email, p_first_name, p_middle_name, p_last_name,
    p_state_of_residence, p_lga_of_residence, p_state_code, p_org_unit_id,
    p_consent_policy_version, p_consent_policy_sha256, p_consent_granted
  );

  UPDATE public.profiles SET
    phone = trim(details->>'phone'),
    ward = NULLIF(trim(details->>'ward'), ''),
    gender = CASE WHEN gender_value IN ('male', 'female', 'other') THEN gender_value ELSE NULL END,
    date_of_birth = parsed_dob,
    occupation = NULLIF(trim(details->>'occupation'), ''),
    is_student = details->>'is_student' = 'yes',
    address = NULLIF(trim(details->>'address'), ''),
    voter_card_status = voter_value,
    voter_card_number = voter_number,
    photo_storage_path = p_photo_storage_path,
    institution_type = CASE WHEN clean_institution IS NULL THEN NULL ELSE p_institution_type END,
    institution_name = clean_institution,
    institution_campus = NULL,
    department = NULL,
    course_of_study = NULLIF(trim(details->>'course_of_study'), ''),
    study_level = NULLIF(trim(details->>'study_level'), ''),
    graduation_year = NULL,
    updated_at = now()
  WHERE id = p_auth_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member profile was not created' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY SELECT issued.membership_id, issued.membership_number, issued.id_card_id, issued.verification_token;
END;
$$;

REVOKE ALL ON FUNCTION public.create_open_membership_with_photo(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,UUID,TEXT,TEXT,BOOLEAN,TEXT,TEXT,TEXT,JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_open_membership_with_photo(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,UUID,TEXT,TEXT,BOOLEAN,TEXT,TEXT,TEXT,JSONB) TO service_role;

COMMENT ON COLUMN public.profiles.voter_card_number IS 'Optional sensitive identifier supplied by the member; private profile access only and never included in card output.';
COMMENT ON TABLE public.membership_lga_counters IS 'Private, concurrency-safe membership-number sequence scoped by year, state, and LGA.';
