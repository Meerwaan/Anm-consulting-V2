/**
 * Catalogue de formation — repris de la base Notion « Modules de formation » (26 modules, 9 parcours).
 * Statut au 15/09/2026 : tout est à l'état d'idée, rien n'a encore été montré à la consultante.
 * Les tarifs et les dates d'ouverture sont des placeholders.
 */

import { A_COMPLETER } from "./vitrine";

export type OffreFormation = "gratuit" | "payant" | "abonnement";
export type FormatFormation = "Vidéo" | "Texte / fiche" | "Quiz" | "Checklist téléchargeable" | "Outil interactif";

export interface ModuleFormation {
  code: string;
  titre: string;
  niveau: "Essentiel" | "Approfondi" | "Expert";
  dureeMin: number | null;
  nbPoints: number | null;
  offre: OffreFormation;
  formats: FormatFormation[];
}

export interface ParcoursFormation {
  id: string;
  nom: string;
  accroche: string;
  modules: ModuleFormation[];
}

export const PARCOURS: ParcoursFormation[] = [
  {
    id: "socle",
    nom: "Socle : se préparer à un contrôle",
    accroche: "Le parcours par lequel tout le monde commence. Le premier module est gratuit.",
    modules: [
      { code: "SOC-01", titre: "Pourquoi et comment on se fait contrôler (CNAPS, URSSAF, Inspection)", niveau: "Essentiel", dureeMin: 20, nbPoints: null, offre: "gratuit", formats: ["Vidéo", "Texte / fiche"] },
      { code: "SOC-02", titre: "La méthode FAIT → PREUVE → RISQUE → RECOMMANDATION", niveau: "Essentiel", dureeMin: 15, nbPoints: null, offre: "payant", formats: ["Vidéo", "Texte / fiche", "Quiz"] },
      { code: "SOC-03", titre: "Les pièces à avoir prêtes : le dossier de contrôle permanent", niveau: "Essentiel", dureeMin: 25, nbPoints: null, offre: "payant", formats: ["Vidéo", "Checklist téléchargeable"] },
      { code: "SOC-04", titre: "Auto-diagnostic 360° : les 8 domaines et les 120 points", niveau: "Essentiel", dureeMin: 30, nbPoints: 120, offre: "payant", formats: ["Vidéo", "Outil interactif"] },
      { code: "SOC-05", titre: "Prioriser et construire son plan d'actions (P1 → P4)", niveau: "Essentiel", dureeMin: 15, nbPoints: null, offre: "payant", formats: ["Vidéo", "Checklist téléchargeable", "Quiz"] },
    ],
  },
  {
    id: "cnaps",
    nom: "CNAPS",
    accroche: "Autorisation, agrément, cartes, Dracar Ultimate, contrats, terrain : ce que le CNAPS regarde, dans l'ordre où il le regarde.",
    modules: [
      { code: "CNA-01", titre: "Autorisation d'exercer, agrément dirigeant, établissements", niveau: "Essentiel", dureeMin: 20, nbPoints: 4, offre: "abonnement", formats: ["Vidéo", "Texte / fiche", "Quiz"] },
      { code: "CNA-02", titre: "Cartes professionnelles : validité, activité adaptée, échéances", niveau: "Essentiel", dureeMin: 25, nbPoints: null, offre: "abonnement", formats: ["Vidéo", "Checklist téléchargeable", "Outil interactif"] },
      { code: "CNA-03", titre: "Dracar Ultimate : obligations, comptes, déclarations mensuelles", niveau: "Approfondi", dureeMin: 30, nbPoints: 10, offre: "payant", formats: ["Vidéo", "Texte / fiche", "Quiz"] },
      { code: "CNA-04", titre: "Contrats clients, devis, factures : les mentions obligatoires", niveau: "Approfondi", dureeMin: 20, nbPoints: null, offre: "abonnement", formats: ["Vidéo", "Checklist téléchargeable"] },
      { code: "CNA-05", titre: "Contrôle terrain et visite de site : ce que le CNAPS regarde", niveau: "Approfondi", dureeMin: 20, nbPoints: null, offre: "abonnement", formats: ["Vidéo", "Checklist téléchargeable"] },
      { code: "CNA-06", titre: "Cas particuliers : cynophile, événementiel, armement, formation continue", niveau: "Expert", dureeMin: 15, nbPoints: null, offre: "abonnement", formats: ["Texte / fiche"] },
    ],
  },
  {
    id: "social",
    nom: "Social & URSSAF",
    accroche: "De l'embauche au bulletin : ce qui entre dans l'assiette, ce qui déclenche un redressement.",
    modules: [
      { code: "SOC-URS-01", titre: "Embauche conforme : DPAE, RUP, contrat, classification, période d'essai", niveau: "Essentiel", dureeMin: 25, nbPoints: 15, offre: "abonnement", formats: ["Vidéo", "Checklist téléchargeable", "Quiz"] },
      { code: "SOC-URS-02", titre: "Lire et contrôler un bulletin de paie sécurité privée (IDCC 1351)", niveau: "Approfondi", dureeMin: 30, nbPoints: null, offre: "abonnement", formats: ["Vidéo", "Outil interactif"] },
      { code: "SOC-URS-03", titre: "Primes, paniers, frais, avantages : ce qui entre dans l'assiette", niveau: "Approfondi", dureeMin: 20, nbPoints: 15, offre: "abonnement", formats: ["Vidéo", "Texte / fiche", "Quiz"] },
      { code: "SOC-URS-04", titre: "Travail dissimulé et contrôle URSSAF : se préparer, réagir", niveau: "Approfondi", dureeMin: 20, nbPoints: null, offre: "payant", formats: ["Vidéo", "Texte / fiche"] },
    ],
  },
  {
    id: "temps",
    nom: "Temps de travail",
    accroche: "Le rapprochement planning → pointage → paie → facturation. Le test à plus forte valeur ajoutée de toute la méthode.",
    modules: [
      { code: "TPS-01", titre: "Planning, pointage, paie, facturation : le rapprochement qui sauve", niveau: "Essentiel", dureeMin: 30, nbPoints: null, offre: "payant", formats: ["Vidéo", "Outil interactif"] },
      { code: "TPS-02", titre: "Durées, repos, nuit, heures sup/complémentaires, vacations", niveau: "Approfondi", dureeMin: 25, nbPoints: 15, offre: "abonnement", formats: ["Vidéo", "Checklist téléchargeable", "Quiz"] },
    ],
  },
  {
    id: "sst",
    nom: "Inspection du travail & SST",
    accroche: "DUERP, travail isolé, agressions, EPI, CSE, affichages : la prévention comme l'inspection la lit.",
    modules: [
      { code: "SST-01", titre: "DUERP, travail isolé, agressions, EPI : la prévention en sécurité privée", niveau: "Essentiel", dureeMin: 25, nbPoints: 20, offre: "abonnement", formats: ["Vidéo", "Checklist téléchargeable"] },
      { code: "SST-02", titre: "CSE, règlement intérieur, affichages, médecine du travail", niveau: "Approfondi", dureeMin: 15, nbPoints: null, offre: "abonnement", formats: ["Texte / fiche", "Quiz"] },
    ],
  },
  {
    id: "sous_traitance",
    nom: "Sous-traitance",
    accroche: "Vigilance, autorisation CNAPS, second rang, prix anormalement bas : sous-traiter sans porter les dettes des autres.",
    modules: [
      { code: "STR-01", titre: "Sous-traiter sans risque : vigilance, autorisation CNAPS, 2ᵉ rang, prix anormal", niveau: "Essentiel", dureeMin: 25, nbPoints: 10, offre: "abonnement", formats: ["Vidéo", "Checklist téléchargeable", "Quiz"] },
    ],
  },
  {
    id: "gouvernance",
    nom: "Gouvernance",
    accroche: "Assurances, délégations, veille, archivage, alertes : l'organisation qui évite de redécouvrir les mêmes écarts.",
    modules: [
      { code: "GOV-01", titre: "Gouvernance : assurances, délégations, veille, archivage, alertes", niveau: "Approfondi", dureeMin: 15, nbPoints: 10, offre: "abonnement", formats: ["Texte / fiche", "Checklist téléchargeable"] },
    ],
  },
  {
    id: "operationnel",
    nom: "Organisation opérationnelle",
    accroche: "Consignes, main courante, prise de poste, supervision, continuité : le terrain, tel qu'un contrôleur le visite.",
    modules: [
      { code: "OPS-01", titre: "Consignes, main courante, prise de poste, supervision, continuité", niveau: "Essentiel", dureeMin: 20, nbPoints: 10, offre: "abonnement", formats: ["Vidéo", "Checklist téléchargeable"] },
    ],
  },
  {
    id: "fiscal",
    nom: "Fiscal / DGFiP",
    accroche: "Comprendre la procédure, préparer la remise des pièces, rapprocher facturation, comptabilité et déclarations. Avec votre expert-comptable.",
    modules: [
      { code: "FIS-01", titre: "Comprendre un contrôle fiscal DGFiP : procédures, charte, périmètre, interlocuteur unique", niveau: "Essentiel", dureeMin: null, nbPoints: 4, offre: "abonnement", formats: ["Vidéo", "Texte / fiche", "Checklist téléchargeable"] },
      { code: "FIS-02", titre: "FEC, balance, grand livre : la comptabilité est-elle prête à être remise ?", niveau: "Approfondi", dureeMin: null, nbPoints: 6, offre: "payant", formats: ["Vidéo", "Texte / fiche", "Outil interactif"] },
      { code: "FIS-03", titre: "Chiffre d'affaires, facturation et TVA : rapprocher prestations, factures, compta et déclarations", niveau: "Approfondi", dureeMin: null, nbPoints: 6, offre: "payant", formats: ["Vidéo", "Texte / fiche", "Outil interactif"] },
      { code: "FIS-04", titre: "Charges, frais du dirigeant et sous-traitance : substance, preuves et cohérence fiscal / CNAPS / social", niveau: "Expert", dureeMin: null, nbPoints: 8, offre: "abonnement", formats: ["Vidéo", "Texte / fiche", "Quiz"] },
    ],
  },
];

export const NB_MODULES = PARCOURS.reduce((n, p) => n + p.modules.length, 0);

export const LIBELLE_OFFRE: Record<OffreFormation, string> = {
  gratuit: "Gratuit",
  payant: "À l'unité",
  abonnement: "Inclus dans l'abonnement",
};

/** Programme d'entraînement (12) — 4 semaines, 9 compétences. Piste : former d'autres consultants. */
export const PROGRAMME_30_JOURS = {
  titre: "Programme d'entraînement 30 jours",
  texte:
    "Quatre semaines, neuf compétences, quatre cas pratiques corrigés (Audit 360°, URSSAF, CNAPS, Inspection). Conçu pour un responsable conformité, un DRH ou un exploitant qui veut savoir auditer sa propre entreprise.",
  format: A_COMPLETER("Format et prix à définir"),
} as const;
