-- Phase 4 : portail de suivi d'audit.
-- Modèle de données dérivé du Pack complet V2 (sept. 2026) :
--   09_Dossier_Mission_Client.xlsx  → missions (FICHE_MISSION), mission_documents (SUIVI_DOCUMENTS),
--                                     interviews (ENTRETIENS), site_visits (VISITES_SITE), findings (CONSTATS),
--                                     actions (PLAN_ACTIONS), mission_journal (JOURNAL_MISSION)
--   06_Procedure_Mission_Audit_360   → mission_phases (7 phases J-10 → J+7) + mission_phase_progress
--   02/03/04/05 (feuilles AUDIT_*)   → control_points (référentiel, seed 0001)
--   11_Pilotage_Commercial_Tarifs    → subscriptions (4 formules)
-- Convention : tout ce qui est client porte org_id ; RLS activée partout ; le rôle consultant voit tout.

-- ---------------------------------------------------------------------------
-- Énumérations (listes de validation des xlsx, reprises telles quelles)
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('consultant', 'client', 'learner');

-- Type de mission = offres du 10_Pack_Commercial §2 + 11 TARIFS (+ fiscal, 5e pilier)
create type public.mission_type as enum (
  'flash', 'cnaps', 'social_urssaf', 'inspection', 'fiscal', 'audit_360', 'suivi_conformite'
);

-- FICHE_MISSION > Statut dossier
create type public.mission_status as enum (
  'qualification', 'documents_en_attente', 'analyse', 'sur_site', 'rapport', 'restitution', 'clos'
);

-- CONSTATS > Domaine (09) + FISCAL (05) ; aligné sur les domaines AUDIT_360 (02)
create type public.audit_domain as enum (
  'gouvernance', 'cnaps', 'social', 'paie', 'temps', 'urssaf', 'inspection_sst',
  'sous_traitance', 'operationnel', 'fiscal'
);

-- Échelle de criticité (01 Bible §2 / CONSTATS > Risque)
create type public.severity as enum ('critique', 'majeur', 'modere', 'mineur');

-- AUDIT_360 > Statut
create type public.control_status as enum ('conforme', 'partiel', 'non_conforme', 'na', 'a_verifier');

-- CONSTATS > Priorité et PLAN_ACTIONS > Priorité
create type public.priority as enum ('P1', 'P2', 'P3', 'P4');

-- CONSTATS > Statut
create type public.finding_status as enum ('ouvert', 'en_analyse', 'valide', 'clos');

-- PLAN_ACTIONS > Statut
create type public.action_status as enum ('a_faire', 'en_cours', 'clos', 'accepte');

-- SUIVI_DOCUMENTS > Catégorie (+ fiscal)
create type public.document_category as enum (
  'entreprise', 'cnaps', 'social', 'paie', 'temps', 'sst', 'cse', 'fiscal', 'autre'
);

-- SUIVI_DOCUMENTS > Complet ?
create type public.document_completeness as enum ('oui', 'non', 'a_verifier', 'na');

-- VISITES_SITE > colonnes Oui/Non/N/A/À vérifier
create type public.check_result as enum ('oui', 'non', 'na', 'a_verifier');

-- JOURNAL_MISSION > Type
create type public.journal_type as enum (
  'email', 'appel', 'reunion', 'reception_document', 'analyse', 'visite_site', 'restitution', 'autre'
);

-- Échéances suivies en abonnement (AGENTS_TITRES, SOUS_TRAITANCE, DUERP…)
create type public.deadline_kind as enum (
  'carte_pro', 'autorisation_exercer', 'agrement_dirigeant', 'attestation_vigilance',
  'duerp', 'visite_medicale', 'plan_prevention', 'autre'
);

-- ---------------------------------------------------------------------------
-- Organisations et profils
-- ---------------------------------------------------------------------------
create table public.organizations (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  siren         text,
  headcount     int,                       -- FICHE_MISSION > Effectif
  establishments int,                      -- FICHE_MISSION > Nb établissements
  client_sites  int,                       -- FICHE_MISSION > Nb sites clients
  activities    text[]                     -- activités de sécurité privée exercées (questionnaire prospect 10 §3)
);

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  org_id      uuid references public.organizations (id) on delete set null,
  role        public.user_role not null default 'client',
  full_name   text,
  job_title   text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Référentiel des points de contrôle (seed 0001_control_points.sql — 208 points)
