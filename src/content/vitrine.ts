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
 * Présentation réécrite par Sofia le 23/09/2026 (transmise par Merwan) : son texte est repris tel quel,
 * il remplace la version du 15/09. Son entreprise n'est plus qualifiée de « PME » (400 collaborateurs
 * au pic). Seule date non écrite par elle : 2024, soit 2003 + vingt et un ans.
 */
export const CONSULTANTE = {
  prenomNom: "Sofia Aoun",
  titre: "Fondatrice d’ANM Consulting · ancienne dirigeante d’une entreprise de sécurité privée",
  anneesDirection: 21,
  /** Titre de sa présentation (page À propos). */
  enTete: "Une expertise née du terrain.",
  /** Sa présentation en une phrase, à la troisième personne (accueil) : le site parle au nom d'ANM, en « nous ». */
  accroche:
    "Après cinq années comme directrice d’exploitation, elle a créé sa propre société de sécurité privée en 2003 et l’a dirigée pendant vingt et un ans. Cette expérience est aujourd’hui au cœur d’ANM Consulting.",
  /** Sa présentation, paragraphe par paragraphe (page À propos) : d'abord le parcours… */
  bio: [
    "Après cinq années comme directrice d’exploitation dans le secteur de la sécurité privée, j’ai créé ma propre société en 2003.",
    "Pendant vingt et un ans, j’ai dirigé cette entreprise, jusqu’à 400 collaborateurs lors des pics d’activité, avec des clients privés, institutionnels et des marchés publics.",
  ],
  /** … puis ce que ce parcours donne à ANM Consulting. */
  bioSuite: [
    "Au cours de ces années, j’ai été directement confrontée aux exigences de conformité du secteur et à différents contrôles : URSSAF (notamment sur les questions de travail dissimulé), DGFiP, Inspection du travail, ainsi que de nombreux contrôles du CNAPS.",
    "Cette expérience est aujourd’hui au cœur d’ANM Consulting.",
  ],
  objectif:
    "Notre objectif : permettre aux dirigeants d’identifier leurs vulnérabilités avant qu’elles ne deviennent des redressements, des sanctions ou des difficultés d’exploitation.",
  intervention:
    "ANM Consulting intervient pour auditer, identifier les écarts, proposer les actions correctives et accompagner leur mise en œuvre, avec une approche concrète et adaptée à la réalité de chaque entreprise.",
  parcours: [
    { periode: "Avant 2003", poste: "Directrice d’exploitation, sécurité privée", detail: "Cinq années sur le terrain : plannings, agents, sites, clients. Là où les écarts naissent, et où un contrôleur va les chercher." },
    { periode: "2003 – 2024", poste: "Fondatrice et dirigeante d’une entreprise de sécurité privée", detail: "Vingt et un ans de direction. Jusqu’à 400 collaborateurs lors des pics d’activité. Clients privés, institutionnels et marchés publics." },
    { periode: "2026", poste: "Création d’ANM Consulting", detail: "Audit, préparation aux contrôles et formation pour les dirigeants de sécurité privée." },
  ],
  citation: "Le problème que l’on voit n’est pas toujours celui qu’il faut traiter en premier. Il faut prendre de la hauteur et anticiper les conséquences avant de décider.",
  /** Son appel à l'action, en fin de présentation. */
  invitation: "Vous dirigez une entreprise de sécurité privée ? Repérez vos écarts avant qu’un contrôleur ne les trouve.",
  invitationTexte: "Contactez ANM Consulting pour réaliser un premier diagnostic de vos principaux points de vigilance.",
} as const;

/**
 * La phrase de Sofia (26/09/2026), à afficher « en gras et en gros » (docs/observatoire/01-phrase-choc.md).
 * Coupée en deux pour la mise en page : la seconde partie porte l'accent typographique.
 */
export const PHRASE_CHOC = {
  debut: "La question n’est pas de savoir combien coûte la mise en conformité, mais combien il vous en coûtera",
  accent: "de ne pas l’avoir faite à temps.",
  auteur: "Sofia Aoun, fondatrice",
} as const;

/**
 * Son manifeste (28/09/2026), version retenue, MOT POUR MOT (docs/observatoire/02-manifeste-sofia.md).
 * Écrit à la première personne : c'est son récit, il reste en « je » et il est signé d'elle.
 * Seule la typographie est ajustée (espaces insécables). Ne pas réécrire.
 */
