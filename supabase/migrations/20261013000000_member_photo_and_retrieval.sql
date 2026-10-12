-- Private profile photos support member ID cards. Photo bytes never use a public bucket.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_storage_path TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('member-profile-photos', 'member-profile-photos', FALSE, 5242880, ARRAY['image/jpeg','image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

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
  p_institution_name TEXT
)
RETURNS TABLE (membership_id UUID, membership_number TEXT, id_card_id UUID, verification_token TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  issued RECORD;
  clean_institution TEXT := NULLIF(trim(p_institution_name), '');
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Trusted registration service required' USING ERRCODE = '42501';
  END IF;
  IF p_photo_storage_path IS DISTINCT FROM ('members/' || p_auth_user_id::TEXT || '/profile.jpg')
     OR COALESCE(length(clean_institution), 0) > 255
     OR (p_institution_type IS NOT NULL AND p_institution_type NOT IN ('tertiary','artisan','youth_corps','general')) THEN
    RAISE EXCEPTION 'Registration profile data is invalid' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO issued FROM public.create_open_membership_with_card(
    p_auth_user_id, p_email, p_first_name, p_middle_name, p_last_name,
    p_state_of_residence, p_lga_of_residence, p_state_code, p_org_unit_id,
    p_consent_policy_version, p_consent_policy_sha256, p_consent_granted
  );

  UPDATE public.profiles SET
    photo_storage_path = p_photo_storage_path,
    institution_type = CASE WHEN clean_institution IS NULL THEN NULL ELSE p_institution_type END,
    institution_name = clean_institution,
    updated_at = now()
  WHERE id = p_auth_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member profile was not created' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY SELECT issued.membership_id, issued.membership_number, issued.id_card_id, issued.verification_token;
END;
$$;

REVOKE ALL ON FUNCTION public.create_open_membership_with_photo(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,UUID,TEXT,TEXT,BOOLEAN,TEXT,TEXT,TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_open_membership_with_photo(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,UUID,TEXT,TEXT,BOOLEAN,TEXT,TEXT,TEXT) TO service_role;
