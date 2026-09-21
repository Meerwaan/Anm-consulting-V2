-- 0037 — l'échéancier de vigilance (demande de Sofia du 21/09/2026) : la date de conclusion du
-- contrat de sous-traitance est le point de départ ; une attestation est due à la conclusion puis
-- tous les 6 mois jusqu'à la fin du contrat.
alter table public.st_sous_traitants
  add column if not exists date_conclusion_contrat date,
  add column if not exists date_fin_contrat date;
