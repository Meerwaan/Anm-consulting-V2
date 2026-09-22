/**
 * Les grilles de contrôle de Sofia, sous forme de données.
 *
 * Source : docs/grilles-sofia/ (01 à 05). Les libellés sont les siens, recopiés tels quels :
 * ne pas les reformuler sans elle. Là où deux grilles posent la même question (02 et 05 sur
 * l'identification ou la vigilance), la question n'apparaît qu'une fois, dans la grille 02,
 * et seuls les points propres à la 05 sont ajoutés.
 *
 * Le code d'un point est dérivé de son libellé : une réponse reste attachée à sa question
 * tant que le libellé ne change pas, même si l'ordre des questions change.
 */

export type Portee = "mission" | "sous_traitant";

export interface Section {
  code: string;
  titre: string;
  /** Source dans les grilles de Sofia, affichée discrètement. */
  source: string;
  /** Points d'alerte : « oui » signifie que l'anomalie est constatée. */
  alerte?: boolean;
  intro?: string;
  items: { code: string; libelle: string }[];
}

export interface Conclusion {
  code: string;
  titre: string;
  source: string;
  type: "choix" | "multi" | "texte";
  choix?: string[];
  aide?: string;
}

export interface Grille {
  code: string;
  titre: string;
  portee: Portee;
  sections: Section[];
  conclusions: Conclusion[];
}

const slug = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

const section = (code: string, titre: string, source: string, libelles: string[], opts: { alerte?: boolean; intro?: string } = {}): Section => ({
  code,
  titre,
  source,
  ...opts,
  items: libelles.map((l) => ({ code: `${code}.${slug(l)}`, libelle: l })),
});

// ——— Contrôle d'un sous-traitant (grilles 02 et 05) ———————————————————————————

