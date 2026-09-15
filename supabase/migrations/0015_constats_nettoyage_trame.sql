-- Correctif de données, appliqué le 08/09/2026.
--
-- 1. Le champ `fact` était pré-rempli avec une trame à trous
--    (« Sur l'échantillon examiné, [fait précis à compléter]… »). À l'écran, le champ
--    paraissait plein alors que le contrôle de complétude le comptait vide : la
--    consultante lisait « manque : le fait » devant un encadré rempli. La trame est
--    retirée ; ce que dit le référentiel s'affiche désormais SOUS le champ.
update public.findings set fact = '' where fact like '%[fait précis%';

-- 2. Le verrou de publication ne vérifiait que la référence : un constat a été publié
--    au client avec la trame à trous dedans. Publication réservée aux constats complets,
--    et retirée à ceux qui ne le sont pas.
update public.findings set visible_to_client = false
where visible_to_client
  and (coalesce(btrim(fact), '') = '' or coalesce(btrim(evidence), '') = ''
       or coalesce(btrim(reference), '') = '' or reference_checked <> 'oui'
       or coalesce(btrim(recommendation), '') = '');
