/**
 * Sources officielles citées dans le pack (01 annexe 3, feuilles SOURCES des modules 02→05).
 * Règle du pack : à revérifier avant chaque mission et avant chaque publication ; noter la date de vérification.
 */
export interface SourceOfficielle {
  id: string;
  nom: string;
  url: string;
  usage: string;
  pilier: "cnaps" | "urssaf_social" | "fiscal" | "inspection" | "transversal";
}

export const SOURCES_OFFICIELLES: SourceOfficielle[] = [
  {
    id: "cnaps-referentiels",
    nom: "CNAPS — Référentiels de contrôle",
    url: "https://www.cnaps.interieur.gouv.fr/Publications/Fiches-thematiques/Referentiels-de-controle-a-destination-des-professionnels-de-la-securite-privee",
    usage: "Référentiels surveillance/gardiennage, sous-traitance, travail illégal.",
    pilier: "cnaps",
  },
  {
    id: "cnaps-portail",
    nom: "CNAPS — Portail et démarches",
    url: "https://www.cnaps.interieur.gouv.fr/",
    usage: "Actualités, démarches, outils.",
    pilier: "cnaps",
  },
  {
    id: "cnaps-dracar",
    nom: "CNAPS — Dracar Ultimate, nouvelles obligations (décret du 26/12/2025)",
    url: "https://cnaps.interieur.gouv.fr/Publications/Fiches-thematiques/Parution-du-decret-du-26-12-2025-les-nouvelles-obligations-liees-au-lancement-de-Dracar-Ultimate",
    usage: "Obligations et échéance 2026.",
    pilier: "cnaps",
  },
  {
    id: "urssaf-controle",
    nom: "URSSAF — Le contrôle",
    url: "https://www.urssaf.fr/controle",
    usage: "Déroulement du contrôle et Charte du cotisant contrôlé.",
    pilier: "urssaf_social",
  },
  {
    id: "boss",
    nom: "BOSS — Bulletin officiel de la Sécurité sociale",
    url: "https://boss.gouv.fr/portail/accueil.html",
    usage: "Doctrine sociale : assiette, frais, avantages, exonérations.",
    pilier: "urssaf_social",
  },
  {
    id: "inspection",
    nom: "Ministère du Travail — Inspection du travail",
    url: "https://travail-emploi.gouv.fr/inspection-du-travail",
    usage: "Missions, prérogatives, ressources.",
    pilier: "inspection",
  },
  {
    id: "pna",
    nom: "PNA Inspection du travail 2026-2029",
    url: "https://travail-emploi.gouv.fr/plan-national-daction-de-linspection-du-travail-pna-2026-2029",
    usage: "Priorités nationales de contrôle (plan publié le 08/06/2026).",
    pilier: "inspection",
  },
  {
    id: "idcc-1351",
    nom: "Légifrance — Convention collective Prévention et sécurité (IDCC 1351)",
    url: "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000005635405",
    usage: "Classification, minima, durée du travail, primes.",
    pilier: "urssaf_social",
  },
  {
    id: "bofip",
    nom: "BOFiP — Procédures de contrôle fiscal et garanties du contribuable",
    url: "https://bofip.impots.gouv.fr/",
    usage: "Examen et vérification de comptabilité, TVA, charges, Charte du contribuable vérifié.",
    pilier: "fiscal",
  },
  {
    id: "impots-pro",
    nom: "impots.gouv.fr — Professionnels",
    url: "https://www.impots.gouv.fr/professionnel",
    usage: "FEC, facturation électronique, TVA entreprises.",
    pilier: "fiscal",
  },
];
