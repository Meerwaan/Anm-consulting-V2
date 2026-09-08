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

/**
 * Le portail vu par la consultante.
 * Décision 03 du 08/09/2026 : l'écran s'organise par ÉTAPE de la méthode, pas par module.
 * Les 15 étapes sont la colonne vertébrale (on suit le déroulé d'une mission, du premier
 * entretien à la restitution) ; les modules restent le classement des pièces et des constats.
 */
export const PORTAIL_CONSULTANTE = {
  principe: "Un dossier par client, déroulé selon les 15 étapes de la méthode. À chaque étape, ses points de contrôle, ses pièces et ses notes. Rien ne doit manquer.",
  modules: ["Mallette Audit 360°", "Module CNAPS", "Module URSSAF / Inspection", "Module Contrôle fiscal DGFiP"],
  parModule: [
    "Points de contrôle du module (statut, gravité, note) — la feuille AUDIT_* remplie",
    "Pièces attendues / reçues / incomplètes, demandes ouvertes",
    "Feuilles de travail annexes (échantillon, croisement heures, titres, score risque) déposées",
    "Notes de travail, publiables au client",
    "Constats qualifiés, rattachés au module",
  ],
  suivi: [
    "Les 15 étapes en colonne vertébrale : chacune porte sa nature (entretien, contrôle, rapprochement, rapport…) et son périmètre de points de contrôle",
    "7 phases calendaires (J-10 → J+7) en repère de temps",
    "Indicateur « rien ne manque » par étape, plus le compteur des points qu'aucune étape ne couvre",
  ],
} as const;

/** Le portail vu par le client. */
/**
 * Le portail vu par le client.
 * Décision 04 du 08/09/2026 : AUCUNE note de travail n'est partagée avant le rapport.
 * Le client voit l'avancement, ce qu'on lui réclame et le fil d'échange — rien du contenu
 * de l'audit tant qu'il n'est pas qualifié. `mission_notes.visible_to_client` reste en base
 * mais n'est pas utilisé côté client.
 */
export const PORTAIL_CLIENT = {
  pendantAudit: [
    "Avancement : les 15 étapes et leur statut, la phase en cours",
    "Pièces demandées, avec dépôt direct et relance automatique tous les 3 jours",
    "Fil d'échange avec la consultante",
    "Notification email à chaque demande, relance et message",
  ],
  finAudit: [
    "Compte rendu en deux axes (risques réels en cas de contrôle / axes d'amélioration) pour le dirigeant, suivi du détail classé par criticité pour l'avocat et l'expert-comptable (décision 05)",
    "Plan d'actions P1 → P4 avec responsable et échéance ; le client coche lui-même ce qu'il a fait et la consultante est notifiée (décision 07)",
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
