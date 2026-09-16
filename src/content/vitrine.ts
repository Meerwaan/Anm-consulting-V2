/**
 * Contenu de la vitrine — le registre est « direct et terrain » (décision 09 du 08/09/2026).
 *
 * Tout ce qui est entre crochets est un PLACEHOLDER à faire compléter par la consultante :
 * son nom, sa bio, ses dates, ses chiffres réels. Le reste est repris du pack
 * (00 → 21) et des fichiers src/content/*.ts, qui restent la source de vérité.
 *
 * Règle absolue du pack : jamais de promesse de garantie contre un contrôle ou un redressement.
 */

/** Marqueur visible d'un champ à compléter par la consultante. */
export const A_COMPLETER = (libelle: string) => `[${libelle}]`;

/**
 * La dirigeante — décision 08 : le site porte son nom et son parcours.
 * Bio et chiffres reçus le 15/09/2026 (présentation de Sofia, transmise par Merwan), légèrement
 * retravaillés pour le web. Les dates 1998 et 2024 sont déduites de « cinq années comme directrice
 * d'exploitation » avant 2003 et de « 21 ans » de direction : à confirmer par Sofia.
 */
export const CONSULTANTE = {
  prenomNom: "Sofia Aoun",
  titre: "Fondatrice d’ANM Consulting · ancienne dirigeante de PME de sécurité privée",
  anneesDirection: 21,
  accroche: "J’ai été dirigeante. Aujourd’hui, je mets cette expérience au service des PME.",
  /** La bio, paragraphe par paragraphe (page À propos). */
  bio: [
    "En 2003, j’ai créé ma société de sécurité privée, après cinq années comme directrice d’exploitation. Pendant vingt et un ans, j’ai dirigé cette PME : jusqu’à 400 collaborateurs lors des pics d’activité, des clients privés, des institutionnels et des marchés publics.",
    "J’ai aussi connu la réalité des contrôles, du côté de celle qui les reçoit : URSSAF, DGFiP, travail dissimulé, Inspection du travail, et des dizaines de contrôles du CNAPS.",
    "Avec l’expérience, j’ai compris qu’en entreprise, le problème que l’on voit n’est pas toujours celui qu’il faut traiter en premier. Il faut prendre de la hauteur, élargir son regard et anticiper les conséquences avant de décider.",
    "Aujourd’hui, j’accompagne les PME de sécurité privée dans leur conformité et leur préparation face aux organismes de contrôle. Mon approche vient de l’intérieur : comprendre comment l’entreprise fonctionne vraiment, repérer les points de vigilance, structurer l’information, et donner au dirigeant une méthode pour aborder ces sujets sans les subir.",
    "Mon objectif : que le dirigeant ne subisse plus l’administratif, mais le comprenne et l’anticipe.",
  ],
  parcours: [
    { periode: "1998 – 2003", poste: "Directrice d’exploitation, sécurité privée", detail: "Cinq années sur le terrain : plannings, agents, sites, clients. Là où les écarts naissent, et où un contrôleur va les chercher." },
    { periode: "2003 – 2024", poste: "Fondatrice et dirigeante d’une PME de sécurité privée", detail: "Vingt et un ans de direction. Jusqu’à 400 collaborateurs lors des pics d’activité. Clients privés, institutionnels et marchés publics." },
    { periode: "2026", poste: "Création d’ANM Consulting", detail: "Audit, préparation aux contrôles et formation pour les dirigeants de sécurité privée." },
  ],
  citation: "Le problème que l’on voit n’est pas toujours celui qu’il faut traiter en premier. Il faut prendre de la hauteur et anticiper les conséquences avant de décider.",
  invitation: "Une question de conformité ? Un contrôle à préparer ? Parlons-en.",
} as const;

/**
 * Les contrôles vécus comme dirigeante — chiffres transmis le 15/09/2026.
 * Ce sont SES résultats, jamais une promesse pour le client : la réserve est affichée avec.
 * ⚠ DGFiP : 6 contrôles annoncés, 4 sans redressement + 1 annulé au tribunal administratif = 5 ;
 * le sixième est à préciser par Sofia avant mise en ligne.
 */
