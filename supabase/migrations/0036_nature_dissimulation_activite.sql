-- 0036 — une nature d'action pour le module URSSAF : la dissimulation d'activité, distincte du
-- travail dissimulé par dissimulation d'emploi salarié (dictée de Sofia du 21/09/2026).
alter table public.non_conformites drop constraint if exists non_conformites_nature_check;
alter table public.non_conformites add constraint non_conformites_nature_check check (nature in (
  'travail_dissimule', 'dissimulation_activite', 'pret_illicite', 'marchandage', 'defaut_vigilance',
  'sous_traitance_irreguliere', 'cnaps', 'facturation', 'autre'));