-- ---------------------------------------------------------------------------
create table public.control_points (
  id             serial primary key,
  code           text not null unique,            -- A360-001, CNA-001, URS-001, INS-001, FIS-001
  source_module  text not null,                   -- fichier xlsx du pack (02..05)
  source_sheet   text not null,                   -- AUDIT_360, AUDIT_CNAPS, AUDIT_URSSAF, AUDIT_INSPECTION, AUDIT_FISCAL
  domain         public.audit_domain not null,
  theme          text not null,
  subtheme       text,
  question       text not null,                   -- point de contrôle / test à réaliser
  evidence       text,                            -- preuves / pièces à examiner
  initial_risk   public.severity not null,
  reference      text,                            -- référence / source officielle à vérifier à la date de mission
  active         boolean not null default true
);

-- Modèles de pièces à demander (seed 0002_document_templates.sql — checklist du 09 + fiscal)
create table public.document_templates (
  id          serial primary key,
  sort_order  int not null,
  category    public.document_category not null,
  name        text not null,
  source      text,
  unique (category, name)
);

-- ---------------------------------------------------------------------------
-- Missions (FICHE_MISSION)
-- ---------------------------------------------------------------------------
create table public.missions (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  org_id                uuid not null references public.organizations (id) on delete cascade,
  reference             text not null unique,                 -- Référence dossier
  type                  public.mission_type not null,
  status                public.mission_status not null default 'qualification',
  consultant_id         uuid references public.profiles (id),
  opened_on             date not null default current_date,   -- Date ouverture
  control_in_progress   boolean not null default false,       -- Contrôle en cours ?
  control_body          text,                                 -- Organisme (CNAPS / URSSAF / DGFiP / Inspection)
  control_deadline      date,                                 -- Échéance
  intervention_on       date,                                 -- Date intervention
  restitution_on        date,                                 -- Date restitution
  report_version        text,                                 -- Version rapport
  amount_ht             numeric(10,2),                        -- Montant HT
  deposit_received      boolean not null default false,       -- Acompte reçu ?
  balance_received      boolean not null default false,       -- Solde reçu ?
  next_action           text,                                 -- Prochaine action
  next_action_on        date,                                 -- Date prochaine action
  scope                 text,                                 -- Périmètre
  initial_hotspots      text                                  -- Points sensibles initiaux
);
create index on public.missions (org_id);

-- Phases de mission (06 Procédure §2 — déroulé standard). Table de référence, pas d'org_id.
create table public.mission_phases (
  id          serial primary key,
  sort_order  int not null unique,
  moment      text not null,      -- J-10 à J-5, …
  name        text not null,      -- Cadrage, Collecte documentaire, …
  work        text not null       -- Travail à réaliser
);
insert into public.mission_phases (sort_order, moment, name, work) values
  (1, 'J-10 à J-5',      'Cadrage',                 'Entretien dirigeant, périmètre, établissements/sites, effectif, contexte, contrôle en cours ou préventif.'),
  (2, 'J-7 à J-3',       'Collecte documentaire',   'Demander les pièces et relancer les manquants. Préparer l''échantillon salariés/sites/sous-traitants.'),
  (3, 'J-2 à J-1',       'Pré-analyse',             'Lire Kbis/RNE, éléments CNAPS, organigramme, paie, plannings, sous-traitance et derniers contrôles.'),
  (4, 'Jour J matin',    'Entretien + gouvernance', 'Dirigeant, RH/paie, exploitation. Vérifier processus d''embauche, affectation, remplacement, contrôle interne.'),
  (5, 'Jour J après-midi','Tests',                  'Échantillon salariés, temps de travail, paie, sous-traitants, documents commerciaux, dossiers CNAPS.'),
  (6, 'J+1 à J+3',       'Analyse',                 'Rapprochements, qualification des risques, demandes complémentaires.'),
  (7, 'J+3 à J+7',       'Rapport',                 'Synthèse dirigeant, constats, plan d''actions et restitution.');

