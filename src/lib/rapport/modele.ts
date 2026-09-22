/**
 * Le rapport : tout ce qu'il contient, rassemblé en une structure pure, utilisée par
 * l'écran (ce qui manque, textes proposés) et par le PDF.
 *
 * Les textes : Sofia écrit ou valide. L'outil propose une rédaction à partir de SES réponses
 * et des calculs, jamais une qualification juridique, jamais une promesse de garantie. Un
 * texte non validé est imprimé, mais le rapport porte alors la mention « version de travail ».
 */
import { GRILLE_CNAPS, GRILLE_DGFIP, GRILLE_RAPPROCHEMENT, GRILLE_SOUS_TRAITANT, GRILLE_URSSAF, NATURES_NC, type Grille } from "@/content/grilles";
import { bilanGrille, type BilanGrille } from "@/lib/modules/analyse";
import type { DonneesGrilles, NonConformite } from "@/lib/grilles/lecture";
import { analyserCartes, analyserEntreprise, analyserFacturation, analyserIdentites, analyserSalaries, analyserSousTraitant, boucler, calculerEcart, type Alerte, type Bouclage, type DossierSousTraitant, type EcartHeures } from "@/lib/sous-traitance/calculs";
import type { DonneesST } from "@/lib/sous-traitance/lecture";
import { fmtEuros, fmtHeures, fmtMois, fmtPct, nombreFr } from "@/lib/sous-traitance/format";

export const CLES_TEXTES = ["contexte", "synthese", "conclusion", "limites"] as const;
export type CleTexte = (typeof CLES_TEXTES)[number];

export const TITRES_TEXTES: Record<CleTexte, string> = {
  contexte: "Objet et périmètre de la mission",
  synthese: "Synthèse",
  conclusion: "Conclusion",
  limites: "Limites du diagnostic",
};

export interface InfosMission {
  client: string;
  siren: string | null;
  reference: string;
  controleEnCours: boolean;
  organisme: string | null;
  echeance: string | null;
  auditeur: string;
}

export interface PointDefavorable {
  section: string;
  libelle: string;
  reponse: "non" | "a_verifier" | "oui";
  alerte: boolean;
  observation: string | null;
}

export interface ChapitreSousTraitant {
  dossier: DossierSousTraitant;
  conclusions: Record<string, string | null>;
  synthese: string | null;
  points: PointDefavorable[];
  repondues: number;
  totalQuestions: number;
}

/** Un module de contrôle (URSSAF, DGFiP) : sa grille, ses conclusions, ses alertes propres. */
export interface ChapitreModule {
  renseigne: boolean;
  bilan: BilanGrille;
  points: PointDefavorable[];
  conclusions: { titre: string; valeur: string | null }[];
  synthese: string | null;
  alertes: Alerte[];
}

export interface ModeleRapport {
  mission: InfosMission;
  periode: { debut: string | null; fin: string | null };
  ecart: EcartHeures;
  bouclage: Bouclage;
  alertesEntreprise: { ventes: Alerte[]; paie: Alerte[] };
  alertesCartes: Alerte[];
  rapprochement: { sources: string[]; question: string | null; explications: string[]; conclusion: string | null; justificatifs: string | null; observations: string | null };
  sousTraitants: ChapitreSousTraitant[];
  dracar: { renseigne: boolean; controles: number; conformes: number; nonConformes: number; aVerifier: number; points: PointDefavorable[]; niveau: string | null; actions: string | null; delai: string | null };
  urssaf: ChapitreModule;
  dgfip: ChapitreModule;
  /** Coût de revient horaire de référence et sa source, tels que saisis. */
  coutRevient: string | null;
  nonConformites: (NonConformite & { libelleNature: string; sousTraitant: string | null })[];
  textes: Record<CleTexte, { texte: string; valide: boolean }>;
  documents: string[];
  /** Ce qu'il manque pour une version définitive. Vide = rapport complet. */
  manques: string[];
  /** Les mêmes points, avec la page où chacun se règle (chemin relatif à la mission). */
  aFaire: { texte: string; lien: string }[];
}

