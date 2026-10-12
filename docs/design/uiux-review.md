# Public UI/UX review

**Review date:** 2026-10-11  
**Scope:** Public homepage, shared navigation/footer, identity, carousel, and copy.  
**Movement name:** Arewa for Asiwaju Student Wing.

## Findings and corrections

| Finding                                                                                                         | User impact                                                                               | Correction                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared branding said “A4A Movement” and generic public copy did not identify the Student Wing.                  | Visitors could misunderstand which part of the movement this site represents.             | Updated shared wordmark, homepage, About page, footer, registration heading, and site metadata to use “Arewa for Asiwaju Student Wing.”                                                                                                                                                                        |
| Main page opened with a text-only hero and a small generic focus panel.                                         | The first screen lacked a strong visual entry point and gave the movement little context. | Reworked the hero into a responsive editorial layout, used the supplied logo artwork, and added an explicit Student Wing overview and policy context.                                                                                                                                                          |
| The site used provisional forest/gold hues with a blue focus accent and no coherent APC identity treatment.     | Brand color usage felt inconsistent.                                                      | Adopted APC identity guide green `#046735`, red `#DC1F2E`, and orange `#DE5B2F`; added a restrained three-color navigation stripe. The blue focus ring remains for clear keyboard focus. The supplied A4A logo remains unaltered.                                                                              |
| Homepage sections had repetitive list treatment and little student-specific wayfinding.                         | The page did not clearly connect strategic objectives to the student audience.            | Added a distinct Student Wing introduction, objectives, policy-advocacy section, live updates area, and clear registration-interest calls to action.                                                                                                                                                           |
| No homepage photo experience existed, and no verified movement activity photos are available in the repository. | The page felt static; adding generic stock photos could imply events that did not happen. | Added a manual, keyboard-operable photo carousel that draws only from published news/event cover images hosted by the configured Supabase project. It uses the supplied official logo as an honest fallback and explicitly says activity photos will appear after publication. No autoplay or invented photos. |
| Carousel controls could be difficult to operate on touch screens if implemented as tiny dots.                   | Small targets reduce usability for mobile users and people with motor impairments.        | Controls use 44px targets, visible focus styling, accessible names, a live slide count, and previous/next buttons. No motion runs automatically.                                                                                                                                                               |
| Published-image URLs must not be trusted blindly.                                                               | An arbitrary URL could load unrelated external content or leak visitor requests.          | Homepage only includes local assets or images whose origin matches the configured Supabase project. Carousel uses responsive dimensions and loads the hero image as priority content.                                                                                                                          |

## Reference use

The CBM reference helped identify broad patterns worth considering: a strong lead section, clear participation routes, separate mission/structure/updates content, and a visual story area. Its words, branding, photographs, data, and distinctive arrangements were not copied. Arewa for Asiwaju’s page uses its own copy from the supplied movement brief and its own logo.

The APC color values above follow the official [APC Visual Identity Guide](https://www.apc.org/sites/default/files/APC_Visual_Guide_2017.pdf). APC identity colors are used as restrained accents; the A4A logo itself is not recolored.

## Accessibility and usability checks

- One page-level heading; sections have descriptive headings and landmarks.
- Carousel controls are native buttons, keyboard reachable, named for screen readers, and have visible focus via the site-wide `:focus-visible` rule.
- Carousel does not auto-advance, so users control the timing and reduced-motion preferences are respected.
- Editorial cover images have empty alt text because the adjacent story title/caption supplies the link meaning; the movement logo fallback has descriptive alt text.
- Hero content stacks before the photo area on small screens; image uses a stable 4:3 box to avoid layout shift.
- Primary/secondary actions remain high contrast and links retain underlines on hover/focus.

## Remaining content and review needs

- No approved Student Wing activity photos were supplied. The carousel will show the logo fallback until content editors publish verified photos through the site.
- Verify registration remains visibly unavailable while the backend is pending; the current CTA must not imply registration is accepting members until the registration feature is enabled.
- Run a screenshot-based review at 360px, 768px, 1280px, and 1440px and a manual keyboard/screen-reader review before launch. This source review alone does not establish WCAG conformance.
- Confirm official naming/capitalisation for public translations and official leadership/contact data before publication.
