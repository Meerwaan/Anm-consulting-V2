-- 0045 — ouverture de l'espace client (/app).
--
-- Avant d'ouvrir l'accès aux clients, la relecture des politiques a relevé :
--
--  1. FAILLE CRITIQUE : `profiles_self_update` laisse chacun modifier sa propre ligne, et le
--     rôle `authenticated` a le droit UPDATE sur `profiles.role` et `profiles.org_id`. Un
--     compte client (ou n'importe qui : l'inscription publique est ouverte) pouvait se
--     déclarer `consultant` et lire tous les dossiers. Un déclencheur bloque désormais toute
--     modification du rôle, de la société et de l'état d'accès hors clé de service.
--  2. `missions` était lisible en entier par le client : `next_action` (le pense-bête de la
--     consultante), `initial_hotspots` (ses points chauds de qualification), `scope`, le
--     montant. Le client passe par `espace_client_missions()`, qui ne rend que le suivi.
--  3. `mission_documents` : le client lisait `observation` et pouvait modifier toutes les
--     colonnes (se déclarer une pièce reçue, la renommer). Lecture par
--     `espace_client_pieces()`, dépôt par `mission_document_files` + déclencheur.
--  4. `mission_journal` (journal de travail) lisible et alimentable par le client.
--  5. `mission_step_progress.note` (note de la consultante sur une étape de méthode) lisible.
--  6. `control_points`, `method_steps`, `mission_phases` lisibles par tout compte connecté :
--     c'est la méthode d'audit elle-même. Réservés à la consultante.
--  7. `mission_messages` : le client pouvait réécrire le texte de n'importe quel message de sa
--     mission (la policy UPDATE devait servir à l'accusé de lecture seulement).
--
-- Ajouts :
--  * `profiles.acces_retire_le` : un accès retiré ne supprime rien ; `current_role()` et
--    `current_org()` renvoient null, donc toutes les policies se ferment d'un coup.
--  * dépôt de fichiers par le client dans le bucket `pieces`, limité aux dossiers de ses
--    pièces ; lecture limitée aux fichiers de ses pièces et aux rapports publiés.
--  * `reports.published_at` et notification du client quand un rapport est publié.

-- ─── 1. Profils : état d'accès et garde ────────────────────────────────────────────────
alter table public.profiles add column if not exists acces_retire_le timestamptz;
comment on column public.profiles.acces_retire_le is
  'Accès retiré par la consultante (espace client). Le compte et ses données restent ; toutes les policies se ferment.';

create or replace function public."current_role"()
returns public.user_role
language sql stable security definer
set search_path to 'public'
as $$ select role from public.profiles where id = auth.uid() and acces_retire_le is null $$;

create or replace function public.current_org()
returns uuid
language sql stable security definer
set search_path to 'public'
as $$ select org_id from public.profiles where id = auth.uid() and acces_retire_le is null $$;

create or replace function public.profiles_garde()
returns trigger
language plpgsql security definer
set search_path to ''
as $$
begin
  -- auth.uid() est null pour la clé de service et les migrations : seules elles peuvent
  -- changer un rôle, une société ou l'état d'un accès.
  if auth.uid() is not null
     and (new.id, new.role, new.org_id, new.acces_retire_le)
         is distinct from (old.id, old.role, old.org_id, old.acces_retire_le) then
    raise exception 'Le rôle, la société et l''état de l''accès ne se modifient pas depuis un compte.'
      using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists profiles_garde on public.profiles;
create trigger profiles_garde before update on public.profiles
  for each row execute function public.profiles_garde();

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ─── 2. Missions : plus de lecture directe par le client ───────────────────────────────
drop policy if exists missions_read on public.missions;
create policy missions_read on public.missions
  for select to authenticated
  using (public."current_role"() = 'consultant');

create or replace function public.espace_client_missions()
returns table (
  id uuid, reference text, type public.mission_type, status public.mission_status,
  opened_on date, intervention_on date, restitution_on date,
  control_in_progress boolean, control_body text, control_deadline date,
  organisation text, consultante text
)
language sql stable security definer
set search_path to ''
as $$
  select m.id, m.reference, m.type, m.status, m.opened_on, m.intervention_on, m.restitution_on,
         m.control_in_progress, m.control_body, m.control_deadline, o.name, c.full_name
    from public.missions m
    join public.organizations o on o.id = m.org_id
    left join public.profiles c on c.id = m.consultant_id
   where public."current_role"() = 'client'
     and m.org_id = public.current_org()
   order by m.opened_on desc, m.created_at desc
$$;

-- Les policies qui passaient par un EXISTS sur missions (désormais invisible au client)
-- passent par is_my_mission(), SECURITY DEFINER.
drop policy if exists actions_read on public.actions;
create policy actions_read on public.actions for select to authenticated
  using (public."current_role"() = 'consultant' or public.is_my_mission(mission_id));
drop policy if exists actions_client_update on public.actions;
create policy actions_client_update on public.actions for update to authenticated
  using (public.is_my_mission(mission_id))
  with check (public.is_my_mission(mission_id));

drop policy if exists findings_client_read on public.findings;
create policy findings_client_read on public.findings for select to authenticated
  using (public."current_role"() = 'consultant' or (visible_to_client and public.is_my_mission(mission_id)));

drop policy if exists phase_progress_read on public.mission_phase_progress;
create policy phase_progress_read on public.mission_phase_progress for select to authenticated
  using (public."current_role"() = 'consultant' or public.is_my_mission(mission_id));

-- ─── 3. Pièces ─────────────────────────────────────────────────────────────────────────
drop policy if exists docs_read on public.mission_documents;
create policy docs_read on public.mission_documents for select to authenticated
  using (public."current_role"() = 'consultant');
drop policy if exists docs_client_upload on public.mission_documents;

create or replace function public.piece_client_de_ma_mission(p_document uuid, p_mission uuid)
returns boolean
language sql stable security definer
set search_path to ''
as $$
  select public."current_role"() = 'client'
     and public.is_my_mission(p_mission)
     and exists (
       select 1 from public.mission_documents d
        where d.id = p_document and d.mission_id = p_mission and d.kind = 'piece_client'
     )
$$;

create or replace function public.espace_client_pieces(p_mission uuid)
returns table (
  id uuid, nom text, categorie text, obligatoire boolean,
  recue boolean, recue_le date,
  demande_statut public.request_status, demandee_le timestamptz, a_rendre_le date, message text, relances integer
)
language sql stable security definer
set search_path to ''
as $$
  select d.id, d.name, d.category::text, d.required,
         d.received = 'oui', d.received_on,
         r.status, r.requested_at, r.due_on, r.message, r.reminders
    from public.mission_documents d
    left join lateral (
      select q.status, q.requested_at, q.due_on, q.message, q.reminders
        from public.document_requests q
       where q.document_id = d.id and q.status <> 'annulee'
       order by q.requested_at desc
       limit 1
    ) r on true
   where public."current_role"() = 'client'
     and public.is_my_mission(p_mission)
     and d.mission_id = p_mission
     and d.kind = 'piece_client'
     and (r.status is not null or d.received = 'oui')
$$;

create policy fichiers_pieces_client_lecture on public.mission_document_files
  for select to authenticated
  using (public."current_role"() = 'client' and public.is_my_mission(mission_id));

create policy fichiers_pieces_client_depot on public.mission_document_files
  for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and public.piece_client_de_ma_mission(document_id, mission_id)
    and storage_path like mission_id::text || '/' || document_id::text || '/%'
  );

