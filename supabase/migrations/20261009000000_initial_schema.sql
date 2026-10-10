-- AREWA4ASIWAJU DIGITAL PLATFORM: INITIAL POSTGRESQL SCHEMA
-- Migration: 20261009000000_initial_schema.sql
-- Description: Core tables, enums, sequences, and indexes

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM (
  'public_visitor',
  'member',
  'event_manager',
  'chapter_coordinator',
  'lga_coordinator',
  'state_coordinator',
  'content_editor',
  'membership_officer',
  'data_protection_officer',
  'auditor',
  'super_admin'
);

CREATE TYPE membership_status AS ENUM (
  'pending_verification',
  'active',
  'suspended',
  'flagged',
  'revoked'
);

CREATE TYPE card_status AS ENUM (
  'active',
  'suspended',
  'revoked',
  'replaced'
);

CREATE TYPE org_unit_type AS ENUM (
  'national',
  'zone',
  'state',
  'lga',
  'ward',
  'campus_chapter',
  'support_group'
);

-- 1. ORGANISATIONAL UNITS
CREATE TABLE IF NOT EXISTS organisational_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  type org_unit_type NOT NULL,
  parent_id UUID REFERENCES organisational_units(id) ON DELETE SET NULL,
  state_code VARCHAR(10),
  lga_name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_units_code ON organisational_units(code);
CREATE INDEX idx_org_units_state_lga ON organisational_units(state_code, lga_name);

-- 2. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY, -- Maps to auth.users.id
  full_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  photo_url TEXT,
  avatar_url TEXT,
  state_of_origin VARCHAR(100),
  state_of_residence VARCHAR(100) NOT NULL,
  lga_of_residence VARCHAR(100) NOT NULL,
  ward VARCHAR(150),
  address TEXT,
  institution_type VARCHAR(50) DEFAULT 'tertiary',
  institution_name VARCHAR(255),
  course_of_study VARCHAR(255),
  graduation_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_state_lga ON profiles(state_of_residence, lga_of_residence);

-- 3. MEMBERSHIPS
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  membership_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. A4A-2026-KN-000142
  status membership_status NOT NULL DEFAULT 'pending_verification',
  state_code VARCHAR(10) NOT NULL,
  org_unit_id UUID REFERENCES organisational_units(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  verification_token VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memberships_number ON memberships(membership_number);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_state_code ON memberships(state_code);

-- 4. CONCURRENCY-SAFE MEMBERSHIP COUNTERS
CREATE TABLE IF NOT EXISTS membership_counters (
  year INTEGER NOT NULL,
  state_code VARCHAR(10) NOT NULL,
  current_seq INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (year, state_code)
);

-- 5. ID CARDS
CREATE TABLE IF NOT EXISTS id_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  card_version INTEGER NOT NULL DEFAULT 1,
  verification_token VARCHAR(128) NOT NULL UNIQUE, -- Cryptographic opaque token for QR code
  qr_code_svg TEXT,
  pdf_storage_path TEXT,
  preview_storage_path TEXT,
  status card_status NOT NULL DEFAULT 'active',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 years'),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_id_cards_token ON id_cards(verification_token);
CREATE INDEX idx_id_cards_membership ON id_cards(membership_id);
CREATE INDEX idx_id_cards_status ON id_cards(status);

-- 6. NDPR CONSENT RECORDS
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  consent_purpose VARCHAR(100) NOT NULL,
  is_granted BOOLEAN NOT NULL DEFAULT TRUE,
  ip_hash VARCHAR(128),
  user_agent TEXT,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ROLE ASSIGNMENTS (RBAC)
CREATE TABLE IF NOT EXISTS role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  org_unit_id UUID REFERENCES organisational_units(id) ON DELETE SET NULL,
  state_code VARCHAR(10),
  assigned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role, org_unit_id)
);

CREATE INDEX idx_role_assignments_user ON role_assignments(user_id);
CREATE INDEX idx_role_assignments_role ON role_assignments(role);

-- 8. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'symposium',
  venue TEXT NOT NULL,
  state_code VARCHAR(10) NOT NULL,
  lga_name VARCHAR(100),
  is_virtual BOOLEAN NOT NULL DEFAULT FALSE,
  virtual_link TEXT,
  banner_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  capacity INTEGER,
  registered_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_state ON events(state_code);
CREATE INDEX idx_events_dates ON events(start_date, end_date);

-- 9. EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  ticket_token VARCHAR(128) NOT NULL UNIQUE,
  attended BOOLEAN NOT NULL DEFAULT FALSE,
  attended_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, membership_id)
);

CREATE INDEX idx_event_reg_ticket ON event_registrations(ticket_token);

-- 10. ANNOUNCEMENTS & NEWS
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'press_release',
  cover_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  author_name VARCHAR(150) NOT NULL DEFAULT 'Arewa4Asiwaju Media Directorate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SUPPORT REQUESTS
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  response TEXT,
  responded_by UUID REFERENCES profiles(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATION OUTBOX
CREATE TABLE IF NOT EXISTS notification_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'in_app')),
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retrying')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);

-- 14. NDPR DATA REQUESTS
CREATE TABLE IF NOT EXISTS data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'restriction')),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  details TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
