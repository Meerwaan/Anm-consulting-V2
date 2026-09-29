/**
 * L’Observatoire ANM : les textes de Sofia (docs/observatoire/, 26 au 28/09/2026), repris mot pour mot.
 * Seuls les libellés d’interface (titres de sections, aides du formulaire, stades) sont d’ANM.
 * Les aides du formulaire citent ses consignes : l’outil structure et publie, il ne rédige pas.
 */

export const OBSERVATOIRE = {
  nom: "L’Observatoire ANM",
  nomLong: "L’Observatoire ANM de la sécurité privée",
  promesse: "Savoir ce qui arrive aux autres pour éviter que cela ne vous arrive.",
  chapeau:
    "Chaque semaine, l’Observatoire ANM décrypte pour les dirigeants de sociétés de sécurité privée les décisions, contrôles et affaires qui peuvent avoir un impact concret sur leur entreprise.",
  sujets: "Jurisprudence, décisions CNAPS, URSSAF, fiscalité, TVA, sous-traitance, travail dissimulé, actualité du secteur…",
  frontiere: "L’Observatoire vous informe. L’audit ANM regarde ce qui se passe chez vous.",
  /** Description courte pour les moteurs et les réseaux (≤ 155 caractères). */
  description:
    "Décisions CNAPS, URSSAF, DGFiP, Inspection du travail : ce qui arrive aux autres sociétés de sécurité privée, décrypté pour les dirigeants.",
  comprendre: {
    titre: "L’Observatoire : comprendre et anticiper",
    intro: ["Ici, pas de théorie inutile.", "Nous décryptons des situations réelles pour vous montrer :"],
    points: [
      "Ce qui s’est passé.",
      "Ce qui a mis l’entreprise en difficulté.",
      "Ce qui a été décidé.",
      "Et les points de vigilance à retenir pour votre propre activité.",
    ],
    promesse: "La promesse de l’Observatoire : vous donner l’information avant qu’elle ne devienne votre problème.",
  },
  audit: {
    titre: "L’audit ANM : passer de l’information à votre réalité",
    intro: [
      "Une situation vous interpelle ? Vous vous demandez si votre entreprise présente le même risque ?",
      "C’est là que commence l’audit.",
      "ANM ne travaille plus sur le cas des autres, mais sur vos propres données.",
      "Contrats, factures, TVA, sous-traitance, plannings, heures réalisées, paie, attestations, paiements : nous croisons les informations pour rechercher les écarts et les incohérences.",
      "À la fin de l’audit, vous savez concrètement :",
    ],
    points: [
      "Où sont vos risques.",
      "Quelles anomalies ont été détectées.",
      "Quelles pièces et opérations sont concernées.",
      "Ce qui doit être traité en priorité.",
      "Et quelles actions correctives mettre en place.",
    ],
  },
  conclusion: ["L’Observatoire vous aide à reconnaître le risque.", "L’audit ANM vous aide à savoir s’il existe chez vous et à agir."],
  pasAvocat:
    "ANM Consulting n’est pas un cabinet d’avocats et ne délivre pas de consultation juridique. Lorsqu’une situation nécessite une analyse juridique, une stratégie contentieuse ou une défense, elle relève d’un professionnel du droit.",
  baseline: "L’Observatoire ANM — Comprendre ce qui arrive aux autres.",
  signatureAnm: "ANM Consulting — Repérez vos écarts avant qu’un contrôleur ne les trouve.",
  /** Signature de chaque fiche (note méthodologique). */
  signature: ["L’Observatoire vous montre ce qui est arrivé aux autres.", "ANM vérifie que cela ne vous arrive pas."],
  /** Mention courte (squelette éditorial, « Frontière avec le conseil juridique »). */
  avertissementCourt:
    "Cette publication présente une analyse générale à partir de sources publiques. Elle ne constitue pas une consultation juridique individualisée.",
} as const;

