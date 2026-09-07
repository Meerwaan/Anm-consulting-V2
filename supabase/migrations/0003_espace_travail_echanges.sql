-- Phase 4 (suite) : le portail comme ESPACE DE TRAVAIL de la consultante + espace d'échange client.
-- Vision produit (07/09/2026, Merwan) :
--   1. Un dossier par client, rangé par MODULE (Mallette 360, CNAPS, URSSAF/Inspection, Fiscal) : rien ne doit manquer.
--   2. Les 15 étapes de la méthode (note de cadrage) comme checklist de travail, en plus des 7 phases calendaires (06 §2).
--   3. Notes de travail visibles ou non par le client pendant l'audit.
--   4. Espace d'échange : messages, demandes de pièces formelles, notifications email.
--   5. Compte rendu final en deux axes : RISQUES réels en cas de contrôle / AXES D'AMÉLIORATION (organisation).

-- ---------------------------------------------------------------------------
-- 1. Modules de travail (= les classeurs xlsx du pack)
-- ---------------------------------------------------------------------------
create table public.audit_modules (
  id           serial primary key,
  code         text not null unique,     -- M360, CNAPS, URSSAF_IT, FISCAL
  name         text not null,
  source_file  text not null,            -- fichier xlsx du pack
  sort_order   int  not null,
  domains      public.audit_domain[] not null
);
insert into public.audit_modules (code, name, source_file, sort_order, domains) values
  ('M360',      'Mallette Audit 360°',              '02_Mallette_Audit_360.xlsx',       1, array['gouvernance','cnaps','social','temps','urssaf','inspection_sst','sous_traitance','operationnel']::public.audit_domain[]),
  ('CNAPS',     'Module Audit CNAPS',               '03_Module_Audit_CNAPS.xlsx',       2, array['cnaps']::public.audit_domain[]),
  ('URSSAF_IT', 'Module URSSAF / Inspection',       '04_Module_URSSAF_Inspection.xlsx', 3, array['social','paie','temps','urssaf','inspection_sst']::public.audit_domain[]),
  ('FISCAL',    'Module Contrôle fiscal DGFiP',     '05_Module_Controle_Fiscal.xlsx',   4, array['fiscal']::public.audit_domain[]);

-- Rattachement des points de contrôle à leur module (via source_module)
alter table public.control_points add column module_id int references public.audit_modules (id);
update public.control_points cp set module_id = m.id
  from public.audit_modules m where cp.source_module = replace(m.source_file, '.xlsx', '');
alter table public.control_points alter column module_id set not null;

-- Modules activés sur une mission (Flash = M360 partiel, CNAPS = CNAPS, 360 = tous…)
create table public.mission_modules (
  mission_id   uuid not null references public.missions (id) on delete cascade,
  module_id    int  not null references public.audit_modules (id),
  status       text not null default 'a_faire' check (status in ('a_faire', 'en_cours', 'termine', 'na')),
  notes        text,
  started_at   timestamptz,
  finished_at  timestamptz,
  primary key (mission_id, module_id)
);

-- Ce que la consultante coche point par point (= la feuille AUDIT_* remplie), par mission.
-- Un constat (findings) n'est créé que quand un point mérite d'être rapporté.
create table public.mission_control_results (
  mission_id        uuid not null references public.missions (id) on delete cascade,
  control_point_id  int  not null references public.control_points (id),
  status            public.control_status not null default 'a_verifier',
  severity          public.severity,                 -- gravité retenue
  note              text,                            -- constat / preuve en brouillon
  finding_id        uuid references public.findings (id) on delete set null,
  updated_at        timestamptz not null default now(),
  updated_by        uuid references public.profiles (id),
  primary key (mission_id, control_point_id)
);

-- Feuilles de travail annexes (ECHANTILLON_SALARIES, CROISEMENT_HEURES, AGENTS_TITRES, SCORE_RISQUE…)
-- restent des fichiers : on les range dans le module, avec leur état.
alter table public.mission_documents
  add column module_id int references public.audit_modules (id),
  add column kind text not null default 'piece_client'
    check (kind in ('piece_client', 'feuille_travail', 'preuve', 'livrable'));

