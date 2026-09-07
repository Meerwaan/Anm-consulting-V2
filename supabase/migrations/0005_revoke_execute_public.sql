-- 0004 révoquait EXECUTE sur anon/authenticated, mais Postgres accorde EXECUTE à PUBLIC
-- par défaut à la création d'une fonction : c'est ce grant-là qui laissait les fonctions
-- exposées dans /rest/v1/rpc/. On révoque donc à PUBLIC, puis on re-donne le strict nécessaire.

-- Fonctions de trigger : appelées uniquement par les triggers (qui tournent en tant que
-- propriétaire de la table). Personne d'autre n'a besoin de les appeler.
revoke execute on function public.init_mission()             from public;
revoke execute on function public.notify_document_request()  from public;
revoke execute on function public.notify_message()           from public;

-- Helpers de RLS : nécessaires aux policies, donc appelables par un utilisateur connecté,
-- mais jamais par un visiteur anonyme. Ils ne renvoient que le contexte de l'appelant
-- (auth.uid()), donc aucune donnée d'un autre client n'est accessible par ce biais.
revoke execute on function public.current_role()      from public;
revoke execute on function public.current_org()       from public;
revoke execute on function public.is_my_mission(uuid) from public;

grant execute on function public.current_role()      to authenticated;
grant execute on function public.current_org()       to authenticated;
grant execute on function public.is_my_mission(uuid) to authenticated;