export const CONTROLES_VECUS = {
  titre: "Les contrôles, je les ai vécus du côté du dirigeant.",
  intro:
    "Vingt et un ans à la tête d’une PME de sécurité privée, c’est aussi une quarantaine de contrôles reçus, subis, préparés. Voilà ce qu’ils ont donné.",
  items: [
    { organisme: "CNAPS", nombre: "≈ 30", label: "contrôles", resultat: "Aucune sanction." },
    { organisme: "DGFiP", nombre: "6", label: "contrôles fiscaux", resultat: "4 sans redressement. 1 redressement annulé au tribunal administratif, décharge à 100 %." },
    { organisme: "URSSAF", nombre: "5", label: "contrôles, dont 3 en flagrance", resultat: "0 redressement." },
    { organisme: "Inspection du travail", nombre: "3", label: "contrôles", resultat: "0 redressement." },
  ],
  reserve:
    "Ce sont mes résultats de dirigeante, pas une promesse pour votre entreprise : personne ne peut garantir l’issue d’un contrôle. Ce que j’apporte, c’est la méthode qui a produit ces résultats, et l’habitude de préparer avant qu’on frappe à la porte.",
} as const;

/** Accueil — au-dessus de la ligne de flottaison. */
export const HERO = {
  eyebrow: "Audit & préparation aux contrôles · Sécurité privée",
  titre: "Repérez les écarts",
  titreItalique: "avant qu’un contrôleur ne les trouve.",
  texte:
    "CNAPS, URSSAF, DGFiP, Inspection du travail, sous-traitance : une photographie factuelle de vos risques, un plan d’actions daté, et un espace pour suivre la mission. Par une dirigeante qui a passé vingt et un ans de votre côté de la table.",
  ctaPrincipal: { label: "Demander un diagnostic flash", href: "/contact?offre=flash" },
  ctaSecondaire: { label: "Voir la méthode en 15 étapes", href: "/audit#methode" },
  chiffres: [
    { valeur: 21, suffixe: " ans", label: "à la tête d’une PME de sécurité privée" },
    { valeur: 400, suffixe: "", label: "collaborateurs lors des pics d’activité" },
    { valeur: 40, suffixe: "+", label: "contrôles vécus comme dirigeante" },
    { valeur: 208, suffixe: "", label: "points de contrôle vérifiés" },
  ],
} as const;

/** Les organismes et sujets qui défilent sous le hero. */
export const ORGANISMES = [
  "CNAPS",
  "URSSAF",
  "DGFiP",
  "Inspection du travail",
  "DREETS",
  "Dracar Ultimate",
  "IDCC 1351",
  "Sous-traitance",
  "DSN",
  "DUERP",
  "Code de la sécurité intérieure",
  "Livre des procédures fiscales",
] as const;

/**
 * Ce qu'un contrôleur voit en vingt minutes.
 * Cas types, tirés des fiches de la Bible (01) et des modules (02 → 05). Aucun n'est un cas client réel.
 */
export const CE_QUE_VOIT_LE_CONTROLEUR = {
  titre: "Ce qu’un contrôleur voit en vingt minutes.",
  intro:
    "Aucun de ces écarts n’apparaît dans un bilan. Tous apparaissent dans un planning, un export Dracar ou un bulletin de paie. C’est là que le contrôle commence.",
  cas: [
    {
      organisme: "CNAPS",
      fait: "Un agent en poste avec une carte professionnelle expirée depuis six semaines.",
      consequence: "Sanction administrative, retrait d’autorisation possible, responsabilité personnelle du dirigeant.",
      criticite: "Critique",
    },
    {
      organisme: "URSSAF",
      fait: "Des paniers repas et des primes versés sans justificatif, hors assiette de cotisations.",
      consequence: "Redressement sur trois ans, majorations, et un doute jeté sur toute la paie.",
      criticite: "Majeur",
    },
    {
      organisme: "Inspection du travail",
      fait: "Des heures facturées au client qui ne correspondent ni au pointage ni aux bulletins.",
      consequence: "Présomption de travail dissimulé. C’est le test le plus fréquent, et le moins préparé.",
      criticite: "Critique",
    },
    {
      organisme: "Sous-traitance",
      fait: "Un sous-traitant sans autorisation d’exercer, sans attestation de vigilance à jour.",
      consequence: "Solidarité financière : ses dettes sociales et fiscales deviennent les vôtres.",
      criticite: "Critique",
    },
  ],
  conclusion: "Un audit sert à voir ces quatre lignes avant lui. Et à les corriger dans l’ordre.",
} as const;