create table public.mission_phase_progress (
  mission_id  uuid not null references public.missions (id) on delete cascade,
  phase_id    int  not null references public.mission_phases (id),
  status      text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  done_at     timestamptz,
  primary key (mission_id, phase_id)
);

-- ---------------------------------------------------------------------------
-- Pièces (SUIVI_DOCUMENTS)
-- ---------------------------------------------------------------------------
create table public.mission_documents (
  id              uuid primary key default gen_random_uuid(),
  mission_id      uuid not null references public.missions (id) on delete cascade,
  template_id     int references public.document_templates (id),
  category        public.document_category not null,
  name            text not null,                           -- Document demandé
  required        boolean not null default true,           -- Obligatoire selon mission ?
  requested_on    date,                                    -- Demandé le
  received        public.check_result not null default 'non',   -- Reçu ?
  received_on     date,                                    -- Reçu le
  period          text,                                    -- Version / période
  complete        public.document_completeness not null default 'a_verifier', -- Complet ?
  reminder_needed boolean not null default true,           -- Relance nécessaire ?
  observation     text,
  storage_path    text,                                    -- fichier déposé (Supabase Storage)
  uploaded_by     uuid references public.profiles (id)
);
create index on public.mission_documents (mission_id);

-- ---------------------------------------------------------------------------
-- Entretiens (ENTRETIENS) et visites de site (VISITES_SITE)
-- ---------------------------------------------------------------------------
create table public.interviews (
  id                 uuid primary key default gen_random_uuid(),
  mission_id         uuid not null references public.missions (id) on delete cascade,
  held_on            date,
  person             text,
  job_title          text,
  topic              text,
  promised_documents text,
  points_to_check    text,
  report_done        boolean not null default false
);
create index on public.interviews (mission_id);

create table public.site_visits (
  id                 uuid primary key default gen_random_uuid(),
  mission_id         uuid not null references public.missions (id) on delete cascade,
  visited_on         date,
  site               text,
  agent              text,
  employer           text,                                 -- employeur réel de l'agent (sous-traitance)
  card_ok            public.check_result default 'a_verifier',   -- Carte OK ?
  mission_fits       public.check_result default 'a_verifier',   -- Mission adaptée ?
  instructions_ok    public.check_result default 'a_verifier',   -- Consignes OK ?
  hours_consistent   public.check_result default 'a_verifier',   -- Horaires cohérents ?
  subcontractor      public.check_result default 'a_verifier',   -- Sous-traitant ?
  critical_gap       public.check_result default 'a_verifier',   -- Écart critique ?
  observation        text
);
create index on public.site_visits (mission_id);

-- ---------------------------------------------------------------------------
-- Constats (CONSTATS) — la fiche de constat : FAIT → PREUVE → RISQUE → RÉFÉRENCE → RECOMMANDATION
-- ---------------------------------------------------------------------------
create table public.findings (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  mission_id         uuid not null references public.missions (id) on delete cascade,
  control_point_id   int references public.control_points (id),
  domain             public.audit_domain not null,
  title              text not null,                        -- Titre court
  fact               text not null,                        -- Fait constaté
  evidence           text,                                 -- Preuve
  severity           public.severity not null,             -- Risque
  control_status     public.control_status,                -- Conforme / Partiel / Non conforme / N/A / À vérifier
  reference_checked  public.check_result not null default 'a_verifier', -- Référence vérifiée ?
  reference          text,                                 -- Source / texte (référence officielle datée — obligatoire avant rapport)
  recommendation     text,
  priority           public.priority not null,
  status             public.finding_status not null default 'ouvert',
  in_report          boolean not null default false,       -- Rapporté ?
  visible_to_client  boolean not null default false        -- publié au client après validation consultant
);
create index on public.findings (mission_id);
create index on public.findings (mission_id, domain);

-- ---------------------------------------------------------------------------
-- Plan d'actions (PLAN_ACTIONS)
-- ---------------------------------------------------------------------------
create table public.actions (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  mission_id        uuid not null references public.missions (id) on delete cascade,
  finding_id        uuid references public.findings (id) on delete set null,   -- Constat ID
  domain            public.audit_domain not null,
  title             text not null,                         -- Action
  client_owner      text,                                  -- Responsable client
  due_on            date,                                  -- Échéance
  priority          public.priority not null,
  status            public.action_status not null default 'a_faire',
  closing_evidence  text,                                  -- Preuve de clôture
  closed_on         date,
  comment           text
);
create index on public.actions (mission_id);