export const MANIFESTE = {
  ouverture: "Quand tout va bien, vous n’avez pas besoin de moi.",
  ouvertureSuite: "C’est quand ça se complique que mon expérience prend tout son sens.",
  duree: "21 ans à la tête d’une société de sécurité privée.",
  /** Le rythme : une ligne chacune, les retours à la ligne font partie du texte. */
  rythme: ["Les contrôles.", "La pression.", "Les décisions à prendre vite.", "Et ces moments où le dirigeant se retrouve seul face au problème."],
  metier: "Je ne suis pas là pour vous apprendre votre métier.",
  place: "J’ai été à votre place.",
  role: "Quand ça se complique, mon rôle est simple : comprendre vite, identifier ce qui vous expose et trouver avec vous les solutions pour reprendre la main.",
  /** « TVA • Sous-traitance • URSSAF • CNAPS », rendu comme un élément graphique. */
  domaines: ["TVA", "Sous-traitance", "URSSAF", "CNAPS"],
  marque: "ANM Consulting",
  signature: ["J’ai été de votre côté du bureau.", "Aujourd’hui, je suis à vos côtés."],
  auteur: "Sofia Aoun",
} as const;

/**
 * Ce que chaque constat apporte au dirigeant, dit comme un bénéfice. Remplace sur la vitrine la chaîne
 * FAIT → PREUVE → RISQUE → RÉFÉRENCE → ACTION → DÉLAI (REGLE_OR, qui reste la structure du portail).
 */
export const CHAINE_CONSTAT =
  "Chaque constat que nous vous remettons dit ce qui a été vu, sur quelle pièce, ce que cela vous expose, sur quel texte, et ce qu’il faut faire, pour quand.";

/**
 * Les quatre temps d'une mission, dits en « quoi » et en « pourquoi », jamais en « comment »
 * (retour de Sofia du 29/09/2026). Clés = noms de METHODE_4_TEMPS (methode.ts).
 */
export const TEMPS_MISSION: Record<string, string> = {
  Cadrage: "Un entretien avec vous, un périmètre fixé ensemble. Vous savez ce qui sera regardé avant que nous commencions.",
  Collecte: "Les pièces qu’un contrôleur vous demanderait. Sur copies, jamais sur vos originaux.",
  Tests: "Ce qu’un contrôleur rapproche, nous le rapprochons avant lui. Comment ? C’est l’objet de l’audit.",
  Restitution: "Des constats qualifiés, des risques classés, un plan d’actions daté, une réunion d’une heure.",
};

/** Le pont vers l'Observatoire (le blog), d'après le squelette éditorial de Sofia. */
export const PONT_OBSERVATOIRE = {
  phrase: "L’Observatoire vous montre ce qui est arrivé aux autres.",
  accent: "L’audit regarde ce qui se passe chez vous.",
  /** Sa phrase d'accroche de l'Observatoire (03-presentation-observatoire.md). */
  texte: "Savoir ce qui arrive aux autres pour éviter que cela ne vous arrive.",
  lien: "Lire l’Observatoire",
  href: "/observatoire",
} as const;

/**
 * Les contrôles vécus comme dirigeante — chiffres transmis le 15/09/2026.
 * Ce sont SES résultats, jamais une promesse pour le client : la réserve est affichée avec.
 * ⚠ DGFiP : 6 contrôles annoncés, 4 sans redressement + 1 annulé au tribunal administratif = 5 ;
 * le sixième est à préciser par Sofia avant mise en ligne.
 */
export const CONTROLES_VECUS = {
  titre: "Les contrôles, notre fondatrice les a vécus du côté du dirigeant.",
  intro:
    "Vingt et un ans à la tête d’une entreprise de sécurité privée, c’est aussi une quarantaine de contrôles reçus, subis, préparés. Voilà ce qu’ils ont donné.",
  items: [
    { organisme: "CNAPS", nombre: "≈ 30", label: "contrôles", resultat: "Aucune sanction." },
    { organisme: "DGFiP", nombre: "6", label: "contrôles fiscaux", resultat: "4 sans redressement. 1 redressement annulé au tribunal administratif, décharge à 100 %." },
    { organisme: "URSSAF", nombre: "5", label: "contrôles, dont 3 en flagrance", resultat: "0 redressement." },
    { organisme: "Inspection du travail", nombre: "3", label: "contrôles", resultat: "0 redressement." },
  ],
  reserve:
    "Ce sont les résultats de notre fondatrice comme dirigeante, pas une promesse pour votre entreprise : personne ne peut garantir l’issue d’un contrôle. Ce que nous apportons, c’est la méthode qui a produit ces résultats, et l’habitude de préparer avant qu’on frappe à la porte.",
} as const;