/** Trois fiches de constat qui tournent dans le hero. Exemples anonymes, chiffres fictifs. */
export const FICHES_EXEMPLE = [
  {
    numero: "047",
    total: "120",
    domaine: "CNAPS",
    criticite: "Critique",
    priorite: "P1 — Immédiat",
    lignes: [
      { cle: "Fait constaté", valeur: "Trois agents en poste sur le site de [Ville] avec une carte professionnelle expirée depuis 41 jours." },
      { cle: "Preuve", valeur: "Export Dracar du 02/09/2026 ; planning semaine 35 ; cartes n° 4472, 5120, 6103." },
      { cle: "Risque", valeur: "Sanction administrative CNAPS, retrait d'autorisation possible, responsabilité du dirigeant." },
      { cle: "Action", valeur: "Retrait immédiat des postes, demande de renouvellement, contrôle mensuel des échéances." },
      { cle: "Référence", valeur: "CSI art. L.612-20 ; référentiel CNAPS surveillance humaine (vérifié le 07/09/2026)." },
    ],
  },
  {
    numero: "083",
    total: "120",
    domaine: "URSSAF",
    criticite: "Majeur",
    priorite: "P2 — 30 jours",
    lignes: [
      { cle: "Fait constaté", valeur: "Sur l'échantillon de 12 bulletins, 4 paniers repas versés sans justificatif de vacation de nuit." },
      { cle: "Preuve", valeur: "Bulletins de juin à août 2026 ; plannings correspondants ; grille IDCC 1351." },
      { cle: "Risque", valeur: "Réintégration dans l'assiette, redressement sur trois ans avec majorations." },
      { cle: "Action", valeur: "Rapprocher panier et planning avant chaque paie, sous la responsabilité du service paie." },
      { cle: "Référence", valeur: "Convention collective IDCC 1351 ; BOSS frais professionnels (vérifié le 07/09/2026)." },
    ],
  },
  {
    numero: "102",
    total: "120",
    domaine: "Sous-traitance",
    criticite: "Critique",
    priorite: "P1 — Immédiat",
    lignes: [
      { cle: "Fait constaté", valeur: "Un sous-traitant intervient sur deux sites sans attestation de vigilance depuis mars 2026." },
      { cle: "Preuve", valeur: "Contrat cadre du 12/01/2026 ; dernière attestation datée du 28/02/2026 ; factures avril à août." },
      { cle: "Risque", valeur: "Solidarité financière sur ses dettes sociales et fiscales ; travail illégal présumé." },
      { cle: "Action", valeur: "Suspendre les affectations, obtenir l'attestation, mettre en place un contrôle semestriel." },
      { cle: "Référence", valeur: "Code du travail art. L.8222-1 et D.8222-5 (vérifié le 07/09/2026)." },
    ],
  },
] as const;

/** Ce que le client repart avec, à la fin d'un audit. */
export const LIVRABLES = [
  {
    titre: "Une synthèse dirigeant en deux axes",
    texte: "Les risques réels en cas de contrôle d’un côté, les axes d’amélioration de l’autre. Deux pages qui se lisent en dix minutes.",
  },
  {
    titre: "Des constats qui tiennent devant un contrôleur",
    texte: "Chaque écart suit la même chaîne : fait, preuve, risque, référence officielle datée, action, délai. Jamais une hypothèse présentée comme une certitude.",
  },
  {
    titre: "Un plan d’actions priorisé",
    texte: "P1 immédiat, P2 sous 30 jours, P3 sous 90 jours, P4 amélioration continue. Avec un responsable et une échéance pour chaque ligne.",
  },
  {
    titre: "Un dossier prêt pour vos conseils",
    texte: "Indexé, daté, structuré par domaine. Votre avocat et votre expert-comptable partent d’un dossier propre au lieu de reconstituer les faits.",
  },
  {
    titre: "Une restitution d’une heure, pas plus",
    texte: "Pour décider, pas pour écouter : ce qui vous expose vraiment, qui fait quoi pour quand, et ce qui part chez votre avocat ou votre expert-comptable.",
  },
  {
    titre: "Un espace de suivi",
    texte: "Après la mission, le portail devient votre tableau de bord : plan d’actions à cocher, échéances de cartes et d’attestations, revues périodiques.",
  },
] as const;

