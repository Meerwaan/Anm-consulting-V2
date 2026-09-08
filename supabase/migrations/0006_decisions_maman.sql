-- ---------------------------------------------------------------------------
-- 0006 — Décisions de la consultante, 8 septembre 2026.
--
-- 03. L'espace de travail s'organise par ÉTAPE de la méthode (les 15), plus par
--     module. Les modules restent le classement des pièces et des constats ;
--     les étapes deviennent la colonne vertébrale de l'écran. Chaque étape
--     porte donc son périmètre (quels points de contrôle elle couvre) et sa
--     nature (quelle surface de travail afficher).
-- 06. Relance automatique des pièces manquantes, cadence réglable par mission.
-- 07. Le client met à jour le statut de ses actions — et seulement cela.
-- ---------------------------------------------------------------------------

-- 1. Nature d'une étape : dit à l'écran quoi afficher.
create type public.step_kind as enum (
  'entretien', 'perimetre', 'collecte', 'analyse', 'echantillon', 'controle',
  'rapprochement', 'qualification', 'plan_actions', 'rapport', 'restitution'
);

alter table public.method_steps
  add column kind      public.step_kind,
  add column domaines  public.audit_domain[] not null default '{}',
  add column objectif  text;

comment on column public.method_steps.domaines is
  'Domaines de control_points travaillés à cette étape. Vide = étape sans point de contrôle.';

update public.method_steps set kind = 'entretien',     objectif = 'Contexte, attentes, contrôle en cours ou préventif.'                     where sort_order = 1;
update public.method_steps set kind = 'perimetre',     objectif = 'Établissements, sites, effectif, période auditée.'                        where sort_order = 2;
update public.method_steps set kind = 'collecte',      objectif = 'Demander les pièces, relancer les manquantes.'                            where sort_order = 3;
update public.method_steps set kind = 'analyse',       objectif = 'Kbis/RNE, statuts, organigramme, contrats de sous-traitance.',
                               domaines = '{gouvernance,sous_traitance}'                                                                     where sort_order = 4;
update public.method_steps set kind = 'echantillon',   objectif = 'Choisir les salariés, sites et sous-traitants testés.'                    where sort_order = 5;
update public.method_steps set kind = 'controle',      objectif = 'Autorisations, dirigeants, cartes, Dracar, missions.',
                               domaines = '{cnaps}'                                                                                          where sort_order = 6;
update public.method_steps set kind = 'controle',      objectif = 'DPAE, contrats, paie, primes, frais, DSN.',
                               domaines = '{social,paie,urssaf}'                                                                             where sort_order = 7;
update public.method_steps set kind = 'controle',      objectif = 'Durées, repos, amplitude, heures supplémentaires.',
                               domaines = '{temps}'                                                                                          where sort_order = 8;
update public.method_steps set kind = 'controle',      objectif = 'DUERP, prévention, travail isolé, suivi santé, CSE.',
                               domaines = '{inspection_sst}'                                                                                 where sort_order = 9;
update public.method_steps set kind = 'rapprochement', objectif = 'Croiser planning, pointage, paie et facturation.',
                               domaines = '{operationnel}'                                                                                   where sort_order = 10;
update public.method_steps set kind = 'qualification', objectif = 'Fait, preuve, risque, référence vérifiée.'                                 where sort_order = 11;
update public.method_steps set kind = 'qualification', objectif = 'Critique / Majeur / Modéré / Mineur.'                                      where sort_order = 12;
update public.method_steps set kind = 'plan_actions',  objectif = 'P1 immédiat, P2 30 j, P3 90 j, P4 amélioration.'                           where sort_order = 13;
update public.method_steps set kind = 'rapport',       objectif = 'Synthèse en deux axes, puis détail par criticité.'                         where sort_order = 14;
update public.method_steps set kind = 'restitution',   objectif = 'Réunion dirigeant, 45 à 60 minutes.'                                       where sort_order = 15;

alter table public.method_steps alter column kind set not null;

-- ⚠ Le domaine 'fiscal' n'est rattaché à aucune étape : les 15 étapes ont été
-- écrites avant l'ajout du 5ᵉ pilier. La vue ci-dessous compte donc les points
-- fiscaux comme « hors étape » pour qu'ils ne disparaissent jamais du décompte,
-- tant qu'une 16ᵉ étape n'est pas validée par la consultante.

