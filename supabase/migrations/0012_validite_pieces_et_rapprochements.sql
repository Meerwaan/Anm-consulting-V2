-- ---------------------------------------------------------------------------
-- 0012 — Deux manques du référentiel.
--
-- 1. Aucune pièce ne portait de durée de validité : le portail garantissait qu'il
--    ne manquait rien, pas que ce qui était là valait encore quelque chose.
--    La table `deadlines` existait avec les bons types, sans rien pour l'alimenter.
-- 2. Le contrôle croisé de l'étape 10 (planning → pointage → paie → facturation)
--    n'existait nulle part en base : c'est pourtant le cœur de la méthode.
--
-- Règle tenue partout : on distingue ce qu'impose un TEXTE de ce qu'exige un USAGE.
-- Un Kbis n'a pas de durée de validité légale — c'est le demandeur qui exige moins
-- de trois mois. Le dire autrement serait raconter une histoire fausse sur un écran
-- qui sert à préparer un contrôle.
-- ---------------------------------------------------------------------------

create type public.validite_nature as enum ('texte', 'pratique', 'date_du_document', 'indefinie');

alter table public.document_templates
  add column validite_jours          int,
  add column validite_nature         public.validite_nature not null default 'indefinie',
  add column validite_note           text,
  add column applique_si_effectif_min int,
  add column deadline_kind           public.deadline_kind;

comment on column public.document_templates.validite_nature is
  'texte = la durée découle d''un texte · pratique = exigée par l''usage · date_du_document = l''échéance est portée par la pièce · indefinie = sans péremption.';
comment on column public.document_templates.applique_si_effectif_min is
  'Seuil d''effectif en dessous duquel la règle ne s''applique pas (DUERP : 11 salariés).';

alter table public.mission_documents
  add column document_date date,
  add column expire_le     date;
comment on column public.mission_documents.document_date is 'Date portée par la pièce elle-même, distincte de la date de réception.';
comment on column public.mission_documents.expire_le  is 'Échéance saisie à la main quand la pièce porte sa propre date de fin (carte pro, autorisation).';

update public.document_templates set
  validite_jours = 90, validite_nature = 'pratique',
  validite_note = 'Un extrait Kbis n''a pas de durée de validité légale : c''est le demandeur qui exige moins de trois mois.'
where name = 'Kbis / RNE';

update public.document_templates set
  validite_jours = 365, validite_nature = 'texte', applique_si_effectif_min = 11,
  deadline_kind = 'duerp',
  validite_note = 'Mise à jour au moins annuelle dans les entreprises d''au moins 11 salariés (C. trav. art. R4121-2). En dessous du seuil, la mise à jour reste due lors d''un aménagement important ou d''une information nouvelle sur un risque.'
where name = 'DUERP';

update public.document_templates set
  validite_nature = 'date_du_document', deadline_kind = 'autorisation_exercer',
  validite_note = 'L''échéance figure sur l''autorisation : la saisir plutôt que la calculer.'
where name = 'Autorisation(s) d''exercer';

update public.document_templates set
  validite_nature = 'date_du_document', deadline_kind = 'agrement_dirigeant',
  validite_note = 'L''échéance figure sur l''agrément.'
where name = 'Agrément(s) dirigeant';

update public.document_templates set
  validite_nature = 'date_du_document', deadline_kind = 'carte_pro',
  validite_note = 'Chaque carte porte sa propre date de fin : suivre l''échéance la plus proche.'
where name = 'Cartes professionnelles / échéances';

-- Les pièces de la vigilance, absentes du pack.
insert into public.document_templates
  (sort_order, category, name, source, validite_jours, validite_nature, validite_note, deadline_kind) values
(90, 'sous_traitance', 'Contrats de sous-traitance signés', 'Ajout ANM — obligation de vigilance',
  null, 'indefinie', 'Un contrat écrit par sous-traitant : premier document réclamé en cas de suspicion de travail dissimulé.', null),
(91, 'sous_traitance', 'Attestations de vigilance des sous-traitants', 'Ajout ANM — C. trav. art. L8222-1',
  182, 'texte',
  'Le donneur d''ordre vérifie à la conclusion du contrat, puis TOUS LES SIX MOIS jusqu''à la fin de son exécution (C. trav. art. L8222-1). Défaut de vigilance = solidarité financière pour les cotisations, pénalités et majorations du sous-traitant (art. L8222-2).',
  'attestation_vigilance'),
(92, 'sous_traitance', 'Kbis / RNE des sous-traitants', 'Ajout ANM — obligation de vigilance',
  90, 'pratique', 'Même usage que pour l''entreprise : moins de trois mois exigé en pratique, sans durée légale.', null),
(93, 'sous_traitance', 'Autorisations CNAPS des sous-traitants', 'Ajout ANM — CSI Livre VI',
  null, 'date_du_document', 'Sous-traiter à une société non autorisée engage le donneur d''ordre.', 'autorisation_exercer');