/** Accueil — au-dessus de la ligne de flottaison. */
export const HERO = {
  eyebrow: "Audit & préparation aux contrôles · Sécurité privée",
  titre: "Repérez les écarts",
  titreItalique: "avant qu’un contrôleur ne les trouve.",
  texte:
    "CNAPS, URSSAF, DGFiP, Inspection du travail : nous identifions vos vulnérabilités avant qu’un contrôle ne les révèle, à commencer par votre sous-traitance. Un constat factuel, un plan d’actions daté, et le regard d’une dirigeante qui a passé vingt et un ans de votre côté de la table.",
  ctaPrincipal: { label: "Demander un diagnostic flash", href: "/contact?offre=flash" },
  ctaSecondaire: { label: "Ce qu’un contrôleur verrait chez vous", href: "#controleur" },
  chiffres: [
    { valeur: 21, suffixe: " ans", label: "à la tête d’une entreprise de sécurité privée" },
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
      consequence: "Présomption de travail dissimulé. C’est l’écart le plus fréquent, et le moins préparé.",
      criticite: "Critique",
    },
    {
      organisme: "Sous-traitance",
      fait: "Un sous-traitant à jour de ses attestations, qui facture plus d’heures que ses salariés déclarés ne peuvent en faire.",
      consequence: "Solidarité financière sur ses dettes sociales et fiscales et, selon les cas, un risque pénal pour le dirigeant.",
      criticite: "Critique",
    },
  ],
  conclusion: "Vos documents existent sans doute. La vraie question est de savoir s’ils résistent au rapprochement entre eux.",
} as const;

/**
 * Trois fiches de constat qui tournent dans le hero. Exemples anonymes, chiffres fictifs.
 *
 * Retour de Sofia (29/09/2026) : « montrer où se trouve le risque sans donner gratuitement toute la
 * méthode permettant de le neutraliser ». La fiche montre donc le fait, la preuve, le risque et le
 * texte (ce que l'administration regarde, et qui est public) ; l'action corrective n'est pas écrite
 * sur la vitrine, elle est `masquee` : la fiche affiche un bandeau caviardé « détaillée dans le rapport ».
 * Aucune action réelle n'est présente dans le code, pour qu'elle ne sorte pas non plus dans le HTML.
 */
export type LigneFiche = { cle: string; valeur: string } | { cle: string; masquee: string };

