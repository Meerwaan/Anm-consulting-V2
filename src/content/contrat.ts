/**
 * Le contrat de prestation de services, texte de Sofia reçu le 24/09/2026 (transmis par Merwan).
 * Repris mot pour mot : seuls les crochets sont remplis par l'outil. Les repères {…} sont remplacés
 * au moment de produire le PDF (voir DocumentContrat) ; ne pas retoucher le texte sans son accord.
 */

export type Bloc = string | { liste: string[] };

export interface Article {
  n: number;
  titre: string;
  blocs: Bloc[];
}

export const ARTICLES_CONTRAT: Article[] = [
  {
    n: 1,
    titre: "Objet du contrat",
    blocs: [
      "Le présent contrat définit les conditions dans lesquelles ANM Consulting réalise pour le Client une prestation d’audit, de diagnostic, de préparation aux contrôles, de mise en conformité et/ou de suivi conformité.",
      "La prestation souscrite est précisée dans le devis ou la proposition commerciale accepté(e) par le Client, qui constitue une annexe contractuelle.",
      "Selon la formule choisie, la mission peut notamment porter sur :",
      {
        liste: [
          "la réglementation applicable aux entreprises de sécurité privée ;",
          "les obligations relevant du CNAPS ;",
          "les obligations sociales et la préparation aux contrôles URSSAF ;",
          "les obligations liées à l’Inspection du travail ;",
          "les éléments fiscaux et administratifs nécessaires à la préparation d’un contrôle DGFiP ;",
          "la sous-traitance et le devoir de vigilance ;",
          "les procédures et documents internes ;",
          "le rapprochement entre exploitation, planning, présence, paie et facturation ;",
          "l’identification des écarts et points de vigilance ;",
          "l’établissement d’un plan d’actions correctives ;",
          "le suivi de la mise en œuvre des actions.",
        ],
      },
    ],
  },
  {
    n: 2,
    titre: "Prestations",
    blocs: [
      "Selon le devis accepté, ANM Consulting peut notamment réaliser :",
      "{SOUS:2.1 Diagnostic Flash}",
      "Entretien avec le dirigeant, examen ciblé de documents et identification des principaux points de vigilance.",
      "{SOUS:2.2 Audits spécialisés}",
      "Audit ciblé portant notamment sur :",
      { liste: ["CNAPS ;", "social / URSSAF ;", "Inspection du travail ;", "préparation au contrôle fiscal DGFiP ;", "sous-traitance et exploitation."] },
      "{SOUS:2.3 Audit 360° Sécurité Privée}",
      "Audit transversal permettant de croiser les différents domaines de conformité et d’établir un plan d’actions global.",
      "{SOUS:2.4 Préparation à un contrôle}",
      "Analyse préalable des documents et pratiques concernés par un contrôle annoncé, identification des points de vigilance et préparation du dossier.",
      "{SOUS:2.5 Accompagnement à la mise en conformité}",
      "Accompagnement du Client dans la mise en œuvre des actions correctives définies à l’issue de l’audit.",
      "{SOUS:2.6 Suivi conformité}",
      "Selon la formule souscrite : revues périodiques, suivi des actions, échéances et points de vigilance.",
      "Le détail, la durée et le prix de la prestation sont précisés dans le devis.",
    ],
  },
  {
    n: 3,
    titre: "Méthodologie",
    blocs: [
      "ANM Consulting réalise ses missions selon une approche fondée sur :",
      "{CHAINE}",
      "Les constats sont établis à partir des documents, informations et éléments effectivement communiqués ou observés dans le cadre de la mission.",
      "Lorsque cela est pertinent, les écarts sont hiérarchisés par niveau de priorité et intégrés dans un plan d’actions.",
    ],
  },
  {
    n: 4,
    titre: "Documents et livrables",
    blocs: [
      "Selon la prestation souscrite, ANM Consulting peut remettre au Client :",
      {
        liste: [
          "une synthèse du diagnostic ;",
          "un rapport d’audit ;",
          "des fiches de constats ;",
          "une identification des pièces manquantes ;",
          "une hiérarchisation des risques ;",
          "un plan d’actions correctives ;",
          "des recommandations opérationnelles ;",
          "un tableau de suivi de conformité ;",
          "tout autre livrable expressément prévu au devis.",
        ],
      },
      "Les livrables effectivement compris dans la prestation sont ceux mentionnés dans le devis accepté.",
    ],
  },
  {
    n: 5,
    titre: "Obligations du Client",
    blocs: [
      "Le Client s’engage à :",
      {
        liste: [
          "communiquer les informations nécessaires à la réalisation de la mission ;",
          "fournir des documents exacts, sincères et à jour ;",
          "transmettre les pièces dans les délais convenus ;",
          "informer ANM Consulting de tout élément susceptible d’avoir une incidence sur la mission ;",
          "désigner, lorsque nécessaire, un interlocuteur disponible ;",
          "permettre l’accès aux informations et documents nécessaires ;",
          "mettre en œuvre, sous sa responsabilité, les actions correctives qu’il décide d’adopter.",
        ],
      },
      "Le Client demeure seul responsable de l’organisation et de la conformité de son entreprise.",
    ],
  },
  {
    n: 6,
    titre: "Obligations d’ANM Consulting",
    blocs: [
      "ANM Consulting s’engage à réaliser la mission avec diligence, sérieux et indépendance, conformément au périmètre défini dans le devis.",
      "ANM Consulting s’engage notamment à :",
      {
        liste: [
          "analyser les éléments transmis ;",
          "signaler les écarts identifiés dans le périmètre de la mission ;",
          "présenter les éléments permettant de comprendre les points de vigilance ;",
          "proposer, lorsque cela est prévu, des actions correctives ;",
          "respecter la confidentialité des informations communiquées.",
        ],
      },
      "La prestation constitue une obligation de moyens.",
    ],
  },
  {
    n: 7,
    titre: "Périmètre et limites de la mission",
    blocs: [
      "ANM Consulting intervient dans le cadre d’une prestation d’audit, de diagnostic, de préparation et d’accompagnement.",
      "ANM Consulting ne constitue pas :",
      {
        liste: [
          "une autorité administrative ;",
          "un organisme de contrôle ;",
          "un organisme certificateur ;",
          "un cabinet d’avocat ;",
          "un cabinet d’expertise comptable.",
        ],
      },
      "ANM Consulting ne réalise pas de consultation juridique ou fiscale réglementée, de représentation contentieuse, de tenue de comptabilité ou de paie.",
      "Lorsque l’analyse nécessite l’intervention d’un professionnel réglementé, le Client est invité à se rapprocher de son avocat, expert-comptable ou autre conseil compétent.",
    ],
  },
  {
    n: 8,
    titre: "Absence de garantie de résultat",
    blocs: [
      "ANM Consulting ne garantit pas l’absence de contrôle, de redressement, de sanction ou de demande complémentaire d’une administration ou d’un organisme de contrôle.",
      "La mission a pour objet de permettre au Client de disposer d’une photographie factuelle de sa situation, d’identifier ses points de vigilance et de mettre en place les actions correctives appropriées.",
      "Les recommandations formulées ne se substituent pas aux décisions du Client ni aux décisions des autorités compétentes.",
    ],
  },
  {
    n: 9,
    titre: "Confidentialité",
    blocs: [
      "ANM Consulting s’engage à conserver confidentiels les documents, données et informations auxquels elle accède dans le cadre de la mission.",
      "Le Client s’engage également à ne pas diffuser à des tiers les méthodes, outils internes ou documents propriétaires d’ANM Consulting sans autorisation préalable.",
      "Cette obligation demeure applicable après la fin du contrat.",
    ],
  },
  {
    n: 10,
    titre: "Données personnelles",
    blocs: [
      "Lorsque la mission implique le traitement de données à caractère personnel, les Parties s’engagent à respecter la réglementation applicable en matière de protection des données.",
      "Le Client s’engage à ne transmettre à ANM Consulting que les données nécessaires à la réalisation de la mission et à s’assurer qu’il dispose des droits nécessaires à leur transmission.",
      "Lorsque cela est nécessaire, un document spécifique relatif au traitement des données pourra être établi.",
    ],
  },
  {
    n: 11,
    titre: "Propriété des outils et méthodes",
    blocs: [
      "Les méthodes, grilles, outils d’audit, questionnaires, modèles, supports et méthodologies développés par ANM Consulting demeurent sa propriété.",
      "Le Client bénéficie d’un droit d’utilisation des livrables qui lui sont remis pour les besoins de sa propre activité.",
      "Toute reproduction, diffusion, commercialisation ou transmission à des tiers des outils propriétaires d’ANM Consulting est interdite sans autorisation écrite préalable.",
    ],
  },
  {
    n: 12,
    titre: "Prix",
    blocs: [
      "Le prix de la prestation est celui indiqué dans le devis accepté par le Client.",
      "{MONTANTS}",
      "Toute prestation supplémentaire non prévue au devis initial fera l’objet d’un devis complémentaire ou d’un accord écrit préalable.",
      "Les frais de déplacement ou autres frais éventuels sont précisés dans le devis.",
    ],
  },
  {
    n: 13,
    titre: "Conditions de paiement",
    blocs: [
      "Les modalités de paiement sont précisées dans le devis.",
      "À défaut de disposition particulière :",
      "{ECHEANCIER}",
      "Les factures sont payables selon le délai indiqué sur celles-ci.",
      "Tout retard de paiement entraîne l’application des pénalités prévues par la réglementation applicable entre professionnels ainsi que de l’indemnité forfaitaire pour frais de recouvrement prévue par la loi.",
    ],
  },
  {
    n: 14,
    titre: "Suspension de la mission",
    blocs: [
      "En cas de retard de paiement ou de non-transmission des éléments nécessaires à la mission, ANM Consulting pourra suspendre l’exécution de la prestation après information du Client.",
      "La suspension pourra entraîner un report du calendrier initialement prévu.",
    ],
  },
  {
    n: 15,
    titre: "Délais",
    blocs: [
      "Le calendrier de réalisation est défini dans le devis ou communiqué au Client lors du cadrage de la mission.",
      "Les délais peuvent être modifiés lorsque :",
      {
        liste: [
          "les documents nécessaires ne sont pas transmis dans les délais ;",
          "le Client demande une modification du périmètre ;",
          "des informations complémentaires sont nécessaires ;",
          "un événement indépendant de la volonté d’ANM Consulting empêche temporairement la réalisation de la mission.",
        ],
      },
    ],
  },
  {
    n: 16,
    titre: "Responsabilité",
    blocs: [
      "ANM Consulting ne pourra être tenue responsable des conséquences résultant notamment :",
      {
        liste: [
          "d’informations inexactes ou incomplètes transmises par le Client ;",
          "de documents non communiqués ;",
          "d’une modification réglementaire postérieure à l’analyse ;",
          "d’une décision prise par le Client contrairement aux recommandations formulées ;",
          "de l’absence de mise en œuvre des actions correctives proposées ;",
          "d’une décision prise par une autorité administrative ou judiciaire.",
        ],
      },
      "ANM Consulting ne peut garantir l’issue d’un contrôle ou d’une procédure administrative.",
    ],
  },
  {
    n: 17,
    titre: "Résultats et utilisation des rapports",
    blocs: [
      "Les rapports et livrables sont destinés au Client dans le cadre de la mission.",
      "Le Client reste responsable de l’utilisation qui en est faite.",
      "Les conclusions sont établies sur la base des éléments disponibles au moment de l’audit et dans le périmètre défini contractuellement.",
    ],
  },
  {
    n: 18,
    titre: "Durée",
    blocs: [
      "Le contrat prend effet à compter de sa signature.",
      "Pour une mission ponctuelle, il prend fin à la réalisation des prestations prévues et au règlement des sommes dues.",
      "Pour un accompagnement récurrent, la durée et les modalités de renouvellement sont précisées dans le devis ou la proposition commerciale.",
    ],
  },
  {
    n: 19,
    titre: "Résiliation",
    blocs: [
      "En cas de manquement grave de l’une des Parties à ses obligations, l’autre Partie pourra mettre fin au contrat après mise en demeure restée sans effet dans le délai indiqué dans celle-ci.",
      "Les prestations déjà réalisées restent dues.",
      "Les dispositions relatives à la confidentialité, à la propriété intellectuelle et aux sommes dues restent applicables après la fin du contrat.",
    ],
  },
  {
    n: 20,
    titre: "Référence commerciale",
    blocs: [
      "ANM Consulting ne pourra utiliser le nom, le logo ou l’identité du Client comme référence commerciale qu’avec son accord préalable.",
      "Aucune information confidentielle concernant le Client ne pourra être publiée sans autorisation.",
    ],
  },
  {
    n: 21,
    titre: "Règlement amiable",
    blocs: [
      "En cas de différend relatif à l’interprétation ou à l’exécution du présent contrat, les Parties s’engagent à rechercher prioritairement une solution amiable.",
      "Elles pourront convenir d’une médiation conventionnelle avant toute procédure judiciaire.",
    ],
  },
  {
    n: 22,
    titre: "Droit applicable",
    blocs: [
      "Le présent contrat est soumis au droit français.",
      "À défaut de résolution amiable, tout litige sera soumis aux juridictions compétentes conformément aux règles de droit commun applicables.",
    ],
  },
  {
    n: 23,
    titre: "Documents contractuels",
    blocs: [
      "Font partie intégrante du présent contrat :",
      "{NUMEROTEE:le présent contrat ;|le devis ou la proposition commerciale accepté(e) ;|la lettre de mission, lorsqu’elle existe ;|les éventuelles annexes.}",
      "En cas de contradiction, les conditions particulières figurant dans le devis ou la lettre de mission prévalent sur les dispositions générales du présent contrat.",
    ],
  },
];

