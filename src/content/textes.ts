/**
 * Les textes qui fondent chaque contrôle.
 *
 * Source unique : la table `legal_texts` de Supabase est générée depuis ce fichier
 * (`node scripts/gen_textes_sql.mjs`). Modifier ici, régénérer, appliquer.
 *
 * ⚠ Règle du pack : la numérotation des articles change. Ce référentiel dit QUEL texte
 * s'applique, jamais que tel article dit telle chose. Toute référence citée dans un
 * constat publié doit être revérifiée et datée avant publication.
 * Vérifié sur Légifrance le 8 septembre 2026.
 */

export type CodeTexte =
  | "CSI_L6" | "CSI_DEONTO" | "CNAPS_REF" | "CNAPS_DRACAR"
  | "CT" | "CT_DUERP" | "CT_DISSIM" | "CT_VIGILANCE" | "CCN_1351"
  | "CSS" | "CSS_CONTROLE" | "BOSS"
  | "LPF_GARANTIES" | "LPF_FEC" | "CGI" | "BOFIP"
  | "C_COM" | "RGPD";

export interface Texte {
  code: CodeTexte;
  nom: string;
  autorite: string;
  portee: string;
  url: string;
  usage: string;
}

export const VERIFIE_LE = "2026-09-08";

export const TEXTES: Texte[] = [
  {
    code: "CSI_L6",
    nom: "Code de la sécurité intérieure — Livre VI, Activités privées de sécurité",
    autorite: "Légifrance",
    portee: "Art. L611-1 à L648-1",
    url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000025503132/LEGISCTA000025506179/",
    usage:
      "Autorisation d'exercice, agrément des dirigeants, carte professionnelle, conditions d'exercice, sous-traitance en sécurité privée, contrôle du CNAPS.",
  },
  {
    code: "CSI_DEONTO",
    nom: "Code de déontologie des activités privées de sécurité",
    autorite: "Légifrance (CSI)",
    portee: "Art. R631-1 à R631-33",
    url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000025503132/LEGISCTA000029656360/",
    usage:
      "Devoirs communs, dignité, loyauté, port de la tenue et de la carte, relations avec les clients et les forces de l'ordre. Base disciplinaire des sanctions CNAPS.",
  },
  {
    code: "CNAPS_REF",
    nom: "CNAPS — Référentiels de contrôle",
    autorite: "CNAPS",
    portee: "Fiches thématiques",
    url: "https://www.cnaps.interieur.gouv.fr/Publications/Fiches-thematiques/Referentiels-de-controle-a-destination-des-professionnels-de-la-securite-privee",
    usage:
      "Bonnes pratiques attendues par le contrôleur : surveillance/gardiennage, cynophile, manifestations, sous-traitance, travail illégal.",
  },
  {
    code: "CNAPS_DRACAR",
    nom: "Décret du 26/12/2025 — obligations Dracar Ultimate",
    autorite: "CNAPS",
    portee: "Décret + fiche CNAPS",
    url: "https://cnaps.interieur.gouv.fr/Publications/Fiches-thematiques/Parution-du-decret-du-26-12-2025-les-nouvelles-obligations-liees-au-lancement-de-Dracar-Ultimate",
    usage: "Déclaration des agents et des missions dans Dracar Ultimate, échéances 2026.",
  },
  {
    code: "CT",
    nom: "Code du travail",
    autorite: "Légifrance",
    portee: "Parties législative et réglementaire",
    url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072050/",
    usage:
      "Contrat de travail, durée du travail, repos, rémunération, représentation du personnel, santé et sécurité.",
  },
  {
    code: "CT_DUERP",
    nom: "Code du travail — Document unique d'évaluation des risques",
    autorite: "Légifrance",
    portee: "Art. L4121-3 et R4121-1 à R4121-4",
    url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000023794014/",
    usage:
      "Obligation d'évaluer les risques, de les transcrire dans le DUERP et de le mettre à jour. Premier document réclamé en visite d'inspection.",
  },
  {
    code: "CT_DISSIM",
    nom: "Code du travail — Travail dissimulé",
    autorite: "Légifrance",
    portee: "Art. L8221-1 à L8224-6",
    url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006160848/",
    usage:
      "Dissimulation d'activité et d'emploi salarié, heures non déclarées, sanctions. Terrain commun à l'URSSAF, au CNAPS et à l'inspection.",
  },
  {
    code: "CT_VIGILANCE",
    nom: "Code du travail — Obligations et solidarité financière des donneurs d'ordre",
    autorite: "Légifrance",
    portee: "Art. L8222-1 à L8222-7",
    url: "https://www.legifrance.gouv.fr/codes/id/LEGIARTI000006904823/2010-12-21/",
    usage:
      "Vérifications à la conclusion et tous les six mois, attestation de vigilance, solidarité financière en cas de travail dissimulé du sous-traitant.",
  },
  {
    code: "CCN_1351",
    nom: "Convention collective Prévention et sécurité (IDCC 1351)",
    autorite: "Légifrance",
    portee: "Convention et avenants",
    url: "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000005635405",
    usage:
      "Classification, minima, durée et organisation du travail, primes, paniers, habillage. Prime sur le Code du travail quand elle est plus favorable.",
  },
  {
    code: "CSS",
    nom: "Code de la sécurité sociale",
    autorite: "Légifrance",
    portee: "Parties législative et réglementaire",
    url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006073189/",
    usage:
      "Assiette des cotisations, avantages en nature, frais professionnels, exonérations, accidents du travail.",
  },
  {
    code: "CSS_CONTROLE",
    nom: "Code de la sécurité sociale — Procédure de contrôle URSSAF",
    autorite: "Légifrance",
    portee: "Art. R243-59 à R243-60-1",
    url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006073189/LEGISCTA000006173356/",
    usage:
      "Avis de contrôle, déroulement, lettre d'observations, délai de réponse, droits du cotisant. Charte du cotisant contrôlé opposable.",
  },
  {
    code: "BOSS",
    nom: "BOSS — Bulletin officiel de la Sécurité sociale",
    autorite: "Sécurité sociale",
    portee: "Doctrine opposable",
    url: "https://boss.gouv.fr/portail/accueil.html",
    usage:
      "Doctrine sur l'assiette, les frais professionnels, les avantages et les exonérations. Opposable à l'URSSAF.",
  },
  {
    code: "LPF_GARANTIES",
    nom: "Livre des procédures fiscales — Garanties du contribuable vérifié",
    autorite: "Légifrance",
    portee: "Art. L47 à L52 B",
    url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069583/LEGISCTA000006180032/",
    usage:
      "Avis de vérification, assistance d'un conseil, durée de la vérification sur place, débat oral et contradictoire.",
  },
  {
    code: "LPF_FEC",
    nom: "Livre des procédures fiscales — Fichier des écritures comptables",
    autorite: "Légifrance",
    portee: "Art. L47 A et A47 A-1",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037526053",
    usage:
      "Remise du FEC au format normé dès le début du contrôle. Le premier point de blocage d'une vérification de comptabilité.",
  },
  {
    code: "CGI",
    nom: "Code général des impôts",
    autorite: "Légifrance",
    portee: "Parties législative et annexes",
    url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069577/",
    usage:
      "TVA collectée et déductible, mentions obligatoires des factures, charges déductibles, frais du dirigeant.",
  },
  {
    code: "BOFIP",
    nom: "BOFiP — Bulletin officiel des finances publiques",
    autorite: "DGFiP",
    portee: "Doctrine opposable",
    url: "https://bofip.impots.gouv.fr/",
    usage:
      "Doctrine administrative sur le contrôle, la TVA et les charges. Opposable à l'administration.",
  },
  {
    code: "C_COM",
    nom: "Code de commerce",
    autorite: "Légifrance",
    portee: "Parties législative et réglementaire",
    url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000005634379/",
    usage:
      "Immatriculation et RNE, obligations comptables, facturation entre professionnels, délais de paiement, contrats commerciaux.",
  },
  {
    code: "RGPD",
    nom: "RGPD et loi Informatique et Libertés",
    autorite: "CNIL / Légifrance",
    portee: "Règlement (UE) 2016/679 et loi 78-17",
    url: "https://www.cnil.fr/fr/reglement-europeen-protection-donnees",
    usage:
      "Données des agents et des clients, vidéoprotection, géolocalisation, durées de conservation, sous-traitance de données (art. 28).",
  },
];