-- ---------------------------------------------------------------------------
-- Journal de mission (JOURNAL_MISSION)
-- ---------------------------------------------------------------------------
create table public.mission_journal (
  id           uuid primary key default gen_random_uuid(),
  mission_id   uuid not null references public.missions (id) on delete cascade,
  happened_at  timestamptz not null default now(),
  type         public.journal_type not null,
  event        text not null,                              -- Action / événement
  person       text,                                       -- Personne concernée
  document     text,                                       -- Document / preuve
  next_step    text,
  author_id    uuid references public.profiles (id)
);
create index on public.mission_journal (mission_id, happened_at desc);

-- ---------------------------------------------------------------------------
-- Échéances (abonnement) et abonnements (11 ABONNEMENTS)
-- ---------------------------------------------------------------------------
create table public.deadlines (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  kind        public.deadline_kind not null,
  subject     text not null,                               -- agent, sous-traitant, site…
  due_on      date not null,
  status      text not null default 'a_venir' check (status in ('a_venir', 'alerte', 'echu', 'renouvele')),
  notes       text
);
create index on public.deadlines (org_id, due_on);

create table public.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  plan          text not null check (plan in ('essentiel', 'pilotage', '360', 'direction_conformite')),
  monthly_ht    numeric(10,2) not null,                    -- 390 / 590 / 790 / 990
  stripe_id     text,
  started_on    date not null default current_date,
  renews_on     date,
  active        boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Vue tableau de bord (DASHBOARD du 09)
-- ---------------------------------------------------------------------------
create view public.mission_dashboard as
select
  m.id as mission_id,
  m.org_id,
  (select count(*) from public.mission_documents d where d.mission_id = m.id and d.required)                       as documents_expected,
  (select count(*) from public.mission_documents d where d.mission_id = m.id and d.received = 'oui')               as documents_received,
  (select count(*) from public.mission_documents d where d.mission_id = m.id and d.complete = 'non')               as documents_incomplete,
  (select count(*) from public.findings f where f.mission_id = m.id and f.severity = 'critique')                    as findings_critique,
  (select count(*) from public.findings f where f.mission_id = m.id and f.severity = 'majeur')                      as findings_majeur,
  (select count(*) from public.findings f where f.mission_id = m.id and f.severity = 'modere')                      as findings_modere,
  (select count(*) from public.findings f where f.mission_id = m.id and f.severity = 'mineur')                      as findings_mineur,
  (select count(*) from public.actions a where a.mission_id = m.id and a.status in ('a_faire', 'en_cours'))         as actions_open,
  (select count(*) from public.actions a where a.mission_id = m.id and a.status in ('clos', 'accepte'))             as actions_closed,
  (select count(*) from public.mission_phase_progress p where p.mission_id = m.id and p.status = 'done')            as phases_done
from public.missions m;

-- ---------------------------------------------------------------------------
-- RLS : un client ne voit que son organisation ; le consultant voit tout.
-- ---------------------------------------------------------------------------
create or replace function public.current_role() returns public.user_role
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.current_org() returns uuid
language sql stable security definer set search_path = public as
$$ select org_id from public.profiles where id = auth.uid() $$;

alter table public.organizations          enable row level security;
alter table public.profiles               enable row level security;
alter table public.control_points         enable row level security;
alter table public.document_templates     enable row level security;
alter table public.missions               enable row level security;
alter table public.mission_phases         enable row level security;
alter table public.mission_phase_progress enable row level security;
alter table public.mission_documents      enable row level security;
alter table public.interviews             enable row level security;
alter table public.site_visits            enable row level security;
alter table public.findings               enable row level security;
alter table public.actions                enable row level security;
alter table public.mission_journal        enable row level security;
alter table public.deadlines              enable row level security;
alter table public.subscriptions          enable row level security;