export const GRILLE_SOUS_TRAITANT: Grille = {
  code: "st",
  titre: "Contrôle du sous-traitant",
  portee: "sous_traitant",
  sections: [
    section("identification", "Identification du sous-traitant", "Grille 02 §1 · 05 §5", [
      "Kbis / justificatif d’immatriculation",
      "SIREN / SIRET vérifié",
      "Activité déclarée cohérente avec la prestation",
      "Adresse de l’établissement vérifiée",
      "Dirigeant identifié",
      "Autorisation CNAPS valide",
      "Agrément(s) du ou des dirigeants vérifié(s)",
      "Établissement déclaré auprès du CNAPS",
      "Situation Dracar Ultimate vérifiée lorsque applicable",
      "Bon de commande",
      "Conditions tarifaires",
      "Coordonnées bancaires",
    ]),
    section("contrat", "Contrat de sous-traitance", "Grille 02 §2", [
      "Contrat écrit et signé",
      "Objet de la prestation clairement défini",
      "Sites et périodes d’intervention identifiés",
      "Prestations précisément définies",
      "Prix et modalités de facturation définis",
      "Moyens humains prévus identifiés",
      "Responsabilités de chaque partie définies",
      "Conditions de remplacement des agents prévues",
      "Clauses relatives au respect de la législation sociale",
      "Clauses relatives au travail dissimulé",
      "Sous-traitance en cascade encadrée",
    ]),
    section("vigilance", "Obligation de vigilance", "Grille 02 §3 · 05 §3", [
      "Seuil de vigilance vérifié",
      "Attestation de vigilance URSSAF demandée",
      "Attestation en cours de validité",
      "Authenticité de l’attestation vérifiée",
      "Attestation correspondant exactement au sous-traitant contractuel",
      "Justificatif d’immatriculation obtenu",
      "Documents archivés",
      "Contrôle renouvelé tous les 6 mois pendant l’exécution du contrat",
      "Échéance du prochain contrôle enregistrée",
    ]),
    section("realite", "Contrôle de la réalité de la prestation", "Grille 05 §6", [
      "Contrat signé",
      "Bon de commande",
      "Planning",
      "Agents identifiés",
      "Heures réalisées",
      "Factures cohérentes",
      "Paiements retrouvés",
      "Prestation effectivement réalisée",
    ]),
    section("td", "Travail dissimulé", "Grille 02 §4", [
      "Personnel déclaré",
      "Déclarations sociales cohérentes",
      "Liste nominative des agents communiquée",
      "Contrats de travail cohérents avec les missions",
      "Horaires déclarés cohérents avec les horaires réellement effectués",
      "Personnel présent sur site identifiable",
      "Personnel présent correspondant à la liste transmise",
      "Aucun agent non déclaré identifié",
      "Aucun remplacement non déclaré identifié",
      "Facturation cohérente avec les effectifs réellement mobilisés",
    ]),
    section(
      "td-alertes",
      "Travail dissimulé : points d’alerte",
      "Grille 02 §4",
      [
        "Agent absent des documents transmis",
        "Horaires incohérents",
        "Travailleur présenté comme indépendant sans justification suffisante",
        "Personnel fourni par une autre société",
        "Documents sociaux incomplets ou incohérents",
      ],
      { alerte: true, intro: "Réponds « oui » quand le point d’alerte est constaté." },
    ),
    section("pi", "Prêt illicite de main-d’œuvre", "Grille 02 §5", [
      "Le sous-traitant conserve la gestion de ses salariés",
      "Le sous-traitant organise les horaires de ses agents",
      "Le sous-traitant assure leur encadrement",
      "Le sous-traitant peut procéder aux remplacements",
      "Le donneur d’ordre ne gère pas directement les salariés du sous-traitant",
      "Le sous-traitant dispose d’une organisation propre",
      "La prestation correspond à un service défini et non à une simple fourniture de personnel",
      "La rémunération correspond à la prestation réalisée",
    ]),
    section(
      "pi-alertes",
      "Prêt illicite : points d’alerte",
      "Grille 02 §5",
      [
        "Donneur d’ordre établissant directement les plannings",
        "Donneur d’ordre donnant les instructions quotidiennes aux salariés",
        "Donneur d’ordre validant les congés ou absences",
        "Donneur d’ordre choisissant directement les agents",
        "Donneur d’ordre évaluant ou sanctionnant directement les salariés",
        "Sous-traitant sans autonomie réelle",
        "Facturation essentiellement calculée sur les heures / effectifs fournis",
      ],
      { alerte: true, intro: "Réponds « oui » quand le point d’alerte est constaté." },
    ),
    section("ma", "Marchandage", "Grille 02 §6", [
      "Prestation commerciale réelle",
      "Prix correspondant à une prestation identifiée",
      "Autonomie réelle du sous-traitant",
      "Organisation et encadrement propres au sous-traitant",
      "Absence de transfert artificiel de personnel",
      "Absence de contournement des règles sociales",
      "Absence de préjudice identifié pour les salariés",
      "Conditions de travail et de rémunération préservées",
    ]),
    section(
      "ma-alertes",
      "Marchandage : points d’alerte",
      "Grille 02 §6",
      [
        "Opération ayant principalement pour objet de fournir du personnel",
        "Salariés placés dans une situation moins favorable",
        "Perte d’avantages liés à leur employeur initial",
        "Organisation artificielle de la prestation",
        "Sous-traitance utilisée principalement pour réduire les coûts sociaux",
        "Absence d’autonomie réelle du sous-traitant",
      ],
      { alerte: true, intro: "Réponds « oui » quand le point d’alerte est constaté." },
    ),
    section("cascade", "Sous-traitance en cascade", "Grille 02 §8 · 05 §9", [
      "Absence de sous-traitance en cascade non autorisée",
      "Sous-traitant de niveau 2 identifié",
      "Contrat disponible",
      "Autorisation CNAPS vérifiée",
      "Attestation de vigilance vérifiée",
      "Personnel réellement employé par le bon intervenant",
      "Chaîne contractuelle cohérente",
    ]),
    section(
      "croise",
      "Contrôle croisé",
      "Grille 02 §9",
      [
        "Contrat de sous-traitance",
        "Factures",
        "Planning",
        "Liste des agents",
        "Cartes professionnelles",
        "Documents URSSAF",
        "Effectifs réellement présents",
        "Dracar Ultimate",
        "Heures réellement effectuées",
        "Organisation et encadrement des agents",
      ],
      { intro: "La cohérence de chacun de ces éléments avec les autres." },
    ),
  ],
  conclusions: [
    { code: "st-td", titre: "Travail dissimulé", source: "Grille 02 §10", type: "choix",
      choix: ["Aucun indice", "Point de vigilance", "Anomalie documentaire", "Vérifications complémentaires nécessaires"] },
    { code: "st-pi", titre: "Prêt illicite de main-d’œuvre", source: "Grille 02 §10", type: "choix",
      choix: ["Aucun indice", "Point de vigilance", "Organisation à revoir", "Vérifications complémentaires nécessaires"] },
    { code: "st-ma", titre: "Marchandage", source: "Grille 02 §10", type: "choix",
      choix: ["Aucun indice", "Point de vigilance", "Organisation à revoir", "Vérifications complémentaires nécessaires"] },
    { code: "st-effectif", titre: "Effectif URSSAF cohérent avec la prestation", source: "Grille 03 §12", type: "choix",
      choix: ["Oui", "Oui, sous réserve de vérifications", "Écart nécessitant justification", "Écart important nécessitant investigation"] },
    { code: "st-vigilance", titre: "Résultat du devoir de vigilance", source: "Grille 05 §12", type: "choix",
      choix: ["Conforme", "Conforme sous réserve", "Dossier incomplet", "Anomalies nécessitant régularisation", "Vigilance renforcée nécessaire"] },
    { code: "st-conclusion", titre: "Conclusion", source: "Grille 02 §12", type: "choix",
      choix: ["Sous-traitance conforme", "Conforme sous réserve de régularisation", "Défaut de vigilance à régulariser", "Risque juridique identifié", "Vérifications complémentaires nécessaires"] },
    { code: "st-synthese", titre: "Synthèse de l’auditeur", source: "Grille 02 §12", type: "texte" },
  ],
};

