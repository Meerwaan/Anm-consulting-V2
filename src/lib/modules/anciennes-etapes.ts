import type { CheminEtape } from "./avancement";

/**
 * L'ancien écran de travail en 15 étapes (`/admin/missions/<id>/etapes/<ordre>`, méthode de
 * 0003) a été remplacé le 21/09/2026 par la barre latérale en 8 étapes. Ses adresses (favoris,
 * historique de Safari, anciens liens) mènent désormais à l'étape qui fait aujourd'hui ce travail.
 */
const EQUIVALENCES: Record<string, CheminEtape> = {
  "1": "pieces", // Entretien avec le dirigeant : la mission s'ouvre sur les pièces
  "2": "sous-traitance/heures", // Périmètre : période contrôlée et repères
  "3": "pieces", // Collecte des documents
  "4": "pieces", // Analyse documentaire
  "5": "sous-traitance", // Échantillon (salariés, sites, sous-traitants)
  "6": "cnaps", // Contrôle CNAPS
  "7": "urssaf", // Contrôle social et URSSAF
  "8": "sous-traitance/heures", // Temps de travail
  "9": "urssaf", // Inspection du travail : travail illégal, grille URSSAF
  "10": "sous-traitance/heures", // Rapprochement planning → paie → facturation
  "11": "actions", // Qualification des constats : les anomalies du plan d'actions
  "12": "actions", // Classement des risques
  "13": "actions", // Plan d'actions
  "14": "rapport", // Rapport final
  "15": "rapport", // Restitution
  "hors-etape": "dgfip", // Points « hors étape » : le pilier fiscal
};

/** L'étape de la barre en 8 étapes qui remplace une ancienne étape (les pièces à défaut). */
export const etapeEquivalente = (ordre: string): CheminEtape => EQUIVALENCES[ordre] ?? "pieces";
