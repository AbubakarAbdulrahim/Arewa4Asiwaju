-- AREWA4ASIWAJU DIGITAL PLATFORM: ROW LEVEL SECURITY POLICIES
-- Migration: 20261009000001_rls_policies.sql
-- Description: Strict RLS enforcement, helper security definer functions, and scoped access

-- 1. ENABLE ROW LEVEL SECURITY ON ALL DOMAIN TABLES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisational_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_counters ENABLE ROW LEVEL SECURITY;

-- 2. SECURITY DEFINER HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM role_assignments WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM role_assignments
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'auditor', 'membership_officer', 'data_protection_officer')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_state_scope()
RETURNS VARCHAR(10) AS $$
  SELECT state_code FROM role_assignments WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. PROFILES POLICIES
-- User can read and update their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. MEMBERSHIPS POLICIES
-- Member can view their own membership; Admins can view based on role and scope
CREATE POLICY "Members can view their own membership"
  ON memberships FOR SELECT
  USING (
    profile_id = auth.uid()
    OR is_admin()
    OR (
      EXISTS (
        SELECT 1 FROM role_assignments ra
        WHERE ra.user_id = auth.uid()
          AND ra.role = 'state_coordinator'
          AND ra.state_code = memberships.state_code
      )
    )
  );

-- Only admins and backend service role can update membership status
CREATE POLICY "Admins can update membership"
  ON memberships FOR UPDATE
  USING (is_admin());

-- 5. ID CARDS POLICIES
-- Member can view their own active card; Admins can view cards
CREATE POLICY "Members can view their own ID cards"
  ON id_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.id = id_cards.membership_id
        AND (m.profile_id = auth.uid() OR is_admin())
    )
  );

-- 6. PUBLIC CONTENT POLICIES (Announcements and Events)
-- Anyone can view published announcements
CREATE POLICY "Public can view published announcements"
  ON announcements FOR SELECT
  USING (is_published = TRUE OR is_admin());

-- Editors and Admins can manage announcements
CREATE POLICY "Staff can manage announcements"
  ON announcements FOR ALL
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM role_assignments WHERE user_id = auth.uid() AND role = 'content_editor'
    )
  );

-- Anyone can view published events
CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  USING (is_published = TRUE OR is_admin());

-- Event managers and Admins can manage events
CREATE POLICY "Event staff can manage events"
  ON events FOR ALL
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM role_assignments WHERE user_id = auth.uid() AND role IN ('event_manager', 'state_coordinator')
    )
  );

-- 7. EVENT REGISTRATIONS POLICIES
CREATE POLICY "Members can view and create their own event registrations"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships m WHERE m.id = event_registrations.membership_id AND m.profile_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "Members can register for events"
  ON event_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m WHERE m.id = event_registrations.membership_id AND m.profile_id = auth.uid()
    )
  );

-- 8. ORGANISATIONAL UNITS POLICIES
-- Anyone authenticated can view org unit hierarchy
CREATE POLICY "Authenticated users can view org units"
  ON organisational_units FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Public can view states and chapters"
  ON organisational_units FOR SELECT
  TO anon
  USING (TRUE);

CREATE POLICY "Admins can manage org units"
  ON organisational_units FOR ALL
  USING (is_admin());

-- 9. AUDIT LOGS & DATA REQUESTS POLICIES
-- Only Auditors, DPO, and Super Admin can view audit logs
CREATE POLICY "Auditors and Super Admin view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM role_assignments WHERE user_id = auth.uid() AND role IN ('super_admin', 'auditor', 'data_protection_officer')
    )
  );

-- Members can manage their own data requests
CREATE POLICY "Members can view and create data requests"
  ON data_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memberships m WHERE m.id = data_requests.membership_id AND m.profile_id = auth.uid()
    )
    OR is_admin()
  );

-- 10. PUBLIC SECURE QR VERIFICATION FUNCTION (Zero PII leakage)
-- Exposes only valid flag, status, masked initials, state, and issue year
CREATE OR REPLACE FUNCTION verify_card_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  card_status card_status,
  initials TEXT,
  state_code VARCHAR(10),
  membership_number TEXT,
  issue_year INTEGER,
  expires_at TIMESTAMPTZ
) SECURITY DEFINER LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    (c.status = 'active')::BOOLEAN,
    c.status,
    CONCAT(LEFT(p.first_name, 1), '. ', LEFT(p.last_name, 1), '.'),
    m.state_code,
    CONCAT('A4A-', EXTRACT(YEAR FROM c.issued_at)::TEXT, '-', m.state_code, '-****'),
    EXTRACT(YEAR FROM c.issued_at)::INTEGER,
    c.expires_at
  FROM id_cards c
  JOIN memberships m ON m.id = c.membership_id
  JOIN profiles p ON p.id = m.profile_id
  WHERE c.verification_token = p_token
  LIMIT 1;
END;
$$;