/** La chaîne de l'article 3, telle qu'elle figure dans son texte. */
export const CHAINE_METHODE = ["FAIT", "PREUVE", "RISQUE", "RÉFÉRENCE", "ACTION", "DÉLAI"];

/**
 * Les livrables de l'article 4 qu'on coche par défaut selon la prestation (modifiables dans l'outil).
 * « tout autre livrable expressément prévu au devis » n'est pas proposé : il se saisit en toutes lettres.
 */
export const LIVRABLES = [
  "une synthèse du diagnostic",
  "un rapport d’audit",
  "des fiches de constats",
  "une identification des pièces manquantes",
  "une hiérarchisation des risques",
  "un plan d’actions correctives",
  "des recommandations opérationnelles",
  "un tableau de suivi de conformité",
] as const;

export const LIVRABLES_PAR_PRESTATION: Record<string, readonly string[]> = {
  flash: ["une synthèse du diagnostic", "une identification des pièces manquantes", "des recommandations opérationnelles"],
  suivi_conformite: ["un tableau de suivi de conformité", "des recommandations opérationnelles"],
  audit: [
    "un rapport d’audit",
    "des fiches de constats",
    "une identification des pièces manquantes",
    "une hiérarchisation des risques",
    "un plan d’actions correctives",
    "des recommandations opérationnelles",
  ],
};

/** L'article 2 qui décrit chaque offre du site. */
export const ARTICLE_PRESTATION: Record<string, string> = {
  flash: "2.1",
  cnaps: "2.2",
  social_urssaf: "2.2",
  inspection: "2.2",
  fiscal: "2.2",
  audit_360: "2.3",
  suivi_conformite: "2.6",
};