create or replace function public.piece_deposee_par_client()
returns trigger
language plpgsql security definer
set search_path to ''
as $$
begin
  if public."current_role"() is distinct from 'client' then
    return new;
  end if;
  update public.mission_documents
     set received = 'oui', received_on = current_date
   where id = new.document_id and received is distinct from 'oui';
  update public.document_requests
     set status = 'recue', fulfilled_at = now()
   where document_id = new.document_id and mission_id = new.mission_id and status in ('ouverte', 'relancee');
  insert into public.notifications (recipient_id, mission_id, kind, title, body, link)
    select p.id, new.mission_id, 'piece_recue', 'Pièce déposée par le client',
           left(coalesce((select name from public.mission_documents where id = new.document_id), 'Pièce')
                || ' — ' || new.file_name, 200),
           '/admin/missions/' || new.mission_id || '/pieces'
      from public.profiles p
     where p.role = 'consultant' and p.acces_retire_le is null;
  return new;
end $$;

drop trigger if exists fichiers_pieces_depot_client on public.mission_document_files;
create trigger fichiers_pieces_depot_client after insert on public.mission_document_files
  for each row execute function public.piece_deposee_par_client();

-- Stockage : le client dépose dans {mission}/{pièce}/… et lit ses fichiers et rapports publiés.
create or replace function public.pieces_depot_client_autorise(p_nom text)
returns boolean
language plpgsql stable security definer
set search_path to ''
as $$
declare dossiers text[] := storage.foldername(p_nom);
begin
  if coalesce(array_length(dossiers, 1), 0) <> 2 then return false; end if;
  if dossiers[1] !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or dossiers[2] !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  return public.piece_client_de_ma_mission(dossiers[2]::uuid, dossiers[1]::uuid);
