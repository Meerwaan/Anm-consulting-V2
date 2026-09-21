-- 0034 — la chaîne complète de Sofia (docs/grilles-sofia/00-objectif-audit.md).
--
-- Client → bon de commande → heures vendues → facture → TVA → règlement → salariés →
-- heures rémunérées → masse salariale → sous-traitance → factures → paiements →
-- attestations → Dracar Ultimate. Et chaque anomalie devient : constat → risque → action
-- corrective → justificatif → responsable → échéance → contrôle de régularisation.

-- Ventes : la facture client, sa TVA et son règlement (DGFiP).
alter table public.st_ventes
  add column if not exists numero_facture  text,
  add column if not exists tva             numeric(14,2),
  add column if not exists montant_ttc     numeric(14,2),
  add column if not exists montant_regle   numeric(14,2),
  add column if not exists date_reglement  date;

-- Paie : heures réalisées (planning, pointage) et masse salariale (URSSAF).
alter table public.st_paie
  add column if not exists heures_realisees numeric(12,2) check (heures_realisees is null or heures_realisees >= 0),
  add column if not exists masse_salariale  numeric(14,2) check (masse_salariale is null or masse_salariale >= 0);

-- Agents : suivi des cartes professionnelles et des affectations (CNAPS).
alter table public.st_agents
  add column if not exists carte_fin       date,
  add column if not exists affecte_mission public.check_result;

-- Actions correctives : la chaîne complète jusqu'au contrôle de régularisation.
alter table public.non_conformites
  add column if not exists risque               text,
  add column if not exists responsable          text,
  add column if not exists echeance             date,
  add column if not exists statut               text not null default 'a_faire'
                                                 check (statut in ('a_faire', 'en_cours', 'regularise')),
  add column if not exists date_regularisation  date,
  add column if not exists preuve_regularisation text;

comment on column public.non_conformites.statut is
  'Contrôle de régularisation : à faire, en cours, régularisé (avec date et preuve).';
