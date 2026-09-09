-- 0022 — la mise en avant n'a pas de plafond.
--
-- Le rang de synthèse était borné à 5, repris du modèle 07 §5 qui dessine cinq blocs
-- « Constat prioritaire n°1 » à « n°5 ». Ce n'est pas une règle : c'est le nombre de
-- blocs qui tiennent dans le gabarit Word, exactement comme le plan d'actions y tient
-- sur dix lignes et le tableau de rapprochement sur cinq — et personne n'a jamais
-- soutenu qu'un plan d'actions s'arrête à dix actions.
--
-- Le pack se contredit d'ailleurs sur le chiffre : la même page, section 4, demande de
-- résumer « les 3 principaux risques » dans le message clé au dirigeant, pendant que la
-- section 5 en dessine cinq. Deux nombres différents dans le même document : c'est la
-- preuve que le nombre est illustratif.
--
-- Ce qui reste vrai : une place n'appartient qu'à un constat, et l'ordre compte. C'est
-- l'unicité qu'on garde (index de 0019), pas le plafond.

alter table public.findings drop constraint if exists findings_report_rank_check;
alter table public.findings add constraint findings_report_rank_check check (report_rank is null or report_rank >= 1);

comment on column public.findings.report_rank is
  'Place dans la synthèse dirigeant : 1 = ce qu''il lit en premier. Sans plafond — une mission peut n''en mettre aucun en avant, ou vingt. NULL = présent au rapport mais pas mis en avant.';

-- La fonction refusait au-delà de 5 : elle ne contrôle plus que le plancher.
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
  if p_rang is not null and p_rang < 1 then
    raise exception 'Une place de synthèse commence à 1.';
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

revoke execute on function public.definir_rang_constat(uuid, uuid, int) from public, anon;
grant execute on function public.definir_rang_constat(uuid, uuid, int) to authenticated;