-- ---------------------------------------------------------------------------
-- 2. Les 15 étapes de la méthode (note de cadrage) — checklist de travail, distincte des 7 phases calendaires
-- ---------------------------------------------------------------------------
create table public.method_steps (
  id          serial primary key,
  sort_order  int not null unique,
  name        text not null,
  phase_id    int references public.mission_phases (id)   -- phase calendaire habituelle
);
insert into public.method_steps (sort_order, name, phase_id) values
  (1,  'Entretien avec le dirigeant',                                        1),
  (2,  'Définition du périmètre de l''audit',                                1),
  (3,  'Collecte des documents',                                             2),
  (4,  'Analyse documentaire',                                               3),
  (5,  'Sélection d''un échantillon de salariés, sites et sous-traitants',   2),
  (6,  'Contrôle CNAPS',                                                     5),
  (7,  'Contrôle social et URSSAF',                                          5),
  (8,  'Contrôle du temps de travail',                                       5),
  (9,  'Analyse Inspection du travail / santé-sécurité',                     5),
  (10, 'Rapprochement planning → pointage → paie → facturation',             6),
  (11, 'Qualification des constats',                                         6),
  (12, 'Classement des risques : Critique / Majeur / Modéré / Mineur',       6),
  (13, 'Plan d''actions : P1 immédiat / P2 30 j / P3 90 j / P4 amélioration', 7),
  (14, 'Rapport final',                                                      7),
  (15, 'Réunion de restitution avec le dirigeant',                           7);

create table public.mission_step_progress (
  mission_id  uuid not null references public.missions (id) on delete cascade,
  step_id     int  not null references public.method_steps (id),
  status      text not null default 'todo' check (status in ('todo', 'doing', 'done', 'na')),
  done_at     timestamptz,
  note        text,
  primary key (mission_id, step_id)
);

-- ---------------------------------------------------------------------------
-- 3. Notes de travail (brouillon de la consultante, partageable au client)
-- ---------------------------------------------------------------------------
create table public.mission_notes (
  id                 uuid primary key default gen_random_uuid(),
  mission_id         uuid not null references public.missions (id) on delete cascade,
  module_id          int references public.audit_modules (id),
  control_point_id   int references public.control_points (id),
  author_id          uuid references public.profiles (id),
  created_at         timestamptz not null default now(),
  body               text not null,
  visible_to_client  boolean not null default false,   -- factuel uniquement (fait / preuve), jamais de conclusion juridique
  pinned             boolean not null default false
);
create index on public.mission_notes (mission_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. Échanges : messages, demandes de pièces, notifications email
-- ---------------------------------------------------------------------------
create table public.mission_messages (
  id           uuid primary key default gen_random_uuid(),
  mission_id   uuid not null references public.missions (id) on delete cascade,
  author_id    uuid not null references public.profiles (id),
  created_at   timestamptz not null default now(),
  body         text not null,
  attachment_document_id uuid references public.mission_documents (id),
  read_at      timestamptz
);
create index on public.mission_messages (mission_id, created_at desc);

create type public.request_status as enum ('ouverte', 'relancee', 'recue', 'annulee');

-- « Il me manque X » : demande formelle, tracée, relançable, notifiée par email.
create table public.document_requests (
  id            uuid primary key default gen_random_uuid(),
  mission_id    uuid not null references public.missions (id) on delete cascade,
  document_id   uuid references public.mission_documents (id) on delete set null,   -- ligne de la checklist concernée
  module_id     int references public.audit_modules (id),
  requested_by  uuid references public.profiles (id),
  requested_at  timestamptz not null default now(),
  due_on        date,
  message       text,
  status        public.request_status not null default 'ouverte',
  reminders     int not null default 0,
  last_reminder_at timestamptz,
  fulfilled_at  timestamptz
);
create index on public.document_requests (mission_id, status);

create type public.notification_kind as enum (
  'demande_piece', 'relance_piece', 'piece_recue', 'message', 'note_publiee',
  'constat_publie', 'etape_franchie', 'rapport_disponible', 'echeance_proche'
);

create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  recipient_id  uuid not null references public.profiles (id) on delete cascade,
  mission_id    uuid references public.missions (id) on delete cascade,
  kind          public.notification_kind not null,
  title         text not null,
  body          text,
  link          text,                          -- route du portail
  email_sent_at timestamptz,                   -- posé par le job Resend
  read_at       timestamptz
);
create index on public.notifications (recipient_id, read_at);

