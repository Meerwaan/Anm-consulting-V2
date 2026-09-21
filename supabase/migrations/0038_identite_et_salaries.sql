-- 0038 — identité des agents et suivi des salariés du donneur d'ordre (Sofia, 21/09/2026).
-- Une seule liste de personnes (st_agents) : les agents d'un sous-traitant, et ceux de
-- l'entreprise auditée, vus à la fois par le module CNAPS (cartes, Dracar) et par le module
-- URSSAF (embauche, registre, titre de travail, médecine du travail).

alter table public.st_agents
  -- Pièce d'identité ou titre de séjour, sa fin de validité, l'autorisation de travail.
  add column if not exists piece_identite       text check (piece_identite is null or piece_identite in ('cni', 'passeport', 'titre_sejour', 'autre')),
  add column if not exists piece_fin            date,
  add column if not exists autorisation_travail public.check_result,
  add column if not exists titre_authentifie    public.check_result,
  -- Salariés de l'entreprise auditée (module URSSAF).
  add column if not exists type_contrat         text check (type_contrat is null or type_contrat in ('cdi', 'cdd', 'cdi_tp', 'cdd_tp', 'apprenti', 'autre')),
  add column if not exists date_entree          date,
  add column if not exists date_sortie          date,
  add column if not exists date_dpae            date,
  add column if not exists contrat_signe        public.check_result,
  add column if not exists registre             public.check_result,
  add column if not exists visite_medicale      date,
  add column if not exists visite_prochaine     date;

-- Une nature d'action pour l'emploi d'un étranger sans titre l'autorisant à travailler.
alter table public.non_conformites drop constraint if exists non_conformites_nature_check;
alter table public.non_conformites add constraint non_conformites_nature_check check (nature in (
  'travail_dissimule', 'dissimulation_activite', 'emploi_etranger', 'pret_illicite', 'marchandage', 'defaut_vigilance',
  'sous_traitance_irreguliere', 'cnaps', 'facturation', 'autre'));
