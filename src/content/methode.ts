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
 * Déroulé standard d'une mission (06 §2). 7 phases calendaires J-10 → J+7.
 * Elles coexistent avec les 15 ÉTAPES de la méthode (note de cadrage de Maman) : les étapes disent
 * ce qu'on fait (checklist de travail, table `method_steps`), les phases disent quand (table `mission_phases`).
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

/** Les 15 étapes de la méthode (note de cadrage d'origine). Rattachées à une phase calendaire habituelle. */
export const ETAPES_METHODE: { ordre: number; nom: string; phase: number }[] = [
  { ordre: 1, nom: "Entretien avec le dirigeant", phase: 1 },
  { ordre: 2, nom: "Définition du périmètre de l'audit", phase: 1 },
  { ordre: 3, nom: "Collecte des documents", phase: 2 },
  { ordre: 4, nom: "Analyse documentaire", phase: 3 },
  { ordre: 5, nom: "Sélection d'un échantillon de salariés, sites et sous-traitants", phase: 2 },
  { ordre: 6, nom: "Contrôle CNAPS", phase: 5 },
  { ordre: 7, nom: "Contrôle social et URSSAF", phase: 5 },
  { ordre: 8, nom: "Contrôle du temps de travail", phase: 5 },
  { ordre: 9, nom: "Analyse Inspection du travail / santé-sécurité", phase: 5 },
  { ordre: 10, nom: "Rapprochement planning → pointage → paie → facturation", phase: 6 },
  { ordre: 11, nom: "Qualification des constats", phase: 6 },
  { ordre: 12, nom: "Classement des risques : Critique / Majeur / Modéré / Mineur", phase: 6 },
  { ordre: 13, nom: "Plan d'actions : P1 immédiat / P2 30 j / P3 90 j / P4 amélioration", phase: 7 },
  { ordre: 14, nom: "Rapport final", phase: 7 },
  { ordre: 15, nom: "Réunion de restitution avec le dirigeant", phase: 7 },
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
  // Le gabarit Word en dessine cinq ; le nombre appartient à la mission, pas au modèle.
  "Constats prioritaires",
  "Analyse par domaine",
  "Contrôle croisé planning → pointage → paie → facturation",
  "Plan d'actions",
  "Conclusion",
  "Sources officielles vérifiées (datées)",
] as const;

/**
 * Domaines de la section 6 du rapport (07) — SIX sous-sections, exactement celles du
 * modèle. Le fiscal n'y figure pas : c'est un pilier du portail, pas une section du
 * gabarit de rapport de Sofia. L'ajouter ici ferait atterrir un titre de sous-section
 * inventé dans un document remis au client. Si elle veut le fiscal au rapport, c'est le
 * docx 07 qu'elle met à jour, et cette constante suivra.
 */
export const DOMAINES_RAPPORT = [
  "CNAPS",
  "Sous-traitance",
  "Contrats et paie",
  "Temps de travail",
  "SST / Inspection du travail",
  "Organisation",
] as const;

/** Réunion de restitution (06 §11) : 45 à 60 minutes. */
export const RESTITUTION_MINUTES = { min: 45, max: 60 } as const;

/**
 * L'ordre du jour minuté de la restitution (06 §11), recopié tel quel.
 * Il n'était nulle part : l'étape 15 se contentait de quatre conseils réécrits, dont un
 * qui inventait un nombre de constats à présenter.
 */
export const ORDRE_DU_JOUR_RESTITUTION = [
  { minutes: 5, quoi: "Rappeler le périmètre et les limites de l'audit." },
  { minutes: 10, quoi: "Présenter les points forts et le niveau global de maîtrise." },
  { minutes: 20, quoi: "Traiter uniquement les écarts critiques et majeurs." },
  { minutes: 10, quoi: "Valider responsables et échéances du plan d'actions." },
  { minutes: 5, quoi: "Décider des sujets à faire vérifier par avocat, expert-comptable ou autre spécialiste." },
  { minutes: 5, quoi: "Fixer, si le client le souhaite, une revue de suivi." },
] as const;

/**
 * Tailles d'échantillon par tranche d'effectif (06 §5), mot pour mot.
 *
 * `min`/`max` ne servent qu'à mettre en évidence la tranche du client : la première
 * n'est pas bornée parce que le pack ne chiffre pas « très petite entreprise ». Lui
 * inventer un seuil serait exactement le défaut qu'on traque.
 */