-- ---------------------------------------------------------------------------
-- 5. Compte rendu final en deux axes
-- ---------------------------------------------------------------------------
create type public.finding_nature as enum ('risque_controle', 'amelioration');
alter table public.findings
  add column nature public.finding_nature not null default 'risque_controle',
  add column module_id int references public.audit_modules (id);
comment on column public.findings.nature is
  'risque_controle = exposition réelle en cas de contrôle (CNAPS/URSSAF/DGFiP/IT) ; amelioration = organisation, traçabilité, temps du dirigeant.';

create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  mission_id    uuid not null references public.missions (id) on delete cascade,
  version       text not null,
  generated_at  timestamptz not null default now(),
  generated_by  uuid references public.profiles (id),
  storage_path  text,                          -- PDF généré (structure 07)
  summary       text,                          -- synthèse dirigeant
  published_to_client boolean not null default false,
  unique (mission_id, version)
);

-- ---------------------------------------------------------------------------
-- Vue « rien ne manque » : complétude par module
-- ---------------------------------------------------------------------------
create view public.mission_module_completeness as
select
  mm.mission_id,
  m.code as module_code,
  m.name as module_name,
  mm.status,
  (select count(*) from public.control_points cp where cp.module_id = m.id and cp.active)                                  as points_total,
  (select count(*) from public.mission_control_results r join public.control_points cp on cp.id = r.control_point_id
     where r.mission_id = mm.mission_id and cp.module_id = m.id and r.status <> 'a_verifier')                              as points_traites,
  (select count(*) from public.mission_documents d where d.mission_id = mm.mission_id and d.module_id = m.id and d.required) as pieces_attendues,
  (select count(*) from public.mission_documents d where d.mission_id = mm.mission_id and d.module_id = m.id and d.required and d.received = 'oui') as pieces_recues,
  (select count(*) from public.document_requests q where q.mission_id = mm.mission_id and q.module_id = m.id and q.status in ('ouverte','relancee')) as demandes_ouvertes
from public.mission_modules mm
join public.audit_modules m on m.id = mm.module_id;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.audit_modules            enable row level security;
alter table public.mission_modules          enable row level security;
alter table public.mission_control_results  enable row level security;
alter table public.method_steps             enable row level security;
alter table public.mission_step_progress    enable row level security;
alter table public.mission_notes            enable row level security;
alter table public.mission_messages         enable row level security;
alter table public.document_requests        enable row level security;
alter table public.notifications            enable row level security;
alter table public.reports                  enable row level security;

create policy "modules_read"  on public.audit_modules for select to authenticated using (true);
create policy "steps_read"    on public.method_steps  for select to authenticated using (true);

-- helper : la mission appartient à mon organisation
create or replace function public.is_my_mission(m_id uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.missions m where m.id = m_id and m.org_id = public.current_org()) $$;

create policy "mm_read"  on public.mission_modules for select to authenticated using (public.is_my_mission(mission_id) or public.current_role() = 'consultant');
create policy "mm_write" on public.mission_modules for all    to authenticated using (public.current_role() = 'consultant');

-- Résultats point par point : consultante seulement (le client voit les constats publiés, pas la feuille de travail)
create policy "mcr_all" on public.mission_control_results for all to authenticated using (public.current_role() = 'consultant');

create policy "msp_read"  on public.mission_step_progress for select to authenticated using (public.is_my_mission(mission_id) or public.current_role() = 'consultant');
create policy "msp_write" on public.mission_step_progress for all    to authenticated using (public.current_role() = 'consultant');

create policy "notes_read"  on public.mission_notes for select to authenticated
  using (public.current_role() = 'consultant' or (visible_to_client and public.is_my_mission(mission_id)));
create policy "notes_write" on public.mission_notes for all to authenticated using (public.current_role() = 'consultant');

create policy "msg_read"   on public.mission_messages for select to authenticated using (public.is_my_mission(mission_id) or public.current_role() = 'consultant');
create policy "msg_insert" on public.mission_messages for insert to authenticated
  with check (author_id = auth.uid() and (public.is_my_mission(mission_id) or public.current_role() = 'consultant'));
