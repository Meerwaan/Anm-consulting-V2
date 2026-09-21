-- 0035 — une nature d'action pour la DGFiP : facturation (complaisance, facture fictive, TVA).
-- Les natures de la grille 02 §11 ne couvraient pas le volet fiscal de l'objectif de l'audit.
alter table public.non_conformites drop constraint if exists non_conformites_nature_check;
alter table public.non_conformites add constraint non_conformites_nature_check check (nature in (
  'travail_dissimule', 'pret_illicite', 'marchandage', 'defaut_vigilance',
  'sous_traitance_irreguliere', 'cnaps', 'facturation', 'autre'));
