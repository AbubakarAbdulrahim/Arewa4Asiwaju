# AREWA4ASIWAJU DIGITAL PLATFORM
## Phase 0: Repository Audit and Product Discovery Deliverable

**Author:** Principal Software Architect & Technical Lead  
**Date:** October 9, 2026  
**Status:** Approved & Baselined  
**Project:** Arewa4Asiwaju Digital Platform  
**Target Environment:** Next.js (App Router), Supabase (PostgreSQL, Auth, Storage, RLS), Vercel, Cloudflare  

---

## 1. Executive Summary & Repository Audit

### 1.1 Project Context & Nature
**Arewa4Asiwaju** is an enterprise-grade digital civic mobilisation, membership management, and chapter governance platform for the student and youth wing across the 19 Northern Nigerian States and the Federal Capital Territory (FCT). 

The platform serves dual core purposes:
1. **Public Citizenry & Supporter Engagement:** High-credibility, authentic digital presence detailing ideology, leadership, news, events, and transparent membership verification.
2. **Administrative & Operational Engine:** Scalable, secure membership onboarding, concurrency-safe digital ID card generation with cryptographic verification, granular hierarchical chapter governance (National → State → LGA → Ward → Campus/Chapter), event ticketing, and NDPR (Nigeria Data Protection Regulation/Act 2023) compliant data governance.

### 1.2 Repository Inspection & Technical Baseline
An exhaustive audit of the workspace (`c:\arewa4asiwaju`) was executed:
- **Repository State:** Greenfield Git repository initialized on branch `dev` (tracking `origin/dev`), with an initial commit containing a minimal `README.md` and standard `.gitignore`.
- **Runtime Environment:**
  - Node.js: `v22.19.0` (LTS active)
  - Package Manager: `npm 11.6.2` (invoked via `npm.cmd` / `npx.cmd` to comply with Windows PowerShell Restricted ExecutionPolicy)
  - OS: Windows 11 Enterprise environment
- **Existing Code & Assets:**
  - No legacy frameworks or conflicting codebases present.
  - No existing database migrations or schema locks.
  - Zero technical debt from prior iterations; zero regression risks on existing modules.
- **Reference Analysis (`cbmnigeria.org`):**
  - Evaluated civic movement paradigms: grassroots onboarding, membership card generation, event RSVPs, chapter identification, and public engagement.
  - **Distinction Enforced:** Arewa4Asiwaju maintains an entirely original visual identity, bespoke typography, northern-tailored geographic taxonomy (19 Northern States, 419 LGAs, wards, and tertiary institutions), and custom Next.js server-side architecture rather than copying layouts or styles.

---

## 2. Requirements Engineering

### 2.1 Functional Requirements Matrix

