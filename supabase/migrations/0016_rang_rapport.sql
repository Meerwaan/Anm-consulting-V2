-- Le rapport ne se décide pas au moment de le rédiger.
-- `in_report` existait déjà sans jamais servir ; il manquait le rang, c'est-à-dire
-- l'ordre des « 5 constats prioritaires » qui ouvrent la synthèse dirigeant (modèle 07).
-- L'étape 12 devient l'endroit où l'on choisit ce qui entre dans le rapport et dans quel ordre.
alter table public.findings
  add column report_rank int check (report_rank between 1 and 5);
comment on column public.findings.report_rank is
  'Position parmi les 5 constats prioritaires de la synthèse dirigeant. NULL = pas dans le top.';
create index on public.findings (mission_id, report_rank);
