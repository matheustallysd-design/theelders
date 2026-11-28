CREATE OR REPLACE FUNCTION public.protect_review_hidden()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.hidden IS DISTINCT FROM OLD.hidden AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Somente administradores podem ocultar ou mostrar avaliações';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.protect_review_hidden() FROM public, anon, authenticated;
CREATE TRIGGER reviews_protect_hidden BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.protect_review_hidden();

DROP POLICY "read visible" ON public.reviews;
CREATE POLICY "read visible anon" ON public.reviews FOR SELECT TO anon USING (hidden = false);
CREATE POLICY "read visible" ON public.reviews FOR SELECT TO authenticated
  USING (hidden = false OR user_id = (select auth.uid()) OR (select public.has_role((select auth.uid()), 'admin')));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;