-- 0046 — Brouillon des textes du rapport (29/09/2026).
-- Jusqu'ici, un texte du rapport n'était écrit en base qu'au geste « Valider ce texte » /
-- « Enregistrer mon texte » : une proposition retouchée puis abandonnée (écran quitté sans toucher
-- le bouton) était perdue. L'écran enregistre désormais la frappe au fil de l'eau dans `brouillon`.
--
-- Le sens de `texte` ne change pas : non nul = texte relu et validé par la consultante, seul texte
-- repris dans le rapport. `brouillon` n'est jamais lu par le rapport ; il est vidé à la validation.
-- Colonne ajoutée, aucune ligne existante modifiée. Les droits (RLS « consultant ») sont ceux de
-- la table (0033).

alter table public.rapport_textes add column if not exists brouillon text;
