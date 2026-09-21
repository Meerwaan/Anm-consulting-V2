-- 0032 — le module sous-traitance, cœur de l'outil (refonte du 21/09/2026).
--
-- Source : les grilles de Sofia (docs/grilles-sofia/, 00 à 05). Principe dicté par elle :
-- on raisonne en HEURES, pas en euros. Les euros ne servent qu'au fléchage DGFiP
-- facture du sous-traitant ↔ paiement.
--
--   A = heures vendues par le donneur d'ordre (bons de commande, factures clients)
--   B = heures figurant sur ses bulletins de paie
--   A − B = volume de sous-traitance hypothétique, à expliquer — jamais une qualification.
--
-- Chaque sous-traitant a son dossier : attestations de vigilance (effectif en équivalent
-- temps plein, converti en heures), factures, paiements, cascade.
-- Les calculs sont faits dans l'application (src/lib/sous-traitance/calculs.ts), pas ici :
-- la base garde les saisies, rien de dérivé qui pourrait se désynchroniser.

-- Paramètres de la mission ------------------------------------------------------------
create table if not exists public.st_parametres (
  mission_id             uuid primary key references public.missions(id) on delete cascade,
  periode_debut          date,
  periode_fin            date,
  -- € HT par heure : convertit une facture client qui ne porte qu'un montant.
  taux_horaire_vendu     numeric(10,2) check (taux_horaire_vendu is null or taux_horaire_vendu > 0),
  -- Durée mensuelle d'un temps plein : 35 h × 52 / 12. Modifiable si l'accord de branche
  -- ou l'entreprise retient une autre base.
  heures_mensuelles_etp  numeric(8,2) not null default 151.67 check (heures_mensuelles_etp > 0),
  updated_at             timestamptz not null default now(),
  updated_by             uuid references auth.users(id) on delete set null,
  constraint st_parametres_periode check (periode_fin is null or periode_debut is null or periode_fin >= periode_debut)
);

-- SMIC horaire brut, daté. Saisi et vérifié par la consultante : il change chaque année,
-- parfois en cours d'année. Jamais écrit en dur dans le code.
create table if not exists public.smic_horaire (
  valable_du  date primary key,
  taux_brut   numeric(8,4) not null check (taux_brut > 0),
  source      text,
  saisi_le    timestamptz not null default now(),
  saisi_par   uuid references auth.users(id) on delete set null
);

-- A : heures vendues ----------------------------------------------------------------------
create table if not exists public.st_ventes (
  id                  uuid primary key default gen_random_uuid(),
  mission_id          uuid not null references public.missions(id) on delete cascade,
  mois                date not null check (extract(day from mois) = 1),
  client              text,
  bon_commande        text,
  heures_commandees   numeric(12,2) check (heures_commandees is null or heures_commandees >= 0),
  heures_facturees    numeric(12,2) check (heures_facturees is null or heures_facturees >= 0),
  montant_ht          numeric(14,2),
  note                text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  updated_by          uuid references auth.users(id) on delete set null
);
create index if not exists st_ventes_mission_idx on public.st_ventes (mission_id, mois);

