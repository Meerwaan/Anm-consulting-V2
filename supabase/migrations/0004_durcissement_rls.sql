-- Durcissement remonté par le linter Supabase après 0003.

-- 1. Les vues doivent appliquer la RLS de CELUI QUI INTERROGE, pas celle du créateur.
--    Sans ça, un client pourrait lire par la vue des lignes que les policies lui refusent.
alter view public.mission_dashboard            set (security_invoker = on);
alter view public.mission_module_completeness  set (security_invoker = on);

-- 2. Les fonctions de trigger n'ont rien à faire dans l'API REST : personne ne doit
--    pouvoir les appeler via /rest/v1/rpc/. Les triggers, eux, continuent de tourner.
revoke execute on function public.init_mission()             from anon, authenticated;
revoke execute on function public.notify_document_request()  from anon, authenticated;
revoke execute on function public.notify_message()           from anon, authenticated;

-- 3. Les helpers de RLS restent appelables par un utilisateur connecté (les policies en ont
--    besoin) mais pas par un visiteur anonyme. Ils ne renvoient que le contexte de l'appelant.
revoke execute on function public.current_role()             from anon;
revoke execute on function public.current_org()              from anon;
revoke execute on function public.is_my_mission(uuid)        from anon;