-- Vue : l'état de validité de chaque pièce d'une mission.
create view public.mission_documents_validite
with (security_invoker = on) as
select
  d.id, d.mission_id, d.name, d.category, d.module_id, d.required, d.received,
  d.received_on, d.document_date, t.validite_nature, t.validite_note, t.validite_jours,
  coalesce(d.expire_le, d.document_date + (t.validite_jours || ' days')::interval) ::date as echeance,
  case
    when t.validite_nature = 'indefinie' then 'sans_objet'
    when t.applique_si_effectif_min is not null
     and coalesce(o.headcount, 0) < t.applique_si_effectif_min then 'sans_objet'
    when d.received <> 'oui' then 'non_recue'
    when coalesce(d.expire_le, d.document_date + (t.validite_jours || ' days')::interval)::date is null then 'date_manquante'
    when coalesce(d.expire_le, d.document_date + (t.validite_jours || ' days')::interval)::date < current_date then 'perimee'
    when coalesce(d.expire_le, d.document_date + (t.validite_jours || ' days')::interval)::date <= current_date + 30 then 'bientot_perimee'
    else 'valide'
  end as etat
from public.mission_documents d
join public.missions m on m.id = d.mission_id
left join public.organizations o on o.id = m.org_id
left join public.document_templates t on t.id = d.template_id;

-- Les échéances suivies pour le client (abonnement, alertes) naissent des pièces.
alter table public.deadlines add column source_document_id uuid references public.mission_documents (id) on delete cascade;
create unique index deadlines_source_doc_uniq on public.deadlines (source_document_id);

create or replace function public.sync_deadline_from_document() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare k public.deadline_kind; ech date; org uuid; j int;
begin
  select t.deadline_kind, t.validite_jours into k, j
    from public.document_templates t where t.id = new.template_id;
  if k is null then return new; end if;

  ech := coalesce(new.expire_le, (new.document_date + (j || ' days')::interval)::date);
  if ech is null then return new; end if;

  select m.org_id into org from public.missions m where m.id = new.mission_id;

  insert into public.deadlines (org_id, kind, subject, due_on, source_document_id, notes)
  values (org, k, new.name, ech, new.id, 'Créée depuis la pièce de mission.')
  on conflict (source_document_id) do update
    set due_on = excluded.due_on, subject = excluded.subject,
        status = case when excluded.due_on < current_date then 'echu'
                      when excluded.due_on <= current_date + 90 then 'alerte'
                      else 'a_venir' end;
  return new;
end $$;
revoke execute on function public.sync_deadline_from_document() from public, anon, authenticated;

create trigger mission_documents_deadline
  after insert or update of document_date, expire_le, received on public.mission_documents
  for each row execute function public.sync_deadline_from_document();

-- ---------------------------------------------------------------------------
-- Contrôle croisé (étape 10). Le système calcule l'écart ; la consultante le qualifie.
-- ---------------------------------------------------------------------------
create type public.rapprochement_kind as enum (
  'agents_cnaps_vs_paie', 'heures_planning_vs_pointage', 'heures_pointage_vs_paie',
  'heures_paie_vs_facturation', 'sous_traitants_contrats_vs_vigilance', 'effectif_paie_vs_dsn'
);

create table public.mission_reconciliations (
  id            uuid primary key default gen_random_uuid(),
  mission_id    uuid not null references public.missions (id) on delete cascade,
  kind          public.rapprochement_kind not null,
  periode       text,
  valeur_a      numeric(12,2),
  valeur_b      numeric(12,2),
  tolerance_pct numeric(5,2) not null default 0 check (tolerance_pct between 0 and 100),
  note          text,
  updated_at    timestamptz not null default now(),
  updated_by    uuid references public.profiles (id),
  unique (mission_id, kind)
);
alter table public.mission_reconciliations enable row level security;
create policy "recon_all" on public.mission_reconciliations for all to authenticated
  using (public.current_role() = 'consultant') with check (public.current_role() = 'consultant');

create view public.mission_reconciliation_status
with (security_invoker = on) as
select r.*,
  (r.valeur_b - r.valeur_a) as ecart,
  case when coalesce(r.valeur_a, 0) = 0 then null
       else round(abs(r.valeur_b - r.valeur_a) / abs(r.valeur_a) * 100, 2) end as ecart_pct,
  case
    when r.valeur_a is null or r.valeur_b is null then 'a_saisir'
    when coalesce(r.valeur_a, 0) = 0 and coalesce(r.valeur_b, 0) = 0 then 'coherent'
    when coalesce(r.valeur_a, 0) = 0 then 'ecart'
    when abs(r.valeur_b - r.valeur_a) / abs(r.valeur_a) * 100 <= r.tolerance_pct then 'coherent'
    else 'ecart'
  end as statut
from public.mission_reconciliations r;
