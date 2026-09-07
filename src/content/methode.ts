/**
 * La méthode : règle d'or, déroulé de mission et formule de constat.
 * Sources : 01_Bible_Consultant_V2 (§1, annexe 2), 06_Procedure_Mission_Audit_360 (§2, §11),
 * 07_Modele_Rapport_Diagnostic_360 (structure du rapport).
 */

/** Règle d'or (01 §1) — chaîne affichée sur la vitrine et structurant la fiche de constat du portail. */
export const REGLE_OR = ["FAIT", "PREUVE", "RISQUE", "RÉFÉRENCE VÉRIFIÉE", "ACTION", "DÉLAI"] as const;

/** Formule type de constat (01 annexe 2). */
export const FORMULE_CONSTAT = {
  fait: "Sur l'échantillon examiné, [fait précis].",
  preuve: "Ce constat repose sur [documents / dates / site / salarié].",
  risque:
    "Cette situation peut exposer l'entreprise à [risque], sous réserve de confirmation de la règle applicable.",
  action:
    "Il est recommandé de [action], sous la responsabilité de [fonction], avant le [délai].",
} as const;

export interface PhaseMission {
  ordre: number;
  moment: string;
  nom: string;
  travail: string;
}

/**
 * Déroulé standard d'une mission (06 §2). 7 phases J-10 → J+7.
 * ⚠ Les maquettes Figma et la page Architecture Notion parlent de « 15 étapes » :
 *   à réconcilier avec ce déroulé (les 15 étapes n'existent dans aucun document du pack).
 */
export const PHASES_MISSION: PhaseMission[] = [
  {
    ordre: 1,
    moment: "J-10 à J-5",
    nom: "Cadrage",
    travail:
      "Entretien dirigeant, périmètre, établissements/sites, effectif, contexte, contrôle en cours ou préventif.",
  },
  {
    ordre: 2,
    moment: "J-7 à J-3",
    nom: "Collecte documentaire",
    travail:
      "Demander les pièces et relancer les manquants. Préparer l'échantillon salariés/sites/sous-traitants.",
  },
  {
    ordre: 3,
    moment: "J-2 à J-1",
    nom: "Pré-analyse",
    travail:
      "Lire Kbis/RNE, éléments CNAPS, organigramme, paie, plannings, sous-traitance et derniers contrôles.",
  },
  {
    ordre: 4,
    moment: "Jour J matin",
    nom: "Entretien + gouvernance",
    travail:
      "Dirigeant, RH/paie, exploitation. Vérifier processus d'embauche, affectation, remplacement, contrôle interne.",
  },
  {
    ordre: 5,
    moment: "Jour J après-midi",
    nom: "Tests",
    travail:
      "Échantillon salariés, temps de travail, paie, sous-traitants, documents commerciaux, dossiers CNAPS.",
  },
  {
    ordre: 6,
    moment: "J+1 à J+3",
    nom: "Analyse",
    travail: "Rapprochements, qualification des risques, demandes complémentaires.",
  },
  {
    ordre: 7,
    moment: "J+3 à J+7",
    nom: "Rapport",
    travail: "Synthèse dirigeant, constats, plan d'actions et restitution.",
  },
];

/** Méthode « en 4 temps » du site web V2 (21) — version vitrine simplifiée des 7 phases. */
export const METHODE_4_TEMPS = [
  { nom: "Cadrage", phases: [1] },
  { nom: "Collecte", phases: [2, 3] },
  { nom: "Tests", phases: [4, 5, 6] },
  { nom: "Restitution", phases: [7] },
] as const;

/** Structure du rapport de diagnostic 360° (07) — sert à la génération PDF depuis les constats. */
export const SECTIONS_RAPPORT = [
  "Objet et périmètre de la mission",
  "Limites et méthode",
  "Échelle de criticité",
  "Synthèse dirigeant",
  "Les 5 constats prioritaires",
  "Analyse par domaine",
  "Contrôle croisé planning → pointage → paie → facturation",
  "Plan d'actions",
  "Conclusion",
  "Sources officielles vérifiées (datées)",
] as const;

/** Domaines de la section 6 du rapport (07). ⚠ Le fiscal n'y figure pas encore : à ajouter dans le docx. */
export const DOMAINES_RAPPORT = [
  "CNAPS",
  "Sous-traitance",
  "Contrats et paie",
  "Temps de travail",
  "SST / Inspection du travail",
  "Organisation",
  "Fiscal (à intégrer au modèle 07)",
] as const;

/** Réunion de restitution (06 §11) : 45 à 60 minutes. */
export const RESTITUTION_MINUTES = { min: 45, max: 60 } as const;
