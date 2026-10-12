-- Persist the expanded public registration details. Registration remains
-- service-only and does not change the no-email-verification workflow.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS occupation VARCHAR(120),
  ADD COLUMN IF NOT EXISTS is_student BOOLEAN,
  ADD COLUMN IF NOT EXISTS voter_card_status TEXT,
  ADD COLUMN IF NOT EXISTS institution_campus VARCHAR(150),
  ADD COLUMN IF NOT EXISTS department VARCHAR(150),
  ADD COLUMN IF NOT EXISTS study_level VARCHAR(80);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_voter_card_status_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_voter_card_status_check
      CHECK (voter_card_status IS NULL OR voter_card_status IN ('yes', 'no', 'prefer_not_to_say'));
  END IF;
END;
$$;

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
  parsed_graduation_year INTEGER;
  gender_value TEXT := NULLIF(details->>'gender', '');
  voter_value TEXT := NULLIF(details->>'voter_card_status', '');
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Trusted registration service required' USING ERRCODE = '42501';
  END IF;
  IF p_photo_storage_path IS DISTINCT FROM ('members/' || p_auth_user_id::TEXT || '/profile.jpg')
     OR COALESCE(length(clean_institution), 0) > 255
     OR (p_institution_type IS NOT NULL AND p_institution_type NOT IN ('tertiary','artisan','youth_corps','general'))
     OR COALESCE(details->>'phone', '') !~ '^\+?[0-9 ()-]{7,30}$'
     OR COALESCE(length(details->>'ward'), 0) > 150
     OR COALESCE(length(details->>'occupation'), 0) > 120
     OR COALESCE(length(details->>'address'), 0) > 500
     OR COALESCE(length(details->>'institution_campus'), 0) > 150
     OR COALESCE(length(details->>'department'), 0) > 150
     OR COALESCE(length(details->>'course_of_study'), 0) > 255
     OR COALESCE(length(details->>'study_level'), 0) > 80
     OR gender_value NOT IN ('male', 'female', 'other', 'prefer_not_to_say')
     OR (voter_value IS NOT NULL AND voter_value NOT IN ('yes', 'no', 'prefer_not_to_say'))
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
  IF NULLIF(details->>'graduation_year', '') IS NOT NULL THEN
    IF details->>'graduation_year' !~ '^20[0-9]{2}$' THEN
      RAISE EXCEPTION 'Graduation year is invalid' USING ERRCODE = '22023';
    END IF;
    parsed_graduation_year := (details->>'graduation_year')::INTEGER;
  END IF;
  IF details->>'is_student' = 'yes'
     AND (clean_institution IS NULL OR p_institution_type IS NULL
       OR NULLIF(details->>'course_of_study', '') IS NULL
       OR NULLIF(details->>'study_level', '') IS NULL) THEN
    RAISE EXCEPTION 'Student institution details are required' USING ERRCODE = '22023';
  END IF;

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
    photo_storage_path = p_photo_storage_path,
    institution_type = CASE WHEN clean_institution IS NULL THEN NULL ELSE p_institution_type END,
    institution_name = clean_institution,
    institution_campus = NULLIF(trim(details->>'institution_campus'), ''),
    department = NULLIF(trim(details->>'department'), ''),
    course_of_study = NULLIF(trim(details->>'course_of_study'), ''),
    study_level = NULLIF(trim(details->>'study_level'), ''),
    graduation_year = parsed_graduation_year,
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
REVOKE ALL ON FUNCTION public.create_open_membership_with_photo(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,UUID,TEXT,TEXT,BOOLEAN,TEXT,TEXT,TEXT) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION public.create_open_membership_with_photo(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,UUID,TEXT,TEXT,BOOLEAN,TEXT,TEXT,TEXT);

CREATE INDEX IF NOT EXISTS profiles_institution_name_idx ON public.profiles (institution_name) WHERE institution_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS profiles_course_of_study_idx ON public.profiles (course_of_study) WHERE course_of_study IS NOT NULL;