// ——— Conclusion du rapprochement des heures (grille 04) ——————————————————————————

export const GRILLE_RAPPROCHEMENT: Grille = {
  code: "rapprochement",
  titre: "Conclusion du rapprochement des heures",
  portee: "mission",
  sections: [],
  conclusions: [
    { code: "rp-sources", titre: "Sources contrôlées", source: "Grille 04 §2 · §3", type: "multi",
      choix: ["Bons de commande", "Contrats clients", "Factures", "Planning prévisionnel", "Facturation mensuelle", "Bulletins de paie", "DSN", "Livre de paie", "État des heures", "Planning des agents", "Registre du personnel", "Contrats de travail", "Pointage / badgeage", "Main courante"] },
    { code: "rp-question", titre: "Le volume d’heures facturé aux clients paraît-il compatible avec les effectifs, les heures rémunérées et les capacités de production de l’entreprise ?", source: "Grille 04 §5", type: "choix",
      choix: ["Oui", "Partiellement", "Non", "À vérifier"] },
    { code: "rp-explications", titre: "Éléments permettant d’expliquer le volume non couvert", source: "Grille 04 §6", type: "multi",
      choix: ["Sous-traitance déclarée", "Intérim", "Dirigeant participant à la production", "Heures supplémentaires", "Agents mis à disposition légalement", "Autre établissement de l’entreprise"] },
    { code: "rp-conclusion", titre: "Conclusion", source: "Grille 04 §11", type: "choix",
      choix: ["Aucun écart significatif identifié", "Écart expliqué par des éléments documentés", "Écart nécessitant la production de justificatifs complémentaires", "Volume de sous-traitance potentielle à investiguer", "Suspicion de sous-traitance non documentée"] },
    { code: "rp-justificatifs", titre: "Justificatifs complémentaires demandés", source: "Grille 04 §11", type: "texte" },
    { code: "rp-observations", titre: "Observations du contrôleur", source: "Grille 04 §11", type: "texte" },
  ],
};

// ——— CNAPS : bâti sur les fiches de Dracar Ultimate (dictée de Sofia du 21/09/2026) ——————————
// Les quatre premières sections sont sa grille 01 §2, recopiée telle quelle (les réponses déjà
// saisies y restent attachées). Les points ajoutés reprennent les fiches pratiques publiées par le
// CNAPS pour Dracar Ultimate (compte administrateur, gestionnaires, rattachement des salariés,
// demandes par activité, vérification et renouvellement des cartes) et sa grille 01 §1, §5 et §10.

