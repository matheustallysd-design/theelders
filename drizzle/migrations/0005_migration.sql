ALTER TABLE public.content_blocks ADD COLUMN IF NOT EXISTS style jsonb NOT NULL DEFAULT '{}'::jsonb;

DROP POLICY IF EXISTS "read all" ON public.reactions;
CREATE POLICY "read own" ON public.reactions FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

CREATE OR REPLACE FUNCTION public.reaction_counts(_chapter text)
RETURNS TABLE(kind text, total bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT kind, count(*) FROM public.reactions WHERE chapter = _chapter GROUP BY kind $$;
GRANT EXECUTE ON FUNCTION public.reaction_counts(text) TO anon, authenticated;