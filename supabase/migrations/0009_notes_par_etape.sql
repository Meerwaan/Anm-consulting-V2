-- Les notes de travail se rattachent désormais à une étape de la méthode :
-- l'écran est organisé par étape (décision 03), une note prise pendant le
-- contrôle CNAPS doit se retrouver là, pas dans une liste globale.
-- module_id et control_point_id restent utilisables pour une note ciblée.
alter table public.mission_notes
  add column step_id int references public.method_steps (id);
create index on public.mission_notes (mission_id, step_id);
