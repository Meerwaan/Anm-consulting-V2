/**
 * Les contrôles croisés de l'étape 10 (planning → pointage → paie → facturation).
 *
 * C'est le cœur de la méthode : un écart entre deux sources qui devraient dire la même
 * chose est ce qu'un contrôleur cherche en premier. Le système calcule l'écart ;
 * la consultante le qualifie. Aucun de ces écarts n'est un constat en soi.
 */

export type TypeRapprochement =
  | "agents_cnaps_vs_paie"
  | "heures_planning_vs_pointage"
  | "heures_pointage_vs_paie"
  | "heures_paie_vs_facturation"
  | "sous_traitants_contrats_vs_vigilance"
  | "effectif_paie_vs_dsn";

export interface Rapprochement {
  kind: TypeRapprochement;
  titre: string;
  libelleA: string;
  libelleB: string;
  unite: string;
  /** Écart en deçà duquel on ne s'alarme pas, en %. 0 = toute différence compte. */
  toleranceParDefaut: number;
  pourquoi: string;
}

export const RAPPROCHEMENTS: Rapprochement[] = [
  {
    kind: "agents_cnaps_vs_paie",
    titre: "Agents détenteurs d'une carte professionnelle vs effectif en paie",
    libelleA: "Agents avec carte valide",
    libelleB: "Agents sur les bulletins",
    unite: "agents",
    toleranceParDefaut: 0,
    pourquoi:
      "Un agent payé sans carte valide est un exercice illégal. Aucune tolérance : c'est le premier croisement que fait le CNAPS.",
  },
  {
    kind: "heures_planning_vs_pointage",
    titre: "Heures planifiées vs heures pointées",
    libelleA: "Heures au planning",
    libelleB: "Heures pointées",
    unite: "heures",
    toleranceParDefaut: 5,
    pourquoi:
      "Un écart normal existe (remplacements, absences). Un écart large signale un planning théorique que personne ne tient.",
  },
  {
    kind: "heures_pointage_vs_paie",
    titre: "Heures pointées vs heures payées",
    libelleA: "Heures pointées",
    libelleB: "Heures sur les bulletins",
    unite: "heures",
    toleranceParDefaut: 1,
    pourquoi:
      "Des heures travaillées et non payées, c'est du travail dissimulé (C. trav. art. L8221-5). Terrain commun URSSAF et inspection.",
  },
  {
    kind: "heures_paie_vs_facturation",
    titre: "Heures payées vs heures facturées au client",
    libelleA: "Heures payées",
    libelleB: "Heures facturées",
    unite: "heures",
    toleranceParDefaut: 10,
    pourquoi:
      "Facturer nettement plus qu'on ne paie interroge sur la sous-traitance non déclarée ; facturer nettement moins interroge sur la rentabilité et sur la réalité des prestations.",
  },
  {
    kind: "sous_traitants_contrats_vs_vigilance",
    titre: "Sous-traitants sous contrat vs attestations de vigilance à jour",
    libelleA: "Sous-traitants actifs",
    libelleB: "Attestations de moins de 6 mois",
    unite: "sous-traitants",
    toleranceParDefaut: 0,
    pourquoi:
      "Chaque manquant expose le dirigeant à la solidarité financière des dettes du sous-traitant (C. trav. art. L8222-2).",
  },
  {
    kind: "effectif_paie_vs_dsn",
    titre: "Effectif en paie vs effectif déclaré en DSN",
    libelleA: "Salariés sur les bulletins",
    libelleB: "Salariés en DSN",
    unite: "salariés",
    toleranceParDefaut: 0,
    pourquoi: "Un salarié payé et non déclaré est le cas d'école du contrôle URSSAF.",
  },
];
