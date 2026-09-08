-- ---------------------------------------------------------------------------
-- 0008 — Authentification : amorçage des profils, invitations, et portée des
-- points de contrôle par mission.
--
-- Sans profil, `current_role()` et `current_org()` renvoient NULL : la RLS ne
-- laisse rien passer et l'utilisateur connecté voit une application vide, sans
-- message d'erreur. Un profil doit donc naître avec le compte.
-- ---------------------------------------------------------------------------

-- 1. Invitations : c'est la seule façon d'obtenir un rôle ou une organisation.
--    Un compte créé sans invitation reçoit le rôle 'client' sans organisation :
--    il ne voit rien du tout. Défaut volontairement inutile plutôt que risqué.
create table public.invitations (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null,
  role        public.user_role not null default 'client',
  org_id      uuid references public.organizations (id) on delete cascade,
  full_name   text,
  invited_by  uuid references public.profiles (id),
  accepted_at timestamptz
);
create unique index invitations_email_uniq on public.invitations (lower(email));
alter table public.invitations enable row level security;
create policy "inv_consultant" on public.invitations for all to authenticated
  using      (public.current_role() = 'consultant')
  with check (public.current_role() = 'consultant');

-- 2. Un profil naît avec le compte.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare inv public.invitations%rowtype;
begin
  select * into inv from public.invitations
   where lower(email) = lower(new.email) and accepted_at is null
   limit 1;

  insert into public.profiles (id, org_id, role, full_name)
  values (new.id,
          inv.org_id,
          coalesce(inv.role, 'client'::public.user_role),
          coalesce(inv.full_name, new.raw_user_meta_data ->> 'full_name'))
  on conflict (id) do nothing;

  if inv.id is not null then
    update public.invitations set accepted_at = now() where id = inv.id;
  end if;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Même faille que sur les actions : un UPDATE client sans WITH CHECK permet
--    de déplacer une pièce vers la mission d'une autre entreprise.
drop policy if exists "docs_client_upload" on public.mission_documents;
create policy "docs_client_upload" on public.mission_documents for update to authenticated
  using      (exists (select 1 from public.missions m where m.id = mission_id and m.org_id = public.current_org()))
  with check (exists (select 1 from public.missions m where m.id = mission_id and m.org_id = public.current_org()));

-- 4. Portée : une mission ne travaille que les points de ses modules actifs.
--    Sans ça, une mission CNAPS afficherait les 208 points, et les points
--    fiscaux d'une mission fiscale n'apparaissaient « hors étape » qu'une fois
--    déjà saisis — donc jamais au moment où elle en a besoin.
drop view if exists public.mission_step_completeness;
create view public.mission_step_completeness
with (security_invoker = on) as
select
  msp.mission_id,
  s.id as step_id, s.sort_order, s.name, s.kind, s.phase_id, msp.status,
  count(cp.id) as points_total,
  count(mcr.control_point_id) filter (where mcr.status <> 'a_verifier') as points_traites
from public.mission_step_progress msp
join public.method_steps s on s.id = msp.step_id
left join public.mission_modules mm on mm.mission_id = msp.mission_id
left join public.control_points cp
       on cp.active
      and cardinality(s.domaines) > 0
      and cp.domain = any (s.domaines)
      and cp.module_id = mm.module_id
left join public.mission_control_results mcr
       on mcr.mission_id = msp.mission_id and mcr.control_point_id = cp.id
group by msp.mission_id, s.id, s.sort_order, s.name, s.kind, s.phase_id, msp.status;

drop view if exists public.mission_points_hors_etape;
create view public.mission_points_hors_etape
with (security_invoker = on) as
select
  mm.mission_id,
  cp.domain,
  count(*) as points_total,
  count(mcr.control_point_id) filter (where mcr.status <> 'a_verifier') as points_traites
from public.mission_modules mm
join public.control_points cp on cp.module_id = mm.module_id and cp.active
left join public.mission_control_results mcr
       on mcr.mission_id = mm.mission_id and mcr.control_point_id = cp.id
where not exists (
  select 1 from public.method_steps s
   where cardinality(s.domaines) > 0 and cp.domain = any (s.domaines)
)
group by mm.mission_id, cp.domain;
