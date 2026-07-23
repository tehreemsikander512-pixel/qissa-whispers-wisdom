
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','ended'))
);

GRANT SELECT, INSERT, UPDATE ON public.conversations TO anon, authenticated;
GRANT ALL ON public.conversations TO service_role;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create conversations" ON public.conversations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read conversations" ON public.conversations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update conversations" ON public.conversations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.wisdom_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  text TEXT NOT NULL,
  language TEXT NOT NULL,
  source_conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL
);

GRANT SELECT ON public.wisdom_entries TO anon, authenticated;
GRANT ALL ON public.wisdom_entries TO service_role;

ALTER TABLE public.wisdom_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read wisdom" ON public.wisdom_entries FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX wisdom_entries_created_at_idx ON public.wisdom_entries (created_at DESC);
