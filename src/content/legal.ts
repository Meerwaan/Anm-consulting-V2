/**
 * Source unique des informations légales du site.
 *
 * ⚠ TANT QUE LA SOCIÉTÉ N'EST PAS IMMATRICULÉE, les champs marqués `A_COMPLETER`
 * ne peuvent pas être remplis : dénomination, forme, capital, siège, RCS, SIREN, TVA.
 * Les mentions légales sont obligatoires et leur absence est sanctionnée
 * (jusqu'à 1 an d'emprisonnement et 75 000 € d'amende, art. 6-III LCEN).
 * → Ne pas mettre le site en ligne avant d'avoir remplacé tous les `A_COMPLETER`.
 *
 * Sources vérifiées le 08/09/2026 : service-public.gouv.fr (F31228), cnil.fr, vercel.com/legal.
 */

/** Marqueur des champs qui bloquent la mise en ligne. */
export const A_COMPLETER = "À COMPLÉTER" as const;

export const EDITEUR = {
  /** Dénomination sociale telle qu'immatriculée. */
  denomination: A_COMPLETER,
  /** SASU, EURL, SARL… — décision en cours avec l'expert-comptable (Backlog, phase 1). */
  formeJuridique: A_COMPLETER,
  capitalSocial: A_COMPLETER,
  siege: A_COMPLETER,
  /** Ville du greffe + numéro, ex. « RCS Lille Métropole 123 456 789 ». */
  rcs: A_COMPLETER,
  siren: A_COMPLETER,
  /** Obligatoire dès que la société est assujettie. Si franchise en base de TVA, l'indiquer. */
  tvaIntracommunautaire: A_COMPLETER,
  /** Personne physique responsable du contenu publié (art. 6-III-1 LCEN). */
  directeurPublication: A_COMPLETER,
  email: A_COMPLETER,
  telephone: A_COMPLETER,
} as const;

/**
 * Hébergeur — nom, adresse et téléphone sont obligatoires (art. 6-III-1 LCEN).
 * Relevé sur vercel.com/legal/privacy-policy le 08/09/2026.
 * Vercel ne publie pas de numéro de téléphone : indiquer le contact écrit, et le vérifier
 * à chaque refonte (l'adresse d'une société américaine change sans préavis).
 */
export const HEBERGEUR = {
  nom: "Vercel Inc.",
  adresse: "440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis",
  contact: "privacy@vercel.com",
  site: "https://vercel.com",
} as const;

/**
 * Activité réglementée : à ce stade, NON.
 * L'audit et le conseil aux entreprises de sécurité privée ne relèvent pas eux-mêmes
 * de l'autorisation CNAPS — c'est l'exercice d'une activité de sécurité privée qui l'exige,
 * et ce n'est pas ce que fait ANM Consulting.
 * ⚠ EN REVANCHE, dès le dépôt de la déclaration d'activité de formation (NDA, Backlog phase 1),
 * le numéro de déclaration devra figurer ici ET sur chaque convention de formation.
 */
export const ACTIVITE_REGLEMENTEE = {
  soumise: false,
  numeroDeclarationActivite: null as string | null,
} as const;

/** Sous-traitants au sens du RGPD (art. 28) qui traitent des données pour le compte du site. */
export const SOUS_TRAITANTS = [
  {
    nom: "Vercel Inc.",
    role: "Hébergement du site et du portail",
    pays: "États-Unis",
    garantie: "Clauses contractuelles types + Data Privacy Framework",
  },
  {
    nom: "Supabase",
    role: "Base de données, authentification et stockage des pièces",
    pays: "Union européenne (région Paris, eu-west-3)",
    garantie: "Données hébergées dans l'UE",
  },
  {
    nom: "Resend",
    role: "Envoi des emails transactionnels (lien de connexion, demandes de pièces, notifications)",
    pays: "États-Unis",
    garantie: "Clauses contractuelles types",
  },
  {
    nom: "Stripe",
    role: "Paiement des formations et de l'abonnement (à activer en phase 4)",
    pays: "Irlande / États-Unis",
    garantie: "Clauses contractuelles types",
  },
] as const;

/**
 * Registre des traitements (art. 30 RGPD), version site + portail.
 * Le détail et les mesures de sécurité sont dans docs/RGPD.md.
 */
export const TRAITEMENTS = [
  {
    id: "prospects",
    nom: "Gestion des demandes de contact et de la prospection",
    finalite:
      "Répondre aux demandes reçues par le formulaire de contact et envoyer la checklist CNAPS demandée.",
    donnees: "Nom, email, société, effectif, message.",
    baseLegale:
      "Intérêt légitime (prospection entre professionnels), et consentement pour l'envoi de la checklist.",
    conservation:
      "3 ans à compter du dernier contact resté sans suite (durée recommandée par la CNIL en prospection).",
  },
  {
    id: "comptes",
    nom: "Comptes du portail client",
    finalite: "Donner à chaque client l'accès au suivi de sa mission.",
    donnees: "Email, nom, fonction, organisation de rattachement, journaux de connexion.",
    baseLegale: "Exécution du contrat de mission.",
    conservation: "Durée de la relation contractuelle, puis 5 ans (prescription de droit commun).",
  },
  {
    id: "missions",
    nom: "Dossiers de mission d'audit",
    finalite:
      "Conduire l'audit : pièces remises par le client, constats, plan d'actions, rapport.",
    donnees:
      "Pièces transmises par le client, qui contiennent des données relatives à SES salariés (identité, cartes professionnelles, plannings, bulletins de paie, suivi de santé).",
    baseLegale:
      "Exécution du contrat de mission. Sur les données des salariés du client, ANM Consulting agit comme SOUS-TRAITANT du client, qui reste responsable de traitement.",
    conservation:
      "Durée de la mission, puis archivage 5 ans à des fins de preuve. Suppression ou restitution sur demande du client.",
  },
  {
    id: "formation",
    nom: "Suivi des parcours de formation",
    finalite: "Suivre la progression, délivrer les attestations, justifier auprès des financeurs.",
    donnees: "Identité, progression, résultats de quiz, horodatage des connexions.",
    baseLegale: "Exécution du contrat et obligation légale (organisme de formation).",
    conservation:
      "Conservation longue imposée par la réglementation de la formation professionnelle : ne pas purger sans vérifier la durée applicable.",
  },
] as const;

/**
 * Cookies réellement posés par le site.
 * ⚠ En l'état, le site ne pose AUCUN traceur soumis à consentement : pas de publicité,
 * pas de réseau social, pas d'analytics tiers. Seul le cookie de session du portail est utilisé,
 * et il est exempté de consentement (mécanisme d'authentification, doctrine CNIL).
 * → Aucun bandeau cookies n'est requis tant que cette liste ne change pas.
 * Ajouter un outil de mesure d'audience ou de publicité rend le bandeau obligatoire.
 */
export const COOKIES = [
  {
    nom: "Cookie de session Supabase",
    finalite: "Maintenir la connexion d'un utilisateur au portail.",
    duree: "Durée de la session, révoqué à la déconnexion.",
    consentementRequis: false,
    motifExemption: "Traceur strictement nécessaire à l'authentification (exempté par la CNIL).",
  },
] as const;

export const DERNIERE_MISE_A_JOUR = "8 septembre 2026";
