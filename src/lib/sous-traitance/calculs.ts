/**
 * Le moteur du contrôle de la sous-traitance.
 *
 * Traduction des grilles de Sofia (docs/grilles-sofia/00 à 05). Trois règles tiennent
 * tout le fichier :
 *
 * 1. On raisonne en HEURES. A = heures vendues, B = heures des bulletins de paie,
 *    A − B = volume de sous-traitance hypothétique. Les euros ne servent qu'au
 *    fléchage DGFiP facture ↔ paiement.
 * 2. Vérifier ne suffit pas, il faut la FAISABILITÉ : l'effectif déclaré sur
 *    l'attestation de vigilance (en équivalent temps plein), converti en heures, doit
 *    pouvoir produire les heures facturées.
 * 3. Le système calcule, il ne qualifie pas. Une alerte décrit un écart chiffré et ce
 *    qu'il faut vérifier ; jamais « travail dissimulé » ou « fausse facture ».
 *
 * Fonctions pures, sans accès à la base : testées par scripts/tester-calculs-st.mjs.
 */
import type { Attestation, FactureST, Paie, Paiement, ParametresST, Smic, SousTraitant, Vente } from "./types";

// ——— Outils ————————————————————————————————————————————————————————————————

/** « 2026-03-01 » → « 2026-03 » */
export const cleMois = (d: string): string => d.slice(0, 7);

const finDuMois = (mois: string): string => {
  const [a, m] = mois.split("-").map(Number);
  const d = new Date(Date.UTC(a, m, 0));
  return d.toISOString().slice(0, 10);
};

const ajouterMois = (date: string, n: number): string => {
  const [a, m, j] = date.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1 + n, j));
  // 31 août + 6 mois = 28 ou 29 février, pas 3 mars.
  if (d.getUTCDate() !== j) d.setUTCDate(0);
  return d.toISOString().slice(0, 10);
};

const somme = (valeurs: (number | null | undefined)[]): number =>
  valeurs.reduce<number>((t, v) => t + (typeof v === "number" && Number.isFinite(v) ? v : 0), 0);

const arrondi = (n: number, decimales = 2) => Math.round(n * 10 ** decimales) / 10 ** decimales;

/** Validité retenue pour une attestation de vigilance : 6 mois à compter de sa délivrance. */
export const VALIDITE_ATTESTATION_MOIS = 6;
/** Seuil de l'obligation de vigilance (grille 05 §2) : 5 000 € HT. */
export const SEUIL_VIGILANCE_HT = 5000;

// ——— A − B : l'écart d'heures du donneur d'ordre ————————————————————————————

/** Heures d'une ligne de vente. Sans heures saisies : montant HT ÷ taux horaire vendu. */
export const heuresDeVente = (v: Vente, tauxVendu: number | null): { heures: number | null; converties: boolean } => {
  if (v.heures_facturees !== null) return { heures: v.heures_facturees, converties: false };
  if (v.montant_ht !== null && tauxVendu) return { heures: arrondi(v.montant_ht / tauxVendu), converties: true };
  return { heures: null, converties: false };
};

export interface LigneEcart {
  mois: string;
  /** A — heures vendues (facturées, ou converties depuis le montant). */
  vendues: number | null;
  /** Une partie de A vient d'un montant converti par le taux horaire vendu. */
  avecConversion: boolean;
  /** Des ventes du mois n'ont ni heures ni montant convertible. */
  ventesIncompletes: boolean;
  /** B — heures figurant sur les bulletins de paie. */
  payees: number | null;
  effectif: number | null;
  /** A − B, seulement si A et B sont connus. */
  ecart: number | null;
  /** (A − B) ÷ A, en pourcentage. */
  ecartPct: number | null;
}

export interface EcartHeures {
  lignes: LigneEcart[];
  totalVendues: number;
  totalPayees: number;
  /** Somme des écarts des seuls mois complets (A et B connus). */
  totalEcart: number;
  totalEcartPct: number | null;
  moisIncomplets: string[];
}

