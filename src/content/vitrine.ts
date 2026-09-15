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

/** La dirigeante — décision 08 : le site porte son nom et son parcours. Bio à recevoir. */
export const CONSULTANTE = {
  prenomNom: A_COMPLETER("Prénom Nom"),
  titre: "Fondatrice d'ANM Consulting",
  anneesDirection: 20,
  accroche:
    "Vingt ans à diriger une entreprise de sécurité privée. Les contrôles CNAPS, URSSAF et Inspection du travail, je les ai vécus du côté du dirigeant.",
  /** Parcours — à remplacer par les vraies étapes, dates et entreprises. */
  parcours: [
    { periode: A_COMPLETER("Année – Année"), poste: A_COMPLETER("Dirigeante, société de sécurité privée"), detail: A_COMPLETER("Effectif, sites, activités (surveillance humaine, événementiel…)") },
    { periode: A_COMPLETER("Année – Année"), poste: A_COMPLETER("Poste précédent"), detail: A_COMPLETER("Ce qui a compté : un contrôle, une réorganisation, une croissance") },
    { periode: "2026", poste: "Création d'ANM Consulting", detail: "Audit, préparation aux contrôles et formation pour les entreprises de sécurité privée." },
  ],
  /** Ce qu'elle a envie de dire d'elle — à recevoir. */
  citation: A_COMPLETER("Une phrase, dans ses mots, sur pourquoi elle fait ce métier."),
} as const;

/** Accueil — au-dessus de la ligne de flottaison. */
export const HERO = {
  eyebrow: "Audit & préparation aux contrôles · Sécurité privée",
  titre: "Repérez les écarts",
  titreItalique: "avant qu'un contrôleur ne les trouve.",
  texte:
    "CNAPS, URSSAF, DGFiP, Inspection du travail, sous-traitance : une photographie factuelle de vos risques, un plan d'actions daté, et un espace pour suivre la mission. Par une dirigeante qui a passé vingt ans de votre côté de la table.",
  ctaPrincipal: { label: "Demander un diagnostic flash", href: "/contact?offre=flash" },
  ctaSecondaire: { label: "Voir la méthode en 15 étapes", href: "/audit#methode" },
  chiffres: [
    { valeur: 20, suffixe: " ans", label: "de direction en sécurité privée" },
    { valeur: 5, suffixe: "", label: "piliers de contrôle" },
    { valeur: 208, suffixe: "", label: "points de contrôle vérifiés" },
    { valeur: 15, suffixe: "", label: "étapes tracées, du cadrage à la restitution" },
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
  titre: "Ce qu'un contrôleur voit en vingt minutes.",
  intro:
    "Aucun de ces écarts n'apparaît dans un bilan. Tous apparaissent dans un planning, un export Dracar ou un bulletin de paie. C'est là que le contrôle commence.",
  cas: [
    {
      organisme: "CNAPS",
      fait: "Un agent en poste avec une carte professionnelle expirée depuis six semaines.",
      consequence: "Sanction administrative, retrait d'autorisation possible, responsabilité personnelle du dirigeant.",
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
      consequence: "Présomption de travail dissimulé. C'est le test le plus fréquent, et le moins préparé.",
      criticite: "Critique",
    },
    {
      organisme: "Sous-traitance",
      fait: "Un sous-traitant sans autorisation d'exercer, sans attestation de vigilance à jour.",
      consequence: "Solidarité financière : ses dettes sociales et fiscales deviennent les vôtres.",
      criticite: "Critique",
    },
  ],
  conclusion: "Un audit sert à voir ces quatre lignes avant lui. Et à les corriger dans l'ordre.",
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
    priorite: "P2 — 30 jours",
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
    texte: "Les risques réels en cas de contrôle d'un côté, les axes d'amélioration de l'autre. Deux pages qui se lisent en dix minutes.",
  },
  {
    titre: "Des constats qui tiennent devant un contrôleur",
    texte: "Chaque écart suit la même chaîne : fait, preuve, risque, référence officielle datée, action, délai. Jamais une hypothèse présentée comme une certitude.",
  },
  {
    titre: "Un plan d'actions priorisé",
    texte: "P1 immédiat, P2 sous 30 jours, P3 sous 90 jours, P4 amélioration continue. Avec un responsable et une échéance pour chaque ligne.",
  },
  {
    titre: "Un dossier prêt pour vos conseils",
    texte: "Indexé, daté, structuré par domaine. Votre avocat et votre expert-comptable partent d'un dossier propre au lieu de reconstituer les faits.",
  },
  {
    titre: "Une restitution d'une heure, pas plus",
    texte: "Pour décider, pas pour écouter : ce qui vous expose vraiment, qui fait quoi pour quand, et ce qui part chez votre avocat ou votre expert-comptable.",
  },
  {
    titre: "Un espace de suivi",
    texte: "Après la mission, le portail devient votre tableau de bord : plan d'actions à cocher, échéances de cartes et d'attestations, revues périodiques.",
  },
] as const;