/** Objections entendues en prospection (10 §7) — réponses courtes, sans promesse. */
export const FAQ = [
  {
    question: "Est-ce que vous garantissez que je n’aurai pas de redressement ?",
    reponse:
      "Non, et personne ne peut le faire honnêtement. Ce que je garantis, c’est une photographie factuelle de votre situation, des preuves identifiées, des risques hiérarchisés et un plan d’actions daté. Ce qu’un contrôleur trouvera, vous l’aurez vu avant lui.",
  },
  {
    question: "J’ai déjà un expert-comptable et un avocat.",
    reponse:
      "Tant mieux, vous en aurez besoin. Je ne les remplace pas : je prépare le terrain pour eux. Un dossier reconstitué, indexé et daté leur fait gagner des heures, et leur analyse part de faits vérifiés au lieu de suppositions. Les questions juridiques ou fiscales réglementées leur reviennent.",
  },
  {
    question: "Combien de temps ça prend, et qu’est-ce que je dois fournir ?",
    reponse:
      "De une demi-journée pour un diagnostic flash à cinq jours pour un audit 360° d’une PME multi-sites. La liste des pièces vous est envoyée dès le cadrage, et je travaille sur copies, jamais sur vos originaux. Le portail vous dit à tout moment ce qui manque.",
  },
  {
    question: "Le contrôle est déjà annoncé. C’est trop tard ?",
    reponse:
      "Non. Un diagnostic flash se cale sous sept jours, avec une majoration d’urgence de 20 %. On se concentre sur ce que le contrôleur regardera en premier, et on prépare la remise des pièces sans créer de nouvelles incohérences.",
  },
  {
    question: "Je suis une petite structure de huit agents. C’est pour moi ?",
    reponse:
      "Oui. Les petites structures sont les plus exposées : une carte expirée ou un panier hors assiette pèse le même poids qu’ailleurs, avec moins de marge pour encaisser. Le diagnostic flash à partir de 590 € HT et le suivi Essentiel à 390 € HT par mois sont faits pour ça.",
  },
  {
    question: "Que deviennent mes documents et les données de mes salariés ?",
    reponse:
      "Elles restent les vôtres. Pendant la mission, ANM Consulting agit comme sous-traitant au sens de l’article 28 du RGPD, avec un avenant à la lettre de mission qui fixe conservation, restitution et suppression. Les données sont hébergées en France, à Paris.",
  },
] as const;

export type ChecklistId = "cnaps" | "urssaf" | "inspection" | "fiscal";

/**
 * Les quatre checklists gratuites (lead magnet) — une par contrôleur.
 * Dix points chacune, tirés des modules du pack (03 CNAPS, 04 URSSAF / Inspection, 05 Fiscal).
 * Seuls les quatre premiers points sont lisibles sur la page ; la liste complète part par email.
 */
