-- 0023 — trois chiffres et un maillon que j'avais inventés ou oubliés.
--
-- 1. L'ESCALADE. Le Manuel de terrain énumère six éléments de constat :
--    Fait, Preuve, Risque, Référence, Action, ESCALADE — « avocat, expert-comptable ou
--    autre spécialiste lorsque le sujet dépasse votre périmètre ». Chaque fiche de la
--    Bible et du Manuel porte une section « Quand escalader ». Le modèle 07 §9 demande
--    « les éventuels sujets à faire valider par avocat / expert-comptable ». Le corrigé
--    du cas 01 en fait un tableau entier.
--    Dans le portail, « avocat » et « expert-comptable » n'apparaissaient que sur la
--    vitrine. Aucun constat ne pouvait porter cette décision — alors que c'est la
--    frontière de responsabilité de la consultante, et le cœur du positionnement :
--    « je ne remplace ni l'avocat ni l'expert-comptable ».

create type public.escalade as enum (
  'aucune',
  'avocat_social',
  'avocat_fiscaliste',
  'avocat_securite_privee',
  'expert_comptable',
  'preventeur_sst',
  'autre'
);

alter table public.findings
  add column if not exists escalation public.escalade,
  add column if not exists escalation_note text;

comment on column public.findings.escalation is
  'Sixième élément de la chaîne (Manuel de terrain) : le spécialiste à saisir quand le sujet dépasse le périmètre du consultant. NULL = décision non prise.';
