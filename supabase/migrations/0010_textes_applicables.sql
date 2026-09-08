-- ---------------------------------------------------------------------------
-- 0010 — Les textes qui fondent chaque contrôle.
--
-- GÉNÉRÉ depuis src/content/textes.ts : ne pas éditer à la main.
--   node --experimental-strip-types scripts/gen_textes_sql.mjs
--
-- Ce référentiel dit QUEL texte s'applique à quel domaine de contrôle. Il ne dit
-- jamais ce qu'un article prescrit : la numérotation change, et la règle du pack
-- impose de revérifier et de dater toute référence avant publication au client.
-- ---------------------------------------------------------------------------

create table public.legal_texts (
  code        text primary key,
  nom         text not null,
  autorite    text not null,
  portee      text,
  url         text,
  usage       text not null,
  verifie_le  date not null default current_date
);
comment on table public.legal_texts is
  'Textes applicables. La numérotation des articles change : revérifier avant chaque publication (règle du pack).';

create type public.text_role as enum ('principal', 'complementaire');

create table public.domain_legal_texts (
  domain    public.audit_domain not null,
  text_code text not null references public.legal_texts (code) on delete cascade,
  role      public.text_role not null default 'principal',
  primary key (domain, text_code)
);

alter table public.legal_texts        enable row level security;
alter table public.domain_legal_texts enable row level security;
create policy "textes_read"  on public.legal_texts        for select to authenticated using (true);
create policy "textes_write" on public.legal_texts        for all    to authenticated using (public.current_role() = 'consultant');
create policy "dlt_read"     on public.domain_legal_texts for select to authenticated using (true);
create policy "dlt_write"    on public.domain_legal_texts for all    to authenticated using (public.current_role() = 'consultant');

