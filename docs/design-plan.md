# Arewa for Asiwaju Student Wing — Design Plan

## 1. Executive Summary & Brand Direction

**Arewa for Asiwaju (A4A) Student Wing** is a civic mobilisation, policy translation, and youth leadership movement spanning Nigeria's 19 northern states and the Federal Capital Territory (FCT). The platform serves Nigerian university, polytechnic, and college students who primarily access the web via mobile devices with constrained bandwidth and share campaign material across WhatsApp.

The design language moves away from generic corporate SaaS patterns and AI-template clichés. It presents a confident, disciplined editorial voice grounded in authentic Nigerian civic visual culture.

---

## 2. Color System & Tokens

We establish a restrained, high-contrast palette built on authentic Nigerian forest green, a warm stone canvas (avoiding sickly yellowed cream), a deep slate-forest charcoal neutral (avoiding pure #000000 and generic #0B0B0B), and a warm ochre-amber accent reserved strictly for key student engagement actions.

### Core Hex Tokens

| Token                | Light Theme | Dark Theme | Purpose                                             |
| :------------------- | :---------- | :--------- | :-------------------------------------------------- |
| `--brand-green`      | `#046735`   | `#2ea866`  | Primary movement identity, headers, key brands      |
| `--brand-green-deep` | `#034a26`   | `#1c683e`  | Hover states, hero backgrounds, high-contrast fills |
| `--neutral-dark`     | `#121814`   | `#f0f4f1`  | Primary text (`--ink`), grounding elements          |
| `--canvas`           | `#f8f7f4`   | `#0e1410`  | Warm-white page background (`--paper`)              |
| `--surface`          | `#ffffff`   | `#16201a`  | Card & form container background                    |
| `--line`             | `#e1e6e2`   | `#27362d`  | Structural dividing borders                         |
| `--muted`            | `#526056`   | `#9eb0a3`  | Secondary text, timestamps, captions                |
| `--accent-amber`     | `#c86d1a`   | `#f09a47`  | Student callout highlight, banner action accent     |
| `--focus`            | `#195da8`   | `#94bfff`  | WCAG 2.2 AA visible keyboard focus ring             |

### Semantic Tokens

- **Success:** `#176b3a` (light) / `#48c774` (dark)
- **Warning:** `#805100` (light) / `#e5a93c` (dark)
- **Danger:** `#b32626` (light) / `#f26d6d` (dark)
- **Info:** `#12567a` (light) / `#5bb2e0` (dark)

---

## 3. Typography & Modular Scale

We replace system fonts and overused AI-defaults (Inter, Poppins, Roboto, Playfair) with two distinct, open-source Google fonts loaded via `next/font`:

- **Display Family:** `Bricolage Grotesque` — A modern grotesk typeface with authentic human rhythm, angular personality, and civic strength.
- **Body Family:** `Plus Jakarta Sans` — An exceptionally crisp geometric sans with wide apertures and high x-height, rendering cleanly on budget mobile displays.

### Modular Scale & Rules

- **Line length:** Strictly capped at `68ch` – `72ch` for long-form prose and editorial content.
- **Sentence case throughout:** No shouty ALL-CAPS headings. Eyebrows are reserved only for real data (dates, categories).
- **Scale:**
  - `Hero Display / H1`: `clamp(2.1rem, 4.8vw, 3.4rem)` · line-height `1.12` · letter-spacing `-0.035em`
  - `Section H2`: `clamp(1.5rem, 3.2vw, 2.25rem)` · line-height `1.2` · letter-spacing `-0.025em`
  - `Subheading H3`: `clamp(1.2rem, 2.2vw, 1.45rem)` · line-height `1.3` · letter-spacing `-0.015em`
  - `Card Header H4`: `1.0625rem (17px)` · line-height `1.4` · font-weight `700`
  - `Body / Lead`: `1.0625rem (17px)` (desktop) / `1rem (16px)` (mobile) · line-height `1.65`
  - `Small / Meta / Caption`: `0.8125rem (13px)` · line-height `1.45`

---

## 4. Layout Architecture & ASCII Wireframes

### Page 1: Homepage (Mobilisation & Regional Presence)

_One-sentence concept: High-conviction student mobilisation page balancing an urgent visual hero, an interactive regional map, transparent civic achievements, and rapid participation actions._

```text
+-------------------------------------------------------------------+
| [Navbar] A4A Logo | About | Leadership | News | Events | Banner | Join |
+-------------------------------------------------------------------+
| HERO (Split Grid on Desktop, Stacked on Mobile)                   |
|  Connect Northern students with policy...    [ Hero Carousel ]    |
|  Clear youth mobilisation message.           [ 4 Leaders     ]    |
|  [Join the Student Wing] [Make your banner]  [ 5s Cadence    ]    |
+-------------------------------------------------------------------+
| REGIONAL REACH (Bold Feature: Interactive Northern Map)           |
|  19 Northern States + 1 FCT                                       |
|  +------------------------------+  +----------------------------+ |
|  | Interactive SVG Map          |  | State Detail Panel         | |
|  | Zones: NW, NE, NC (Selectable|  | Name, Capital, Zone, LGAs  | |
|  | Hover/tap highlights state   |  | [Join Chapter] Action      | |
|  +------------------------------+  +----------------------------+ |
|  Accessible tabular / list fallback for screen readers            |
+-------------------------------------------------------------------+
| WHAT WE STAND FOR (Compact 3-item horizontal / vertical list)     |
|  1. Organise locally  2. Explain policy  3. Include young people   |
+-------------------------------------------------------------------+
| VERIFIED ACHIEVEMENTS (Quiet tabular band with official sources)  |
|  Education: ₦86.3bn (NELFUND) | Roads: 279+ | Health: 8,800 PHCs  |
|  [Official State House source links under each item]              |
+-------------------------------------------------------------------+
| MAKE YOUR BANNER TEASER (Visual specimen + 1-click generator CTA) |
+-------------------------------------------------------------------+
| NEWS & CAMPUS DISPATCHES (Lead story + compact list / invitation) |
+-------------------------------------------------------------------+
| [Footer] Purpose, WhatsApp Direct, Leadership, Legal, APC mark    |
+-------------------------------------------------------------------+
```

### Page 2: Editorial / Content Page (About absorbing Mission)

_One-sentence concept: Quiet, authoritative long-form editorial layout with pull statements, the single numbered organising path, and focus area briefs._

```text
+-------------------------------------------------------------------+
| Header: "About the Student Wing" + Plain purpose statement        |
+-------------------------------------------------------------------+
| Pull Quotes: Mission statement & Vision statement                 |
+-------------------------------------------------------------------+
| THE ORGANISING HIERARCHY (The ONLY place numbers are used)        |
|  01 National oversight                                            |
|  02 Zonal coordination (North-West, North-East, North-Central)    |
|  03 State chapters (19 Northern States + FCT)                     |
|  04 Local government areas (419 LGAs)                             |
|  05 Ward structures                                               |
|  06 Campus units (Tertiary institutions across the North)         |
+-------------------------------------------------------------------+
| WHAT WE FOCUS ON (Education, Agriculture, Infrastructure, Civic)  |
+-------------------------------------------------------------------+
```

### Page 3: Leadership Directory

_One-sentence concept: Transparent photo-led directory of approved coordinators alongside an accessible structural diagram and an invitation to lead your campus._

```text
+-------------------------------------------------------------------+
| Header: Leadership & governance                                   |
| "Students in every northern state, organised ward by ward"        |
+-------------------------------------------------------------------+
| Approved Leadership Grid (Photo, Name, Role, State/Zone, Bio)     |
| (Uses real verified records; structured fallback if empty)        |
+-------------------------------------------------------------------+
| Governance Framework diagram + "Coordinate your state" action     |
+-------------------------------------------------------------------+
```

### Page 4: News & Events (List Pages)

_One-sentence concept: Magazine-style layout with lead dispatch, category filtering, reading times, and warm invitation states when no posts are scheduled._

```text
+-------------------------------------------------------------------+
| Header: Newsroom & Announcements                                  |
| [Lead Article Card: Image, Date, Reading time, Summary]           |
| Secondary Grid: List of stories                                   |
| Empty state: "No stories yet. Follow us on WhatsApp to get first" |
+-------------------------------------------------------------------+
```

### Page 5: Tools (Banner Generator)

_One-sentence concept: Split-screen desktop workbench and sticky-top mobile preview with instantaneous canvas updates and zero server image transmission._

```text
+-------------------------------------------------------------------+
| Header: "Make your movement banner"                               |
| "Your photo never leaves your phone."                             |
+------------------------------------+------------------------------+
| CONTROLS (Left on Desktop)         | PREVIEW (Right / Sticky Top) |
| - Full name input                  | [ Live Canvas Render ]       |
| - Role / Designation input         | - Drag photo to pan          |
| - Photo upload input               | - Real-time typography sync  |
| - Zoom & crop range slider         |                              |
| - [Download PNG] [Share WhatsApp]  | 1528 x 2160 HD output badge  |
+------------------------------------+------------------------------+
```

---

## 5. Discipline & Boldness Allocation

- **Where Boldness is Spent:**
  1. **Home Hero:** Clean typography lockup paired with the existing 4-leader high-impact carousel.
  2. **Interactive Northern Map:** Custom, lightweight SVG map of Nigeria highlighting the 19 northern states + FCT, with immediate state-level feedback and zone grouping.
- **Where Discipline is Kept:**
  - All other sections avoid flashy floating elements, superfluous 3D widgets, or AI-style background glow blobs.
  - Cards are restrained, border-based (`border-line`), and use white/neutral surface backgrounds without heavy shadows.

---

## 6. Review Against the Avoid-List

| Avoid-List Item                                      | Status in Plan | How It Is Addressed                                                                                                                                               |
| :--------------------------------------------------- | :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cream background + serif + terracotta accent**     | Rejected       | We use modern warm-white stone (`#f8f7f4`), geometric/humanist sans (`Bricolage Grotesque` + `Plus Jakarta Sans`), and restrained forest green with amber accent. |
| **Near-black + acid green**                          | Rejected       | Dark mode uses deep pine-charcoal (`#0e1410`) and balanced forest emerald (`#2ea866`), never neon/acid green.                                                     |
| **Tracked-out ALL-CAPS eyebrow on every header**     | Rejected       | Eyebrows eliminated from generic section titles; preserved only on dates and categories.                                                                          |
| **Numbered 01/02/03 markers on non-sequences**       | Rejected       | Strict ban on numbers except for the 6-tier governance hierarchy (National → Campus).                                                                             |
| **Identical rounded cards with the same shadow**     | Rejected       | Diverse layout patterns: quiet horizontal data bands for achievements, structured vertical path for organisation, tables and editorial lists for priorities.      |
| **Single word accented in different colour/italic**  | Rejected       | Headlines use uniform font color and weight for integrity and authority.                                                                                          |
| **Fade-and-slide on every section; card hover-lift** | Rejected       | Zero scroll-jacking; one orchestrated hero transition; motion reserved strictly for user feedback (map click, slider drag, banner updates).                       |
| **"->" arrows appended to every link**               | Rejected       | Plain text links or purposeful Lucide icons with text. No decorative "A · B · C" or "WORD — fragment" tags.                                                       |
| **Build-process caveats**                            | Rejected       | Removed all meta-talk ("The supplied framework describes...", "Roster confirmation in progress", "This describes the intended framework...").                     |
