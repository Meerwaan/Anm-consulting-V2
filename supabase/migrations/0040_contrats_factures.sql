-- 0040 — Contrats et factures (demande de Sofia du 24/09/2026) : tout ce qui peut se remplir tout
-- seul se remplit tout seul. Le cabinet est saisi une fois, le client est complété depuis son SIREN
-- (annuaire des entreprises de l'État), le prix vient de la grille tarifaire.
--
-- Factures : numérotation continue par série et par année (F2026-0001, AV2026-0001), attribuée par
-- la base au moment de l'émission ; une facture émise ne se modifie plus et ne se supprime pas
-- (seuls son paiement et son archive PDF se renseignent) : une erreur se corrige par un avoir.

-- Le cabinet : une seule ligne ------------------------------------------------------------------
create table if not exists public.cabinet (
  id                   boolean primary key default true check (id),
  raison_sociale       text not null default 'ANM Consulting',
  forme_juridique      text not null default 'EURL',
  capital              numeric(12,2) default 10000,
  adresse              text default '17 rue Diderot',
  code_postal          text default '92310',
  ville                text default 'Sèvres',
  siren                text check (siren is null or siren ~ '^\d{9}$'),
  rcs_ville            text default 'Nanterre',             -- Sèvres relève du greffe de Nanterre
  franchise_tva        boolean not null default false,      -- true : « TVA non applicable, art. 293 B du CGI »
  representant         text default 'Sofia Aoun',
  fonction             text default 'Gérante',
  email                text,
  telephone            text,
  iban                 text,
  bic                  text,
  delai_paiement_jours int not null default 30 check (delai_paiement_jours between 0 and 60),
  acompte_pct          int not null default 50 check (acompte_pct between 0 and 100),
  updated_at           timestamptz not null default now()
);
insert into public.cabinet (id) values (true) on conflict do nothing;

-- Le client : ce qu'il faut pour un contrat et une facture ------------------------------------
alter table public.organizations
  add column if not exists forme_juridique       text,
  add column if not exists adresse               text,
  add column if not exists code_postal           text,
  add column if not exists ville                 text,
  add column if not exists representant          text,
  add column if not exists representant_fonction text,
  add column if not exists annuaire_le           timestamptz;  -- dernière lecture de l'annuaire des entreprises

-- Le contrat : un par mission, modifiable jusqu'à sa signature --------------------------------
create table if not exists public.contrats (
  id              uuid primary key default gen_random_uuid(),
  mission_id      uuid not null unique references public.missions (id) on delete cascade,
  cree_le         timestamptz not null default now(),
  maj_le          timestamptz not null default now(),
  prestation      text not null,                 -- id de l'offre (flash, social_urssaf…)
  intitule        text not null,
  description     text,
  montant_ht      numeric(10,2) check (montant_ht is null or montant_ht >= 0),
  frais_ht        numeric(10,2) not null default 0 check (frais_ht >= 0),
  acompte_pct     int not null default 50 check (acompte_pct between 0 and 100),
  calendrier      text,
  livrables       text[] not null default '{}',
  lieu_signature  text,
  date_contrat    date not null default current_date,
  signe_le        date,                          -- non nul : le contrat est figé
  archive_path    text                           -- PDF archivé à la signature (bucket pieces)
);

-- Les factures -----------------------------------------------------------------------------------
create table if not exists public.compteurs_factures (
  serie   text not null check (serie in ('F', 'AV')),
  annee   int  not null,
  dernier int  not null default 0,
  primary key (serie, annee)
);

create table if not exists public.factures (
  id              uuid primary key default gen_random_uuid(),
  mission_id      uuid not null references public.missions (id) on delete restrict,
  numero          text unique,
  nature          text not null check (nature in ('acompte', 'solde', 'totale', 'avoir')),
  emise_le        date not null default current_date,
  echeance_le     date not null,
  lignes          jsonb not null,                -- [{ designation, detail?, quantite, prix_unitaire_ht }]
  total_ht        numeric(10,2) not null,
  taux_tva        numeric(4,2) not null,         -- 0 en franchise
  total_tva       numeric(10,2) not null,
  total_ttc       numeric(10,2) not null,
  acomptes        jsonb not null default '[]',   -- solde : [{ numero, emise_le, total_ht, total_ttc }] déduits
  net_a_payer     numeric(10,2) not null,
  facture_origine uuid references public.factures (id),  -- avoir : la facture annulée
  vendeur         jsonb not null,                -- le cabinet tel qu'il était à l'émission
  client          jsonb not null,                -- le client tel qu'il était à l'émission
  contrat_du      date,
  cree_le         timestamptz not null default now(),
  payee_le        date,
  archive_path    text
);
create index if not exists factures_mission on public.factures (mission_id);

create or replace function public.numeroter_facture() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  s text := case when new.nature = 'avoir' then 'AV' else 'F' end;
  a int  := extract(year from new.emise_le)::int;
  n int;
begin
  insert into public.compteurs_factures (serie, annee, dernier) values (s, a, 1)
  on conflict (serie, annee) do update set dernier = compteurs_factures.dernier + 1
  returning dernier into n;
  new.numero := s || a || '-' || lpad(n::text, 4, '0');
  return new;
end $$;

create or replace function public.figer_facture() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Une facture émise ne se supprime pas : émettre un avoir.';
  end if;
  if (to_jsonb(new) - 'payee_le' - 'archive_path') is distinct from (to_jsonb(old) - 'payee_le' - 'archive_path') then
    raise exception 'Une facture émise ne se modifie pas : émettre un avoir.';
  end if;
  return new;
end $$;

drop trigger if exists factures_numero on public.factures;
create trigger factures_numero before insert on public.factures
  for each row execute function public.numeroter_facture();
drop trigger if exists factures_figees on public.factures;
create trigger factures_figees before update or delete on public.factures
  for each row execute function public.figer_facture();

revoke execute on function public.numeroter_facture() from public, anon, authenticated;
revoke execute on function public.figer_facture() from public, anon, authenticated;

-- Droits : consultante uniquement ----------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['cabinet', 'contrats', 'factures', 'compteurs_factures'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s_consultant" on public.%I', t, t);
    execute format('create policy "%s_consultant" on public.%I for all to authenticated
                    using (public.current_role() = ''consultant'')
                    with check (public.current_role() = ''consultant'')', t, t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;
grant select, update on public.cabinet to authenticated;
grant select, insert, update, delete on public.contrats to authenticated;
grant select, insert, update on public.factures to authenticated;
-- Le compteur n'est écrit que par le déclencheur (security definer).
revoke all on public.compteurs_factures from authenticated;