create policy "msg_read_mark" on public.mission_messages for update to authenticated using (public.is_my_mission(mission_id) or public.current_role() = 'consultant');

create policy "req_read"  on public.document_requests for select to authenticated using (public.is_my_mission(mission_id) or public.current_role() = 'consultant');
create policy "req_write" on public.document_requests for all    to authenticated using (public.current_role() = 'consultant');

create policy "notif_self" on public.notifications for select to authenticated using (recipient_id = auth.uid());
create policy "notif_mark" on public.notifications for update to authenticated using (recipient_id = auth.uid());

create policy "reports_read"  on public.reports for select to authenticated
  using (public.current_role() = 'consultant' or (published_to_client and public.is_my_mission(mission_id)));
create policy "reports_write" on public.reports for all to authenticated using (public.current_role() = 'consultant');

-- ---------------------------------------------------------------------------
-- Automatisations : à la création d'une mission, activer les modules et initialiser étapes, phases, pièces.
-- ---------------------------------------------------------------------------
create or replace function public.init_mission() returns trigger
language plpgsql security definer set search_path = public as $$
declare mods text[];
begin
  mods := case new.type
    when 'flash'            then array['M360']
    when 'cnaps'            then array['CNAPS']
    when 'social_urssaf'    then array['URSSAF_IT']
    when 'inspection'       then array['URSSAF_IT']
    when 'fiscal'           then array['FISCAL']
    when 'audit_360'        then array['M360','CNAPS','URSSAF_IT']
    when 'suivi_conformite' then array['M360']
  end;
  insert into public.mission_modules (mission_id, module_id)
    select new.id, id from public.audit_modules where code = any(mods);
  insert into public.mission_phase_progress (mission_id, phase_id) select new.id, id from public.mission_phases;
  insert into public.mission_step_progress  (mission_id, step_id)  select new.id, id from public.method_steps;
  -- pièces standard, rangées dans le module correspondant ; les pièces fiscales seulement si le module FISCAL est actif
  insert into public.mission_documents (mission_id, template_id, category, name, required, module_id)
    select new.id, t.id, t.category, t.name, true,
           (select id from public.audit_modules where code = case t.category
              when 'entreprise' then 'M360'
              when 'cnaps'      then 'CNAPS'
              when 'fiscal'     then 'FISCAL'
              else 'URSSAF_IT' end)
    from public.document_templates t
    where (t.category <> 'fiscal' and new.type <> 'fiscal') or (t.category = 'fiscal' and 'FISCAL' = any(mods))
       or (new.type = 'fiscal' and t.category = 'entreprise');
  return new;
end $$;

create trigger missions_init after insert on public.missions
  for each row execute function public.init_mission();

-- Une demande de pièce ou un message crée une notification pour l'autre partie.
create or replace function public.notify_document_request() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (recipient_id, mission_id, kind, title, body, link)
    select p.id, new.mission_id, 'demande_piece',
           'Pièce demandée : ' || coalesce((select name from public.mission_documents where id = new.document_id), 'document'),
           new.message, '/app/missions/' || new.mission_id || '/pieces'
    from public.missions m join public.profiles p on p.org_id = m.org_id and p.role = 'client'
    where m.id = new.mission_id;
  return new;
end $$;
create trigger document_requests_notify after insert on public.document_requests
  for each row execute function public.notify_document_request();

create or replace function public.notify_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare author_role public.user_role;
begin
  select role into author_role from public.profiles where id = new.author_id;
  if author_role = 'consultant' then
    insert into public.notifications (recipient_id, mission_id, kind, title, body, link)
      select p.id, new.mission_id, 'message', 'Nouveau message de votre consultante', left(new.body, 200), '/app/missions/' || new.mission_id || '/echanges'
      from public.missions m join public.profiles p on p.org_id = m.org_id and p.role = 'client' where m.id = new.mission_id;
  else
    insert into public.notifications (recipient_id, mission_id, kind, title, body, link)
      select p.id, new.mission_id, 'message', 'Nouveau message client', left(new.body, 200), '/admin/missions/' || new.mission_id || '/echanges'
      from public.profiles p where p.role = 'consultant';
  end if;
  return new;
end $$;
create trigger mission_messages_notify after insert on public.mission_messages
  for each row execute function public.notify_message();