| Module ID | Module Name | Core Capabilities | Critical Edge Cases |
| :--- | :--- | :--- | :--- |
| **MOD-A** | **Public Web Platform** | • Informative homepage establishing mission, core pillars, and national credibility.<br>• Leadership directory with bios and regional portfolios.<br>• Verified news, media gallery, FAQs, and contact desk.<br>• Public card verification portal via secure opaque token.<br>• Hausa localisation-ready i18n structure. | • Slow 2G/3G connectivity in rural northern corridors.<br>• Image weight and layout shifts on budget Android devices.<br>• Safe fallback for unverified cards without disclosing private data. |
| **MOD-B** | **Public Registration** | • Multi-step accessible onboarding (Personal Info, Geo-hierarchy down to Ward/Campus, Contact Verification).<br>• Photo capture/upload with client-side compression.<br>• NDPR consent recording with immutable timestamp and IP hash.<br>• Duplicate detection (Phone, Email, NIN/Voter ID hash). | • Interrupted registrations.<br>• Concurrent identical phone/NIN registrations.<br>• Enumeration attacks (public error messages must never confirm whether an account exists). |
| **MOD-C** | **Automated Digital ID Engine** | • Concurrency-safe ID sequence generator: `A4A-{YEAR}-{ST_CODE}-{SEQ_6DIGIT}`.<br>• High-resolution vector PDF generation & WebP/PNG preview.<br>• Dynamic QR code containing opaque HMAC-signed verification URL.<br>• Private storage with short-lived signed URLs.<br>• Card lifecycle: Active, Suspended, Revoked, Reissued. | • Race conditions during peak mobilisation rallies.<br>• Re-issuance preserving history and incrementing card version.<br>• Tamper-evident verification without exposing member PII. |
| **MOD-D** | **Member Self-Service Portal** | • Supabase Auth (Passwordless OTP / Email magic link / Password).<br>• Live digital ID card viewing, wallet download, and printable PDF.<br>• Event discovery, RSVP, and unique QR ticket generation.<br>• Profile details update with audit trail.<br>• Communication preferences & NDPR data subject access/deletion requests. | • Session invalidation across devices.<br>• Strict isolation: Member can only view their own records (RLS). |
| **MOD-E** | **Central Administration Portal** | • Scoped dashboard metrics (State, LGA, Chapter counts).<br>• Member directory with complex filtering, pagination, and status management.<br>• Duplicate investigation triage.<br>• Card suspension/revocation controls.<br>• Content Management System (News, Events, Media, FAQs).<br>• Role assignment and audit log explorer. | • Role escalation prevention.<br>• Bulk export security (restricted by role and purpose).<br>• Coordinator access strictly bounded by geographic scope. |
| **MOD-F** | **Hierarchical Governance** | • 5-Tier Organizational Hierarchy: National → State → LGA → Ward → Campus Chapter.<br>• Coordinator appointments with scoped permissions.<br>• Transfer workflows for students relocating or graduating. | • Circular parent-child relationships in org units.<br>• Cross-state data leakage among coordinators. |
| **MOD-G** | **Events & Mobilisation** | • Event scheduling, venue/virtual links, capacity caps.<br>• Scoped attendance check-in via QR ticket scanning.<br>• Post-event media and attendance metrics. | • Oversubscription handling.<br>• Duplicate check-ins. |
| **MOD-H** | **Content Management System** | • Editorial workflow: Draft → In Review → Published → Archived.<br>• Rich media asset management with alt-text and categorization.<br>• Leadership profiles and press statements. | • Unauthorised publication of unvetted announcements.<br>• XSS prevention in rich text rendering. |
| **MOD-I** | **Reporting & Analytics** | • Anonymized demographic, geographic, and temporal trend analytics.<br>• Card issuance success vs. failure rates.<br>• No raw sensitive political data exposed in aggregate feeds. | • Query timeouts on massive member tables (indexes required). |
| **MOD-J** | **Notification Engine & Outbox** | • Transactional email dispatch (Welcome, Card Ready, Event RSVP).<br>• Outbox pattern in database for reliable delivery & retries.<br>• Support ticket submission and administrative responses. | • Outbound provider rate limits and transient network drops. |

---

## 3. Route & Module Inventory

### 3.1 Public Routes (`(public)`)
- `/` — Homepage: Hero, Mission, Impact Pillars, Live Verification CTA, Latest News, Upcoming Events.
- `/about` — Detailed organisational background, manifesto, and governance structure.
- `/leadership` — National, Zonal, and State leadership directories.
- `/news` — Press releases, articles, and campaign announcements.
- `/news/[slug]` — Detailed news article with reading time and social share integration.
- `/events` — Comprehensive events calendar with category filters.
- `/events/[id]` — Event details with RSVP button and countdown.
- `/gallery` — Media gallery featuring campaign rallies, campus symposiums, and community outreach.
- `/faq` — Frequently Asked Questions grouped by category.
- `/contact` — Contact directory, campus liaison desk, and feedback form.
- `/privacy` — NDPR-compliant Privacy Notice, data rights, and DPO contact.
- `/terms` — Membership Terms of Service and Code of Conduct.
- `/verify-card` — Public card verification portal (QR target or manual token input).
- `/register` — Multi-step public membership onboarding application.
- `/register/success` — Registration acknowledgment, verification confirmation, and portal redirect.

### 3.2 Authentication Routes (`(auth)`)
- `/auth/login` — Unified Member and Staff login with MFA readiness.
- `/auth/forgot-password` — Password recovery request.
- `/auth/reset-password` — Password reset completion via secure token.
- `/auth/verify` — Email / OTP verification landing.
- `/auth/callback` — Supabase Auth session exchange and route dispatcher.