-- 2. Avancement par étape : combien de points, combien traités, sur cette mission.
create view public.mission_step_completeness
with (security_invoker = on) as
select
  msp.mission_id,
  s.id                                                          as step_id,
  s.sort_order,
  s.name,
  s.kind,
  s.phase_id,
  msp.status,
  count(cp.id)                                                  as points_total,
  count(mcr.control_point_id) filter (where mcr.status <> 'a_verifier') as points_traites
from public.mission_step_progress msp
join public.method_steps s on s.id = msp.step_id
left join public.control_points cp
  on cp.active and cardinality(s.domaines) > 0 and cp.domain = any (s.domaines)
left join public.mission_control_results mcr
  on mcr.mission_id = msp.mission_id and mcr.control_point_id = cp.id
group by msp.mission_id, s.id, s.sort_order, s.name, s.kind, s.phase_id, msp.status;

-- Points de contrôle d'une mission qu'aucune étape ne couvre (aujourd'hui : le fiscal).
create view public.mission_points_hors_etape
with (security_invoker = on) as
select mcr.mission_id, cp.domain, count(*) as points
from public.mission_control_results mcr
join public.control_points cp on cp.id = mcr.control_point_id
where not exists (
  select 1 from public.method_steps s
  where cardinality(s.domaines) > 0 and cp.domain = any (s.domaines)
)
group by mcr.mission_id, cp.domain;

-- 3. Relance automatique des pièces : cadence réglable, 3 jours par défaut.
alter table public.missions
  add column reminder_interval_days int not null default 3
    check (reminder_interval_days between 1 and 30);
comment on column public.missions.reminder_interval_days is
  'Délai entre deux relances automatiques d''une pièce non déposée (décision 06).';

-- Demandes à relancer maintenant : lues par le job d''envoi Resend.
create view public.document_requests_a_relancer
with (security_invoker = on) as
select dr.id, dr.mission_id, dr.document_id, dr.module_id, dr.message, dr.due_on,
       dr.reminders, dr.last_reminder_at, m.reminder_interval_days
from public.document_requests dr
join public.missions m on m.id = dr.mission_id
where dr.status in ('ouverte', 'relancee')
  and coalesce(dr.last_reminder_at, dr.requested_at)
      < now() - make_interval(days => m.reminder_interval_days);

-- 4. Le client met à jour ses actions — statut, preuve, commentaire, et rien d'autre.
alter type public.notification_kind add value if not exists 'action_maj';

drop policy if exists "actions_client_update" on public.actions;
create policy "actions_client_update" on public.actions for update to authenticated
  using      (exists (select 1 from public.missions m where m.id = mission_id and m.org_id = public.current_org()))
  with check (exists (select 1 from public.missions m where m.id = mission_id and m.org_id = public.current_org()));

create or replace function public.actions_client_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- La consultante modifie tout ; le client ne touche qu'à l'avancement.
  if public.current_role() = 'consultant' then
    return new;
  end if;
  if (new.mission_id, new.finding_id, new.domain, new.title, new.client_owner, new.due_on, new.priority)
     is distinct from
     (old.mission_id, old.finding_id, old.domain, old.title, old.client_owner, old.due_on, old.priority) then
    raise exception 'Seuls le statut, la preuve de clôture et le commentaire sont modifiables par le client.'
      using errcode = '42501';
  end if;
  if new.status is distinct from old.status then
    insert into public.notifications (recipient_id, mission_id, kind, title, body, link)
      select p.id, new.mission_id, 'action_maj',
             'Le client a mis à jour une action',
             left(new.title, 200) || ' — ' || new.status::text,
             '/admin/missions/' || new.mission_id || '/actions'
      from public.profiles p where p.role = 'consultant';
  end if;
  return new;
end;
$$;

-- Supabase accorde EXECUTE par défaut à anon et authenticated sur les fonctions du
-- schéma public : révoquer à PUBLIC seul ne suffit pas (leçon des 0004/0005).
-- Une fonction de trigger n'a besoin d'être appelable par personne.
revoke execute on function public.actions_client_guard() from public, anon, authenticated;

create trigger actions_client_guard_trg
  before update on public.actions
  for each row execute function public.actions_client_guard();
