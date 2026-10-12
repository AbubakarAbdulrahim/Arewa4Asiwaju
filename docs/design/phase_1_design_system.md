# Arewa for Asiwaju — Phase 1 Design System

**Status:** Implemented as a provisional system; movement logo and final palette pending source asset.  
**Copy source:** User-provided _Arewa for Asiwaju (A4A) Comprehensive Strategic Blueprint, Governance Structure, and Campaign Framework_.  
**Scope:** Public identity foundation and reusable interface rules. This is not a production-readiness claim for registration, verification, privacy, or administration.

## Brand and product direction

A4A is presented as a political mobilisation and advocacy movement supporting the current administration and the Renewed Hope Agenda. The site should communicate the movement's purpose, explain policy priorities in sourced language, show its organising structure, and offer a clear route to participate. It should not present itself as a general youth-services programme or claim that unverified projects, events, member totals, or achievements exist.

The supplied document names the Renewed Hope Agenda and identifies HEARTS as a North Central sub-regional example. Public copy should distinguish movement advocacy from government programme delivery and link factual claims to sources before publishing them. The document includes office-holder names, but those were not added to the site because no dated, confirmed public leadership roster or approved portrait assets were supplied. The governance model is represented structurally; named leadership is a content-management task after confirmation.

The movement logo was not present in the project workspace when this phase was implemented. The header and footer use a plain text wordmark. No substitute emblem is drawn. The green and ochre hues below are implementation placeholders and are not approved brand colors; replace them from the supplied logo/brand guide before brand sign-off.

## Tokens

Tokens live in `src/app/globals.css` and are surfaced to Tailwind through `@theme inline`.

| Token                 | Current value                                  | Use                                       |
| --------------------- | ---------------------------------------------- | ----------------------------------------- |
| `--brand-forest`      | `#0B4619` (provisional)                        | Primary actions, links, movement emphasis |
| `--brand-forest-dark` | `#06260D` (provisional)                        | Hover/pressed primary action              |
| `--brand-ochre`       | `#805B0D` (provisional accessible text accent) | Small emphasis, numbering                 |
| `--ink`               | `#121713`                                      | Body and headings                         |
| `--paper`             | `#FBF9F5`                                      | Public page background                    |
| `--surface`           | `#FFFFFF`                                      | Forms and contained panels                |
| `--line`              | `#E2E6E2`                                      | Dividers and borders                      |
| `--muted`             | `#59636E`                                      | Secondary text                            |
| `--focus`             | `#195DA8`                                      | Visible keyboard focus                    |

Type uses the system Arial/Helvetica stack so pages do not block on a font download. Body text is 16px with 1.6 line height; section headings scale between 26px and 40px; display headings use a 36px–72px fluid clamp. The content width is 76rem. The mobile gutter is 10px below 640px and 16px otherwise. Controls use a 6px radius and content surfaces use a 10px radius. Shadows and gradients are avoided unless a later component has a clear functional need.

Status colors are semantic and must always be paired with text: success `#176B3A`, warning `#805100`, danger `#A32929`, and info `#155F83`. Do not rely on color alone. Honor `prefers-reduced-motion`.

## Component rules

- **Wordmark:** Text-only “AREWA FOR ASIWAJU / A4A MOVEMENT” until the approved logo is available. Preserve the logo's aspect ratio and clear space when supplied; do not recolor it without an approved variant.
- **Navigation:** Sticky, single-row desktop header. At narrow widths use a menu button with an accessible name, `aria-expanded`, and controlled menu; close after navigation. Mark the active route with `aria-current` and a non-color cue.
- **Buttons:** Primary (solid movement color), secondary (white with border), and quiet (text emphasis). Minimum interactive height is 46px. Use links for navigation, buttons for actions, and show disabled/loading states explicitly.
- **Forms:** Labels remain visible above fields; required and optional are stated; placeholder text is an example, not the only label. Focus is visible. Consent and optional communications start unchecked. Do not prefill personal details or infer a user's location.
- **Content rows:** Use dividers and editorial hierarchy for lists instead of repeating oversized cards. A card is reserved for a self-contained task or record.
- **Tables:** Admin tables should use a real table on wide layouts and a labeled stacked record view on narrow screens. Keep row actions grouped, visible on keyboard focus, and permission-aware.
- **Dialogs and alerts:** Include a programmatic title, deliberate focus entry/return, Escape handling when dismissible, and text that explains how to recover. Destructive actions require a clear confirmation.
- **Status indicators:** Use short text labels and semantic colors; never encode access or membership status by color alone.
- **Icons:** Lucide outline icons at consistent 16/20/24px sizes. Decorative icons are hidden from assistive technology; icon-only controls require an accessible name.

Reusable foundations currently include the button variants, field, surface, notice, status, content container, navigation, and footer styles in `globals.css` and the shared layout components. This is a small native component layer, not a shadcn/ui installation; no Radix/shadcn package was added because the current Phase 1 components do not need more runtime code.