export const GRILLE_CNAPS: Grille = {
  code: "cnaps",
  titre: "Contrôle CNAPS : Dracar Ultimate",
  portee: "mission",
  sections: [
    section("entreprise", "Entreprise et autorisations", "Grille 01 §1 · fiche « Je dépose une demande »", [
      "Autorisation d’exercer CNAPS valide",
      "Agrément(s) des dirigeants valide(s)",
      "Activités exercées conformes aux autorisations détenues",
      "Une autorisation détenue pour chaque activité exercée",
      "Établissements déclarés auprès du CNAPS",
      "Dirigeants / responsables déclarés à jour",
      "Toute modification de situation déclarée au CNAPS dans le délai réglementaire",
    ]),
    section("comptes", "Comptes et organisation", "Grille 01 §2 · fiches « compte administrateur » et « gestionnaire »", [
      "Espace administrateur créé",
      "Espace gestionnaire créé",
      "Gestionnaires désignés",
      "Établissements rattachés aux comptes concernés",
      "Procédure interne de gestion de Dracar Ultimate définie",
      "Compte administrateur validé par le CNAPS",
      "Un gestionnaire rattaché à chaque établissement (SIRET)",
    ]),
    section("salaries", "Salariés", "Grille 01 §2 · fiche « Je rattache des salariés »", [
      "Tous les salariés/agents concernés sont rattachés dans Dracar Ultimate",
      "Liste des personnels à jour",
      "Entrées et sorties régulièrement actualisées",
      "Procédure prévue pour la mise à jour immédiate des effectifs",
      "Salariés rattachés pour chaque activité qu’ils exercent",
      "Rattachements rompus pour les salariés sortis",
      "Liste Dracar Ultimate rapprochée du registre du personnel et de la paie",
    ]),
    section("cartes", "Cartes professionnelles", "Grille 01 §2 · fiche « vérification des cartes »", [
      "Vérification régulière de la validité des cartes professionnelles",
      "Vérification au minimum mensuelle",
      "Vérification avant affectation à un grand événement",
      "Traçabilité des vérifications conservée",
      "Procédure permettant d’empêcher l’affectation d’un agent dont la carte n’est plus valide",
    ]),
    section("demarches", "Démarches CNAPS", "Grille 01 §2 · fiche « Je dépose une demande »", [
      "Demandes effectuées via le compte gestionnaire",
      "Suivi des renouvellements",
      "Suivi des échéances",
      "Lorsque plusieurs activités sont concernées, demandes distinctes effectuées pour chaque activité",
      "Renouvellements distincts par activité lorsque nécessaire",
      "Renouvellements déposés dans les 6 mois qui précèdent l’expiration",
      "Échanges avec le CNAPS suivis dans la messagerie Dracar Ultimate",
    ]),
    section("tiers", "Tiers de confiance", "Fiche « J’agis comme tiers de confiance »", [
      "L’entreprise agit comme tiers de confiance pour ses salariés",
      "Accord écrit de chaque salarié concerné conservé",
    ], { intro: "Sans objet si l’entreprise n’effectue pas les démarches à la place de ses salariés." }),
    section("evenements", "Grands événements", "Grille 01 §5", [
      "Entreprise concernée par la surveillance de grands événements",
      "Agents concernés titulaires du titre / de la spécialité correspondant à l’activité",
      "Affectations vérifiées",
      "Validité des cartes contrôlée avant affectation",
      "Procédure spécifique grands événements mise en place",
    ], { intro: "Sans objet si l’entreprise n’intervient pas sur de grands événements." }),
    section("sous-traitance", "Sous-traitance", "Grille 01 §10", [
      "Sous-traitants identifiés",
      "Autorisations CNAPS vérifiées",
      "Cartes professionnelles des agents vérifiées",
      "Agents rattachés dans Dracar Ultimate lorsque requis",
      "Contrats de sous-traitance disponibles",
      "Conditions réglementaires de recours à la sous-traitance respectées",
    ]),
  ],
  conclusions: [
    { code: "cn-niveau", titre: "Niveau de conformité", source: "Grille 01 §13", type: "choix",
      choix: ["Conforme", "Conforme avec réserves", "Mise en conformité nécessaire", "Non-conformités nécessitant une action prioritaire"] },
    { code: "cn-actions", titre: "Actions correctives recommandées", source: "Grille 01 §13", type: "texte",
      aide: "Une action par ligne, par ordre de priorité." },
    { code: "cn-delai", titre: "Délai préconisé", source: "Grille 01 §13", type: "texte" },
  ],
};
/** Ancien nom, gardé le temps que tout pointe vers GRILLE_CNAPS. */
export const GRILLE_DRACAR = GRILLE_CNAPS;