/** La note méthodologique, publiée telle quelle (gage de sérieux : sources, structure, avertissement). */
export const NOTE_METHODOLOGIQUE = {
  titre: "Note méthodologique",
  description:
    "Sources, structure des fiches, identification des entreprises et avertissement juridique : comment l’Observatoire ANM sélectionne et présente les décisions.",
  sections: [
    {
      id: "objectif",
      titre: "Objectif",
      paragraphes: [
        "L’Observatoire ANM rend accessibles aux dirigeants de sociétés de sécurité privée les décisions et actualités susceptibles d’avoir un impact concret sur leur activité :",
        "DGFiP / TVA – URSSAF – CNAPS – Inspection du travail – sous-traitance – travail dissimulé – facturation – jurisprudence et actualité du secteur.",
      ],
    },
    {
      id: "promesse",
      titre: "Promesse",
      paragraphes: [
        "Savoir ce qui arrive aux autres pour éviter que cela ne vous arrive.",
        "L’objectif n’est pas de transformer le dirigeant en juriste, mais de lui permettre de comprendre rapidement :",
      ],
      liste: ["ce qui s’est passé ;", "ce qui a été reproché ;", "ce qui a été décidé ;", "pourquoi cette affaire doit retenir son attention."],
    },
    {
      id: "sources",
      titre: "Sources",
      paragraphes: [
        "Chaque publication repose prioritairement sur une source officielle et vérifiable : Légifrance, Conseil d’État, Cour de cassation, juridictions administratives, CNAPS, URSSAF, ministère du Travail, DGFiP ou autre organisme public compétent.",
        "La presse peut permettre d’identifier une affaire, mais ne remplace pas la décision lorsqu’elle est accessible.",
        "Chaque fiche mentionne la juridiction, la date, le numéro de la décision et permet, lorsque cela est possible, d’accéder au texte intégral.",
      ],
    },
    {
      id: "structure",
      titre: "Structure de chaque fiche",
      liste: [
        "Une accroche destinée au dirigeant.",
        "Les faits utiles à la compréhension.",
        "Ce qui était reproché à l’entreprise.",
        "La décision effectivement rendue.",
        "Pourquoi cette affaire mérite l’attention d’un dirigeant.",
        "La question ANM : « Et chez vous ? »",
        "La référence permettant de consulter la décision complète.",
      ],
      listeNumerotee: true,
      paragraphesApres: [
        "Le stade de la procédure est toujours précisé. Une décision de référé, par exemple, n’est jamais présentée comme une décision définitive sur le fond.",
      ],
    },
    {
      id: "frontiere",
      titre: "Frontière entre l’Observatoire et l’audit",
      paragraphes: [
        "L’Observatoire explique ce qui est arrivé aux autres.",
        "Il ne dévoile ni les grilles de contrôle ANM, ni les méthodes de rapprochement des données, ni les check-lists exhaustives, ni les procédures d’audit ou plans correctifs détaillés.",
        "L’Observatoire montre le risque.\nL’audit ANM recherche ce risque dans l’entreprise.",
        "L’audit porte sur les données et pratiques propres au client afin d’identifier les écarts, incohérences et zones d’exposition et de permettre au dirigeant de savoir concrètement où se situe son entreprise.",
      ],
    },
    {
      id: "identification",
      titre: "Identification des entreprises",
      paragraphes: [
        "Le nom d’une société peut être repris lorsqu’il figure dans une décision publiquement accessible.",
        "Toutefois, lorsque son identification n’apporte rien à la compréhension de l’affaire, la rédaction privilégie la formulation « une société de sécurité privée ».",
        "Lorsqu’une entreprise est identifiée, une distinction stricte est maintenue entre les faits rapportés, les griefs de l’administration ou de l’autorité, les arguments de l’entreprise et ce qui a effectivement été jugé.",
      ],
    },
    {
      id: "avertissement",
      titre: "Avertissement juridique",
      paragraphes: [
        "Les contenus de L’Observatoire ANM sont publiés exclusivement à des fins d’information générale et de sensibilisation des professionnels de la sécurité privée.",
        "Ils constituent une présentation synthétique et une lecture opérationnelle de décisions, textes, contrôles ou informations accessibles au public.",
        "Ils ne constituent ni une consultation juridique, ni un avis juridique, fiscal ou social individualisé, ni une recommandation quant à la conduite à adopter dans une situation particulière.",
        "Chaque décision est présentée au regard des informations publiquement accessibles à la date de publication. Sa portée dépend de ses faits propres, de la procédure, des arguments des parties et du droit applicable.",
        "Une décision peut faire l’objet d’un recours, être infirmée, annulée ou précisée ultérieurement. La législation, la réglementation et la jurisprudence peuvent également évoluer.",
        "La synthèse publiée par L’Observatoire ANM ne se substitue jamais à la lecture de la décision intégrale, dont la référence est communiquée.",
        "ANM Consulting n’est pas un cabinet d’avocats et n’assure aucune représentation ou défense en justice.",
        "Toute situation nécessitant une interprétation juridique individualisée, la contestation d’un contrôle ou d’une sanction, l’exercice d’un recours ou la définition d’une stratégie contentieuse doit être soumise à un avocat ou au professionnel du droit compétent.",
        "L’intervention d’ANM Consulting porte sur l’analyse opérationnelle des pratiques et données de l’entreprise, l’identification des écarts et zones de risque et l’accompagnement dans l’amélioration de ses procédures, dans les limites de son champ d’intervention.",
      ],
    },
    {
      id: "ligne-editoriale",
      titre: "Ligne éditoriale",
      paragraphes: [
        "Le ton doit rester direct, accessible, factuel et orienté dirigeant.",
        "Pas de cours de droit.\nPas de jargon inutile.\nPas de jugement sur les entreprises concernées.\nEt surtout : ne jamais donner gratuitement la méthode d’audit ANM.",
        "Le lecteur doit terminer chaque article avec une question :",
        "« Et chez moi ? »",
      ],
    },
  ] as {
    id: string;
    titre: string;
    paragraphes?: string[];
    liste?: string[];
    listeNumerotee?: boolean;
    paragraphesApres?: string[];
  }[],
} as const;