export const CHECKLISTS: {
  id: ChecklistId;
  organisme: string;
  titre: string;
  texte: string;
  points: string[];
  /** Ressources annoncées pour ce contrôleur — issues des modules de formation prévus, à écrire. */
  aVenir: { titre: string; type: "Guide" | "Checklist" | "Outil" }[];
}[] = [
  {
    id: "cnaps",
    organisme: "CNAPS",
    titre: "Êtes-vous prêt pour un contrôle CNAPS ?",
    texte:
      "Dix points, dix minutes. La checklist que je passe en premier chez un client : autorisation, agrément, cartes, Dracar, contrats, sous-traitance, terrain.",
    points: [
      "Autorisation d’exercer à jour pour chaque établissement",
      "Agrément dirigeant valide et affiché",
      "Cartes professionnelles : aucune expirée, activité adaptée au poste",
      "Déclarations mensuelles Dracar Ultimate à jour",
      "Contrats clients avec les mentions obligatoires",
      "Sous-traitants autorisés, attestations de vigilance de moins de six mois",
      "Numéro d’autorisation sur devis, factures et documents commerciaux",
      "Tenue et carte visibles sur site, consignes écrites",
      "Registre du personnel et DPAE cohérents avec le planning",
      "Échéancier des renouvellements tenu, avec alerte à 90 jours",
    ],
    aVenir: [
      { titre: "Préparer une visite de site : ce que le CNAPS regarde sur place", type: "Guide" },
      { titre: "Les documents à contrôler avant de faire intervenir un sous-traitant", type: "Checklist" },
      { titre: "Suivi des échéances de cartes professionnelles", type: "Outil" },
    ],
  },
  {
    id: "urssaf",
    organisme: "URSSAF",
    titre: "Êtes-vous prêt pour un contrôle URSSAF ?",
    texte:
      "Ce que l’inspecteur du recouvrement rapproche en premier : embauches, bulletins, primes et paniers, heures, DSN, sous-traitance. Dix points pour savoir où vous en êtes.",
    points: [
      "DPAE transmise avant chaque prise de poste, sans exception",
      "Registre unique du personnel à jour, contrats écrits et signés",
      "Classification et salaire de base conformes à la grille IDCC 1351",
      "Primes, paniers et indemnités justifiés par le planning réel (nuit, vacation, dimanche)",
      "Frais professionnels remboursés sur justificatifs, pas en forfait déguisé",
      "Heures supplémentaires et complémentaires payées, majorées et déclarées",
      "DSN mensuelle cohérente avec les bulletins et les effectifs",
      "Temps partiels : avenants signés et limite d’heures complémentaires respectée",
      "Attestations de vigilance des sous-traitants renouvelées tous les six mois",
      "Planning, pointage, paie et facturation rapprochés au moins une fois par trimestre",
    ],
    aVenir: [
      { titre: "Lire et contrôler un bulletin de paie sécurité privée (IDCC 1351)", type: "Guide" },
      { titre: "Primes, paniers, frais : ce qui entre dans l’assiette", type: "Checklist" },
      { titre: "Rapprochement planning, pointage, paie, facturation sur un mois", type: "Outil" },
    ],
  },
  {
    id: "inspection",
    organisme: "Inspection du travail",
    titre: "Êtes-vous prêt pour une visite de l’Inspection du travail ?",
    texte:
      "Durées, repos, prévention, documents obligatoires : ce que l’inspecteur demande dès son arrivée, et ce qu’il vérifie sur un site en vingt minutes.",
    points: [
      "DUERP rédigé, mis à jour dans l’année, adapté aux risques réels des sites",
      "Plans de prévention établis pour les interventions sur sites clients",
      "Durées maximales de travail et repos quotidien et hebdomadaire respectés sur les plannings",
      "Affichages et documents obligatoires disponibles : horaires, convention collective, coordonnées de l’inspection et de la médecine du travail",
      "Suivi médical à jour, renforcé pour les travailleurs de nuit",
      "Travail isolé : procédure écrite et moyen d’alerte fonctionnel",
      "Équipements de protection fournis, tracés, remplacés",
      "CSE en place dès que l’effectif l’impose, élections tracées",
      "Accidents du travail déclarés dans les délais et analysés",
      "Agressions et incidents consignés, avec une procédure connue des agents",
    ],
    aVenir: [
      { titre: "DUERP en sécurité privée : travail isolé, agressions, nuit", type: "Guide" },
      { titre: "Affichages et documents obligatoires à présenter à l’inspecteur", type: "Checklist" },
    ],
  },
  {
    id: "fiscal",
    organisme: "DGFiP",
    titre: "Êtes-vous prêt pour un contrôle fiscal ?",
    texte:
      "Avant de remettre quoi que ce soit au vérificateur : la comptabilité, la facturation et la TVA doivent se rapprocher entre elles, et avec vos plannings. À passer avec votre expert-comptable.",
    points: [
      "Fichier des écritures comptables (FEC) exportable et conforme, testé avant toute demande",
      "Balance, grand livre et liasse fiscale rapprochés sans écart inexpliqué",
      "Chiffre d’affaires facturé rapproché des heures planifiées et pointées",
      "Factures complètes : mentions obligatoires et numéro d’autorisation CNAPS",
      "TVA collectée et déductible cohérentes avec les déclarations déposées",
      "Charges et frais du dirigeant justifiés, usage mixte documenté",
      "Factures de sous-traitants rapprochées des plannings et des agents présents",
      "Comptes courants d’associés et flux avec le dirigeant documentés",
      "Pièces classées, indexées et datées, prêtes à être remises sur demande",
      "Interlocuteur unique désigné et procédure de contrôle comprise avant le premier rendez-vous",
    ],
    aVenir: [
      { titre: "Contrôle fiscal : préparer la remise des pièces sans créer d’incohérences", type: "Guide" },
      { titre: "FEC, balance, grand livre : les tests à faire avant de remettre", type: "Checklist" },
    ],
  },
];

/** Ce qui se passe après le formulaire de contact. */
export const APRES_CONTACT = [
  { etape: "01", titre: "Un appel de trente minutes", texte: "Sans engagement. On identifie vos trois principaux risques et on décide de la suite, ou pas." },
  { etape: "02", titre: "Une proposition écrite sous 48 h", texte: "Périmètre, format, prix ferme, liste des pièces. Pas de surprise à la facture." },
  { etape: "03", titre: "La mission, suivie dans votre espace", texte: "Vous déposez les pièces, vous suivez les 15 étapes, vous recevez le rapport et le plan d’actions." },
] as const;

/** Contextes proposés dans le formulaire de contact. */
export const SITUATIONS_CONTACT = [
  { valeur: "preventif", label: "Je veux vérifier où j’en suis, sans contrôle annoncé" },
  { valeur: "controle_annonce", label: "Un contrôle est annoncé" },
  { valeur: "observation", label: "J’ai reçu une observation ou une mise en demeure" },
  { valeur: "sous_traitance", label: "Je veux sécuriser ma sous-traitance" },
  { valeur: "abonnement", label: "Je m’intéresse au suivi conformité" },
  { valeur: "formation", label: "Je m’intéresse à la formation" },
  { valeur: "prescripteur", label: "Je suis avocat, expert-comptable ou prescripteur" },
] as const;
