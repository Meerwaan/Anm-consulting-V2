import type { CheminEtape } from "@/lib/modules/avancement";

/**
 * Les étapes d'une mission, dans l'ordre d'un audit (demande de Sofia du 21/09/2026) : préparer,
 * saisir, contrôler (DGFiP, URSSAF, CNAPS, l'ordre de sa lettre), conclure. Une seule liste pour
 * la barre latérale et pour le lien « étape suivante » en bas de page.
 */
export interface Etape {
  n: number;
  chemin: CheminEtape;
  libelle: string;
}

export const GROUPES: { titre: string; etapes: Etape[] }[] = [
  { titre: "Préparer", etapes: [{ n: 1, chemin: "pieces", libelle: "Pièces justificatives" }] },
  {
    titre: "Saisir",
    etapes: [
      { n: 2, chemin: "sous-traitance/heures", libelle: "Heures de l’entreprise" },
      { n: 3, chemin: "sous-traitance", libelle: "Sous-traitance" },
    ],
  },
  {
    titre: "Contrôler",
    etapes: [
      { n: 4, chemin: "dgfip", libelle: "DGFiP" },
      { n: 5, chemin: "urssaf", libelle: "URSSAF" },
      { n: 6, chemin: "cnaps", libelle: "CNAPS" },
    ],
  },
  {
    titre: "Conclure",
    etapes: [
      { n: 7, chemin: "actions", libelle: "Plan d’actions" },
      { n: 8, chemin: "rapport", libelle: "Rapport" },
    ],
  },
];

export const ETAPES: Etape[] = GROUPES.flatMap((g) => g.etapes);

/** L'étape à laquelle appartient une adresse. Les dossiers des sous-traitants font partie de l'étape 3. */
export const etapeCourante = (chemin: string, missionId: string): Etape | null => {
  const reste = chemin.replace(`/admin/missions/${missionId}/`, "");
  if (reste.startsWith("sous-traitance/heures")) return ETAPES[1];
  return ETAPES.find((e) => reste === e.chemin || reste.startsWith(`${e.chemin}/`)) ?? null;
};