end $$;

create or replace function public.pieces_lecture_client_autorisee(p_nom text)
returns boolean
language sql stable security definer
set search_path to ''
as $$
  select public."current_role"() = 'client' and (
    exists (select 1 from public.mission_document_files f
             where f.storage_path = p_nom and public.is_my_mission(f.mission_id))
    or exists (select 1 from public.reports r
                where r.storage_path = p_nom and r.published_to_client and public.is_my_mission(r.mission_id))
  )
$$;

drop policy if exists pieces_client_depot on storage.objects;
create policy pieces_client_depot on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pieces' and public.pieces_depot_client_autorise(name));

drop policy if exists pieces_client_lecture on storage.objects;
create policy pieces_client_lecture on storage.objects
  for select to authenticated
  using (bucket_id = 'pieces' and public.pieces_lecture_client_autorisee(name));

-- ─── 4. Journal et méthode : consultante seule ─────────────────────────────────────────
drop policy if exists journal_read on public.mission_journal;
create policy journal_read on public.mission_journal for select to authenticated
  using (public."current_role"() = 'consultant');
drop policy if exists journal_write on public.mission_journal;
create policy journal_write on public.mission_journal for insert to authenticated
  with check (public."current_role"() = 'consultant');

drop policy if exists msp_read on public.mission_step_progress;
create policy msp_read on public.mission_step_progress for select to authenticated
  using (public."current_role"() = 'consultant');

drop policy if exists ref_read on public.control_points;
create policy ref_read on public.control_points for select to authenticated
  using (public."current_role"() = 'consultant');
drop policy if exists steps_read on public.method_steps;
create policy steps_read on public.method_steps for select to authenticated
  using (public."current_role"() = 'consultant');
drop policy if exists phases_read on public.mission_phases;
create policy phases_read on public.mission_phases for select to authenticated
  using (public."current_role"() = 'consultant');

-- ─── 5. Échanges ───────────────────────────────────────────────────────────────────────
create or replace function public.messages_garde()
returns trigger
language plpgsql security definer
set search_path to ''
as $$
begin
  if auth.uid() is null or public."current_role"() = 'consultant' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.attachment_document_id is not null or new.read_at is not null then
      raise exception 'Un message client ne porte ni pièce jointe ni accusé de lecture.' using errcode = '42501';
    end if;
    new.created_at := now();
    return new;
  end if;
  -- UPDATE : le client ne pose que l'accusé de lecture, et seulement sur un message reçu.
  if old.author_id = auth.uid()
     or (new.id, new.mission_id, new.author_id, new.created_at, new.body, new.attachment_document_id)
        is distinct from (old.id, old.mission_id, old.author_id, old.created_at, old.body, old.attachment_document_id) then
    raise exception 'Seul l''accusé de lecture d''un message reçu est modifiable.' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists mission_messages_garde on public.mission_messages;
create trigger mission_messages_garde before insert or update on public.mission_messages
  for each row execute function public.messages_garde();

