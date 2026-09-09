-- Le rapport final est un dossier complet : il contient TOUS les constats.
-- Le drapeau in_report supposait qu'on choisisse ce qui y entre — mauvaise idée : un
-- constat écarté du dossier serait un constat que le dirigeant ne verra jamais, alors
-- qu'il a été relevé. On garde la colonne (elle sert au filtrage d'affichage) mais elle
-- vaut vrai par défaut et pour tout l'existant.
alter table public.findings alter column in_report set default true;
update public.findings set in_report = true where in_report = false;
comment on column public.findings.in_report is
  'Toujours vrai : le rapport contient tous les constats. Conservé pour un éventuel besoin d''exclusion documenté.';
comment on column public.findings.report_rank is
  'Position parmi les constats mis en avant dans la synthèse dirigeant (modèle 07). N''exclut rien : tout figure au rapport.';
