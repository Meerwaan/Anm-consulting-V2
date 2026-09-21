import { NATURE_PAR_ALERTE, type Section } from "@/content/grilles";
import type { DonneesGrilles } from "@/lib/grilles/lecture";
import type { DonneesST } from "@/lib/sous-traitance/lecture";
import {
  analyserCartes, analyserEntreprise, analyserFacturation, analyserIdentites, analyserSalaries, analyserSousTraitant, boucler, calculerEcart,
  type Alerte, type DossierSousTraitant,
} from "@/lib/sous-traitance/calculs";

/**
 * Les trois modules de contrôle (dictée de Sofia du 21/09/2026) lisent les mêmes données que la
 * sous-traitance : rien n'est saisi deux fois. Ce fichier répartit les alertes calculées entre
 * URSSAF, DGFiP et CNAPS, et compte les réponses d'une grille.
 */

export interface BilanGrille {
  total: number;
  controles: number;
  conformes: number;
  nonConformes: number;
  aVerifier: number;
}

/** Dans une section de points d'alerte, « oui » est une anomalie constatée et « non » un point conforme. */
export const bilanGrille = (g: DonneesGrilles, grille: string, cible: string, sections: Section[]): BilanGrille => {
  const b: BilanGrille = { total: 0, controles: 0, conformes: 0, nonConformes: 0, aVerifier: 0 };
  for (const s of sections) {
    for (const i of s.items) {
      b.total += 1;
      const r = g.reponses[`${grille}|${cible}|${i.code}`]?.reponse ?? null;
      if (!r || r === "na") continue;
      b.controles += 1;
      if (r === "a_verifier") b.aVerifier += 1;
      else if ((r === "oui") !== Boolean(s.alerte)) b.conformes += 1;
      else b.nonConformes += 1;
    }
  }
  return b;
};

const nature = (a: Alerte) => NATURE_PAR_ALERTE[a.code];
/** La facture qu'un effectif ne peut pas avoir produite relève des deux modules. */
const AUSSI_DGFIP = new Set(["capacite_depassee", "plafond_smic_depasse"]);

export interface AlertesParSousTraitant {
  dossier: DossierSousTraitant;
  alertes: Alerte[];
}

export interface AlertesModules {
  urssaf: { entreprise: Alerte[]; salaries: Alerte[]; sousTraitants: AlertesParSousTraitant[] };
  dgfip: { emises: Alerte[]; recues: AlertesParSousTraitant[] };
  cnaps: Alerte[];
  /** Identité des agents de l'entreprise : montrée dans CNAPS comme dans URSSAF. */
  identitesEntreprise: Alerte[];
  dossiers: DossierSousTraitant[];
}

export const alertesDesModules = (d: DonneesST, aujourdHui: string): AlertesModules => {
  const ecart = calculerEcart(d.ventes, d.paie, d.parametres);
  const bouclage = boucler(ecart, d.sousTraitants, d.factures);
  const entreprise = analyserEntreprise(d.ventes, d.paie, d.smics);
  const facturation = analyserFacturation(d.ventes, d.factures, d.sousTraitants, d.smics, d.parametres);
  const dossiers = d.sousTraitants.map((st) => {
    const x = analyserSousTraitant(st, d.attestations, d.factures, d.paiements, d.parametres, d.smics, d.agents, aujourdHui);
    return { ...x, alertes: x.alertes.map((a) => ({ ...a, sousTraitantId: st.id })) };
  });

  const urssafEntreprise = [...entreprise.paie, ...bouclage.alertes.filter((a) => nature(a) !== "facturation")];
  const urssafST = dossiers.map((x) => ({
    dossier: x,
    alertes: x.alertes.filter((a) => ["travail_dissimule", "defaut_vigilance", "emploi_etranger"].includes(nature(a) ?? "")),
  }));

  const emises = [
    ...entreprise.ventes,
    ...facturation.filter((a) => !a.sousTraitantId),
    ...bouclage.alertes.filter((a) => nature(a) === "facturation"),
  ];
  const recues = dossiers.map((x) => ({
    dossier: x,
    alertes: [
      ...x.alertes.filter((a) => nature(a) === "facturation" || AUSSI_DGFIP.has(a.code)),
      ...facturation.filter((a) => a.sousTraitantId === x.st.id),
    ],
  }));

  const identitesEntreprise = analyserIdentites(d.agents.filter((a) => a.sous_traitant_id === null), aujourdHui);
  return {
    urssaf: { entreprise: urssafEntreprise, salaries: [...analyserSalaries(d.agents, d.paie, aujourdHui), ...identitesEntreprise], sousTraitants: urssafST },
    dgfip: { emises, recues },
    cnaps: analyserCartes(d.agents, aujourdHui),
    identitesEntreprise,
    dossiers,
  };
};