// ——— URSSAF : travail dissimulé, dissimulation d'activité, prêt illicite, marchandage ——————————
// Dictée de Sofia du 21/09/2026. L'entreprise auditée est contrôlée ici pour elle-même ; ses
// sous-traitants le sont chacun dans leur dossier (grilles 02 et 05), dont les conclusions sont
// reprises en tête du module. Libellés : grille 02 de Sofia et points du pack (codes URS, A360).

const CHOIX_INFRACTION = ["Aucun indice", "Point de vigilance", "Anomalie documentaire", "Vérifications complémentaires nécessaires"];

export const GRILLE_URSSAF: Grille = {
  code: "urssaf",
  titre: "Contrôle URSSAF : travail illégal et sous-traitance",
  portee: "mission",
  sections: [
    section("emploi", "Travail dissimulé par dissimulation d’emploi salarié", "Grille 02 §4", [
      "DPAE effectuée avant chaque prise de poste",
      "Registre unique du personnel à jour",
      "Effectif cohérent entre registre, contrats, paie et DSN",
      "Contrats de travail écrits et cohérents avec les missions",
      "Horaires déclarés cohérents avec les horaires réellement effectués",
      "Toutes les heures réalisées figurent sur les bulletins de paie",
      "Heures supplémentaires et complémentaires payées et déclarées",
      "Présence réelle rapprochée des DPAE, de la DSN et de la paie",
      "Planning, pointage, paie et facturation comparés",
      "Aucun agent présent sur site sans être déclaré",
    ]),
    section("emploi-alertes", "Dissimulation d’emploi : points d’alerte", "Grille 02 §4", [
      "Agent présent sur site absent du registre ou de la paie",
      "Heures réalisées supérieures aux heures payées",
      "Horaires incohérents",
      "Documents sociaux incomplets ou incohérents",
    ], { alerte: true, intro: "Réponds « oui » quand le point d’alerte est constaté." }),
    section("activite", "Travail dissimulé par dissimulation d’activité", "Contrôle URSSAF", [
      "Entreprise immatriculée pour l’activité réellement exercée",
      "Établissements et sites d’intervention déclarés",
      "DSN déposées chaque mois",
      "Déclarations de TVA déposées",
      "Chiffre d’affaires facturé cohérent avec le chiffre d’affaires déclaré",
      "Comptes de charges de personnel rapprochés des journaux de paie",
      "Aucune activité exercée sous une autre structure ou après radiation",
    ]),
    section("independants", "Travailleurs présentés comme indépendants", "Grille 02 §4", [
      "Indépendants et auto-entrepreneurs intervenant pour l’entreprise identifiés",
      "Chacun dispose d’une immatriculation et d’une clientèle propre",
      "Aucun horaire, planning ou instruction imposé comme à un salarié",
      "Aucune tenue ni matériel fourni comme à un salarié",
      "Facturation correspondant à une prestation, et non à des heures de présence",
    ], { intro: "Sans objet si l’entreprise ne fait appel à aucun indépendant." }),
    section("pret", "Prêt illicite de main-d’œuvre et marchandage", "Grille 02 §5 · §6", [
      "L’entreprise conserve l’encadrement de ses agents sur les sites clients",
      "Les consignes passent par l’encadrement de l’entreprise, et non directement par le client",
      "Le client ne choisit, n’évalue ni ne sanctionne les agents",
      "Les prestations vendues sont des services définis, et non une simple fourniture de personnel",
      "Les sous-traitants organisent et encadrent eux-mêmes leurs agents",
      "La sous-traitance ne sert pas principalement à réduire les coûts sociaux",
      "Les salariés concernés ne sont pas placés dans une situation moins favorable",
    ]),
    section("pret-alertes", "Prêt illicite et marchandage : points d’alerte", "Grille 02 §5 · §6", [
      "Facturation essentiellement calculée sur les heures / effectifs fournis",
      "Donneur d’ordre établissant directement les plannings",
      "Donneur d’ordre donnant les instructions quotidiennes aux salariés",
      "Opération ayant principalement pour objet de fournir du personnel",
      "Sous-traitant sans autonomie réelle",
    ], { alerte: true, intro: "Réponds « oui » quand le point d’alerte est constaté." }),
    section("vigilance", "Vigilance du donneur d’ordre", "Grille 05", [
      "Tous les sous-traitants de la période identifiés (grand livre fournisseurs)",
      "Un dossier de vigilance complet pour chaque contrat de 5 000 € HT ou plus",
      "Attestations renouvelées tous les 6 mois",
      "Procédure interne de contrôle des sous-traitants",
      "Sous-traitance en cascade identifiée et encadrée",
    ]),
  ],
  conclusions: [
    { code: "ur-emploi", titre: "Dissimulation d’emploi salarié", source: "Grille 02 §10", type: "choix", choix: CHOIX_INFRACTION },
    { code: "ur-activite", titre: "Dissimulation d’activité", source: "Grille 02 §10", type: "choix", choix: CHOIX_INFRACTION },
    { code: "ur-pret", titre: "Prêt illicite de main-d’œuvre", source: "Grille 02 §10", type: "choix",
      choix: ["Aucun indice", "Point de vigilance", "Organisation à revoir", "Vérifications complémentaires nécessaires"] },
    { code: "ur-marchandage", titre: "Marchandage", source: "Grille 02 §10", type: "choix",
      choix: ["Aucun indice", "Point de vigilance", "Organisation à revoir", "Vérifications complémentaires nécessaires"] },
    { code: "ur-conclusion", titre: "Conclusion", source: "Grille 02 §12", type: "choix",
      choix: ["Aucun risque identifié", "Conforme sous réserve de régularisation", "Régularisations nécessaires", "Risque juridique identifié", "Vérifications complémentaires nécessaires"] },
    { code: "ur-synthese", titre: "Synthèse de l’auditeur", source: "Grille 02 §12", type: "texte" },
  ],
};

