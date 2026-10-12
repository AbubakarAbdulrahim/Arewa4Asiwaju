-- Public content is visible only through an explicit field allowlist. In
-- particular, event meeting links and internal registration counters stay
-- server-side even when an event is published.
REVOKE SELECT ON public.events, public.announcements FROM anon, authenticated;

GRANT SELECT (
  id, title, slug, description, category, venue, state_code, lga_name,
  is_virtual, banner_url, start_date, end_date, capacity, is_published
) ON public.events TO anon, authenticated;

GRANT SELECT (
  id, title, slug, excerpt, content, category, cover_image, is_published,
  published_at, author_name
) ON public.announcements TO anon, authenticated;
