-- 0027 — fermer le search_path des trois fonctions ajoutées cette session.
--
-- Le linter Supabase les signalait toutes les trois : un appelant qui pose son propre
-- `search_path` peut faire résoudre `findings` vers une table qu'il contrôle. Elles
-- qualifient déjà toutes leurs tables en `public.`, donc un search_path vide est sûr.
alter function public.touch_updated_at() set search_path = '';
alter function public.definir_rang_constat(uuid, uuid, int) set search_path = '';
alter function public.supprimer_constat(uuid, uuid) set search_path = '';