export type DomaineAudit =
  | "gouvernance" | "cnaps" | "social" | "paie" | "temps" | "urssaf"
  | "inspection_sst" | "sous_traitance" | "operationnel" | "fiscal";

/** Quels textes fondent quel domaine de contrôle. `principal` = cité par défaut dans un constat. */
export const TEXTES_PAR_DOMAINE: Record<DomaineAudit, { principal: CodeTexte[]; complementaire: CodeTexte[] }> = {
  cnaps:          { principal: ["CSI_L6", "CSI_DEONTO", "CNAPS_REF"], complementaire: ["CNAPS_DRACAR", "CT_DISSIM"] },
  social:         { principal: ["CT", "CCN_1351"],                    complementaire: ["CSS"] },
  paie:           { principal: ["CT", "CCN_1351", "CSS", "BOSS"],     complementaire: [] },
  temps:          { principal: ["CT", "CCN_1351"],                    complementaire: ["CT_DISSIM"] },
  urssaf:         { principal: ["CSS", "CSS_CONTROLE", "BOSS", "CT_DISSIM"], complementaire: ["CT"] },
  inspection_sst: { principal: ["CT", "CT_DUERP"],                    complementaire: ["CSS"] },
  sous_traitance: { principal: ["CT_VIGILANCE", "CT_DISSIM", "CSI_L6"], complementaire: ["C_COM"] },
  fiscal:         { principal: ["LPF_GARANTIES", "LPF_FEC", "CGI", "BOFIP"], complementaire: ["C_COM"] },
  gouvernance:    { principal: ["CSI_L6", "C_COM"],                   complementaire: ["RGPD"] },
  operationnel:   { principal: ["RGPD"],                              complementaire: ["CSI_L6", "CT"] },
};

const parCode = new Map(TEXTES.map((t) => [t.code, t]));

/** Textes d'un domaine, principaux d'abord. */
export const textesDuDomaine = (domaine: DomaineAudit): { texte: Texte; role: "principal" | "complementaire" }[] => {
  const m = TEXTES_PAR_DOMAINE[domaine];
  if (!m) return [];
  return [
    ...m.principal.map((c) => ({ texte: parCode.get(c)!, role: "principal" as const })),
    ...m.complementaire.map((c) => ({ texte: parCode.get(c)!, role: "complementaire" as const })),
  ];
};

/** Textes couvrant plusieurs domaines, sans doublon — pour une étape qui en couvre plusieurs. */
export const textesDesDomaines = (domaines: string[]): { texte: Texte; role: "principal" | "complementaire" }[] => {
  const vus = new Map<CodeTexte, { texte: Texte; role: "principal" | "complementaire" }>();
  domaines.forEach((d) => {
    textesDuDomaine(d as DomaineAudit).forEach((e) => {
      const existant = vus.get(e.texte.code);
      if (!existant || (existant.role === "complementaire" && e.role === "principal")) vus.set(e.texte.code, e);
    });
  });
  return [...vus.values()].sort((a, b) => (a.role === b.role ? 0 : a.role === "principal" ? -1 : 1));
};
