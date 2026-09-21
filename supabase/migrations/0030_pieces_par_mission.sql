-- 0030 — une pièce ne peut vivre que dans le dossier de sa mission.
--
-- La policy de 0028 laissait tout consultant lire et écrire n'importe où dans le bucket.
-- Le chemin est désormais imposé : `{mission_id}/…`. Le premier segment doit être
-- l'identifiant d'une mission existante, sinon l'écriture est refusée par la base
-- elle-même — un bug applicatif ne peut pas ranger une pièce dans le mauvais dossier.
-- Même règle pour les PDF de rapport, rangés sous `{mission_id}/rapports/`.
--
-- Le `case` garantit l'ordre d'évaluation : sans lui, Postgres peut tenter la conversion
-- en uuid d'un segment qui n'en est pas un, et l'erreur remplacerait le refus propre.
--
-- Pas de liste de types MIME au niveau du bucket : sur place, une DSN, un export de
-- logiciel de planning ou un .eml arrivent souvent en application/octet-stream, et un
-- refus au moment du dépôt serait pire que le risque couvert (seule la consultante dépose).
create or replace function public.pieces_chemin_valide(p_nom text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when (storage.foldername(p_nom))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then exists (select 1 from public.missions m where m.id = ((storage.foldername(p_nom))[1])::uuid)
    else false
  end
$$;

revoke execute on function public.pieces_chemin_valide(text) from public, anon;
grant execute on function public.pieces_chemin_valide(text) to authenticated;

drop policy if exists "pieces_consultant" on storage.objects;
create policy "pieces_consultant" on storage.objects
  for all to authenticated
  using      (bucket_id = 'pieces' and public.current_role() = 'consultant' and public.pieces_chemin_valide(name))
  with check (bucket_id = 'pieces' and public.current_role() = 'consultant' and public.pieces_chemin_valide(name));