const minuscule = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
const pluriel = (n: number, s: string, p = `${s}s`) => `${nombreFr(n)}\u00a0${n > 1 ? p : s}`;

const choixMulti = (g: DonneesGrilles, grille: string, cible: string, code: string, choix: string[]) =>
  choix.filter((_, i) => g.reponses[`${grille}|${cible}|${code}.${i}`]?.reponse === "oui");

// ——— Propositions de rédaction ——————————————————————————————————————————————————

const proposerContexte = (m: InfosMission, periode: ModeleRapport["periode"], nbST: number): string => {
  const quand =
    periode.debut && periode.fin
      ? `de ${fmtMois(periode.debut)} à ${fmtMois(periode.fin)}`
      : periode.debut
        ? `à partir de ${fmtMois(periode.debut)}`
        : "sur la période communiquée";
  const cadre = m.controleEnCours ? `, dans le cadre du contrôle ${m.organisme ? `${m.organisme} ` : ""}en cours` : "";
  return (
    `À la demande de ${m.client}, ANM Consulting a examiné le recours à la sous-traitance de l’entreprise ${quand}${cadre}. ` +
    `Les travaux ont porté sur trois points : les heures vendues aux clients, rapprochées des heures figurant sur les bulletins de paie ; ` +
    `le dossier de vigilance de ${nbST === 0 ? "chaque sous-traitant" : pluriel(nbST, "sous-traitant")} (attestations, factures, paiements, agents intervenus) ; ` +
    `la cohérence d’ensemble entre ce qui est vendu, produit, facturé et payé.`
  );
};

const proposerSynthese = (e: EcartHeures, b: Bouclage, chapitres: ChapitreSousTraitant[], dracarNiveau: string | null, urssaf: string | null = null, dgfip: string | null = null): string => {
  const phrases: string[] = [];
  if (e.lignes.length) {
    phrases.push(
      `Sur la période, l’entreprise a vendu ${fmtHeures(e.totalVendues)} et ses bulletins de paie en justifient ${fmtHeures(e.totalPayees)}.`,
    );
    if (b.totalEcart > 0) {
      phrases.push(
        `L’écart, soit ${fmtHeures(b.totalEcart)}${e.totalEcartPct !== null ? ` (${fmtPct(e.totalEcartPct)} des heures vendues)` : ""}, doit être couvert par la sous-traitance : les factures des sous-traitants en expliquent ${fmtHeures(b.totalDocumentees)}.`,
      );
    }
    if (b.totalReste > 0.5) phrases.push(`${fmtHeures(b.totalReste)} restent sans justification à ce stade.`);
    if (b.totalExcedent > 0.5) {
      phrases.push(
        `À l’inverse, les sous-traitants facturent ${fmtHeures(b.totalExcedent)} de plus que les ventes n’en demandent certains mois : ces factures doivent pouvoir être rattachées à des prestations réelles.`,
      );
    }
    if (b.totalReste <= 0.5 && b.totalExcedent <= 0.5 && b.totalEcart > 0) phrases.push("Chaque mois complet est couvert.");
  }
  // Un sous-traitant par phrase, avec des tournures qui varient d'un dossier à l'autre.
  const ouvertures = ["Pour", "S’agissant de", "Concernant", "Quant à"];
  chapitres.forEach((c, i) => {
    const concl = c.conclusions["st-conclusion"];
    const alertes = c.dossier.alertes.filter((a) => a.niveau === "alerte").length;
    const debut = `${ouvertures[i % ouvertures.length]} ${c.dossier.st.raison_sociale}`;
    if (concl) {
      phrases.push(`${debut}, la conclusion retenue est : ${minuscule(concl)}${alertes ? `, avec ${pluriel(alertes, "alerte")} relevée${alertes > 1 ? "s" : ""} dans les chiffres` : ""}.`);
    } else if (alertes) {
      phrases.push(`${debut}, ${pluriel(alertes, "alerte")} ressort${alertes > 1 ? "ent" : ""} des chiffres et reste${alertes > 1 ? "nt" : ""} à conclure.`);
    }
  });
  if (urssaf) phrases.push(`Pour l’entreprise elle-même, la conclusion du contrôle URSSAF est : ${minuscule(urssaf)}.`);
  if (dgfip) phrases.push(`Sur les factures, le risque de facture fictive ou de complaisance est apprécié ainsi : ${minuscule(dgfip)}.`);
  if (dracarNiveau) phrases.push(`Sur Dracar Ultimate, le niveau de conformité retenu est : ${minuscule(dracarNiveau)}.`);
  return phrases.join(" ");
};

