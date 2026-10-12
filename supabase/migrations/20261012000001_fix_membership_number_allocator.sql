-- Avoid a PL/pgSQL variable/column name collision in the shared number allocator.
-- The staging database already has this function; CREATE OR REPLACE is forward-safe.
CREATE OR REPLACE FUNCTION private.generate_next_membership_number(p_state_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  membership_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
  next_sequence INTEGER;
  clean_state_code TEXT := upper(trim(p_state_code));
BEGIN
  IF clean_state_code !~ '^[A-Z0-9]{2,10}$' THEN
    RAISE EXCEPTION 'Invalid state code' USING ERRCODE = '22023';
  END IF;

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