export const TRANCHES_ECHANTILLON = [
  { libelle: "Très petite entreprise", cible: "environ 5 dossiers salariés si l'effectif le permet", min: null, max: null },
  { libelle: "10 à 49 salariés", cible: "8 à 12 dossiers", min: 10, max: 49 },
  { libelle: "50 à 199 salariés", cible: "12 à 20 dossiers", min: 50, max: 199 },
  { libelle: "200 salariés et plus", cible: "au moins 20 dossiers, puis augmenter selon le risque, le nombre de sites et les anomalies détectées", min: 200, max: null },
] as const;

/**
 * Les huit profils que la procédure §5 impose d'inclure « dans tous les cas ».
 * L'écran n'en reprenait que quatre, et y avait ajouté un critère de choix de site que
 * le pack n'écrit nulle part. Ceux qui manquaient sont ceux qui portent le risque : le
 * CDD (requalification), les heures supplémentaires (travail dissimulé), le départ
 * récent, le salarié par sous-traitant (solidarité financière).
 */
export const PROFILS_ECHANTILLON = [
  "Un nouvel embauché",
  "Un CDD si présent",
  "Un temps partiel si présent",
  "Un travailleur de nuit",
  "Un agent avec beaucoup d'heures supplémentaires",
  "Un agent ayant changé de site",
  "Un départ récent",
  "Au moins un salarié par sous-traitant testé",
] as const;

/**
 * Le questionnaire d'entretien du dirigeant (06 §4), recopié mot pour mot.
 *
 * Il n'existait nulle part dans le portail : l'étape 01 ne demandait que six champs
 * administratifs. Or le pack en fait le pivot de la mission — les réponses sur la
 * vérification des titres CNAPS, sur le document qui fait foi pour les heures, sur qui
 * rapproche planning et paie, orientent l'échantillon de l'étape 05 et les contrôles
 * croisés de l'étape 10. Sans lui, la consultante mène l'entretien de mémoire ou sur
 * papier, hors de l'outil, et rien n'en revient.
 *
 * Le `code` est stable : il sert de clé en base (mission_entretien_reponses). Ne jamais
 * le renuméroter, seulement en ajouter.
 */
export const QUESTIONNAIRE_DIRIGEANT = [
  { code: "activite", theme: "Activité", question: "Quelles activités de sécurité privée exercez-vous réellement aujourd'hui ? Lesquelles sont sous-traitées ?" },
  { code: "organisation", theme: "Organisation", question: "Qui décide des embauches, affectations, remplacements urgents et validations de paie ?" },
  { code: "cnaps_titre", theme: "CNAPS", question: "Comment vérifiez-vous un titre CNAPS avant l'embauche puis avant l'affectation ?" },
  { code: "cnaps_echeances", theme: "CNAPS", question: "Comment suivez-vous les dates d'expiration des cartes et agréments ?" },
  { code: "st_selection", theme: "Sous-traitance", question: "Dans quels cas sous-traitez-vous ? Comment sélectionnez-vous et contrôlez-vous vos sous-traitants ?" },
  { code: "st_second_rang", theme: "Sous-traitance", question: "Existe-t-il de la sous-traitance de second rang ? Comment en êtes-vous informé ?" },
  { code: "social_controle", theme: "Social", question: "Qui contrôle les DPAE, contrats, classifications et avenants ?" },
  { code: "temps_foi", theme: "Temps", question: "Quel document fait foi pour les heures réellement travaillées ?" },
  { code: "temps_remplacement", theme: "Temps", question: "Comment gérez-vous un remplacement de dernière minute sans dépasser les limites de temps/repos ?" },
  { code: "paie_rapprochement", theme: "Paie", question: "Qui rapproche planning, variables de paie et bulletin avant validation ?" },
  { code: "paie_elements", theme: "Paie", question: "Quelles primes, paniers, frais et indemnités sont versés ? Sur quelle base ?" },
  { code: "clients_hors_cadre", theme: "Clients", question: "Un client a-t-il déjà demandé à un agent une mission hors du cadre prévu ? Comment cela est-il géré ?" },
  { code: "sst_risques", theme: "SST", question: "Quels sont vos trois principaux risques professionnels ? Comment sont-ils suivis dans le DUERP ?" },
  { code: "controles_passes", theme: "Contrôles", question: "Avez-vous déjà reçu une observation CNAPS, URSSAF ou Inspection du travail ? A-t-elle été corrigée durablement ?" },
  { code: "pilotage", theme: "Pilotage", question: "Quels points de conformité vous inquiètent aujourd'hui ?" },
] as const;