-- Les notifications ignorent les accès retirés ; le lien côté consultante mène à l'écran
-- « Espace client » de la mission.
create or replace function public.notify_message()
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
declare author_role public.user_role;
begin
  select role into author_role from public.profiles where id = new.author_id;
  if author_role = 'consultant' then
    insert into public.notifications (recipient_id, mission_id, kind, title, body, link)
      select p.id, new.mission_id, 'message', 'Nouveau message de votre consultante', left(new.body, 200),
             '/app/missions/' || new.mission_id || '/echanges'
        from public.missions m
        join public.profiles p on p.org_id = m.org_id and p.role = 'client' and p.acces_retire_le is null
       where m.id = new.mission_id;
  else
    insert into public.notifications (recipient_id, mission_id, kind, title, body, link)
      select p.id, new.mission_id, 'message', 'Nouveau message client', left(new.body, 200),
             '/admin/missions/' || new.mission_id || '/client'
        from public.profiles p where p.role = 'consultant' and p.acces_retire_le is null;
  end if;
  return new;
end $$;

create or replace function public.notify_document_request()
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
begin
  insert into public.notifications (recipient_id, mission_id, kind, title, body, link)
    select p.id, new.mission_id, 'demande_piece',
           'Pièce demandée : ' || coalesce((select name from public.mission_documents where id = new.document_id), 'document'),
           new.message, '/app/missions/' || new.mission_id || '/pieces'
      from public.missions m
      join public.profiles p on p.org_id = m.org_id and p.role = 'client' and p.acces_retire_le is null
     where m.id = new.mission_id;
  return new;
end $$;

-- ─── 6. Rapport publié ─────────────────────────────────────────────────────────────────
alter table public.reports add column if not exists published_at timestamptz;
comment on column public.reports.published_at is 'Mise à disposition du client (espace client). Null tant que la version n''est pas publiée.';

create or replace function public.rapport_publie()
returns trigger
language plpgsql security definer
set search_path to ''
as $$
begin
  if new.published_to_client and not coalesce(old.published_to_client, false) then
    new.published_at := now();
    insert into public.notifications (recipient_id, mission_id, kind, title, body, link)
      select p.id, new.mission_id, 'rapport_disponible', 'Votre rapport d’audit est disponible',
             'Version ' || new.version, '/app/missions/' || new.mission_id
        from public.missions m
        join public.profiles p on p.org_id = m.org_id and p.role = 'client' and p.acces_retire_le is null
       where m.id = new.mission_id;
  elsif not new.published_to_client then
    new.published_at := null;
  end if;
  return new;
end $$;

drop trigger if exists reports_publication on public.reports;
create trigger reports_publication before update of published_to_client on public.reports
  for each row execute function public.rapport_publie();

-- ─── 7. Droits d'exécution ─────────────────────────────────────────────────────────────
revoke all on function public.profiles_garde() from public, anon, authenticated;
revoke all on function public.piece_deposee_par_client() from public, anon, authenticated;
revoke all on function public.messages_garde() from public, anon, authenticated;
revoke all on function public.rapport_publie() from public, anon, authenticated;
revoke all on function public.espace_client_missions() from public, anon;
revoke all on function public.espace_client_pieces(uuid) from public, anon;
revoke all on function public.piece_client_de_ma_mission(uuid, uuid) from public, anon;
revoke all on function public.pieces_depot_client_autorise(text) from public, anon;
revoke all on function public.pieces_lecture_client_autorisee(text) from public, anon;
grant execute on function public.espace_client_missions() to authenticated;
grant execute on function public.espace_client_pieces(uuid) to authenticated;
grant execute on function public.piece_client_de_ma_mission(uuid, uuid) to authenticated;
grant execute on function public.pieces_depot_client_autorise(text) to authenticated;
grant execute on function public.pieces_lecture_client_autorisee(text) to authenticated;

-- ─── 0045b (appliquée à part) : auth.uid() évalué une fois par requête (advisor initplan) ─
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists fichiers_pieces_client_depot on public.mission_document_files;
create policy fichiers_pieces_client_depot on public.mission_document_files
  for insert to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and public.piece_client_de_ma_mission(document_id, mission_id)
    and storage_path like mission_id::text || '/' || document_id::text || '/%'
  );
