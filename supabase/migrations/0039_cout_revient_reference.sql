-- 0039 — le coût de revient horaire de référence de la branche (Sofia, 21/09/2026) : un prix
-- de vente ou d'achat de l'heure en dessous de ce coût est à justifier (module DGFiP). La valeur
-- et sa source sont saisies par l'auditrice ; l'outil n'en invente aucune.
alter table public.st_parametres
  add column if not exists cout_revient_horaire numeric(10,2) check (cout_revient_horaire is null or cout_revient_horaire > 0),
  add column if not exists cout_revient_source  text;