const proposerConclusion = (rp: string | null, nbNC: number): string => {
  const debut = rp ? `Au terme de ces travaux, la conclusion sur le rapprochement des heures est la suivante : ${minuscule(rp)}.` : "Au terme de ces travaux, plusieurs points restent à éclaircir.";
  const nc = nbNC
    ? ` ${pluriel(nbNC, "non-conformité")} appelle${nbNC > 1 ? "nt" : ""} une action, détaillée au plan d’actions avec son délai et le justificatif attendu.`
    : " Aucune non-conformité n’a été formalisée.";
  return `${debut}${nc} Les points qui relèvent d’une qualification juridique sont à soumettre à l’avocat ou à l’expert-comptable de l’entreprise.`;
};

const LIMITES =
  "Le diagnostic repose sur les documents communiqués par l’entreprise et par ses sous-traitants, examinés sur copie. Il ne vaut ni certification ni garantie contre un redressement ou une sanction, et ne remplace pas l’analyse de l’avocat ou de l’expert-comptable. L’effectif figurant sur une attestation de vigilance est un indicateur de cohérence : il ne désigne pas les salariés qui ont exécuté la prestation. Les écarts d’heures sont des points d’investigation, non des qualifications.";

// ——— Assemblage ——————————————————————————————————————————————————————————————

const pointsDefavorables = (g: DonneesGrilles, grille: string, cible: string, sections: typeof GRILLE_SOUS_TRAITANT.sections): PointDefavorable[] =>
  sections.flatMap((s) =>
    s.items.flatMap((i) => {
      const r = g.reponses[`${grille}|${cible}|${i.code}`];
      const v = r?.reponse;
      const defav = s.alerte ? v === "oui" : v === "non";
      if (!defav && v !== "a_verifier") return [];
      return [{ section: s.titre, libelle: i.libelle, reponse: v as "non" | "a_verifier" | "oui", alerte: Boolean(s.alerte), observation: r?.observation ?? null }];
    }),
  );