/* ------------------------------------------------------------------ */
/* Les cinq territoires éditoriaux (squelette éditorial)                */
/* ------------------------------------------------------------------ */

export type TerritoireId = "cnaps" | "urssaf" | "dgfip" | "inspection_travail" | "economie";

export interface Territoire {
  id: TerritoireId;
  /** Segment d’URL : /observatoire/{slug}. */
  slug: string;
  libelle: string;
  nomLong: string;
  angle: string;
  thematiques: string;
}

export const TERRITOIRES: readonly Territoire[] = [
  {
    id: "cnaps",
    slug: "cnaps",
    libelle: "CNAPS",
    nomLong: "CNAPS",
    angle: "Ce que le CNAPS regarde réellement dans une entreprise.",
    thematiques:
      "Sous-traitance, autorisations, cartes professionnelles, DRACAR, contrôle des dirigeants et des agents, devoir de vigilance, sanctions, retraits et suspensions, décisions administratives, jurisprudence des tribunaux administratifs, des cours administratives d’appel et du Conseil d’État.",
  },
  {
    id: "urssaf",
    slug: "urssaf",
    libelle: "URSSAF",
    nomLong: "URSSAF",
    angle: "Les chiffres de l’entreprise sont-ils cohérents avec l’activité réellement réalisée ?",
    thematiques:
      "Travail dissimulé, sous-traitance, prêt de main-d’œuvre, marchandage, devoir de vigilance, masse salariale, volume d’heures, salariés déclarés, indépendants, redressements, solidarité financière.",
  },
  {
    id: "dgfip",
    slug: "dgfip",
    libelle: "DGFiP",
    nomLong: "DGFiP et TVA",
    angle: "Une facture comptabilisée n’est pas nécessairement une facture sécurisée.",
    thematiques:
      "TVA, factures fictives, factures de complaisance, sous-traitants, réalité des prestations, déductibilité, incohérences comptables, paiements, fournisseurs, justificatifs.",
  },
  {
    id: "inspection_travail",
    slug: "inspection-du-travail",
    libelle: "Inspection du travail",
    nomLong: "Inspection du travail et social",
    angle: "Ce que les documents sociaux racontent réellement de l’organisation de l’entreprise.",
    thematiques:
      "Durée du travail, heures supplémentaires, repos, plannings, prêt de main-d’œuvre, travail dissimulé, convention collective, conditions d’emploi.",
  },
  {
    id: "economie",
    slug: "economie-de-la-securite",
    libelle: "Économie",
    nomLong: "Économie de l’entreprise de sécurité",
    angle: "Faire parler les chiffres avant qu’un contrôleur ne le fasse.",
    thematiques:
      "Heures vendues, heures salariées, sous-traitance, prix horaire, masse salariale, marge, coût réel d’un agent, dépendance à la sous-traitance, défaillances, marchés publics, rentabilité d’un contrat.",
  },
] as const;

export const territoireParId = (id: string): Territoire => TERRITOIRES.find((t) => t.id === id) ?? TERRITOIRES[0];
export const territoireParSlug = (slug: string): Territoire | undefined => TERRITOIRES.find((t) => t.slug === slug);

/* ------------------------------------------------------------------ */
/* Stade de la procédure                                               */
/* ------------------------------------------------------------------ */

export type StadeId = "refere" | "premiere_instance" | "appel" | "cassation" | "definitive" | "sanction_administrative";

export const STADES: readonly { id: StadeId; libelle: string; portee: string }[] = [
  { id: "refere", libelle: "Référé", portee: "Décision provisoire, rendue en urgence : elle ne tranche pas le fond du litige." },
  { id: "premiere_instance", libelle: "Première instance", portee: "Jugement susceptible d’appel : il peut encore être réformé." },
  { id: "appel", libelle: "Appel", portee: "Arrêt d’appel : un pourvoi en cassation reste possible." },
  {
    id: "cassation",
    libelle: "Cassation",
    portee: "Décision de la Cour de cassation ou du Conseil d’État : elle se prononce sur le droit, l’affaire peut être renvoyée.",
  },
  { id: "definitive", libelle: "Décision définitive", portee: "Plus aucun recours n’est ouvert, selon les informations disponibles à la date de publication." },
  {
    id: "sanction_administrative",
    libelle: "Sanction administrative",
    portee: "Décision d’une autorité administrative, susceptible de recours devant le juge.",
  },
] as const;

