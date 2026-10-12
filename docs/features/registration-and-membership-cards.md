# Registration and Membership Cards

## Member registration

The public form is at `/register`. It collects a member's name, email, Northern state and LGA of residence, a required profile photograph, explicit acceptance of the displayed data-processing notice, and optional institution details. It does not collect date of birth, gender, NIN, voter number, political views, or phone numbers.

Signup does not send or require an email verification message. The server creates an immediately confirmed Supabase Auth identity, then calls the service-only `create_open_membership_with_photo` database function. The function delegates membership/card-record creation to the existing idempotent open-registration transaction and stores the private photo path and optional institution in the profile. A database unique constraint allocates the membership number. Public errors for duplicate accounts remain generic.

The browser crops and normalizes JPEG, PNG, or WebP input into a 720 × 960 JPEG before upload. The API independently validates file signatures, dimensions, size, and PDF decoder compatibility. The original image is never uploaded to a public bucket. The private `member-profile-photos` bucket is limited to JPEG/PNG and 5 MB; storage paths are `members/<auth-user-id>/profile.jpg`.

## Card generation and retrieval

The server generates a two-sided PDF after membership creation. It contains the member's name, membership number, state/LGA, optional institution, member photo, issue/expiry dates, A4A logo/watermark, QR verification code, and a coordinator signature line. It is stored in the private `member-id-cards` bucket. Registration returns short-lived signed preview and download URLs when card generation succeeds. If generation fails, the membership remains saved and the existing card-generation job can be retried from the authenticated portal.

Members can retrieve a card at `/retrieve-id` by entering their membership number, registered email, or raw QR token. The system returns a generic response and emails a sign-in link to the account on record; the link does not confirm whether the identifier exists. Card files remain restricted to an authenticated owner in the member portal. Email delivery is therefore required for **retrieval/account access**, but it is not a condition for initial registration or ID-card generation.

The QR code contains only an opaque random token in a URL fragment. The public verification page reveals card validity, a masked membership number, and dates; it does not expose the member's name, contact details, photo, or full card. Revoked and expired cards do not verify as active.

## Data notice and retention

The registration notice text and version come from `REGISTRATION_CONSENT_NOTICE` and `REGISTRATION_CONSENT_VERSION`. The notice must explain membership administration, ID-card generation, support, access controls, and the currently approved retention period before launch. Acceptance is recorded with a SHA-256 hash of the notice version. This record is not a substitute for the organisation's Nigeria data-protection review or a defined deletion/retention policy.

Membership photos and cards are private and retained with the membership record under approved retention rules. Until those rules are formally approved and configured, do not claim automatic deletion at a particular time. Privacy and access requests must be completed through the documented administrative workflow.

## Required production configuration

- `REGISTRATION_ENABLED=true`
- `REGISTRATION_CONSENT_NOTICE` with approved, current wording
- `REGISTRATION_CONSENT_VERSION` incremented when the notice changes
- Supabase Auth configured with the production callback URL and working email delivery for sign-in/recovery links
- The `member-profile-photos` and `member-id-cards` private buckets and all version-controlled migrations applied
- A first administrator provisioned through the secure bootstrap procedure; public registration never assigns administrator roles
- A verified authorised APC logo/signature asset, if these should appear on cards. The current template does not invent an APC mark or a person's signature.

## Migration

Apply `20261013000000_member_photo_and_retrieval.sql` after the preceding migrations. Test it with `supabase db reset` and `supabase test db`. Staging and production changes should use reviewed `supabase db push` migrations; do not edit production tables manually.

For a controlled staging integration check, start the production build with staging environment values, then run `node scripts/registration-smoke.mjs`. It posts one synthetic image, verifies the returned PDF preview/download, and removes the temporary member account and files.