### 3.3 Member Self-Service Portal (`(portal)`)
- `/portal` — Member Dashboard: Current status, quick card view, upcoming events, notifications.
- `/portal/id-card` — High-fidelity Digital ID Card, PDF download, print mode, QR refresh.
- `/portal/profile` — Personal information, educational institution, chapter details, photo update.
- `/portal/events` — Registered events, event QR passes, attendance history.
- `/portal/support` — Open support inquiries and track administrative replies.
- `/portal/privacy` — Data rights request submission (export data, rectify, or request erasure).

### 3.4 Administrative Dashboard (`(admin)`)
- `/admin` — Central Executive Overview: Key metrics, regional activity heatmap, issuance rates.
- `/admin/members` — Member Master Registry: Multi-filter, fuzzy search, state/LGA facets, status actions.
- `/admin/members/[id]` — Deep member dossier, ID card history, audit logs, status controls.
- `/admin/cards` — Card Issuance Lifecycle: Pending batches, active cards, revoked/flagged cards.
- `/admin/org-units` — Organizational Unit Tree: States, LGAs, Wards, Campus Chapters, Coordinator rosters.
- `/admin/events` — Event Manager: Creator, attendance tracker, ticket scanner dispatch.
- `/admin/content/news` — Articles and press release management.
- `/admin/content/leadership` — Leadership profiles and portfolio assignments.
- `/admin/content/gallery` — Media uploads and albums.
- `/admin/content/faq` — FAQ questions, answers, and ordering.
- `/admin/support` — Member helpdesk ticket triage and responder.
- `/admin/roles` — Granular Role & Permission matrix and coordinator geographic scope assignments.
- `/admin/audit-logs` — Immutable audit trail with actor, action, target, IP, and timestamp.
- `/admin/analytics` — Regional and demographic reports with CSV/PDF export restrictions.
- `/admin/settings` — System parameters, maintenance mode, notification credentials check.

### 3.5 API & Route Handlers (`/api/...`)
- `/api/auth/webhook` — Supabase Auth event listener for profile synchronization.
- `/api/register` — Validated server-side registration endpoint with abuse rate limiting.
- `/api/cards/generate` — Server-side idempotent ID card rendering (PDF generation and storage commit).
- `/api/cards/[id]/download` — Authenticated short-lived signed URL dispenser.
- `/api/verify-token` — Opaque cryptographic QR token verification returning minimal sanitised data.
- `/api/portal/events/rsvp` — Concurrency-controlled event RSVP handler.
- `/api/admin/export` — Scoped, audit-logged administrative data exporter.

---

## 4. Technical Architecture Proposal

### 4.1 Frontend Stack & Component Strategy
- **Core:** Next.js 15 (App Router), React 19, TypeScript strict mode (`noImplicitAny`, `strictNullChecks`).
- **Styling Architecture:** Tailwind CSS with bespoke custom design tokens. Zero generic UI templates.
- **Component Primitives:** Accessible primitives based on Radix UI / shadcn/ui patterns.
- **Form Management:** React Hook Form bound with Zod schemas sharing validation between client and server.
- **Iconography:** Lucide React icons, chosen for visual consistency and clean SVG rendering.

### 4.2 Brand & Visual Design Identity
- **Primary Brand Palette:**
  - **Arewa Emerald Deep:** `#0B4619` (Symbolising northern agrarian vitality, dignity, and national flag heritage)
  - **Arewa Savanna Gold / Ochre:** `#C59B27` (Symbolising northern richness, leadership, and optimism)
  - **Kano Earth Charcoal:** `#121713` (Deep, high-contrast dark foundation for typography and cards)
  - **Neutral Sand Warm:** `#FBF9F5` (Soft, glare-free background optimized for bright African outdoor viewing)
  - **Neutral Border Slate:** `#E2E6E2` (Subtle, refined borders eliminating heavy visual clutter)
  - **Accent Status Colors:** Success `#15803D`, Warning `#B45309`, Danger `#B91C1C`, Info `#0369A1`
- **Typography:**
  - Headings: *Outfit* / *Cabinet Grotesk* (commanding, modern civic typography).
  - Body: *Inter* / *Figtree* (crystal clear legibility at 14px–16px on mobile Android screens).
  - Monospace: *JetBrains Mono* (used for Membership Numbers, Verification Tokens, and Audit IDs).

