/**
 * Textes de l'espace client (/app). Vouvoiement.
 *
 * Règle d'ANM : le client suit l'avancement de SA mission, jamais la méthode d'audit. Les
 * étapes ci-dessous décrivent ce que vit le client (préparer, transmettre, recevoir), pas ce
 * que la consultante contrôle ni comment.
 */
import type { StatutMission, TypeMission } from "@/lib/types";

export const ETAPES_CLIENT: { statut: StatutMission; titre: string; texte: string }[] = [
  {
    statut: "qualification",
    titre: "Préparation",
    texte: "Nous cadrons la mission avec vous : périmètre, calendrier, interlocuteurs.",
  },
  {
    statut: "documents_en_attente",
    titre: "Transmission des pièces",
    texte: "Vous déposez les documents demandés dans l’onglet Pièces. Chaque dépôt nous est signalé.",
  },
  {
    statut: "analyse",
    titre: "Étude du dossier",
    texte: "Nous étudions les pièces reçues. Nous revenons vers vous si un complément est nécessaire.",
  },
  {
    statut: "sur_site",
    titre: "Intervention",
    texte: "Nous intervenons dans vos locaux, à la date convenue ensemble.",
  },
  {
    statut: "rapport",
    titre: "Rédaction du rapport",
    texte: "Nous rédigeons le rapport et le plan d’actions.",
  },
  {
    statut: "restitution",
    titre: "Restitution",
    texte: "Nous vous présentons les conclusions et les priorités, puis le rapport est mis à votre disposition ici.",
  },
  {
    statut: "clos",
    titre: "Mission terminée",
    texte: "Le rapport reste disponible dans cet espace.",
  },
];

export const TYPE_MISSION_CLIENT: Record<TypeMission, string> = {
  flash: "Audit flash",
  cnaps: "Audit CNAPS",
  social_urssaf: "Audit social et URSSAF",
  inspection: "Préparation à l’inspection du travail",
  fiscal: "Audit fiscal",
  audit_360: "Audit 360",
  suivi_conformite: "Suivi de conformité",
};

export const CATEGORIES_PIECES: Record<string, string> = {
  entreprise: "Entreprise",
  cnaps: "CNAPS",
  social: "Social",
  paie: "Paie",
  temps: "Temps de travail",
  sst: "Santé et sécurité au travail",
  cse: "CSE",
  fiscal: "Fiscal",
  sous_traitance: "Sous-traitance",
};

/** Date lisible, à la française, sans décalage de fuseau pour les colonnes `date`. */
export const dateClient = (d: string | null | undefined, avecAnnee = true): string => {
  if (!d) return "";
  const iso = d.length === 10 ? `${d}T12:00:00Z` : d;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    ...(avecAnnee ? { year: "numeric" } : {}),
    timeZone: "Europe/Paris",
  });
};
