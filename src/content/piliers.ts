/**
 * Les 5 piliers d'intervention et le positionnement.
 * Sources : 00_SOMMAIRE.txt (positionnement V2), Fiche_Globale_1_Page.docx (4 piliers + fiscal),
 * 01_Bible_Consultant_V2 (blocs A→G), 02→05 (modules xlsx).
 */

export const POSITIONNEMENT = {
  titre: "Audit & préparation aux contrôles des entreprises de sécurité privée",
  sousTitre:
    "CNAPS • URSSAF • DGFiP / Fiscal • Inspection du travail • Sous-traitance • Exploitation",
  signature:
    "20 ans d'expérience de direction dans la sécurité privée au service de votre conformité opérationnelle.",
  phraseCle: "Je fais le lien entre le dirigeant, le terrain et ses conseils spécialisés.",
  /** Ton imposé par le pack : jamais de promesse de garantie contre un redressement. */
  limite:
    "Ces outils servent à l'audit, au diagnostic, à la préparation et à l'accompagnement organisationnel. Les consultations juridiques ou fiscales réglementées, le contentieux, les rectifications fiscales et les missions comptables sont orientés vers avocat, avocat fiscaliste et/ou expert-comptable.",
  cibles: [
    { nom: "Dirigeants", besoin: "Auditer, prévenir et préparer un contrôle." },
    { nom: "Avocats", besoin: "Disposer d'un dossier terrain structuré avant analyse juridique." },
    {
      nom: "Experts-comptables",
      besoin: "Croiser la réalité opérationnelle avec paie, comptabilité et déclarations.",
    },
    { nom: "Prescripteurs", besoin: "Orienter leurs clients vers un spécialiste métier du secteur." },
  ],
  valeurAjoutee: [
    "Lecture métier immédiate grâce à 20 ans de direction dans le secteur.",
    "Contrôle croisé : planning → présence réelle → paie → facturation → situation réglementaire.",
    "Constats factuels, preuves identifiées et risques hiérarchisés.",
    "Plan d'actions concret avec priorités, responsables et délais.",
  ],
} as const;

export type Domaine =
  | "gouvernance"
  | "cnaps"
  | "social"
  | "paie"
  | "temps"
  | "urssaf"
  | "inspection_sst"
  | "sous_traitance"
  | "operationnel"
  | "fiscal";

export interface Pilier {
  id: "cnaps" | "urssaf_social" | "fiscal" | "inspection" | "sous_traitance";
  nom: string;
  organisme: string;
  description: string;
  /** Domaines du référentiel control_points couverts par ce pilier. */
  domaines: Domaine[];
  /** Fiches de la Bible V2 (01). */
  fichesBible: string;
  /** Module xlsx du pack. */
  moduleSource: string;
  /** Nombre de points de contrôle seedés (supabase/seed/0001_control_points.sql). */
  nbPoints: number;
}

export const PILIERS: Pilier[] = [
  {
    id: "cnaps",
    nom: "CNAPS",
    organisme: "Conseil national des activités privées de sécurité",
    description:
      "Autorisations, dirigeants, cartes professionnelles, Dracar Ultimate, contrats, missions, sous-traitance, contrôle terrain.",
    domaines: ["cnaps"],
    fichesBible: "Bloc A — fiches 01 à 08",
    moduleSource: "03_Module_Audit_CNAPS.xlsx (AUDIT_CNAPS 24 tests) + 02 AUDIT_360 CNAPS (25 points)",
    nbPoints: 49,
  },
  {
    id: "urssaf_social",
    nom: "URSSAF / Social",
    organisme: "URSSAF",
    description:
      "DPAE, registre du personnel, contrats, paie, primes, frais, paniers, avantages, temps de travail, DSN, travail dissimulé.",
    domaines: ["social", "paie", "temps", "urssaf"],
    fichesBible: "Blocs C et D — fiches 14 à 28 ; bloc F fiche 35",
    moduleSource:
      "04_Module_URSSAF_Inspection.xlsx (AUDIT_URSSAF 20 tests) + 02 AUDIT_360 SOCIAL / TEMPS / URSSAF (45 points)",
    nbPoints: 65,
  },
  {
    id: "fiscal",
    nom: "DGFiP / Fiscal",
    organisme: "Direction générale des Finances publiques",
    description:
      "Procédure de contrôle, FEC, balance et grand livre, chiffre d'affaires et facturation, TVA, charges et frais du dirigeant, sous-traitance, préparation de la remise des pièces.",
    domaines: ["fiscal"],
    fichesBible: "Bloc G — fiches 37 à 44 + annexe fiscale sécurité privée",
    moduleSource: "05_Module_Controle_Fiscal.xlsx (AUDIT_FISCAL 24 points)",
    nbPoints: 24,
  },
  {
    id: "inspection",
    nom: "Inspection du travail",
    organisme: "DREETS — Inspection du travail",
    description:
      "Durée du travail, repos, DUERP, plans de prévention, travail isolé, accidents et agressions, CSE, suivi santé, préparation d'une visite.",
    domaines: ["inspection_sst"],
    fichesBible: "Bloc E — fiches 29 à 34",
    moduleSource:
      "04_Module_URSSAF_Inspection.xlsx (AUDIT_INSPECTION 20 tests) + 02 AUDIT_360 TRAVAIL (20 points)",
    nbPoints: 40,
  },
  {
    id: "sous_traitance",
    nom: "Sous-traitance & exploitation",
    organisme: "Transversal (CNAPS, URSSAF, DGFiP)",
    description:
      "Sélection des sous-traitants, obligation de vigilance, cascade, prix et volumes, travail illégal ; gouvernance et organisation opérationnelle.",
    domaines: ["sous_traitance", "gouvernance", "operationnel"],
    fichesBible: "Bloc B — fiches 09 à 13",
    moduleSource: "02 AUDIT_360 SOUS-TRAITANCE / GOUVERNANCE / OPÉRATIONNEL (30 points)",
    nbPoints: 30,
  },
];

/** Échelle de criticité (01 Bible §2). Couleurs de la DA validée. */
export const CRITICITE = [
  {
    niveau: "critique",
    label: "Critique",
    definition:
      "Risque immédiat ou potentiellement lourd ; titre, travail non déclaré, sécurité grave, incohérence majeure.",
    traitement: "P1 — traiter immédiatement et faire valider si nécessaire.",
    couleur: "#8A1F1B",
  },
  {
    niveau: "majeur",
    label: "Majeur",
    definition:
      "Écart significatif pouvant entraîner observation, régularisation, sanction ou litige.",
    traitement: "P2 — corriger sous 30 jours.",
    couleur: "#8A5A12",
  },
  {
    niveau: "modere",
    label: "Modéré",
    definition: "Écart de procédure, traçabilité ou maîtrise interne.",
    traitement: "P3 — corriger sous 90 jours.",
    couleur: "#6B6A15",
  },
  {
    niveau: "mineur",
    label: "Mineur",
    definition: "Amélioration de forme ou de pilotage.",
    traitement: "P4 — amélioration continue.",
    couleur: "#1F5A3A",
  },
] as const;