### 4.3 Database Architecture & Data Integrity (PostgreSQL)
- **Primary Keys:** UUID v4 for all domain entities.
- **Sequential Concurrency:** Atomic PostgreSQL counter sequence per year/state to guarantee gapless, race-condition-free membership numbers (`A4A-2026-KN-000142`).
- **Data Access:** 100% of tables protected by Row Level Security (RLS). No public read/write grants on core tables.
- **Audit Logging:** Database triggers and server action hooks logging every administrative mutation to `audit_logs`.
- **Sensitive Data Handling:** PII hashing, encrypted storage pointers for member photos and ID cards, zero plain-text personal credentials in QR payloads.

### 4.4 Automated Digital ID Card Subsystem
- **Engine:** Server-side PDF generation using `pdf-lib` / vector canvas compositing.
- **Dimensions:** ISO/IEC 7810 ID-1 standard (85.60 mm × 53.98 mm, standard credit/voter card aspect ratio 1.586).
- **Features on Card:**
  - Front: Movement Crest, Member Photo, Full Name, Unique Membership Number, State of Registration, LGA, Issue Date, Expiry Date, Barcode/QR Code.
  - Back: Movement Code of Conduct summary, Emergency hotline, Non-transferable legal notice, Return address.
- **Cryptographic QR Code:**
  - Target URL: `https://arewa4asiwaju.org/verify-card?token={OPAQUE_CRYPTO_TOKEN}`.
  - Token is a 256-bit secure random identifier linked to the active card issuance record.
  - Verification endpoint confirms: Status (VALID / SUSPENDED / REVOKED), Member First Name + Initial, State/Chapter, Issue Year. **Zero phone numbers, full addresses, or NINs are returned.**

---

## 5. Initial Risk Register & Mitigation Strategy

| Risk ID | Risk Category | Risk Description | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | **Security / Abuse** | Mass bot submissions during public registration leading to DB bloat. | High | Cloudflare Turnstile bot verification + Redis/In-memory IP rate limiting + unique phone/email database check constraints. |
| **RSK-02** | **Concurrency** | Multiple concurrent registrations allocating the same membership sequence. | Critical | Atomic PostgreSQL transaction lock via `SELECT FOR UPDATE` on state sequence records or native PostgreSQL sequences. |
| **RSK-03** | **Privacy / NDPR** | Political affiliation and supporter information exposed through unauthenticated APIs. | Critical | Strict Supabase RLS on all tables; public verification returns strictly obfuscated minimal metadata; signed short-lived storage URLs. |
| **RSK-04** | **Performance** | Sluggish load times on 2G/3G mobile networks across northern rural areas. | High | Next.js Server Components, static generation for public pages, Next/Image WebP compression, lightweight CSS footprint (<50KB). |
| **RSK-05** | **Security / RBAC** | State/LGA coordinators viewing or modifying records outside their assigned jurisdiction. | High | Server-side organisational scope guard enforced in both Supabase RLS policies and Next.js Server Action middleware. |
| **RSK-06** | **Operational** | PDF card generation failing under sudden serverless timeout or memory limits. | Medium | Lightweight vector PDF synthesis using `pdf-lib` (zero headless Chrome overhead), idempotent retry queue via outbox. |

---

## 6. Phase-by-Phase Execution Plan

1. **Phase 0: Repository Audit and Product Discovery (COMPLETED)**
2. **Phase 1: Project Scaffolding & Design System**
3. **Phase 2: Database Schema, Migrations, RLS & Seed Data**
4. **Phase 3: Core Authentication, Authorization (RBAC) & Scoped Access Engine**
5. **Phase 4: Public Website & Brand Design**
6. **Phase 5: Public Membership Registration Workflow & Validation**
7. **Phase 6: Automatic Digital ID Card Engine & QR Verification**
8. **Phase 7: Member Self-Service Portal**
9. **Phase 8: Organizational Hierarchy & Chapter Management**
10. **Phase 9: Administrative Dashboard & Member Management**
11. **Phase 10: Events, Content Management & Support Helpdesk**
12. **Phase 11: Analytics, Reporting & Audit Logging**
13. **Phase 12: Security Hardening, NDPR Compliance Review & Edge Protection**
14. **Phase 13: Automated Testing & Accessibility QA**
15. **Phase 14: Production Readiness, Deployment & Handover**

---

## 7. Phase 0 Acceptance Criteria Verification

- [x] Current project state accurately understood and documented.
- [x] Existing work documented with zero regressions.
- [x] Critical architectural uncertainties documented in Risk Register.
- [x] Complete route and module inventory established.
- [x] Detailed 14-phase roadmap locked.
