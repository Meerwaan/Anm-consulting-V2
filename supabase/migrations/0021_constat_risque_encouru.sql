-- 0021 — le maillon manquant de la règle d'or.
--
-- La règle d'or de la Bible consultant (§1) compte six maillons :
-- FAIT → PREUVE → RISQUE → RÉFÉRENCE VÉRIFIÉE → ACTION → DÉLAI.
-- La fiche de constat n'en portait que cinq : le risque encouru n'existait ni comme
-- champ ni comme colonne. Le sous-titre de l'étape 11 le promettait pourtant, et la
-- formule type (01, annexe 2) l'écrit mot pour mot.
--
-- Une criticité n'est pas un risque. « CRITIQUE » dit à la consultante dans quel ordre
-- traiter ; ça ne dit pas au dirigeant ce qu'il encourt. C'est précisément la phrase
-- qu'il retient et qui justifie la mission.

alter table public.findings add column if not exists risk text;

comment on column public.findings.risk is
  'Ce que la situation expose : requalification, redressement, sanction, retrait d''autorisation. Formulé sous réserve de confirmation de la règle applicable — le portail ne qualifie pas juridiquement (01 annexe 2).';