// ——— DGFiP : facture fictive et facture de complaisance ————————————————————————————————
// Dictée de Sofia du 21/09/2026 : tout le module sur la facture fictive (aucune prestation) et la
// facture de complaisance (prestation, montant ou émetteur qui ne correspondent pas à la réalité).
// Fléchage commande ↔ facture ↔ prestation ↔ paiement, dans les deux sens (grilles 03 à 05).

export const GRILLE_DGFIP: Grille = {
  code: "dgfip",
  titre: "Contrôle DGFiP : factures fictives et de complaisance",
  portee: "mission",
  sections: [
    section("formalisme", "Formalisme des factures émises", "Précision de Sofia du 21/09/2026", [
      "Numéro unique, selon une séquence chronologique continue",
      "Date d’émission",
      "Nom, adresse et SIREN de l’entreprise et du client",
      "Numéro de TVA intracommunautaire",
      "Date ou période de la prestation",
      "Désignation précise : site, nature de la prestation, heures ou forfait",
      "Prix unitaire hors taxe et quantités",
      "Taux et montant de la TVA, totaux hors taxe et toutes taxes comprises",
      "Date d’échéance du paiement",
      "Taux des pénalités de retard et indemnité forfaitaire pour frais de recouvrement",
      "Numéro d’autorisation CNAPS et mention prévue par le code de la sécurité intérieure",
      "Préparation à la facturation électronique",
    ], { intro: "Sur l’échantillon de factures examiné." }),
    section("contrats", "Contrats commerciaux", "Précision de Sofia du 21/09/2026", [
      "Un contrat écrit et signé pour chaque client",
      "Objet, sites et horaires de la prestation définis",
      "Volume d’heures ou effectifs prévus",
      "Prix horaire ou forfait défini",
      "Clause de révision des prix",
      "Durée et conditions de résiliation",
      "Mentions CNAPS présentes sur le contrat et les devis",
      "Factures conformes aux prix et au périmètre du contrat",
    ]),
    section("commandes", "Bons de commande", "Précision de Sofia du 21/09/2026", [
      "Un bon de commande pour chaque prestation facturée",
      "Bon de commande daté et accepté avant la prestation",
      "Heures ou effectifs commandés précisés",
      "Prix repris du contrat",
      "Commande, planning et facture concordants",
    ]),
    section("prix", "Taux horaires", "Précision de Sofia du 21/09/2026", [
      "Coût de revient horaire de référence de la branche retenu, avec sa source",
      "Prix de vente de l’heure au moins égal au coût de revient de référence",
      "Prix d’achat de la sous-traitance compatible avec le coût de revient de référence",
      "Tout prix inférieur justifié par écrit",
    ]),
    section("emises", "Factures émises aux clients", "Objectif de l’audit §1", [
      "Numérotation continue et chronologique, sans doublon",
      "Mentions obligatoires présentes",
      "Chaque facture rattachée à un contrat ou un bon de commande",
      "Chaque facture rattachée à une prestation réalisée (planning, main courante)",
      "Heures facturées cohérentes avec les heures réalisées",
      "Taux de TVA correct",
      "Avoirs et annulations justifiés",
      "Prestations rattachées à la bonne période",
      "Chiffre d’affaires facturé, comptabilisé et déclaré concordants",
      "TVA collectée concordante avec la TVA déclarée",
      "Règlements reçus du client facturé",
    ]),
    section("recues", "Factures reçues des sous-traitants et fournisseurs", "Grilles 03 §5 · §6, 05 §6 · §8", [
      "Chaque facture correspond à un contrat et à une commande",
      "Chaque facture correspond à une prestation identifiable (sites, dates, agents)",
      "Émetteur existant et actif (SIREN, immatriculation vérifiés)",
      "Activité de l’émetteur compatible avec la prestation facturée",
      "Heures facturées compatibles avec l’effectif de l’émetteur",
      "Prix cohérent avec la prestation et avec son coût réel",
      "TVA déduite sur des factures conformes",
      "Toutes les factures sont retrouvées en comptabilité",
      "Paiement effectué sur un compte au nom du sous-traitant",
      "Aucun paiement sans facture correspondante",
      "Prestation sous-traitée refacturée au client final (fléchage)",
      "Marges cohérentes sur la sous-traitance",
    ]),
    section("alertes", "Indices de facture fictive ou de complaisance", "Grille 05 §11", [
      "Facture sans prestation identifiable",
      "Facture supérieure aux prestations constatées",
      "Paiement vers un compte différent de celui de l’émetteur",
      "Paiement en espèces ou sans trace bancaire",
      "Émetteur récent, domicilié ou sans moyens apparents",
      "Montants ronds et répétitifs sans lien avec des heures",
      "Flux de retour vers l’entreprise, son dirigeant ou une société liée",
      "Même personne derrière le client ou le fournisseur et l’entreprise",
      "Factures de fournisseurs différents à la présentation identique",
      "Facturation groupée en fin d’exercice sans prestation correspondante",
    ], { alerte: true, intro: "Réponds « oui » quand l’indice est constaté." }),
  ],
  conclusions: [
    { code: "dg-emises", titre: "Factures émises", source: "Objectif de l’audit §1", type: "choix",
      choix: ["Aucun indice", "Point de vigilance", "Anomalies à régulariser", "Vérifications complémentaires nécessaires"] },
    { code: "dg-recues", titre: "Factures reçues", source: "Grille 05 §12", type: "choix",
      choix: ["Aucun indice", "Point de vigilance", "Anomalies à régulariser", "Vérifications complémentaires nécessaires"] },
    { code: "dg-risque", titre: "Risque de facture fictive ou de complaisance", source: "Objectif de l’audit §1", type: "choix",
      choix: ["Aucun indice", "Indices isolés à documenter", "Indices concordants : justificatifs à produire", "Risque juridique identifié"] },
    { code: "dg-synthese", titre: "Synthèse de l’auditeur", source: "Objectif de l’audit §5", type: "texte" },
  ],
};

