-- 0031 — une pièce peut porter plusieurs fichiers.
--
-- « Bulletins de paie » ou « Relevés de pointage » arrivent en dix ou douze fichiers.
-- Les colonnes posées sur mission_documents (0002 : storage_path, uploaded_by ; 0028 :
-- file_name, file_size, uploaded_at) ne permettaient qu'un fichier par pièce, et n'ont
-- jamais été écrites. Elles sont remplacées par une table de fichiers.
--
-- La base garantit elle-même qu'un fichier est rangé dans le dossier de sa mission :
-- `storage_path` doit commencer par l'identifiant de la mission (même règle que la
-- policy du bucket, 0030). Une ligne ne peut donc pas pointer vers le fichier d'un
-- autre dossier, même par erreur applicative.
create table if not exists public.mission_document_files (
  id            uuid primary key default gen_random_uuid(),
  mission_id    uuid not null references public.missions(id) on delete cascade,
  document_id   uuid not null references public.mission_documents(id) on delete cascade,
  storage_path  text not null unique,
  file_name     text not null,
  file_size     bigint,
  content_type  text,
  uploaded_at   timestamptz not null default now(),
  uploaded_by   uuid references auth.users(id) on delete set null,
  constraint mission_document_files_chemin check (storage_path like mission_id::text || '/%')
);

comment on table public.mission_document_files is
  'Fichiers déposés pour une pièce (bucket `pieces`). Une pièce peut en avoir plusieurs.';
comment on column public.mission_document_files.file_name is
  'Nom d''origine, tel que la consultante le reconnaît. Le chemin de stockage, lui, est nettoyé (sans accents ni espaces).';

create index if not exists mission_document_files_document_idx on public.mission_document_files (document_id);
create index if not exists mission_document_files_mission_idx on public.mission_document_files (mission_id);

alter table public.mission_document_files enable row level security;
create policy "fichiers_pieces_consultant" on public.mission_document_files
  for all to authenticated
  using (public.current_role() = 'consultant')
  with check (public.current_role() = 'consultant');
revoke all on public.mission_document_files from anon;
grant select, insert, update, delete on public.mission_document_files to authenticated;

-- La vue doit être recréée : elle lisait les colonnes supprimées.
drop view if exists public.mission_documents_validite;

alter table public.mission_documents
  drop column if exists storage_path,
  drop column if exists uploaded_by,
  drop column if exists file_name,
  drop column if exists file_size,
  drop column if exists uploaded_at;

-- Deux corrections au passage :
--  * `received = 'na'` (la consultante a jugé la pièce non applicable) s'affichait
--    « Manquante ». Il vaut désormais « Sans objet », comme le seuil d'effectif.
--  * la vue expose le nombre de fichiers, pour afficher la pièce sans seconde requête.
create view public.mission_documents_validite
with (security_invoker = on) as
select
  d.id, d.mission_id, d.name, d.category, d.module_id, d.required,
  d.received, d.received_on, d.document_date,
  t.validite_nature, t.validite_note, t.validite_jours,
  coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) as echeance,
  case
    when d.received = 'na' then 'sans_objet'
    when t.applique_si_effectif_min is not null
     and coalesce(o.headcount, 0) < t.applique_si_effectif_min then 'sans_objet'
    when d.received <> 'oui' then 'non_recue'
    when t.validite_nature = 'indefinie' or t.validite_nature is null then 'recue'
    when coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) is null then 'date_manquante'
    when coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) < current_date then 'perimee'
    when coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) <= current_date + 30 then 'bientot_perimee'
    else 'valide'
  end as etat,
  (select count(*) from public.mission_document_files f where f.document_id = d.id)::int as nb_fichiers,
  coalesce(t.sort_order, 999) as ordre
from public.mission_documents d
join public.missions m on m.id = d.mission_id
left join public.organizations o on o.id = m.org_id
left join public.document_templates t on t.id = d.template_id;

revoke all on public.mission_documents_validite from anon;
grant select on public.mission_documents_validite to authenticated;
