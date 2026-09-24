-- 0042 — Un client d'exemple pour découvrir la chaîne commerciale sans client réel (24/09/2026).
-- Tout ce qui touche un client marqué `exemple` reçoit un numéro « EXEMPLE-… », hors des séries
-- réelles (D, F, AV) : la première vraie facture reste F2026-0001. L'exemple s'efface d'un bouton ;
-- ses factures, elles seules, peuvent donc être supprimées.

alter table public.organizations add column if not exists exemple boolean not null default false;
alter table public.leads add column if not exists exemple boolean not null default false;

create or replace function public.numeroter_facture() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  s text := case when new.nature = 'avoir' then 'AV' else 'F' end;
  a int  := extract(year from new.emise_le)::int;
  n int;
begin
  if exists (select 1 from public.missions m join public.organizations o on o.id = m.org_id where m.id = new.mission_id and o.exemple) then
    select count(*) + 1 into n from public.factures where numero like 'EXEMPLE-' || s || '-%';
    new.numero := 'EXEMPLE-' || s || '-' || lpad(n::text, 4, '0');
    return new;
  end if;
  insert into public.compteurs_factures (serie, annee, dernier) values (s, a, 1)
  on conflict (serie, annee) do update set dernier = compteurs_factures.dernier + 1
  returning dernier into n;
  new.numero := s || a || '-' || lpad(n::text, 4, '0');
  return new;
end $$;

create or replace function public.numeroter_devis() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  a int := extract(year from new.cree_le)::int;
  n int;
begin
  if exists (select 1 from public.organizations o where o.id = new.org_id and o.exemple) then
    select count(*) + 1 into n from public.devis where numero like 'EXEMPLE-D-%';
    new.numero := 'EXEMPLE-D-' || lpad(n::text, 4, '0');
    return new;
  end if;
  insert into public.compteurs_factures (serie, annee, dernier) values ('D', a, 1)
  on conflict (serie, annee) do update set dernier = compteurs_factures.dernier + 1
  returning dernier into n;
  new.numero := 'D' || a || '-' || lpad(n::text, 4, '0');
  return new;
end $$;

create or replace function public.figer_facture() returns trigger
language plpgsql set search_path = public as $$
begin
  if old.numero like 'EXEMPLE-%' then
    return case when tg_op = 'DELETE' then old else new end;
  end if;
  if tg_op = 'DELETE' then
    raise exception 'Une facture émise ne se supprime pas : émettre un avoir.';
  end if;
  if (to_jsonb(new) - 'payee_le' - 'archive_path') is distinct from (to_jsonb(old) - 'payee_le' - 'archive_path') then
    raise exception 'Une facture émise ne se modifie pas : émettre un avoir.';
  end if;
  return new;
end $$;

-- Supprimer les factures d'exemple : la consultante en a besoin pour effacer l'exemple.
grant delete on public.factures to authenticated;
revoke execute on function public.numeroter_facture() from public, anon, authenticated;
revoke execute on function public.numeroter_devis() from public, anon, authenticated;
revoke execute on function public.figer_facture() from public, anon, authenticated;

-- La consultante efface les demandes d'exemple (et elles seules).
drop policy if exists "leads_consultant_exemple" on public.leads;
create policy "leads_consultant_exemple" on public.leads for delete to authenticated
  using (public.current_role() = 'consultant' and exemple);
grant delete on public.leads to authenticated;
