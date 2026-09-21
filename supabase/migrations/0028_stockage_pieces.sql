-- 0028 — le bucket des pièces justificatives.
--
-- Appliquée en base le 20/09/2026 depuis la session mobile (version 20260920203757),
-- recopiée ici pour que le repo reste la source de vérité du schéma.
-- La policy posée ici est remplacée par 0030, qui la restreint au chemin de la mission.
insert into storage.buckets (id, name, public, file_size_limit)
values ('pieces', 'pieces', false, 52428800)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

alter table public.mission_documents
  add column if not exists file_name  text,
  add column if not exists file_size  bigint,
  add column if not exists uploaded_at timestamptz;

comment on column public.mission_documents.file_name is
  'Nom d''origine du fichier déposé, tel que la consultante le reconnaît. Le chemin réel est storage_path.';
comment on column public.mission_documents.file_size is 'Taille en octets, pour l''afficher sans requête au stockage.';
comment on column public.mission_documents.uploaded_at is 'Horodatage du dépôt. Distinct de received_on, qui est la date à laquelle le client a transmis la pièce.';

drop policy if exists "pieces_consultant" on storage.objects;
create policy "pieces_consultant" on storage.objects
  for all to authenticated
  using      (bucket_id = 'pieces' and public.current_role() = 'consultant')
  with check (bucket_id = 'pieces' and public.current_role() = 'consultant');