export const FICHES_EXEMPLE: readonly {
  numero: string;
  total: string;
  domaine: string;
  criticite: string;
  priorite: string;
  lignes: readonly LigneFiche[];
}[] = [
  {
    numero: "047",
    total: "120",
    domaine: "CNAPS",
    criticite: "Critique",
    priorite: "P1 — Immédiat",
    lignes: [
      { cle: "Fait constaté", valeur: "Trois agents en poste sur un même site client avec une carte professionnelle expirée depuis 41 jours." },
      { cle: "Preuve", valeur: "Export Dracar du 02/09/2026 et planning de la semaine 35." },
      { cle: "Risque", valeur: "Sanction administrative CNAPS, retrait d’autorisation possible, responsabilité du dirigeant." },
      { cle: "Action", masquee: "Détaillée dans le rapport" },
      { cle: "Référence", valeur: "Code de la sécurité intérieure, art. L. 612-20 (vérifié le 07/09/2026)." },
    ],
  },
  {
    numero: "083",
    total: "120",
    domaine: "URSSAF",
    criticite: "Majeur",
    priorite: "P2 — 30 jours",
    lignes: [
      { cle: "Fait constaté", valeur: "Sur un échantillon de 12 bulletins, 4 paniers repas versés sans vacation de nuit correspondante." },
      { cle: "Preuve", valeur: "Bulletins de juin à août 2026 et plannings de la même période." },
      { cle: "Risque", valeur: "Réintégration dans l’assiette, redressement sur trois ans avec majorations." },
      { cle: "Action", masquee: "Détaillée dans le rapport" },
      { cle: "Référence", valeur: "Convention collective IDCC 1351 ; BOSS, frais professionnels (vérifié le 07/09/2026)." },
    ],
  },
  {
    numero: "102",
    total: "120",
    domaine: "Sous-traitance",
    criticite: "Critique",
    priorite: "P1 — Immédiat",
    lignes: [
      { cle: "Fait constaté", valeur: "Un sous-traitant facture 2 400 heures par mois ; son attestation de vigilance déclare six salariés." },
      { cle: "Preuve", valeur: "Attestation de vigilance du 15/07/2026 ; factures de juin à août 2026." },
      { cle: "Risque", valeur: "Faisabilité non démontrée : solidarité financière sur ses dettes, recours au travail dissimulé présumé." },
      { cle: "Action", masquee: "Détaillée dans le rapport" },
      { cle: "Référence", valeur: "Code du travail, art. L. 8222-1 et D. 8222-5 (vérifié le 07/09/2026)." },
    ],
  },
];

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
      "Non, et personne ne peut le faire honnêtement. Ce que nous garantissons, c’est une photographie factuelle de votre situation, des preuves identifiées, des risques hiérarchisés et un plan d’actions daté. Ce qu’un contrôleur trouvera, vous l’aurez vu avant lui.",
  },
  {
    question: "J’ai déjà un expert-comptable et un avocat.",
    reponse:
      "Tant mieux, vous en aurez besoin. Nous ne les remplaçons pas : nous préparons le terrain pour eux. Un dossier reconstitué, indexé et daté leur fait gagner des heures, et leur analyse part de faits vérifiés au lieu de suppositions. Les questions juridiques ou fiscales réglementées leur reviennent.",
  },
  {
    question: "Combien de temps ça prend, et qu’est-ce que je dois fournir ?",
    reponse:
      "De une demi-journée pour un diagnostic flash à cinq jours pour un audit 360° d’une PME multi-sites. La liste des pièces vous est envoyée dès le cadrage, et nous travaillons sur copies, jamais sur vos originaux. Le portail vous dit à tout moment ce qui manque.",
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
 * La page n'en montre que trois (`apercu`) : les dix sont dans `checklists.ts`, qui n'est lu que
 * côté serveur et part par email. Retour de Sofia du 29/09/2026 : ne pas publier toute la grille.
 */
export const CHECKLISTS: {
  id: ChecklistId;
  organisme: string;
  titre: string;
  texte: string;
  /** Les trois premiers points de la checklist complète (checklists.ts), seuls visibles sur la page. */
  apercu: readonly [string, string, string];
  /** Nombre de points de la checklist complète envoyée par email. */
  nbPoints: number;
  /** Ressources annoncées pour ce contrôleur — issues des modules de formation prévus, à écrire. */
  aVenir: { titre: string; type: "Guide" | "Checklist" | "Outil" }[];
}[] = [
  {
    id: "cnaps",
    organisme: "CNAPS",
    titre: "Êtes-vous prêt pour un contrôle CNAPS ?",
    texte:
      "Dix points, dix minutes. Ce que le CNAPS vérifie en premier : autorisation, agrément, cartes, Dracar, contrats, sous-traitance, terrain.",
    apercu: [
      "Autorisation d’exercer à jour pour chaque établissement",
      "Cartes professionnelles : aucune expirée, activité adaptée au poste",
      "Sous-traitants autorisés, attestations de vigilance de moins de six mois",
    ],
    nbPoints: 10,
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
    apercu: [
      "DPAE transmise avant chaque prise de poste, sans exception",
      "Primes, paniers et indemnités justifiés par le planning réel (nuit, vacation, dimanche)",
      "Attestations de vigilance des sous-traitants renouvelées tous les six mois",
    ],
    nbPoints: 10,
    aVenir: [
      { titre: "Lire et contrôler un bulletin de paie sécurité privée (IDCC 1351)", type: "Guide" },
      { titre: "Primes, paniers, frais : ce qui entre dans l’assiette", type: "Checklist" },
      { titre: "Heures vendues, heures réalisées : l’écart à surveiller", type: "Outil" },
    ],
  },
  {
    id: "inspection",
    organisme: "Inspection du travail",
    titre: "Êtes-vous prêt pour une visite de l’Inspection du travail ?",
    texte:
      "Durées, repos, prévention, documents obligatoires : ce que l’inspecteur demande dès son arrivée, et ce qu’il vérifie sur un site en vingt minutes.",
    apercu: [
      "DUERP rédigé, mis à jour dans l’année, adapté aux risques réels des sites",
      "Durées maximales de travail et repos quotidien et hebdomadaire respectés sur les plannings",
      "Travail isolé : procédure écrite et moyen d’alerte fonctionnel",
    ],
    nbPoints: 10,
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
    apercu: [
      "Fichier des écritures comptables (FEC) exportable et conforme, testé avant toute demande",
      "Factures complètes : mentions obligatoires et numéro d’autorisation CNAPS",
      "TVA collectée et déductible cohérentes avec les déclarations déposées",
    ],
    nbPoints: 10,
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
  { etape: "03", titre: "La mission, suivie dans votre espace", texte: "Vous déposez les pièces, vous suivez chaque étape, vous recevez le rapport et le plan d’actions." },
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