-- Référentiels : lisibles par tout utilisateur connecté, modifiables par le consultant.
create policy "ref_read"  on public.control_points     for select to authenticated using (true);
create policy "ref_write" on public.control_points     for all    to authenticated using (public.current_role() = 'consultant');
create policy "tpl_read"  on public.document_templates for select to authenticated using (true);
create policy "tpl_write" on public.document_templates for all    to authenticated using (public.current_role() = 'consultant');
create policy "phases_read" on public.mission_phases   for select to authenticated using (true);

create policy "profiles_self"       on public.profiles for select to authenticated using (id = auth.uid() or public.current_role() = 'consultant');
create policy "profiles_self_update" on public.profiles for update to authenticated using (id = auth.uid());

create policy "org_read"  on public.organizations for select to authenticated using (id = public.current_org() or public.current_role() = 'consultant');
create policy "org_write" on public.organizations for all    to authenticated using (public.current_role() = 'consultant');

-- Tables de mission : lecture par l'organisation cliente, écriture consultant (sauf exceptions ci-dessous).
create policy "missions_read"  on public.missions for select to authenticated using (org_id = public.current_org() or public.current_role() = 'consultant');
create policy "missions_write" on public.missions for all    to authenticated using (public.current_role() = 'consultant');

create policy "phase_progress_read"  on public.mission_phase_progress for select to authenticated
  using (exists (select 1 from public.missions m where m.id = mission_id and (m.org_id = public.current_org() or public.current_role() = 'consultant')));
create policy "phase_progress_write" on public.mission_phase_progress for all to authenticated using (public.current_role() = 'consultant');

-- Pièces : le client peut déposer (insert/update) ses propres pièces.
create policy "docs_read"  on public.mission_documents for select to authenticated
  using (exists (select 1 from public.missions m where m.id = mission_id and (m.org_id = public.current_org() or public.current_role() = 'consultant')));
create policy "docs_client_upload" on public.mission_documents for update to authenticated
  using (exists (select 1 from public.missions m where m.id = mission_id and m.org_id = public.current_org()));
create policy "docs_write" on public.mission_documents for all to authenticated using (public.current_role() = 'consultant');

create policy "interviews_read"  on public.interviews  for select to authenticated using (public.current_role() = 'consultant');
create policy "interviews_write" on public.interviews  for all    to authenticated using (public.current_role() = 'consultant');
create policy "visits_read"      on public.site_visits for select to authenticated using (public.current_role() = 'consultant');
create policy "visits_write"     on public.site_visits for all    to authenticated using (public.current_role() = 'consultant');

-- Constats : le client ne voit que les constats publiés (visible_to_client).
create policy "findings_client_read" on public.findings for select to authenticated
  using (public.current_role() = 'consultant'
     or (visible_to_client and exists (select 1 from public.missions m where m.id = mission_id and m.org_id = public.current_org())));
create policy "findings_write" on public.findings for all to authenticated using (public.current_role() = 'consultant');

-- Plan d'actions : le client peut mettre à jour le statut / la preuve de clôture de ses actions.
create policy "actions_read" on public.actions for select to authenticated
  using (exists (select 1 from public.missions m where m.id = mission_id and (m.org_id = public.current_org() or public.current_role() = 'consultant')));
create policy "actions_client_update" on public.actions for update to authenticated
  using (exists (select 1 from public.missions m where m.id = mission_id and m.org_id = public.current_org()));
create policy "actions_write" on public.actions for all to authenticated using (public.current_role() = 'consultant');

create policy "journal_read"  on public.mission_journal for select to authenticated
  using (exists (select 1 from public.missions m where m.id = mission_id and (m.org_id = public.current_org() or public.current_role() = 'consultant')));
create policy "journal_write" on public.mission_journal for insert to authenticated
  with check (exists (select 1 from public.missions m where m.id = mission_id and (m.org_id = public.current_org() or public.current_role() = 'consultant')));

create policy "deadlines_read"  on public.deadlines     for select to authenticated using (org_id = public.current_org() or public.current_role() = 'consultant');
create policy "deadlines_write" on public.deadlines     for all    to authenticated using (public.current_role() = 'consultant');
create policy "subs_read"       on public.subscriptions for select to authenticated using (org_id = public.current_org() or public.current_role() = 'consultant');
create policy "subs_write"      on public.subscriptions for all    to authenticated using (public.current_role() = 'consultant');