export const GRILLES = { st: GRILLE_SOUS_TRAITANT, rapprochement: GRILLE_RAPPROCHEMENT, cnaps: GRILLE_CNAPS, urssaf: GRILLE_URSSAF, dgfip: GRILLE_DGFIP } as const;
export type CodeGrille = keyof typeof GRILLES;

/** Rappel CNAPS à afficher avec la grille Dracar (grille 01 §2, texte de Sofia). */
export const RAPPEL_DRACAR =
  "Le CNAPS précise que les entreprises doivent avoir créé leur espace Dracar Ultimate et déclaré leurs salariés au 1er octobre 2026. Le CNAPS recommande notamment une vérification au moins mensuelle de la validité des cartes professionnelles.";

export const NATURES_NC: Record<string, string> = {
  travail_dissimule: "Travail dissimulé",
  pret_illicite: "Prêt illicite de main-d’œuvre",
  marchandage: "Marchandage",
  defaut_vigilance: "Défaut de vigilance",
  sous_traitance_irreguliere: "Sous-traitance irrégulière",
  dissimulation_activite: "Dissimulation d’activité",
  emploi_etranger: "Emploi d’un étranger sans titre de travail",
  cnaps: "Non-conformité CNAPS",
  facturation: "Facture fictive ou de complaisance (DGFiP)",
  autre: "Autre",
};