insert into public.legal_texts (code, nom, autorite, portee, url, usage) values
('CSI_L6', 'Code de la sécurité intérieure — Livre VI, Activités privées de sécurité', 'Légifrance', 'Art. L611-1 à L648-1', 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000025503132/LEGISCTA000025506179/', 'Autorisation d''exercice, agrément des dirigeants, carte professionnelle, conditions d''exercice, sous-traitance en sécurité privée, contrôle du CNAPS.'),
('CSI_DEONTO', 'Code de déontologie des activités privées de sécurité', 'Légifrance (CSI)', 'Art. R631-1 à R631-33', 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000025503132/LEGISCTA000029656360/', 'Devoirs communs, dignité, loyauté, port de la tenue et de la carte, relations avec les clients et les forces de l''ordre. Base disciplinaire des sanctions CNAPS.'),
('CNAPS_REF', 'CNAPS — Référentiels de contrôle', 'CNAPS', 'Fiches thématiques', 'https://www.cnaps.interieur.gouv.fr/Publications/Fiches-thematiques/Referentiels-de-controle-a-destination-des-professionnels-de-la-securite-privee', 'Bonnes pratiques attendues par le contrôleur : surveillance/gardiennage, cynophile, manifestations, sous-traitance, travail illégal.'),
('CNAPS_DRACAR', 'Décret du 26/12/2025 — obligations Dracar Ultimate', 'CNAPS', 'Décret + fiche CNAPS', 'https://cnaps.interieur.gouv.fr/Publications/Fiches-thematiques/Parution-du-decret-du-26-12-2025-les-nouvelles-obligations-liees-au-lancement-de-Dracar-Ultimate', 'Déclaration des agents et des missions dans Dracar Ultimate, échéances 2026.'),
('CT', 'Code du travail', 'Légifrance', 'Parties législative et réglementaire', 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072050/', 'Contrat de travail, durée du travail, repos, rémunération, représentation du personnel, santé et sécurité.'),
('CT_DUERP', 'Code du travail — Document unique d''évaluation des risques', 'Légifrance', 'Art. L4121-3 et R4121-1 à R4121-4', 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000023794014/', 'Obligation d''évaluer les risques, de les transcrire dans le DUERP et de le mettre à jour. Premier document réclamé en visite d''inspection.'),
('CT_DISSIM', 'Code du travail — Travail dissimulé', 'Légifrance', 'Art. L8221-1 à L8224-6', 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006160848/', 'Dissimulation d''activité et d''emploi salarié, heures non déclarées, sanctions. Terrain commun à l''URSSAF, au CNAPS et à l''inspection.'),
('CT_VIGILANCE', 'Code du travail — Obligations et solidarité financière des donneurs d''ordre', 'Légifrance', 'Art. L8222-1 à L8222-7', 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000006904823/2010-12-21/', 'Vérifications à la conclusion et tous les six mois, attestation de vigilance, solidarité financière en cas de travail dissimulé du sous-traitant.'),
('CCN_1351', 'Convention collective Prévention et sécurité (IDCC 1351)', 'Légifrance', 'Convention et avenants', 'https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000005635405', 'Classification, minima, durée et organisation du travail, primes, paniers, habillage. Prime sur le Code du travail quand elle est plus favorable.'),
('CSS', 'Code de la sécurité sociale', 'Légifrance', 'Parties législative et réglementaire', 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006073189/', 'Assiette des cotisations, avantages en nature, frais professionnels, exonérations, accidents du travail.'),
('CSS_CONTROLE', 'Code de la sécurité sociale — Procédure de contrôle URSSAF', 'Légifrance', 'Art. R243-59 à R243-60-1', 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006073189/LEGISCTA000006173356/', 'Avis de contrôle, déroulement, lettre d''observations, délai de réponse, droits du cotisant. Charte du cotisant contrôlé opposable.'),
('BOSS', 'BOSS — Bulletin officiel de la Sécurité sociale', 'Sécurité sociale', 'Doctrine opposable', 'https://boss.gouv.fr/portail/accueil.html', 'Doctrine sur l''assiette, les frais professionnels, les avantages et les exonérations. Opposable à l''URSSAF.'),
('LPF_GARANTIES', 'Livre des procédures fiscales — Garanties du contribuable vérifié', 'Légifrance', 'Art. L47 à L52 B', 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069583/LEGISCTA000006180032/', 'Avis de vérification, assistance d''un conseil, durée de la vérification sur place, débat oral et contradictoire.'),
('LPF_FEC', 'Livre des procédures fiscales — Fichier des écritures comptables', 'Légifrance', 'Art. L47 A et A47 A-1', 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037526053', 'Remise du FEC au format normé dès le début du contrôle. Le premier point de blocage d''une vérification de comptabilité.'),
('CGI', 'Code général des impôts', 'Légifrance', 'Parties législative et annexes', 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069577/', 'TVA collectée et déductible, mentions obligatoires des factures, charges déductibles, frais du dirigeant.'),
('BOFIP', 'BOFiP — Bulletin officiel des finances publiques', 'DGFiP', 'Doctrine opposable', 'https://bofip.impots.gouv.fr/', 'Doctrine administrative sur le contrôle, la TVA et les charges. Opposable à l''administration.'),
('C_COM', 'Code de commerce', 'Légifrance', 'Parties législative et réglementaire', 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000005634379/', 'Immatriculation et RNE, obligations comptables, facturation entre professionnels, délais de paiement, contrats commerciaux.'),
('RGPD', 'RGPD et loi Informatique et Libertés', 'CNIL / Légifrance', 'Règlement (UE) 2016/679 et loi 78-17', 'https://www.cnil.fr/fr/reglement-europeen-protection-donnees', 'Données des agents et des clients, vidéoprotection, géolocalisation, durées de conservation, sous-traitance de données (art. 28).');

insert into public.domain_legal_texts (domain, text_code, role) values
('cnaps', 'CSI_L6', 'principal'),
('cnaps', 'CSI_DEONTO', 'principal'),
('cnaps', 'CNAPS_REF', 'principal'),
('cnaps', 'CNAPS_DRACAR', 'complementaire'),
('cnaps', 'CT_DISSIM', 'complementaire'),
('social', 'CT', 'principal'),
('social', 'CCN_1351', 'principal'),
('social', 'CSS', 'complementaire'),
('paie', 'CT', 'principal'),
('paie', 'CCN_1351', 'principal'),
('paie', 'CSS', 'principal'),
('paie', 'BOSS', 'principal'),
('temps', 'CT', 'principal'),
('temps', 'CCN_1351', 'principal'),
('temps', 'CT_DISSIM', 'complementaire'),
('urssaf', 'CSS', 'principal'),
('urssaf', 'CSS_CONTROLE', 'principal'),
('urssaf', 'BOSS', 'principal'),
('urssaf', 'CT_DISSIM', 'principal'),
('urssaf', 'CT', 'complementaire'),
('inspection_sst', 'CT', 'principal'),
('inspection_sst', 'CT_DUERP', 'principal'),
('inspection_sst', 'CSS', 'complementaire'),
('sous_traitance', 'CT_VIGILANCE', 'principal'),
('sous_traitance', 'CT_DISSIM', 'principal'),
('sous_traitance', 'CSI_L6', 'principal'),
('sous_traitance', 'C_COM', 'complementaire'),
('fiscal', 'LPF_GARANTIES', 'principal'),
('fiscal', 'LPF_FEC', 'principal'),
('fiscal', 'CGI', 'principal'),
('fiscal', 'BOFIP', 'principal'),
('fiscal', 'C_COM', 'complementaire'),
('gouvernance', 'CSI_L6', 'principal'),
('gouvernance', 'C_COM', 'principal'),
('gouvernance', 'RGPD', 'complementaire'),
('operationnel', 'RGPD', 'principal'),
('operationnel', 'CSI_L6', 'complementaire'),
('operationnel', 'CT', 'complementaire');

-- Le champ `reference` du pack mélange de vraies sources et des restes de colonnes
-- Excel (« Audit », « Interne », « Dossiers antérieurs »). On le qualifie sans rien effacer.
create type public.reference_kind as enum ('source', 'interne', 'a_qualifier');
alter table public.control_points add column reference_kind public.reference_kind;
update public.control_points set reference_kind = (case
  when reference is null or btrim(reference) = '' then 'a_qualifier'
  when reference in ('Interne','Audit','Audit croisé','Audit opérationnel','Dossiers antérieurs',
                     'Audit risque travail illégal','Interne/CNAPS','Interne/SST') then 'interne'
  else 'source' end)::public.reference_kind;
alter table public.control_points alter column reference_kind set not null;
comment on column public.control_points.reference_kind is
  'source = le pack cite une source ; interne = point de contrôle interne, sans texte opposable ; a_qualifier = rien dans le pack.';
