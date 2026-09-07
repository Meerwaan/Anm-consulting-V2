/**
 * Vision produit — cadrage du 07/09/2026 (Merwan, d'après la demande de Maman).
 * Sert de colonne vertébrale à la vitrine (pourquoi nous) et au portail (ce qu'on y fait).
 */

/** Les 5 objectifs de l'accompagnement, dans l'ordre où elle les énonce. */
export const OBJECTIFS = [
  {
    n: 1,
    titre: "Prévenir les risques",
    texte:
      "Repérer avant le contrôle ce qu'un contrôleur CNAPS, URSSAF, DGFiP ou Inspection du travail verrait : titres, heures, paie, sous-traitance, facturation.",
  },
  {
    n: 2,
    titre: "Créer une organisation",
    texte:
      "Mettre en place les procédures, les rapprochements périodiques et le classement documentaire qui font qu'on ne redécouvre pas les mêmes écarts à chaque contrôle.",
  },
  {
    n: 3,
    titre: "Conseiller là où l'avocat et l'expert-comptable ne peuvent pas aller",
    texte:
      "Un regard métier de dirigeante de sécurité privée sur la ligne de crête : ce qui est tenable sur le terrain, ce qui ne l'est pas, dans le respect du code de déontologie de la profession.",
  },
  {
    n: 4,
    titre: "Préparer le contrôle pour faciliter le travail des avocats et des experts-comptables",
    texte:
      "Un dossier terrain structuré, indexé et daté : faits, preuves, écarts qualifiés. Les conseils spécialisés partent d'un dossier propre au lieu de reconstituer les faits.",
  },
  {
    n: 5,
    titre: "Libérer le temps du dirigeant",
    texte:
      "Une organisation qui soulage le brouillon administratif pour que le patron se concentre sur son cœur de métier : ses clients, ses agents, ses sites.",
  },
] as const;

/** Ce qu'elle n'est pas — à afficher sur la vitrine et à rappeler dans chaque rapport. */
export const LIGNE_DE_CRETE = {
  phrase: "Je ne remplace ni l'avocat ni l'expert-comptable. Je prépare le terrain, je reconstitue les faits et je structure le dossier.",
  exclusions: [
    "Consultation juridique ou fiscale réglementée",
    "Représentation et stratégie contentieuse",
    "Réponse à une proposition de rectification fiscale",
    "Tenue de la paie et de la comptabilité, certification des comptes",
  ],
  regle: "Toute note ou constat partagé au client reste factuel (fait, preuve, écart) ; la qualification juridique est renvoyée au professionnel compétent.",
} as const;

/** Le portail vu par la consultante : un dossier par client, rangé par module, où rien ne manque. */
export const PORTAIL_CONSULTANTE = {
  principe: "Un dossier / espace de travail par client, rangé par module, avec les feuilles remplies et les pièces fournies. Rien ne doit manquer.",
  modules: ["Mallette Audit 360°", "Module CNAPS", "Module URSSAF / Inspection", "Module Contrôle fiscal DGFiP"],
  parModule: [
    "Points de contrôle du module (statut, gravité, note) — la feuille AUDIT_* remplie",
    "Pièces attendues / reçues / incomplètes, demandes ouvertes",
    "Feuilles de travail annexes (échantillon, croisement heures, titres, score risque) déposées",
    "Notes de travail, publiables au client",
    "Constats qualifiés, rattachés au module",
  ],
  suivi: ["15 étapes de la méthode (checklist)", "7 phases calendaires (J-10 → J+7)", "Indicateur « rien ne manque » par module"],
} as const;

/** Le portail vu par le client. */
export const PORTAIL_CLIENT = {
  pendantAudit: [
    "Avancement (étapes, phases, modules) et notes que la consultante choisit de partager",
    "Pièces demandées, avec dépôt direct et relances",
    "Fil d'échange avec la consultante",
    "Notification email à chaque demande, message, note ou constat publié",
  ],
  finAudit: [
    "Compte rendu adapté à l'audit, en deux axes : risques réels en cas de contrôle / axes d'amélioration",
    "Plan d'actions P1 → P4 avec responsable et échéance, statut modifiable par le client",
    "Proposition de suivi conformité (abonnement) : échéances, revues, veille",
  ],
} as const;

/** Les deux axes du compte rendu final (champ findings.nature). */
export const AXES_RAPPORT = [
  {
    nature: "risque_controle",
    titre: "Risques réels en cas de contrôle",
    definition: "Écarts qui exposent l'entreprise face à un contrôleur : à traiter en priorité, preuve à l'appui.",
  },
  {
    nature: "amelioration",
    titre: "Axes d'amélioration",
    definition: "Organisation, traçabilité, procédures, temps du dirigeant : ce qui rend l'entreprise plus solide et plus simple à piloter.",
  },
] as const;
