-- AREWA4ASIWAJU DIGITAL PLATFORM: FUNCTIONS AND TRIGGERS
-- Migration: 20261009000002_functions_and_triggers.sql
-- Description: Concurrency-safe membership sequence allocator, card issuance, and profile sync

-- 1. CONCURRENCY-SAFE ATOMIC MEMBERSHIP NUMBER GENERATOR
-- Guarantees race-condition-free, gapless sequential numbering per year and state
CREATE OR REPLACE FUNCTION generate_next_membership_number(p_state_code TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
  v_seq INTEGER;
  v_clean_state VARCHAR(10) := UPPER(TRIM(p_state_code));
  v_membership_num TEXT;
BEGIN
  -- Atomic upsert and increment on membership_counters
  INSERT INTO membership_counters (year, state_code, current_seq)
  VALUES (v_year, v_clean_state, 1)
  ON CONFLICT (year, state_code)
  DO UPDATE SET current_seq = membership_counters.current_seq + 1
  RETURNING current_seq INTO v_seq;

  -- Format: A4A-YYYY-ST-XXXXXX (e.g. A4A-2026-KN-000001)
  v_membership_num := 'A4A-' || v_year::TEXT || '-' || v_clean_state || '-' || LPAD(v_seq::TEXT, 6, '0');
  
  RETURN v_membership_num;
END;
$$;

-- 2. AUTOMATIC ID CARD ISSUANCE WORKFLOW
-- Idempotent issuance of initial or renewed membership card
CREATE OR REPLACE FUNCTION issue_digital_id_card(p_membership_id UUID)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
  v_card_id UUID;
  v_token TEXT;
  v_latest_version INTEGER := 0;
BEGIN
  -- Obtain next card version
  SELECT COALESCE(MAX(card_version), 0) + 1 INTO v_latest_version
  FROM id_cards
  WHERE membership_id = p_membership_id;

  -- Generate 64-character (256-bit) cryptographically secure opaque token
  v_token := encode(gen_random_bytes(32), 'hex');

  -- Previous active cards are replaced
  UPDATE id_cards
  SET status = 'replaced', revoked_at = NOW(), revocation_reason = 'New card issued'
  WHERE membership_id = p_membership_id AND status = 'active';

  -- Insert new active card
  INSERT INTO id_cards (
    membership_id,
    card_version,
    verification_token,
    status,
    issued_at,
    expires_at
  ) VALUES (
    p_membership_id,
    v_latest_version,
    v_token,
    'active',
    NOW(),
    NOW() + INTERVAL '4 years'
  ) RETURNING id INTO v_card_id;

  -- Mark membership active
  UPDATE memberships
  SET status = 'active', verified_at = COALESCE(verified_at, NOW())
  WHERE id = p_membership_id;

  RETURN v_card_id;
END;
$$;

-- 3. SYNC PROFILES ON SUPABASE AUTH SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    first_name,
    last_name,
    email,
    phone,
    state_of_residence,
    lga_of_residence
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Supporter'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Supporter'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'state_of_residence', 'Kano'),
    COALESCE(NEW.raw_user_meta_data->>'lga_of_residence', 'Kano Municipal')
  ) ON CONFLICT (id) DO NOTHING;

  -- Assign default member role
  INSERT INTO public.role_assignments (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT (user_id, role, org_unit_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