Implemented files: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, and the reusable `src/components/ui/{Button,Field,StatusBadge}.tsx` primitives. Updated screens: `/`, `/about`, `/register`, and `/verify-card`; the latter two include explicit not-ready states. The card preview/generator no longer prints unconfirmed contact details or a verification token. No database migration or new public route was added. The pre-existing Zod v4 enum option in `src/lib/validation/registration-schema.ts` was corrected to unblock type checking.

## Page wireframes

### Public site

1. **Shared header:** Wordmark at left; Home, About A4A, and (when relevant) service navigation; one join action. On mobile, the same content moves into the controlled menu.
2. **Home:** Movement descriptor → concise purpose headline → supporting description → registration/about actions → focus summary → three numbered strategic objectives → one participation call to action. Avoid unsourced metrics, fabricated event/news cards, quotes, and member-card samples.
3. **About:** Movement overview → objectives → policy alignment (clearly identify advocacy) → operating structure (state, youth/student, grassroots). Publish leadership biographies only after roster and image approval.
4. **Registration:** Intro and privacy explanation → grouped form steps with progress → inline validation and recovery → explicit pending/verified outcomes. The existing form still needs its own workflow and privacy/security redesign in later phases.
5. **Verification:** Explain what the checker does → token field → pending, valid, invalid, suspended/revoked, and service-error states. Return only minimal information. The current API has demo success fallbacks and must not be used as a live verification authority.
6. **Footer:** Movement description and confirmed links only. Add official contact channels, privacy/terms links, and social channels after the organization provides them.

### Administrative dashboard (design specification for a later phase)

Use a distinct compact workspace: persistent left navigation on desktop and a labeled drawer on mobile; top bar for page title, scoped organization context, account/session menu; main content with a single page-level heading and breadcrumbs. Default overview should prioritize a small set of database-backed operational summaries, work queues, and recent authorized activity. Show timestamps and scope for every aggregate. Use tables and filters for member/event/content work, with server-side pagination, explicit empty states, and row-level permissions. Never render hardcoded example totals as live measures. Keep public decorative branding out of dense operational views while retaining the typography, color roles, focus rules, and component shapes.

## Responsive and accessibility rules

- Breakpoints: compact `<640px`; tablet `640–1023px`; desktop `>=1024px`.
- Design mobile first. Single-column content order follows reading order; actions wrap vertically; no horizontal page scroll. The registration form uses full-width inputs and thumb-sized actions.
- At tablet width, content groups may become two columns only when each remains readable. Admin navigation collapses before the work area becomes cramped.
- Keyboard: logical DOM order, skip-to-content link, visible focus, no hover-only actions, Escape to dismiss mobile navigation/dialogs, and focus restoration after transient UI.
- Screen readers: semantic landmarks, one H1 per page, descriptive link text, visible labels, announced form errors, and meaningful image alternatives. Decorative icons are hidden.
- Contrast target is WCAG 2.2 AA (4.5:1 body text, 3:1 large text and controls). Confirm all final logo and palette combinations with a contrast checker when the approved assets arrive.

## Critical design review and corrections

The prior screens used an invented A4A badge instead of the movement logo; generic “student and youth wing” positioning; fabricated counts, campus initiatives, an event calendar, press releases, a sample member card/person, and unsupported leadership/contact details; “100%” and privacy-compliance claims; and too many rounded cards and effects. The new home and About layouts remove these unsupported assertions and replace them with copy from the supplied movement blueprint. The A4A monogram is removed from navigation; the supplied logo is still required. Registration no longer preselects Kano, BUK, a graduation year, a gender, consent, or communications. The sample token action and the UI's compliance label were removed.

Known blockers: (1) approved logo and brand colors are not in the workspace; (2) official leadership list, public contact channels, approved privacy notice, and editorial content are not supplied; (3) registration still contains a prototype form that asks for potentially unnecessary demographic and education details; (4) account, contact verification, card issuance, and card verification are not implemented. To prevent this preview from creating or confirming fictional records, the registration, card-download, and verification API routes return a service-unavailable response, and the public registration submit control is disabled. This phase does not provide working registration or card services. Implement and test them in their designated later phases before public use.

Responsive behavior was checked against the declared mobile/tablet/desktop rules in source. A screenshot-based browser review was not possible in this session because no browser was available in the UI automation surface and neither Playwright nor Puppeteer is installed. Complete that visual check when a browser preview is available.

## Phase 2 handoff

The supplied logo is available at `public/brand/arewa-for-asiwaju-a4a.jpg` and is used in shared navigation and the homepage photo fallback. The public product name is now **Arewa for Asiwaju Student Wing**. APC institutional green, red, and orange are used as the palette; the artwork remains an opaque JPEG with its original colors. The leadership roster and official contact channels still need organizational confirmation before publication. See `docs/design/uiux-review.md` for the later public UI review and remaining manual checks.
