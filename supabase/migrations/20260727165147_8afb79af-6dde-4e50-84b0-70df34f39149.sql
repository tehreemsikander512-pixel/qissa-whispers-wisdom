CREATE TABLE public.moderation_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  conversation_id uuid,
  message text NOT NULL,
  categories text[] NOT NULL DEFAULT '{}',
  offense_count integer NOT NULL DEFAULT 1,
  blocked boolean NOT NULL DEFAULT false
);

GRANT INSERT ON public.moderation_events TO anon, authenticated;
GRANT ALL ON public.moderation_events TO service_role;

ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log moderation events"
  ON public.moderation_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX idx_moderation_events_session ON public.moderation_events (session_id, created_at DESC);