export const stadeParId = (id: string | null) => STADES.find((s) => s.id === id) ?? null;

/* ------------------------------------------------------------------ */
/* Les cinq questions avant chaque diffusion (squelette éditorial)      */
/* ------------------------------------------------------------------ */

export const QUESTIONS_DIFFUSION = [
  { cle: "q_concerne_dirigeant", texte: "Le sujet concerne-t-il réellement un dirigeant de sécurité privée ?" },
  { cle: "q_source_verifiable", texte: "Existe-t-il un fait, un chiffre, une décision ou une source vérifiable ?" },
  { cle: "q_analyse", texte: "ANM apporte-t-il une analyse et non un simple résumé ?" },
  { cle: "q_sans_methode", texte: "La publication démontre-t-elle l’expertise sans dévoiler toute la méthode d’audit ?" },
  { cle: "q_utilite_anm", texte: "Le lecteur comprend-il pourquoi ANM peut lui être utile ?" },
] as const;

export type CleQuestion = (typeof QUESTIONS_DIFFUSION)[number]["cle"];

/* ------------------------------------------------------------------ */
/* Les blocs d’une fiche, dans l’ordre de la note                       */
/* ------------------------------------------------------------------ */

export const BLOCS_FICHE = [
  {
    cle: "faits",
    titre: "Ce qui s’est passé",
    libelle: "Les faits",
    obligatoire: true,
    aide: "Les faits utiles à la compréhension, rien de plus. Distinguer faits, position de l’administration, arguments de l’entreprise, décision. Nommer la société seulement si cela éclaire l’affaire ; sinon « une société de sécurité privée ».",
  },
  {
    cle: "reproches",
    titre: "Ce qui était reproché",
    libelle: "Les reproches de l’administration",
    obligatoire: true,
    aide: "Les griefs de l’administration ou de l’autorité, présentés comme des griefs, pas comme des faits établis.",
  },
  {
    cle: "defense",
    titre: "Ce que l’entreprise a fait valoir",
    libelle: "La défense de l’entreprise",
    obligatoire: false,
    aide: "Les arguments de l’entreprise, tels que la décision les rapporte. À laisser vide si la décision n’en fait pas état : la section ne s’affichera pas.",
  },
  {
    cle: "decision",
    titre: "Ce qui a été décidé",
    libelle: "La décision rendue",
    obligatoire: true,
    aide: "Ce qui a effectivement été jugé ou décidé. Une décision de référé n’est jamais présentée comme une décision définitive sur le fond.",
  },
  {
    cle: "point_anm",
    titre: "Le point ANM",
    libelle: "Le point ANM",
    obligatoire: true,
    aide: "Montrer où est le risque sans donner la méthode pour le neutraliser. Dépasser le résumé : ce que l’administration a regardé, ce que la décision retient. Ni grille, ni méthode de rapprochement, ni check-list, ni plan correctif.",
  },
  {
    cle: "question",
    titre: "Et chez vous ?",
    libelle: "La question au dirigeant",
    obligatoire: true,
    aide: "La question que le lecteur doit se poser chez lui. Exemple : « Savez-vous combien de salariés votre sous-traitant déclare réellement ? »",
  },
] as const;

export type CleBloc = (typeof BLOCS_FICHE)[number]["cle"];

/* ------------------------------------------------------------------ */
/* Appels à l’action (squelette éditorial : « à varier »)               */
/* ------------------------------------------------------------------ */

export const CTAS = [
  { id: "discussion", titre: "Comment votre entreprise contrôle-t-elle aujourd’hui ce point ?", cta: "En parler avec nous", href: "/contact" },
  {
    id: "diagnostic",
    titre: "Vous souhaitez savoir comment ce risque se matérialiserait dans votre propre organisation ?",
    cta: "Demander un diagnostic",
    href: "/contact?offre=flash",
  },
  { id: "audit", titre: "ANM Consulting audite vos pratiques avant que l’administration ne le fasse.", cta: "Découvrir l’audit 360°", href: "/audit" },
] as const;

/** Un appel à l’action stable par article : le même à chaque visite, variable d’un article à l’autre. */
export const ctaPour = (slug: string) => {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return CTAS[h % CTAS.length];
};
