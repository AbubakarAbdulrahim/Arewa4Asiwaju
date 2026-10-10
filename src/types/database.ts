export type UserRole =
  | "public_visitor"
  | "member"
  | "event_manager"
  | "chapter_coordinator"
  | "lga_coordinator"
  | "state_coordinator"
  | "content_editor"
  | "membership_officer"
  | "data_protection_officer"
  | "auditor"
  | "super_admin";

export type MembershipStatus =
  | "pending_verification"
  | "active"
  | "suspended"
  | "flagged"
  | "revoked";

export type CardStatus =
  | "active"
  | "suspended"
  | "revoked"
  | "replaced";

export type OrgUnitType =
  | "national"
  | "zone"
  | "state"
  | "lga"
  | "ward"
  | "campus_chapter"
  | "support_group";

export interface Profile {
  id: string; // Supabase Auth user ID
  full_name: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  email: string;
  phone: string;
  date_of_birth?: string | null;
  gender?: "male" | "female" | "other" | null;
  photo_url?: string | null;
  avatar_url?: string | null;
  state_of_origin?: string | null;
  state_of_residence: string;
  lga_of_residence: string;
  ward?: string | null;
  address?: string | null;
  institution_type?: "tertiary" | "artisan" | "youth_corps" | "general" | null;
  institution_name?: string | null;
  course_of_study?: string | null;
  graduation_year?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  profile_id: string;
  membership_number: string; // e.g., A4A-2026-KN-000142
  status: MembershipStatus;
  state_code: string;
  org_unit_id?: string | null;
  verified_at?: string | null;
  verification_token?: string | null;
  created_at: string;
  updated_at: string;
}

export interface IdCard {
  id: string;
  membership_id: string;
  card_version: number; // 1, 2, 3...
  verification_token: string; // Opaque cryptographic token for QR code
  qr_code_svg?: string | null;
  pdf_storage_path?: string | null;
  preview_storage_path?: string | null;
  status: CardStatus;
  issued_at: string;
  expires_at: string;
  revoked_at?: string | null;
  revocation_reason?: string | null;
  created_at: string;
}

export interface OrganisationalUnit {
  id: string;
  name: string;
  code: string; // Unique, e.g., ST-KN, LGA-KN-DALA, CHP-ABU
  type: OrgUnitType;
  parent_id?: string | null;
  state_code?: string | null;
  lga_name?: string | null;
  description?: string | null;
  created_at: string;
}

export interface RoleAssignment {
  id: string;
  user_id: string;
  role: UserRole;
  org_unit_id?: string | null; // For scoped authority (State, LGA, or Campus Chapter)
  state_code?: string | null;
  assigned_by?: string | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: "rally" | "symposium" | "training" | "outreach" | "meeting";
  venue: string;
  state_code: string;
  lga_name?: string | null;
  is_virtual: boolean;
  virtual_link?: string | null;
  banner_url?: string | null;
  start_date: string;
  end_date: string;
  capacity?: number | null;
  registered_count: number;
  is_published: boolean;
  created_by?: string | null;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  membership_id: string;
  ticket_token: string;
  attended: boolean;
  attended_at?: string | null;
  registered_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: "announcement" | "press_release" | "campaign" | "editorial";
  cover_image?: string | null;
  is_published: boolean;
  published_at?: string | null;
  author_name: string;
  created_at: string;
}

export interface SupportRequest {
  id: string;
  membership_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  category: "id_card" | "membership" | "chapter" | "technical" | "general";
  status: "open" | "in_progress" | "resolved" | "closed";
  response?: string | null;
  responded_by?: string | null;
  responded_at?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  target_type: string;
  target_id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
}

export interface DataRequest {
  id: string;
  membership_id: string;
  request_type: "access" | "rectification" | "erasure" | "restriction";
  status: "pending" | "processing" | "completed" | "rejected";
  details?: string | null;
  completed_at?: string | null;
  created_at: string;
}
