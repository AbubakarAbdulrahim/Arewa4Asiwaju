-- Provision the private bucket used by server-side ID-card issuance.
-- Browser clients receive no object policies; downloads are short-lived signed URLs.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'member-id-cards',
  'member-id-cards',
  FALSE,
  5242880,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = FALSE,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