export const calculerEcart = (ventes: Vente[], paie: Paie[], p: ParametresST): EcartHeures => {
  const mois = new Set<string>();
  for (const v of ventes) mois.add(cleMois(v.mois));
  for (const b of paie) mois.add(cleMois(b.mois));

  const lignes: LigneEcart[] = [...mois].sort().map((m) => {
    const vm = ventes.filter((v) => cleMois(v.mois) === m);
    const conv = vm.map((v) => heuresDeVente(v, p.taux_horaire_vendu));
    const connues = conv.filter((c) => c.heures !== null);
    const vendues = connues.length ? arrondi(somme(connues.map((c) => c.heures))) : null;
    const b = paie.find((x) => cleMois(x.mois) === m);
    const payees = b?.heures_payees ?? null;
    const ecart = vendues !== null && payees !== null ? arrondi(vendues - payees) : null;
    return {
      mois: m,
      vendues,
      avecConversion: conv.some((c) => c.converties),
      ventesIncompletes: conv.some((c) => c.heures === null),
      payees,
      effectif: b?.effectif ?? null,
      ecart,
      ecartPct: ecart !== null && vendues ? arrondi((ecart / vendues) * 100, 1) : null,
    };
  });

  const complets = lignes.filter((l) => l.ecart !== null);
  const totalVenduesComplets = somme(complets.map((l) => l.vendues));
  const totalEcart = arrondi(somme(complets.map((l) => l.ecart)));
  return {
    lignes,
    totalVendues: arrondi(somme(lignes.map((l) => l.vendues))),
    totalPayees: arrondi(somme(lignes.map((l) => l.payees))),
    totalEcart,
    totalEcartPct: totalVenduesComplets ? arrondi((totalEcart / totalVenduesComplets) * 100, 1) : null,
    moisIncomplets: lignes.filter((l) => l.ecart === null).map((l) => l.mois),
  };
};

// ——— Faisabilité d'un sous-traitant —————————————————————————————————————————

/**
 * L'attestation qui couvre un mois : délivrée au plus tard le dernier jour du mois, et
 * encore valide (6 mois) le premier jour. S'il y en a plusieurs, la plus récente.
 */
export const attestationDuMois = (attestations: Attestation[], mois: string): Attestation | null => {
  const debut = `${mois}-01`;
  const fin = finDuMois(mois);
  const valides = attestations
    .filter((a) => a.date_delivrance && a.date_delivrance <= fin && ajouterMois(a.date_delivrance, VALIDITE_ATTESTATION_MOIS) >= debut)
    .sort((x, y) => (x.date_delivrance! < y.date_delivrance! ? 1 : -1));
  return valides[0] ?? null;
};

/** SMIC horaire brut en vigueur à une date. */
export const smicA = (smics: Smic[], date: string): Smic | null =>
  [...smics].filter((s) => s.valable_du <= date).sort((a, b) => (a.valable_du < b.valable_du ? 1 : -1))[0] ?? null;

export interface MoisSousTraitant {
  mois: string;
  heuresFacturees: number | null;
  facturesSansHeures: number;
  attestation: Attestation | null;
  /** Effectif ETP × heures mensuelles d'un temps plein. */
  capacite: number | null;
  /** Heures facturées ÷ capacité, en pourcentage. */
  tauxCapacite: number | null;
  /** Heures facturées ÷ effectif déclaré (grille 03 §8). */
  heuresParSalarie: number | null;
  /** Rémunérations déclarées ÷ SMIC horaire : le plafond d'heures qu'elles peuvent payer. */
  plafondSmic: number | null;
}

export interface FlechageFacture {
  facture: FactureST;
  /** Montant attendu : TTC s'il est saisi, sinon HT. */
  attendu: number | null;
  baseAttendu: "ttc" | "ht" | null;
  paye: number;
  ecart: number | null;
  paiements: Paiement[];
}

export type NiveauAlerte = "alerte" | "a_verifier";

export interface Alerte {
  code: string;
  niveau: NiveauAlerte;
  texte: string;
  /** Grille de Sofia dont l'indicateur est issu. */
  grille: "02" | "03" | "04" | "05";
}

