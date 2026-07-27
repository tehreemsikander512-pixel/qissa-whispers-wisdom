DROP POLICY "Anyone can log moderation events" ON public.moderation_events;
REVOKE INSERT ON public.moderation_events FROM anon, authenticated;