/** Objections entendues en prospection (10 §7) — réponses courtes, sans promesse. */
export const FAQ = [
  {
    question: "Est-ce que vous garantissez que je n'aurai pas de redressement ?",
    reponse:
      "Non, et personne ne peut le faire honnêtement. Ce que je garantis, c'est une photographie factuelle de votre situation, des preuves identifiées, des risques hiérarchisés et un plan d'actions daté. Ce qu'un contrôleur trouvera, vous l'aurez vu avant lui.",
  },
  {
    question: "J'ai déjà un expert-comptable et un avocat.",
    reponse:
      "Tant mieux, vous en aurez besoin. Je ne les remplace pas : je prépare le terrain pour eux. Un dossier reconstitué, indexé et daté leur fait gagner des heures, et leur analyse part de faits vérifiés au lieu de suppositions. Les questions juridiques ou fiscales réglementées leur reviennent.",
  },
  {
    question: "Combien de temps ça prend, et qu'est-ce que je dois fournir ?",
    reponse:
      "De une demi-journée pour un diagnostic flash à cinq jours pour un audit 360° d'une PME multi-sites. La liste des pièces vous est envoyée dès le cadrage, et je travaille sur copies, jamais sur vos originaux. Le portail vous dit à tout moment ce qui manque.",
  },
  {
    question: "Le contrôle est déjà annoncé. C'est trop tard ?",
    reponse:
      "Non. Un diagnostic flash se cale sous sept jours, avec une majoration d'urgence de 20 %. On se concentre sur ce que le contrôleur regardera en premier, et on prépare la remise des pièces sans créer de nouvelles incohérences.",
  },
  {
    question: "Je suis une petite structure de huit agents. C'est pour moi ?",
    reponse:
      "Oui. Les petites structures sont les plus exposées : une carte expirée ou un panier hors assiette pèse le même poids qu'ailleurs, avec moins de marge pour encaisser. Le diagnostic flash à partir de 590 € HT et le suivi Essentiel à 390 € HT par mois sont faits pour ça.",
  },
  {
    question: "Que deviennent mes documents et les données de mes salariés ?",
    reponse:
      "Elles restent les vôtres. Pendant la mission, ANM Consulting agit comme sous-traitant au sens de l'article 28 du RGPD, avec un avenant à la lettre de mission qui fixe conservation, restitution et suppression. Les données sont hébergées en France, à Paris.",
  },
] as const;

/** Ressources annoncées sur l'accueil — la checklist CNAPS est le lead magnet de la phase 2. */
export const RESSOURCES = [
  { titre: "10 points à vérifier avant un contrôle CNAPS", type: "Checklist", statut: "disponible" },
  { titre: "Préparer les pièces sans créer de nouvelles incohérences", type: "Guide", statut: "a_venir" },
  { titre: "Les documents à contrôler avant de faire intervenir un sous-traitant", type: "Checklist", statut: "a_venir" },
  { titre: "Contrôle fiscal : préparer la remise des pièces", type: "Guide", statut: "a_venir" },
] as const;

/** Le lead magnet. */
export const CHECKLIST_CNAPS = {
  titre: "Êtes-vous prêt pour un contrôle CNAPS ?",
  texte:
    "Dix points, dix minutes. La checklist que je passe en premier chez un client : autorisation, agrément, cartes, Dracar, contrats, sous-traitance, terrain.",
  points: [
    "Autorisation d'exercer à jour pour chaque établissement",
    "Agrément dirigeant valide et affiché",
    "Cartes professionnelles : aucune expirée, activité adaptée au poste",
    "Déclarations mensuelles Dracar Ultimate à jour",
    "Contrats clients avec les mentions obligatoires",
    "Sous-traitants autorisés, attestations de vigilance de moins de six mois",
    "Numéro d'autorisation sur devis, factures et documents commerciaux",
    "Tenue et carte visibles sur site, consignes écrites",
    "Registre du personnel et DPAE cohérents avec le planning",
    "Échéancier des renouvellements tenu, avec alerte à 90 jours",
  ],
  cta: "Recevoir la checklist",
} as const;

/** Ce qui se passe après le formulaire de contact. */
export const APRES_CONTACT = [
  { etape: "01", titre: "Un appel de trente minutes", texte: "Sans engagement. On identifie vos trois principaux risques et on décide de la suite, ou pas." },
  { etape: "02", titre: "Une proposition écrite sous 48 h", texte: "Périmètre, format, prix ferme, liste des pièces. Pas de surprise à la facture." },
  { etape: "03", titre: "La mission, suivie dans votre espace", texte: "Vous déposez les pièces, vous suivez les 15 étapes, vous recevez le rapport et le plan d'actions." },
] as const;

/** Contextes proposés dans le formulaire de contact. */
export const SITUATIONS_CONTACT = [
  { valeur: "preventif", label: "Je veux vérifier où j'en suis, sans contrôle annoncé" },
  { valeur: "controle_annonce", label: "Un contrôle est annoncé" },
  { valeur: "observation", label: "J'ai reçu une observation ou une mise en demeure" },
  { valeur: "sous_traitance", label: "Je veux sécuriser ma sous-traitance" },
  { valeur: "abonnement", label: "Je m'intéresse au suivi conformité" },
  { valeur: "formation", label: "Je m'intéresse à la formation" },
  { valeur: "prescripteur", label: "Je suis avocat, expert-comptable ou prescripteur" },
] as const;