export interface DossierSousTraitant {
  st: SousTraitant;
  mois: MoisSousTraitant[];
  totalHeures: number;
  totalHT: number;
  totalTTC: number;
  totalPaye: number;
  flechage: FlechageFacture[];
  paiementsSansFacture: Paiement[];
  vigilanceObligatoire: boolean | null;
  alertes: Alerte[];
}

const h = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} h`;
const eur = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const moisLisible = (m: string) =>
  new Date(`${m}-01T12:00:00Z`).toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

export const analyserSousTraitant = (
  st: SousTraitant,
  attestations: Attestation[],
  factures: FactureST[],
  paiements: Paiement[],
  p: ParametresST,
  smics: Smic[],
): DossierSousTraitant => {
  const at = attestations.filter((a) => a.sous_traitant_id === st.id);
  const fa = factures.filter((f) => f.sous_traitant_id === st.id);
  const pa = paiements.filter((x) => x.sous_traitant_id === st.id);
  const alertes: Alerte[] = [];

  // Mois par mois : heures facturées, capacité déclarée, plafond SMIC.
  const moisFactures = [...new Set(fa.filter((f) => f.mois).map((f) => cleMois(f.mois!)))].sort();
  const mois: MoisSousTraitant[] = moisFactures.map((m) => {
    const fm = fa.filter((f) => f.mois && cleMois(f.mois) === m);
    const avecHeures = fm.filter((f) => f.heures !== null);
    const heuresFacturees = avecHeures.length ? arrondi(somme(avecHeures.map((f) => f.heures))) : null;
    const attestation = attestationDuMois(at, m);
    const capacite = attestation?.effectif_etp != null ? arrondi(attestation.effectif_etp * p.heures_mensuelles_etp) : null;
    const smic = attestation?.mois_reference ? smicA(smics, attestation.mois_reference) : null;
    const plafondSmic = attestation?.remunerations != null && smic ? arrondi(attestation.remunerations / smic.taux_brut) : null;
    return {
      mois: m,
      heuresFacturees,
      facturesSansHeures: fm.length - avecHeures.length,
      attestation,
      capacite,
      tauxCapacite: heuresFacturees !== null && capacite ? arrondi((heuresFacturees / capacite) * 100, 1) : null,
      heuresParSalarie: heuresFacturees !== null && attestation?.effectif_etp ? arrondi(heuresFacturees / attestation.effectif_etp, 1) : null,
      plafondSmic,
    };
  });

  for (const m of mois) {
    const lib = moisLisible(m.mois);
    if (!m.attestation) {
      alertes.push({ code: "mois_sans_attestation", niveau: "alerte", grille: "05",
        texte: `${lib} : aucune attestation de vigilance valide ne couvre ce mois.` });
    }
    if (m.heuresFacturees !== null && m.capacite !== null && m.heuresFacturees > m.capacite) {
      alertes.push({ code: "capacite_depassee", niveau: "alerte", grille: "03",
        texte: `${lib} : ${h(m.heuresFacturees)} facturées pour une capacité déclarée de ${h(m.capacite)} (${m.attestation?.effectif_etp} ETP). L’effectif de l’attestation ne peut pas produire ces heures à lui seul.` });
    }
    if (m.heuresFacturees !== null && m.plafondSmic !== null && m.heuresFacturees > m.plafondSmic) {
      alertes.push({ code: "plafond_smic_depasse", niveau: "alerte", grille: "03",
        texte: `${lib} : ${h(m.heuresFacturees)} facturées, alors que les rémunérations déclarées ne peuvent payer au plus que ${h(m.plafondSmic)} au SMIC.` });
    }
    if (m.facturesSansHeures > 0) {
      alertes.push({ code: "facture_sans_heures", niveau: "a_verifier", grille: "05",
        texte: `${lib} : ${m.facturesSansHeures} facture${m.facturesSansHeures > 1 ? "s" : ""} sans nombre d’heures. Impossible de vérifier la faisabilité sans le volume facturé.` });
    }
  }

  // Attestations : présence, SIREN, authenticité, renouvellement tous les 6 mois.
  const totalHT = arrondi(somme(fa.map((f) => f.montant_ht)));
  const montantRef = st.montant_contrat_ht ?? (totalHT || null);
  const vigilanceObligatoire = montantRef === null ? null : montantRef >= SEUIL_VIGILANCE_HT;

  if (at.length === 0) {
    alertes.push({ code: "aucune_attestation", niveau: vigilanceObligatoire === false ? "a_verifier" : "alerte", grille: "05",
      texte: vigilanceObligatoire
        ? `Aucune attestation de vigilance, pour une relation de ${eur(montantRef!)} HT : au-delà de ${eur(SEUIL_VIGILANCE_HT)} HT, la vérification est obligatoire.`
        : "Aucune attestation de vigilance saisie." });
  }
  for (const a of at) {
    const date = a.date_delivrance ? new Date(`${a.date_delivrance}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" }) : "sans date";
    if (a.siren_conforme === "non") {
      alertes.push({ code: "siren_different", niveau: "alerte", grille: "05",
        texte: `Attestation du ${date} : le SIREN ne correspond pas au sous-traitant contractuel.` });
    }
    if (a.authentifiee !== "oui") {
      alertes.push({ code: "authenticite_non_verifiee", niveau: a.authentifiee === "non" ? "alerte" : "a_verifier", grille: "05",
        texte: `Attestation du ${date} : authenticité ${a.authentifiee === "non" ? "non confirmée" : "pas encore vérifiée"} (code de sécurité sur le site de l’URSSAF).` });
    }
    if (!a.date_delivrance) {
      alertes.push({ code: "attestation_sans_date", niveau: "a_verifier", grille: "05",
        texte: "Une attestation n’a pas de date de délivrance : sa validité ne peut pas être contrôlée." });
    }
  }
  const datees = at.filter((a) => a.date_delivrance).map((a) => a.date_delivrance!).sort();
  for (let i = 1; i < datees.length; i++) {
    if (ajouterMois(datees[i - 1], VALIDITE_ATTESTATION_MOIS) < datees[i]) {
      alertes.push({ code: "renouvellement_tardif", niveau: "alerte", grille: "05",
        texte: `Plus de 6 mois entre les attestations du ${new Date(`${datees[i - 1]}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" })} et du ${new Date(`${datees[i]}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" })} : la vigilance n’a pas été renouvelée à temps.` });
    }
  }

  // Fléchage DGFiP : chaque facture ↔ ses paiements, sur un compte au nom du sous-traitant.
  const flechage: FlechageFacture[] = fa.map((f) => {
    const ps = pa.filter((x) => x.facture_id === f.id);
    const attendu = f.montant_ttc ?? f.montant_ht;
    const paye = arrondi(somme(ps.map((x) => x.montant)));
    return {
      facture: f,
      attendu,
      baseAttendu: f.montant_ttc !== null ? "ttc" : f.montant_ht !== null ? "ht" : null,
      paye,
      ecart: attendu !== null ? arrondi(paye - attendu) : null,
      paiements: ps,
    };
  });
  const paiementsSansFacture = pa.filter((x) => !x.facture_id || !fa.some((f) => f.id === x.facture_id));

  for (const fl of flechage) {
    const ref = fl.facture.numero ? `Facture ${fl.facture.numero}` : "Une facture sans numéro";
    if (fl.paiements.length === 0) {
      alertes.push({ code: "facture_non_payee", niveau: "a_verifier", grille: "05",
        texte: `${ref} : aucun paiement rattaché.` });
    } else if (fl.ecart !== null && Math.abs(fl.ecart) >= 1) {
      alertes.push({ code: fl.ecart > 0 ? "paiement_superieur" : "paiement_inferieur", niveau: fl.ecart > 0 ? "alerte" : "a_verifier", grille: "05",
        texte: `${ref} : ${eur(fl.paye)} payés pour ${eur(fl.attendu!)} ${fl.baseAttendu === "ttc" ? "TTC" : "HT"} facturés (écart de ${eur(Math.abs(fl.ecart))}).` });
    }
  }
  for (const x of paiementsSansFacture) {
    alertes.push({ code: "paiement_sans_facture", niveau: "alerte", grille: "03",
      texte: `Paiement${x.montant !== null ? ` de ${eur(x.montant)}` : ""}${x.date_paiement ? ` du ${new Date(`${x.date_paiement}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" })}` : ""} sans facture correspondante.` });
  }
  for (const x of pa.filter((y) => y.compte_au_nom === "non")) {
    alertes.push({ code: "compte_tiers", niveau: "alerte", grille: "05",
      texte: `Paiement${x.montant !== null ? ` de ${eur(x.montant)}` : ""} versé sur un compte qui n’est pas au nom du sous-traitant.` });
  }

  return {
    st,
    mois,
    totalHeures: arrondi(somme(fa.map((f) => f.heures))),
    totalHT,
    totalTTC: arrondi(somme(fa.map((f) => f.montant_ttc))),
    totalPaye: arrondi(somme(pa.map((x) => x.montant))),
    flechage,
    paiementsSansFacture,
    vigilanceObligatoire,
    alertes,
  };
};

