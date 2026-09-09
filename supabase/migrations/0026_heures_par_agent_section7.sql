-- 0026 — la section 7 du rapport, par salarié.
--
-- Le modèle 07 §7 impose un tableau PAR SALARIÉ :
--   Salarié | Période | Planning | Pointage | Payé | Facturé | Écart / conclusion
-- et la procédure §7 décrit la séquence qui le remplit : prendre un site et un mois,
-- extraire le planning prévu puis réalisé, vérifier la main courante, comparer aux
-- variables puis au bulletin de chaque agent, comparer à la facture client.
--
-- Le portail ne stockait que deux totaux par type de croisement (valeur_a, valeur_b).
-- La section du rapport n'était donc pas produisible : elle devait se remplir à la main
-- dans Word, agent par agent, à partir de chiffres que l'outil avait déjà — c'est
-- exactement le travail de ressaisie que le portail existe pour supprimer.
--
-- Les rapprochements de l'étape 10 restent utiles pour ce qui est vrai au niveau de la
-- mission : agents CNAPS contre paie, effectif paie contre DSN. Les deux cohabitent.

create table if not exists public.mission_heures_agent (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  salarie text not null,
  site text,
  periode text,
  planning numeric(12,2),
  pointage numeric(12,2),
  paye numeric(12,2),
  facture numeric(12,2),
  conclusion text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

comment on table public.mission_heures_agent is
  'Section 7 du modèle 07 : « Salarié | Période | Planning | Pointage | Payé | Facturé | Écart / conclusion ».';

create unique index if not exists mission_heures_agent_uniq
  on public.mission_heures_agent (mission_id, salarie, coalesce(site, ''), coalesce(periode, ''));

alter table public.mission_heures_agent enable row level security;
create policy "heures_agent_write" on public.mission_heures_agent
  for all to authenticated using (public.current_role() = 'consultant')
  with check (public.current_role() = 'consultant');
revoke all on public.mission_heures_agent from anon;
grant select, insert, update, delete on public.mission_heures_agent to authenticated;

create or replace view public.mission_heures_agent_ecarts
with (security_invoker = on) as
select h.id, h.mission_id, h.salarie, h.site, h.periode,
       h.planning, h.pointage, h.paye, h.facture, h.conclusion, h.updated_at,
       (h.pointage - h.planning) as ecart_planning_pointage,
       (h.paye - h.pointage)     as ecart_pointage_paye,
       (h.facture - h.paye)      as ecart_paye_facture,
       -- La procédure §7 dit « investiguer tout écart » : aucune tolérance ici non plus.
       (coalesce(h.pointage - h.planning, 0) <> 0
        or coalesce(h.paye - h.pointage, 0) <> 0
        or coalesce(h.facture - h.paye, 0) <> 0) as a_investiguer,
       (h.planning is null or h.pointage is null or h.paye is null or h.facture is null) as incomplet
from public.mission_heures_agent h;

revoke all on public.mission_heures_agent_ecarts from anon;
grant select on public.mission_heures_agent_ecarts to authenticated;
