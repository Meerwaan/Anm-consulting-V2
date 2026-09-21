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
      "Contrôle renouvelé tous les 6 mois pendant l’exécution du contrat",
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
      "Travail dissimulé : points d’alerte",
      "Grille 02 §4",
      [
        "Agent absent des documents transmis",
        "Horaires incohérents",
        "Travailleur présenté comme indépendant sans justification suffisante",
        "Personnel fourni par une autre société",
        "Documents sociaux incomplets ou incohérents",
      ],
      { alerte: true, intro: "Réponds « oui » quand le point d’alerte est constaté." },
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
      "Prêt illicite : points d’alerte",
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
      { alerte: true, intro: "Réponds « oui » quand le point d’alerte est constaté." },
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
      { alerte: true, intro: "Réponds « oui » quand le point d’alerte est constaté." },
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
    { code: "rp-question", titre: "Le volume d’heures facturé aux clients paraît-il compatible avec les effectifs, les heures rémunérées et les capacités de production de l’entreprise ?", source: "Grille 04 §5", type: "choix",
      choix: ["Oui", "Partiellement", "Non", "À vérifier"] },
    { code: "rp-explications", titre: "Éléments permettant d’expliquer le volume non couvert", source: "Grille 04 §6", type: "multi",
      choix: ["Sous-traitance déclarée", "Intérim", "Dirigeant participant à la production", "Heures supplémentaires", "Agents mis à disposition légalement", "Autre établissement de l’entreprise"] },
    { code: "rp-conclusion", titre: "Conclusion", source: "Grille 04 §11", type: "choix",
      choix: ["Aucun écart significatif identifié", "Écart expliqué par des éléments documentés", "Écart nécessitant la production de justificatifs complémentaires", "Volume de sous-traitance potentielle à investiguer", "Suspicion de sous-traitance non documentée"] },
    { code: "rp-justificatifs", titre: "Justificatifs complémentaires demandés", source: "Grille 04 §11", type: "texte" },
    { code: "rp-observations", titre: "Observations du contrôleur", source: "Grille 04 §11", type: "texte" },
  ],
};

// ——— CNAPS : le contrôle Dracar Ultimate (grille 01 §2, recentrée le 21/09/2026) ————————

export const GRILLE_DRACAR: Grille = {
  code: "cnaps",
  titre: "Dracar Ultimate : obligations 2026",
  portee: "mission",
  sections: [
    section("comptes", "Comptes et organisation", "Grille 01 §2", [
      "Espace administrateur créé",
      "Espace gestionnaire créé",
      "Gestionnaires désignés",
      "Établissements rattachés aux comptes concernés",
      "Procédure interne de gestion de Dracar Ultimate définie",
    ]),
    section("salaries", "Salariés", "Grille 01 §2", [
      "Tous les salariés/agents concernés sont rattachés dans Dracar Ultimate",
      "Liste des personnels à jour",
      "Entrées et sorties régulièrement actualisées",
      "Procédure prévue pour la mise à jour immédiate des effectifs",
    ]),
    section("cartes", "Cartes professionnelles", "Grille 01 §2", [
      "Vérification régulière de la validité des cartes professionnelles",
      "Vérification au minimum mensuelle",
      "Vérification avant affectation à un grand événement",
      "Traçabilité des vérifications conservée",
      "Procédure permettant d’empêcher l’affectation d’un agent dont la carte n’est plus valide",
    ]),
    section("demarches", "Démarches CNAPS", "Grille 01 §2", [
      "Demandes effectuées via le compte gestionnaire",
      "Suivi des renouvellements",
      "Suivi des échéances",
      "Lorsque plusieurs activités sont concernées, demandes distinctes effectuées pour chaque activité",
      "Renouvellements distincts par activité lorsque nécessaire",
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

export const GRILLES = { st: GRILLE_SOUS_TRAITANT, rapprochement: GRILLE_RAPPROCHEMENT, cnaps: GRILLE_DRACAR } as const;
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
  cnaps: "Non-conformité CNAPS",
  facturation: "Facturation / TVA (DGFiP)",
  autre: "Autre",
};

/** Nature proposée quand une alerte calculée est transformée en action. */
export const NATURE_PAR_ALERTE: Record<string, string> = {
  mois_sans_attestation: "defaut_vigilance",
  aucune_attestation: "defaut_vigilance",
  authenticite_non_verifiee: "defaut_vigilance",
  renouvellement_tardif: "defaut_vigilance",
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
};