// ——— Bouclage : l'écart A − B est-il expliqué par la sous-traitance documentée ? ————————

export interface LigneBouclage {
  mois: string;
  ecart: number | null;
  /** Heures facturées par les sous-traitants de rang 1 (le rang 2 est déjà dans le rang 1). */
  documentees: number;
  /** Écart − heures documentées : ce qui reste à expliquer. */
  reste: number | null;
}

export interface Bouclage {
  lignes: LigneBouclage[];
  totalEcart: number;
  totalDocumentees: number;
  /** Heures vendues couvertes ni par la paie ni par un sous-traitant (mois où le reste est positif). */
  totalReste: number;
  /** Heures facturées par les sous-traitants au-delà de l'écart (mois où le reste est négatif). */
  totalExcedent: number;
  alertes: Alerte[];
}

export const boucler = (ecart: EcartHeures, sousTraitants: SousTraitant[], factures: FactureST[]): Bouclage => {
  const rang1 = new Set(sousTraitants.filter((s) => s.rang === 1).map((s) => s.id));
  const lignes: LigneBouclage[] = ecart.lignes.map((l) => {
    const documentees = arrondi(
      somme(factures.filter((f) => rang1.has(f.sous_traitant_id) && f.mois && cleMois(f.mois) === l.mois).map((f) => f.heures)),
    );
    return { mois: l.mois, ecart: l.ecart, documentees, reste: l.ecart !== null ? arrondi(l.ecart - documentees) : null };
  });
  const complets = lignes.filter((l) => l.reste !== null);
  // Les mois ne se compensent pas : un excédent en mars n'explique pas un manque en avril.
  const totalReste = arrondi(somme(complets.map((l) => Math.max(0, l.reste!))));
  const totalExcedent = arrondi(somme(complets.map((l) => Math.max(0, -l.reste!))));

  const alertes: Alerte[] = [];
  for (const l of complets) {
    if (l.reste! > 0.5) {
      alertes.push({ code: "ecart_non_explique", niveau: "alerte", grille: "04",
        texte: `${moisLisible(l.mois)} : ${h(l.reste!)} vendues ne sont couvertes ni par la paie ni par une facture de sous-traitant.` });
    }
    if (l.reste! < -0.5) {
      // Plus d'heures de sous-traitance facturées que les ventes n'en demandent : des factures
      // sans prestation correspondante, le profil que la DGFiP examine en premier.
      alertes.push({ code: "sous_traitance_excedentaire", niveau: "alerte", grille: "04",
        texte: `${moisLisible(l.mois)} : les sous-traitants facturent ${h(l.documentees)}, soit ${h(-l.reste!)} de plus que les heures vendues non couvertes par la paie (${h(Math.max(0, l.ecart!))}). Ces heures ne correspondent à aucune vente : vérifier la réalité des prestations facturées.` });
    }
  }
  return {
    lignes,
    totalEcart: arrondi(somme(complets.map((l) => l.ecart))),
    totalDocumentees: arrondi(somme(complets.map((l) => l.documentees))),
    totalReste,
    totalExcedent,
    alertes,
  };
};
