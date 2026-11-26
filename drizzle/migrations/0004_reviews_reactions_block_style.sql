ALTER TABLE public.content_blocks ADD COLUMN color text NOT NULL DEFAULT 'default', ADD COLUMN font text NOT NULL DEFAULT 'body', ADD COLUMN frame text NOT NULL DEFAULT 'straight';

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  author text NOT NULL DEFAULT 'Leitor',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '' CHECK (char_length(comment) <= 1000),
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read visible" ON public.reviews FOR SELECT TO anon, authenticated USING (hidden = false OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "insert own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND hidden = false);
CREATE POLICY "update own or admin" ON public.reviews FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "delete own or admin" ON public.reviews FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chapter text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('arrepiante','epico','misterioso')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, chapter)
);
GRANT SELECT ON public.reactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reactions TO authenticated;
GRANT ALL ON public.reactions TO service_role;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read all" ON public.reactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert own" ON public.reactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update own" ON public.reactions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete own" ON public.reactions FOR DELETE TO authenticated USING (user_id = auth.uid());