-- 0025 — le questionnaire d'entretien du dirigeant.
--
-- La procédure §4 donne un questionnaire de 15 questions, en trois colonnes :
-- thème, question, « notes / preuve à demander ». Il n'existait nulle part dans le
-- portail : l'étape 01 ne demandait que six champs administratifs (contrôle en cours,
-- organisme, échéance, date d'intervention, points sensibles, date de restitution).
--
-- Le pack fait pourtant de cet entretien le pivot de la mission. « Quel document fait foi
-- pour les heures réellement travaillées ? » décide de ce qu'on croisera à l'étape 10 ;
-- « existe-t-il de la sous-traitance de second rang ? » décide de l'échantillon de
-- l'étape 05. Sans ces réponses dans l'outil, la consultante menait l'entretien de
-- mémoire ou sur papier, et rien n'en revenait.
--
-- Deux agents d'audit indépendants, sur deux dimensions différentes, ont trouvé ce même
-- manque — c'est la convergence qui l'a rendu indiscutable.

create table if not exists public.mission_entretien_reponses (
  mission_id uuid not null references public.missions(id) on delete cascade,
  question_code text not null,
  reponse text,
  preuve text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  primary key (mission_id, question_code)
);

comment on table public.mission_entretien_reponses is
  'Réponses au questionnaire d''entretien du dirigeant (06 §4, 15 questions). Le code de question vient de QUESTIONNAIRE_DIRIGEANT dans src/content/methode.ts : stable, jamais renuméroté.';

alter table public.mission_entretien_reponses enable row level security;

create policy "entretien_write" on public.mission_entretien_reponses
  for all to authenticated using (public.current_role() = 'consultant')
  with check (public.current_role() = 'consultant');

revoke all on public.mission_entretien_reponses from anon;
grant select, insert, update, delete on public.mission_entretien_reponses to authenticated;

create index if not exists mission_entretien_reponses_mission_idx
  on public.mission_entretien_reponses (mission_id);
