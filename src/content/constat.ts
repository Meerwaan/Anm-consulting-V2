/**
 * Le référentiel du constat, en un seul endroit.
 *
 * Ces valeurs et cette règle étaient recopiées dans les actions serveur et dans trois
 * composants. Une copie qui dérive donne le pire défaut possible sur cet outil : deux
 * écrans qui répondent différemment à « ce constat est-il fini ? ».
 *
 * Ce fichier n'est pas un module « use server » : il peut donc exporter autre chose que
 * des fonctions asynchrones, ce qu'un fichier d'actions serveur n'a pas le droit de faire.
 */

/** Criticité → priorité de traitement (Bible consultant, chapitre 4). */
export const PRIORITE_PAR_CRITICITE: Record<string, "P1" | "P2" | "P3" | "P4"> = {
  critique: "P1",
  majeur: "P2",
  modere: "P3",
  mineur: "P4",
};

/** Échéance conseillée par priorité, en jours (même source). */
export const DELAI_PAR_PRIORITE: Record<string, number> = { P1: 7, P2: 30, P3: 90, P4: 180 };

export const CRITICITES: { valeur: string; label: string; priorite: string }[] = [
  { valeur: "critique", label: "Critique", priorite: "P1 · immédiat" },
  { valeur: "majeur", label: "Majeur", priorite: "P2 · 30 jours" },
  { valeur: "modere", label: "Modéré", priorite: "P3 · 90 jours" },
  { valeur: "mineur", label: "Mineur", priorite: "P4 · amélioration" },
];

export const DOMAINES: { valeur: string; libelle: string }[] = [
  { valeur: "gouvernance", libelle: "Gouvernance" },
  { valeur: "cnaps", libelle: "CNAPS / autorisations" },
  { valeur: "social", libelle: "Social / contrats" },
  { valeur: "paie", libelle: "Paie" },
  { valeur: "temps", libelle: "Temps de travail" },
  { valeur: "urssaf", libelle: "URSSAF / cotisations" },
  { valeur: "inspection_sst", libelle: "Inspection du travail / santé-sécurité" },
  { valeur: "sous_traitance", libelle: "Sous-traitance / vigilance" },
  { valeur: "operationnel", libelle: "Organisation opérationnelle" },
  { valeur: "fiscal", libelle: "Fiscal" },
];

const rempli = (v: string | null | undefined): boolean => Boolean(v && v.trim().length > 0);

/** Ce qu'un constat contient, vu du contrôle de complétude. */
export interface PiecesDuConstat {
  fact: string | null | undefined;
  evidence: string | null | undefined;
  risk: string | null | undefined;
  reference: string | null | undefined;
  reference_checked: string | null | undefined;
  recommendation: string | null | undefined;
}

/**
 * Ce qui manque à un constat pour être publiable, dans l'ordre de la règle d'or
 * (01 Bible §1) : fait → preuve → risque → référence vérifiée → action → délai.
 * La chaîne est indivisible ; un maillon absent rend le constat inutilisable devant un
 * contrôleur.
 *
 * Le risque encouru n'est pas la criticité. « Critique » dit à la consultante dans quel
 * ordre traiter ; ça ne dit pas au dirigeant ce qu'il encourt, et c'est cette phrase-là
 * qu'il retient.
 *
 * `[fait précis` reste testé : une ancienne trame à trous pré-remplissait ce champ, et
 * un encadré plein à l'œil mais vide au fond a déjà été publié à un client.
 */
export const cequiManque = (c: PiecesDuConstat): string[] => {
  const manques: string[] = [];
  if (!rempli(c.fact) || (c.fact ?? "").includes("[fait précis")) manques.push("le fait");
  if (!rempli(c.evidence)) manques.push("la preuve");
  if (!rempli(c.risk)) manques.push("le risque encouru");
  if (!rempli(c.reference)) manques.push("la référence");
  else if (c.reference_checked !== "oui") manques.push("la vérification de la référence");
  if (!rempli(c.recommendation)) manques.push("la recommandation");
  return manques;
};

export const constatComplet = (c: PiecesDuConstat): boolean => cequiManque(c).length === 0;

/** Date d'un champ `date` ou `timestamptz`, au fuseau où travaille la consultante. */
export const jour = (valeur: string): string =>
  new Date(valeur.length <= 10 ? `${valeur}T12:00:00Z` : valeur).toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
  });