-- B : heures payées (bulletins de paie du donneur d'ordre), une ligne par mois --------------
create table if not exists public.st_paie (
  mission_id     uuid not null references public.missions(id) on delete cascade,
  mois           date not null check (extract(day from mois) = 1),
  effectif       numeric(8,2) check (effectif is null or effectif >= 0),
  heures_payees  numeric(12,2) check (heures_payees is null or heures_payees >= 0),
  note           text,
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users(id) on delete set null,
  primary key (mission_id, mois)
);

-- Sous-traitants ------------------------------------------------------------------------
create table if not exists public.st_sous_traitants (
  id                   uuid primary key default gen_random_uuid(),
  mission_id           uuid not null references public.missions(id) on delete cascade,
  raison_sociale       text not null,
  siren                text,
  adresse              text,
  dirigeant            text,
  activite             text,
  debut_relation       date,
  contrat_ref          text,
  montant_contrat_ht   numeric(14,2),
  -- Cascade : un sous-traitant de rang 2 est employé par un sous-traitant de rang 1.
  rang                 smallint not null default 1 check (rang in (1, 2)),
  donneur_id           uuid references public.st_sous_traitants(id) on delete set null,
  note                 text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint st_sous_traitants_cascade check ((rang = 1 and donneur_id is null) or rang = 2)
);
create index if not exists st_sous_traitants_mission_idx on public.st_sous_traitants (mission_id);

-- Attestations de vigilance URSSAF ------------------------------------------------------
create table if not exists public.st_attestations (
  id                uuid primary key default gen_random_uuid(),
  mission_id        uuid not null references public.missions(id) on delete cascade,
  sous_traitant_id  uuid not null references public.st_sous_traitants(id) on delete cascade,
  date_delivrance   date,
  -- Mois des déclarations auxquelles se rapportent l'effectif et les rémunérations.
  mois_reference    date check (mois_reference is null or extract(day from mois_reference) = 1),
  effectif_etp      numeric(8,2) check (effectif_etp is null or effectif_etp >= 0),
  remunerations     numeric(14,2) check (remunerations is null or remunerations >= 0),
  siren_conforme    public.check_result,
  authentifiee      public.check_result,
  note              text,
  created_at        timestamptz not null default now()
);
create index if not exists st_attestations_st_idx on public.st_attestations (sous_traitant_id, date_delivrance);

-- Factures du sous-traitant ---------------------------------------------------------------
create table if not exists public.st_factures (
  id                uuid primary key default gen_random_uuid(),
  mission_id        uuid not null references public.missions(id) on delete cascade,
  sous_traitant_id  uuid not null references public.st_sous_traitants(id) on delete cascade,
  numero            text,
  date_facture      date,
  mois              date check (mois is null or extract(day from mois) = 1),
  heures            numeric(12,2) check (heures is null or heures >= 0),
  montant_ht        numeric(14,2),
  montant_ttc       numeric(14,2),
  note              text,
  created_at        timestamptz not null default now()
);
create index if not exists st_factures_st_idx on public.st_factures (sous_traitant_id, mois);

-- Paiements au sous-traitant (fléchage DGFiP) ----------------------------------------------
create table if not exists public.st_paiements (
  id                uuid primary key default gen_random_uuid(),
  mission_id        uuid not null references public.missions(id) on delete cascade,
  sous_traitant_id  uuid not null references public.st_sous_traitants(id) on delete cascade,
  facture_id        uuid references public.st_factures(id) on delete set null,
  date_paiement     date,
  montant           numeric(14,2),
  reference         text,
  -- Le compte crédité est-il au nom du sous-traitant ?
  compte_au_nom     public.check_result,
  note              text,
  created_at        timestamptz not null default now()
);
create index if not exists st_paiements_st_idx on public.st_paiements (sous_traitant_id);

-- Réponses aux grilles de Sofia (cases oui / non / sans objet / à vérifier) ------------------
-- `cible` = 'mission' pour une question sur le donneur d'ordre, ou l'identifiant d'un
-- sous-traitant pour une question sur lui. Texte plutôt qu'une clé nullable : l'unicité
-- (et donc l'enregistrement « au fil de l'eau ») reste simple.
create table if not exists public.grille_reponses (
  mission_id   uuid not null references public.missions(id) on delete cascade,
  grille       text not null,
  cible        text not null default 'mission',
  item         text not null,
  reponse      public.check_result,
  observation  text,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users(id) on delete set null,
  primary key (mission_id, grille, cible, item)
);

create table if not exists public.grille_conclusions (
  mission_id   uuid not null references public.missions(id) on delete cascade,
  grille       text not null,
  cible        text not null default 'mission',
  choix        text,
  synthese     text,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users(id) on delete set null,
  primary key (mission_id, grille, cible)
);

-- Droits : consultant uniquement, comme le reste du portail -------------------------------
do $$
declare t text;
begin
  foreach t in array array['st_parametres','st_ventes','st_paie','st_sous_traitants','st_attestations',
                           'st_factures','st_paiements','grille_reponses','grille_conclusions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s_consultant" on public.%I', t, t);
    execute format('create policy "%s_consultant" on public.%I for all to authenticated
                    using (public.current_role() = ''consultant'')
                    with check (public.current_role() = ''consultant'')', t, t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

alter table public.smic_horaire enable row level security;
drop policy if exists "smic_lecture" on public.smic_horaire;
create policy "smic_lecture" on public.smic_horaire for select to authenticated using (true);
drop policy if exists "smic_ecriture" on public.smic_horaire;
create policy "smic_ecriture" on public.smic_horaire for all to authenticated
  using (public.current_role() = 'consultant') with check (public.current_role() = 'consultant');
revoke all on public.smic_horaire from anon;
grant select, insert, update, delete on public.smic_horaire to authenticated;
