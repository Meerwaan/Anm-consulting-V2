import { GRILLE_CNAPS, GRILLE_DGFIP, GRILLE_URSSAF } from "@/content/grilles";
import type { DonneesGrilles } from "@/lib/grilles/lecture";
import type { DonneesST } from "@/lib/sous-traitance/lecture";
import { calculerEcart } from "@/lib/sous-traitance/calculs";
import { bilanGrille } from "./analyse";

/**
 * Où en est chaque étape de la mission : affiché dans la barre latérale, pour que Sofia voie
 * d'un coup d'œil ce qui est fait et ce qui reste. Une étape de contrôle est faite quand sa
 * conclusion est choisie.
 */
export type EtatEtape = "a_faire" | "en_cours" | "fait";
export interface Avancement {
  etat: EtatEtape;
  detail: string;
}
export type CheminEtape = "pieces" | "sous-traitance/heures" | "sous-traitance" | "dgfip" | "urssaf" | "cnaps" | "actions" | "rapport";

const RECUES = new Set(["recue", "valide", "bientot_perimee", "perimee", "date_manquante"]);

export const avancementMission = (
  d: DonneesST,
  g: DonneesGrilles,
  pieces: { etat: string }[],
  versions: string[],
): Record<CheminEtape, Avancement> => {
  const applicables = pieces.filter((p) => p.etat !== "sans_objet").length;
  const recues = pieces.filter((p) => RECUES.has(p.etat)).length;

  const ecart = calculerEcart(d.ventes, d.paie, d.parametres);
  const moisComplets = ecart.lignes.length - ecart.moisIncomplets.length;
  const periode = Boolean(d.parametres.periode_debut && d.parametres.periode_fin);

  const nbST = d.sousTraitants.length;
  const conclus = d.sousTraitants.filter((s) => g.conclusions[`st-conclusion|${s.id}`]?.choix).length;

  const controle = (grille: typeof GRILLE_DGFIP, conclusion: string, quoi: string): Avancement => {
    const b = bilanGrille(g, grille.code, "mission", grille.sections);
    const conclu = Boolean(g.conclusions[`${conclusion}|mission`]?.choix);
    return {
      etat: conclu ? "fait" : b.controles > 0 ? "en_cours" : "a_faire",
      detail: conclu ? `${quoi} · conclu` : `${quoi} · ${b.controles} / ${b.total}`,
    };
  };

  const ouvertes = g.nonConformites.filter((n) => n.statut !== "regularise").length;
  const nbActions = g.nonConformites.length;

  return {
    pieces: {
      etat: applicables > 0 && recues >= applicables ? "fait" : recues > 0 ? "en_cours" : "a_faire",
      detail: `${recues} / ${applicables} reçues`,
    },
    "sous-traitance/heures": {
      etat: ecart.lignes.length === 0 ? "a_faire" : periode && ecart.moisIncomplets.length === 0 ? "fait" : "en_cours",
      detail: ecart.lignes.length === 0 ? "Ventes et paie à saisir" : `${moisComplets} mois complet${moisComplets > 1 ? "s" : ""}${ecart.moisIncomplets.length ? `, ${ecart.moisIncomplets.length} à finir` : ""}`,
    },
    "sous-traitance": {
      etat: nbST === 0 ? "a_faire" : conclus === nbST ? "fait" : "en_cours",
      detail: nbST === 0 ? "Aucun dossier" : `${conclus} sur ${nbST} conclu${conclus > 1 ? "s" : ""}`,
    },
    dgfip: controle(GRILLE_DGFIP, "dg-risque", "Factures"),
    urssaf: controle(GRILLE_URSSAF, "ur-conclusion", "Travail illégal"),
    cnaps: controle(GRILLE_CNAPS, "cn-niveau", "Dracar"),
    actions: {
      etat: nbActions === 0 ? "a_faire" : ouvertes === 0 ? "fait" : "en_cours",
      detail: nbActions === 0 ? "Aucune action" : ouvertes === 0 ? "Toutes régularisées" : `${ouvertes} ouverte${ouvertes > 1 ? "s" : ""} sur ${nbActions}`,
    },
    rapport: {
      etat: versions.length ? "fait" : "a_faire",
      detail: versions.length ? `${versions[0]} émise` : "À émettre",
    },
  };
};