export const construireRapport = (m: InfosMission, d: DonneesST, g: DonneesGrilles, documents: string[], aujourdHui: string): ModeleRapport => {
  const ecart = calculerEcart(d.ventes, d.paie, d.parametres);
  const bouclage = boucler(ecart, d.sousTraitants, d.factures);
  const alertesEntreprise = analyserEntreprise(d.ventes, d.paie, d.smics);
  const alertesCartes = analyserCartes(d.agents, aujourdHui);
  const totalQuestions = GRILLE_SOUS_TRAITANT.sections.reduce((n, s) => n + s.items.length, 0);

  const sousTraitants: ChapitreSousTraitant[] = d.sousTraitants.map((st) => {
    const dossier = analyserSousTraitant(st, d.attestations, d.factures, d.paiements, d.parametres, d.smics, d.agents, aujourdHui);
    const conclusions = Object.fromEntries(
      GRILLE_SOUS_TRAITANT.conclusions.filter((c) => c.type === "choix").map((c) => [c.code, g.conclusions[`${c.code}|${st.id}`]?.choix ?? null]),
    );
    return {
      dossier,
      conclusions,
      synthese: g.conclusions[`st-synthese|${st.id}`]?.synthese ?? null,
      points: pointsDefavorables(g, "st", st.id, GRILLE_SOUS_TRAITANT.sections),
      repondues: GRILLE_SOUS_TRAITANT.sections.reduce((n, s) => n + s.items.filter((i) => g.reponses[`st|${st.id}|${i.code}`]?.reponse).length, 0),
      totalQuestions,
    };
  });

  const rpC = (code: string) => g.conclusions[`${code}|mission`];
  const choixRp = (code: string) => GRILLE_RAPPROCHEMENT.conclusions.find((c) => c.code === code)?.choix ?? [];
  const rapprochement = {
    sources: choixMulti(g, "rapprochement", "mission", "rp-sources", choixRp("rp-sources")),
    question: rpC("rp-question")?.choix ?? null,
    explications: choixMulti(g, "rapprochement", "mission", "rp-explications", choixRp("rp-explications")),
    conclusion: rpC("rp-conclusion")?.choix ?? null,
    justificatifs: rpC("rp-justificatifs")?.synthese ?? null,
    observations: rpC("rp-observations")?.synthese ?? null,
  };

  const bilanCnaps = bilanGrille(g, "cnaps", "mission", GRILLE_CNAPS.sections);
  const dracar = {
    renseigne: GRILLE_CNAPS.sections.some((s) => s.items.some((i) => g.reponses[`cnaps|mission|${i.code}`])),
    controles: bilanCnaps.controles,
    conformes: bilanCnaps.conformes,
    nonConformes: bilanCnaps.nonConformes,
    aVerifier: bilanCnaps.aVerifier,
    points: pointsDefavorables(g, "cnaps", "mission", GRILLE_CNAPS.sections),
    niveau: rpC("cn-niveau")?.choix ?? null,
    actions: rpC("cn-actions")?.synthese ?? null,
    delai: rpC("cn-delai")?.synthese ?? null,
  };

  const chapitreModule = (grille: Grille, codeSynthese: string, alertes: Alerte[]): ChapitreModule => {
    const bilan = bilanGrille(g, grille.code, "mission", grille.sections);
    const conclusions = grille.conclusions.filter((c) => c.type === "choix").map((c) => ({ titre: c.titre, valeur: rpC(c.code)?.choix ?? null }));
    const synthese = rpC(codeSynthese)?.synthese ?? null;
    return {
      renseigne: bilan.controles > 0 || conclusions.some((c) => c.valeur) || Boolean(synthese) || grille.sections.some((s) => s.items.some((i) => g.reponses[`${grille.code}|mission|${i.code}`])),
      bilan,
      points: pointsDefavorables(g, grille.code, "mission", grille.sections),
      conclusions,
      synthese,
      alertes,
    };
  };
  const urssaf = chapitreModule(GRILLE_URSSAF, "ur-synthese", [
    ...analyserSalaries(d.agents, d.paie, aujourdHui),
    ...analyserIdentites(d.agents.filter((a) => a.sous_traitant_id === null), aujourdHui),
  ]);
  const dgfip = chapitreModule(GRILLE_DGFIP, "dg-synthese", analyserFacturation(d.ventes, d.factures, d.sousTraitants, d.smics, d.parametres));

  const nonConformites = g.nonConformites.map((n) => ({
    ...n,
    libelleNature: n.nature === "autre" && n.nature_autre ? n.nature_autre : NATURES_NC[n.nature] ?? n.nature,
    sousTraitant: d.sousTraitants.find((s) => s.id === n.sous_traitant_id)?.raison_sociale ?? null,
  }));

  const propositions: Record<CleTexte, string> = {
    contexte: proposerContexte(m, { debut: d.parametres.periode_debut, fin: d.parametres.periode_fin }, d.sousTraitants.length),
    synthese: proposerSynthese(ecart, bouclage, sousTraitants, dracar.niveau, rpC("ur-conclusion")?.choix ?? null, rpC("dg-risque")?.choix ?? null),
    conclusion: proposerConclusion(rapprochement.conclusion, nonConformites.length),
    limites: LIMITES,
  };
  const textes = Object.fromEntries(
    (Object.keys(propositions) as CleTexte[]).map((k) => [k, g.textes[k] ? { texte: g.textes[k], valide: true } : { texte: propositions[k], valide: false }]),
  ) as ModeleRapport["textes"];

  const aFaire: { texte: string; lien: string }[] = [];
  const manque = (texte: string, lien: string) => aFaire.push({ texte, lien });
  if (!d.parametres.periode_debut || !d.parametres.periode_fin) manque("La période contrôlée n’est pas renseignée (étape 2, Heures de l’entreprise).", "sous-traitance/heures");
  if (ecart.lignes.length === 0) manque("Aucune heure vendue ni payée n’est saisie.", "sous-traitance/heures");
  if (ecart.moisIncomplets.length) manque(`${pluriel(ecart.moisIncomplets.length, "mois")} sans heures vendues ou sans heures payées.`, "sous-traitance/heures");
  if (!rapprochement.conclusion) manque("La conclusion du rapprochement des heures n’est pas choisie.", "sous-traitance#conclusion-rp");
  for (const c of sousTraitants) {
    if (!c.conclusions["st-conclusion"]) manque(`${c.dossier.st.raison_sociale} : conclusion non choisie.`, `sous-traitance/${c.dossier.st.id}?vue=conclusion`);
    if (c.repondues < c.totalQuestions) manque(`${c.dossier.st.raison_sociale} : ${c.totalQuestions - c.repondues} points de contrôle sans réponse.`, `sous-traitance/${c.dossier.st.id}?vue=controle`);
  }
  if (dracar.renseigne && !dracar.niveau) manque("CNAPS : niveau de conformité non choisi.", "cnaps#synthese");
  if (urssaf.renseigne && !rpC("ur-conclusion")?.choix) manque("URSSAF : conclusion non choisie.", "urssaf#conclusion");
  if (dgfip.renseigne && !rpC("dg-risque")?.choix) manque("DGFiP : risque de facture fictive ou de complaisance non apprécié.", "dgfip#conclusion");
  for (const k of CLES_TEXTES) if (!textes[k].valide) manque(`Texte « ${TITRES_TEXTES[k]} » : proposition de l’outil pas encore relue et validée.`, "rapport#textes");

  const manques = aFaire.map((x) => x.texte);
  return {
    mission: m,
    periode: { debut: d.parametres.periode_debut, fin: d.parametres.periode_fin },
    ecart,
    bouclage,
    alertesEntreprise,
    alertesCartes,
    rapprochement,
    sousTraitants,
    dracar,
    urssaf,
    dgfip,
    coutRevient: d.parametres.cout_revient_horaire
      ? `${fmtEuros(d.parametres.cout_revient_horaire)} HT${d.parametres.cout_revient_source ? ` (${d.parametres.cout_revient_source})` : ""}`
      : null,
    nonConformites,
    textes,
    documents,
    manques,
    aFaire,
  };
};

/** Les textes proposés, pour les afficher à côté de ce que Sofia a écrit. */
export const propositionsTextes = (r: ModeleRapport): Record<CleTexte, string> => {
  const m = r.mission;
  return {
    contexte: proposerContexte(m, r.periode, r.sousTraitants.length),
    synthese: proposerSynthese(r.ecart, r.bouclage, r.sousTraitants, r.dracar.niveau, r.urssaf.conclusions.find((c) => c.titre === "Conclusion")?.valeur ?? null, r.dgfip.conclusions.find((c) => c.titre.startsWith("Risque"))?.valeur ?? null),
    conclusion: proposerConclusion(r.rapprochement.conclusion, r.nonConformites.length),
    limites: LIMITES,
  };
};