/** Nature proposée quand une alerte calculée est transformée en action. */
export const NATURE_PAR_ALERTE: Record<string, string> = {
  mois_sans_attestation: "defaut_vigilance",
  aucune_attestation: "defaut_vigilance",
  authenticite_non_verifiee: "defaut_vigilance",
  renouvellement_tardif: "defaut_vigilance",
  echeance_vigilance_manquee: "defaut_vigilance",
  siren_different: "defaut_vigilance",
  attestation_sans_date: "defaut_vigilance",
  capacite_depassee: "travail_dissimule",
  plafond_smic_depasse: "travail_dissimule",
  agents_superieurs_effectif: "travail_dissimule",
  agent_hors_documents: "travail_dissimule",
  ecart_non_explique: "travail_dissimule",
  heures_non_payees: "travail_dissimule",
  cout_horaire_sous_smic: "travail_dissimule",
  sous_traitance_excedentaire: "facturation",
  numero_vente_double: "facturation",
  numero_st_double: "facturation",
  cout_st_superieur_vente: "facturation",
  cout_st_sous_smic: "facturation",
  prix_vente_sous_revient: "facturation",
  cout_st_sous_revient: "facturation",
  facture_sans_heures: "facturation",
  facture_non_payee: "facturation",
  paiement_superieur: "facturation",
  paiement_inferieur: "facturation",
  paiement_sans_facture: "facturation",
  compte_tiers: "facturation",
  vente_sans_commande: "facturation",
  facture_au_dela_commande: "facturation",
  tva_incoherente: "facturation",
  ttc_incoherent: "facturation",
  vente_trop_reglee: "facturation",
  vente_partiellement_reglee: "facturation",
  carte_non_valide: "cnaps",
  agent_hors_dracar: "cnaps",
  carte_expiree: "cnaps",
  carte_bientot_expiree: "cnaps",
  carte_sans_date: "cnaps",
  agent_non_declare_dracar: "cnaps",
  affectation_non_conforme: "cnaps",
  agent_absent_planning: "cnaps",
  agent_hors_planning: "travail_dissimule",
  titre_sejour_expire: "emploi_etranger",
  titre_sejour_bientot_expire: "emploi_etranger",
  titre_sans_date: "emploi_etranger",
  sans_autorisation_travail: "emploi_etranger",
  titre_non_authentifie: "emploi_etranger",
  piece_expiree: "autre",
  dpae_absente: "travail_dissimule",
  dpae_tardive: "travail_dissimule",
  absent_registre: "travail_dissimule",
  contrat_non_signe: "autre",
  visite_absente: "autre",
  visite_depassee: "autre",
  effectif_liste_paie: "travail_dissimule",
};
