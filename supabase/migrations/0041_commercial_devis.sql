-- 0041 — Le suivi commercial au même endroit (Merwan, 24/09/2026) : la demande reçue du site
-- (formulaire de contact, estimateur) devient un devis, le devis accepté devient la mission et son
-- contrat, le contrat donne les factures. Rien ne se retape d'une étape à l'autre.

-- Les demandes : le contexte en colonnes (il était replié dans `message`) ------------------------
alter table public.leads
  add column if not exists telephone     text,
  add column if not exists sites         int,
  add column if not exists situation     text,
  add column if not exists offre         text,          -- id de l'offre (flash, audit_360…)
  add column if not exists urgence       boolean not null default false,
  add column if not exists estimation_ht numeric(10,2), -- l'estimation vue par le prospect sur le site
  add column if not exists siren         text,
  add column if not exists statut        text not null default 'nouvelle'
    check (statut in ('nouvelle', 'en_cours', 'devis', 'gagnee', 'sans_suite')),
  add column if not exists org_id        uuid references public.organizations (id) on delete set null,
  add column if not exists maj_le        timestamptz;

-- La consultante lit et suit les demandes ; le site continue d'insérer seul.
drop policy if exists "leads_consultant" on public.leads;
create policy "leads_consultant" on public.leads for select to authenticated
  using (public.current_role() = 'consultant');
drop policy if exists "leads_consultant_maj" on public.leads;
create policy "leads_consultant_maj" on public.leads for update to authenticated
  using (public.current_role() = 'consultant') with check (public.current_role() = 'consultant');
grant select, update on public.leads to authenticated;

-- Les devis ---------------------------------------------------------------------------------------
alter table public.compteurs_factures drop constraint if exists compteurs_factures_serie_check;
alter table public.compteurs_factures add constraint compteurs_factures_serie_check check (serie in ('F', 'AV', 'D'));

create table if not exists public.devis (
  id                 uuid primary key default gen_random_uuid(),
  numero             text unique,
  org_id             uuid not null references public.organizations (id) on delete cascade,
  lead_id            uuid references public.leads (id) on delete set null,
  mission_id         uuid references public.missions (id) on delete set null,
  cree_le            date not null default current_date,
  valable_jusquau    date not null,
  statut             text not null default 'brouillon' check (statut in ('brouillon', 'envoye', 'accepte', 'refuse')),
  envoye_le          date,
  accepte_le         date,
  -- chiffrage (grille des tarifs, modifiable)
  prestation         text not null,
  intitule           text not null,
  description        text,
  base_ht            numeric(10,2) not null default 0,
  effectif           int,
  sites              int,
  urgence            boolean not null default false,
  jours_comp         numeric(4,1) not null default 0,
  frais_ht           numeric(10,2) not null default 0,
  ajustement_ht      numeric(10,2) not null default 0,
  ajustement_libelle text,
  lignes             jsonb not null default '[]',
  total_ht           numeric(10,2) not null default 0,
  taux_tva           numeric(4,2) not null default 20,
  total_ttc          numeric(10,2) not null default 0,
  -- conditions reprises au contrat
  acompte_pct        int not null default 50 check (acompte_pct between 0 and 100),
  calendrier         text,
  livrables          text[] not null default '{}',
  controle_organisme text,
  controle_echeance  date,
  maj_le             timestamptz not null default now()
);
create index if not exists devis_org on public.devis (org_id);

create or replace function public.numeroter_devis() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  a int := extract(year from new.cree_le)::int;
  n int;
begin
  insert into public.compteurs_factures (serie, annee, dernier) values ('D', a, 1)
  on conflict (serie, annee) do update set dernier = compteurs_factures.dernier + 1
  returning dernier into n;
  new.numero := 'D' || a || '-' || lpad(n::text, 4, '0');
  return new;
end $$;
drop trigger if exists devis_numero on public.devis;
create trigger devis_numero before insert on public.devis
  for each row execute function public.numeroter_devis();
revoke execute on function public.numeroter_devis() from public, anon, authenticated;

alter table public.devis enable row level security;
drop policy if exists "devis_consultant" on public.devis;
create policy "devis_consultant" on public.devis for all to authenticated
  using (public.current_role() = 'consultant') with check (public.current_role() = 'consultant');
revoke all on public.devis from anon;
grant select, insert, update, delete on public.devis to authenticated;

-- Le contrat garde la trace du devis dont il vient -------------------------------------------------
alter table public.contrats add column if not exists devis_id uuid references public.devis (id) on delete set null;
