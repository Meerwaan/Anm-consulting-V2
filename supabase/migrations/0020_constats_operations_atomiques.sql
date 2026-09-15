-- 0020 — rendre indivisibles deux opérations qui ne l'étaient pas.
--
-- L'échange de rang et la suppression d'un constat s'écrivaient en plusieurs requêtes
-- depuis l'action serveur. Entre deux requêtes, rien ne garantit la suivante : une
-- coupure ou un refus RLS laissait la base à moitié modifiée — un rang de synthèse
-- perdu, ou une action de plan effacée alors que son constat existe toujours. Pire,
-- l'écran annonçait « rangs échangés » sans avoir vérifié quoi que ce soit.
--
-- Les deux fonctions ci-dessous s'exécutent dans la transaction de l'appel : soit tout
-- passe, soit rien. Elles sont en SECURITY INVOKER (le défaut) : les politiques RLS
-- s'appliquent exactement comme si la consultante écrivait elle-même.

/**
 * Donne à un constat sa place dans la synthèse dirigeant.
 *
 * Si la place est déjà prise, on échange : elle vient de dire lequel passe devant,
 * lui rendre une erreur l'obligerait à défaire l'autre d'abord. L'index unique
 * interdisant deux fois le même rang, l'occupant est libéré avant d'être resservi.
 */
create or replace function public.definir_rang_constat(
  p_mission uuid,
  p_constat uuid,
  p_rang int
) returns text
language plpgsql
as $$
declare
  rang_courant int;
  occupant uuid;
  titre_occupant text;
begin
  if p_rang is not null and (p_rang < 1 or p_rang > 5) then
    raise exception 'Le rang de synthèse va de 1 à 5.';
  end if;

  select report_rank into rang_courant
  from public.findings
  where id = p_constat and mission_id = p_mission
  for update;

  if not found then
    raise exception 'Constat introuvable dans cette mission.';
  end if;

  if p_rang is null then
    update public.findings set report_rank = null where id = p_constat;
    return 'Ce constat n''est plus mis en avant.';
  end if;

  if rang_courant is not distinct from p_rang then
    return 'Ce constat occupait déjà la place ' || p_rang || '.';
  end if;

  select id, title into occupant, titre_occupant
  from public.findings
  where mission_id = p_mission and report_rank = p_rang and id <> p_constat
  for update;

  if occupant is null then
    update public.findings set report_rank = p_rang where id = p_constat;
    return 'Mis en avant en place ' || p_rang || '.';
  end if;

  update public.findings set report_rank = null where id = occupant;
  update public.findings set report_rank = p_rang where id = p_constat;
  update public.findings set report_rank = rang_courant where id = occupant;

  if rang_courant is null then
    return 'Place ' || p_rang || ' prise. « ' || titre_occupant || ' » n''est plus mis en avant.';
  end if;
  return 'Places échangées avec « ' || titre_occupant || ' ».';
end;
$$;

/**
 * Supprime un constat et l'action générée depuis lui.
 *
 * Les deux effacements ensemble ou aucun : laisser l'action sans son constat produit
 * une ligne de plan dont plus personne ne sait d'où elle vient. Le point de contrôle
 * est délié par la clé étrangère (on delete set null) et redevient disponible.
 */
create or replace function public.supprimer_constat(
  p_mission uuid,
  p_constat uuid
) returns table (titre text, actions_supprimees int, avait_ete_negocie boolean)
language plpgsql
as $$
declare
  n int;
  negocie boolean;
begin
  select f.title into titre
  from public.findings f
  where f.id = p_constat and f.mission_id = p_mission
  for update;

  if titre is null then
    raise exception 'Constat introuvable dans cette mission.';
  end if;

  -- Une action dont le responsable ou l'échéance ont été renseignés a été négociée
  -- en restitution : l'écran doit le dire, la perte n'est pas anodine.
  select count(*), bool_or(a.client_owner is not null or a.due_on is not null)
    into n, negocie
  from public.actions a
  where a.mission_id = p_mission and a.finding_id = p_constat;

  delete from public.actions a where a.mission_id = p_mission and a.finding_id = p_constat;
  delete from public.findings f where f.id = p_constat and f.mission_id = p_mission;

  actions_supprimees := coalesce(n, 0);
  avait_ete_negocie := coalesce(negocie, false);
  return next;
end;
$$;

revoke execute on function public.definir_rang_constat(uuid, uuid, int) from public, anon;
revoke execute on function public.supprimer_constat(uuid, uuid) from public, anon;
grant execute on function public.definir_rang_constat(uuid, uuid, int) to authenticated;
grant execute on function public.supprimer_constat(uuid, uuid) to authenticated;
