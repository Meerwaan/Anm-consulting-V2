/**
 * Description des tableaux de saisie du module sous-traitance.
 *
 * Une seule source pour l'écran (libellés, largeurs, claviers) et pour le serveur (liste
 * blanche des colonnes, conversion des valeurs) : une colonne ajoutée ici apparaît des
 * deux côtés, une colonne absente ne peut pas être écrite.
 */

export type TypeColonne = "mois" | "date" | "heures" | "euros" | "nombre" | "texte" | "verif" | "facture";

export interface Colonne {
  cle: string;
  libelle: string;
  type: TypeColonne;
  /** Largeur minimale en rem, pour que le tableau reste lisible sur iPad. */
  largeur: number;
  aide?: string;
}

export type NomTable =
  | "st_ventes"
  | "st_ventes_facturation"
  | "st_paie"
  | "st_attestations"
  | "st_factures"
  | "st_paiements"
  | "st_agents"
  | "agents_entreprise"
  | "smic_horaire";

export interface DefTable {
  nom: NomTable;
  /** Clé de ligne : un identifiant, ou le mois pour la paie (une ligne par mois). */
  cle: "id" | "mois" | "valable_du";
  /** La table appartient à un sous-traitant (colonne sous_traitant_id). */
  parSousTraitant: boolean;
  /** Table commune à toutes les missions (SMIC). */
  globale?: boolean;
  /** Table réelle en base, quand elle diffère du nom (deux vues sur une même table). */
  base?: string;
  /**
   * Vue complémentaire : elle complète des lignes créées ailleurs (pas d'ajout, pas de
   * suppression, pas de collage). Chaque ligne est présentée par un libellé en lecture seule.
   */
  complement?: boolean;
  colonnes: Colonne[];
}

export const TABLES: Record<NomTable, DefTable> = {
  st_ventes: {
    nom: "st_ventes",
    cle: "id",
    parSousTraitant: false,
    colonnes: [
      { cle: "mois", libelle: "Mois", type: "mois", largeur: 7.5 },
      { cle: "client", libelle: "Client", type: "texte", largeur: 7 },
      { cle: "bon_commande", libelle: "Bon de commande", type: "texte", largeur: 6 },
      { cle: "heures_commandees", libelle: "Heures commandées", type: "heures", largeur: 5 },
      { cle: "heures_facturees", libelle: "Heures facturées", type: "heures", largeur: 5 },
      { cle: "montant_ht", libelle: "Montant HT", type: "euros", largeur: 6 },
    ],
  },
  st_ventes_facturation: {
    nom: "st_ventes_facturation",
    base: "st_ventes",
    cle: "id",
    parSousTraitant: false,
    complement: true,
    colonnes: [
      { cle: "numero_facture", libelle: "N° de facture", type: "texte", largeur: 6.5 },
      { cle: "tva", libelle: "TVA", type: "euros", largeur: 6 },
      { cle: "montant_ttc", libelle: "Montant TTC", type: "euros", largeur: 6.5 },
      { cle: "montant_regle", libelle: "Montant réglé", type: "euros", largeur: 6.5 },
      { cle: "date_reglement", libelle: "Réglé le", type: "date", largeur: 7.5 },
    ],
  },
  st_paie: {
    nom: "st_paie",
    cle: "mois",
    parSousTraitant: false,
    colonnes: [
      { cle: "mois", libelle: "Mois", type: "mois", largeur: 7.5 },
      { cle: "effectif", libelle: "Effectif", type: "nombre", largeur: 4.5 },
      { cle: "heures_realisees", libelle: "Heures réalisées (planning, pointage)", type: "heures", largeur: 6 },
      { cle: "heures_payees", libelle: "Heures payées (bulletins)", type: "heures", largeur: 6 },
      { cle: "masse_salariale", libelle: "Masse salariale brute", type: "euros", largeur: 6.5 },
      { cle: "note", libelle: "Source", type: "texte", largeur: 6 },
    ],
  },
  st_attestations: {
    nom: "st_attestations",
    cle: "id",
    parSousTraitant: true,
    colonnes: [
      { cle: "date_delivrance", libelle: "Délivrée le", type: "date", largeur: 7.5 },
      { cle: "mois_reference", libelle: "Mois déclaré", type: "mois", largeur: 7.5 },
      { cle: "effectif_etp", libelle: "Effectif (ETP)", type: "nombre", largeur: 5 },
      { cle: "remunerations", libelle: "Rémunérations", type: "euros", largeur: 6.5 },
      { cle: "siren_conforme", libelle: "SIREN identique", type: "verif", largeur: 6 },
      { cle: "authentifiee", libelle: "Authenticité vérifiée", type: "verif", largeur: 6 },
    ],
  },
  st_factures: {
    nom: "st_factures",
    cle: "id",
    parSousTraitant: true,
    colonnes: [
      { cle: "numero", libelle: "N° de facture", type: "texte", largeur: 6 },
      { cle: "date_facture", libelle: "Date", type: "date", largeur: 7.5 },
      { cle: "mois", libelle: "Mois de prestation", type: "mois", largeur: 7.5 },
      { cle: "heures", libelle: "Heures", type: "heures", largeur: 4.5 },
      { cle: "montant_ht", libelle: "Montant HT", type: "euros", largeur: 6.5 },
      { cle: "montant_ttc", libelle: "Montant TTC", type: "euros", largeur: 6.5 },
    ],
  },
  st_paiements: {
    nom: "st_paiements",
    cle: "id",
    parSousTraitant: true,
    colonnes: [
      { cle: "facture_id", libelle: "Facture payée", type: "facture", largeur: 10 },
      { cle: "date_paiement", libelle: "Date", type: "date", largeur: 8 },
      { cle: "montant", libelle: "Montant payé", type: "euros", largeur: 7 },
      { cle: "reference", libelle: "Référence bancaire", type: "texte", largeur: 8 },
      { cle: "compte_au_nom", libelle: "Compte au nom du sous-traitant", type: "verif", largeur: 7 },
    ],
  },
  st_agents: {
    nom: "st_agents",
    cle: "id",
    parSousTraitant: true,
    colonnes: [
      { cle: "nom", libelle: "Agent", type: "texte", largeur: 7 },
      { cle: "carte_numero", libelle: "N° de carte pro", type: "texte", largeur: 6 },
      { cle: "heures", libelle: "Heures réalisées", type: "heures", largeur: 4.5 },
      { cle: "present_documents", libelle: "Dans les documents du sous-traitant", type: "verif", largeur: 5.5 },
      { cle: "carte_valide", libelle: "Carte valide", type: "verif", largeur: 5.5 },
      { cle: "dracar", libelle: "Rattaché Dracar", type: "verif", largeur: 5.5 },
      { cle: "planning", libelle: "Sur le planning", type: "verif", largeur: 5.5 },
    ],
  },
  agents_entreprise: {
    nom: "agents_entreprise",
    base: "st_agents",
    cle: "id",
    parSousTraitant: false,
    colonnes: [
      { cle: "nom", libelle: "Agent", type: "texte", largeur: 8 },
      { cle: "carte_numero", libelle: "N° de carte pro", type: "texte", largeur: 7 },
      { cle: "carte_fin", libelle: "Carte valable jusqu’au", type: "date", largeur: 7.5 },
      { cle: "dracar", libelle: "Déclaré Dracar", type: "verif", largeur: 6 },
      { cle: "planning", libelle: "Sur le planning", type: "verif", largeur: 6 },
      { cle: "affecte_mission", libelle: "Affectation conforme", type: "verif", largeur: 6 },
    ],
  },
  smic_horaire: {
    nom: "smic_horaire",
    cle: "valable_du",
    parSousTraitant: false,
    globale: true,
    colonnes: [
      { cle: "valable_du", libelle: "En vigueur depuis le", type: "date", largeur: 8 },
      { cle: "taux_brut", libelle: "SMIC horaire brut (€)", type: "euros", largeur: 7 },
      { cle: "source", libelle: "Source vérifiée", type: "texte", largeur: 14 },
    ],
  },
};

export const LIBELLES_VERIF: Record<string, string> = {
  oui: "Oui",
  non: "Non",
  a_verifier: "À vérifier",
  na: "Sans objet",
};

/**
 * Lecture d'un nombre saisi ou collé à la française : « 1 234,50 », « 1234.5 », « 12 000 h »,
 * « 2 400,00 € ». Renvoie null pour une case vide, NaN pour une saisie illisible.
 */
export const lireNombre = (brut: string): number | null => {
  const t = brut.replace(/[\s  ]/g, "").replace(/(€|h|heures?|ETP)$/i, "");
  if (t === "") return null;
  const normalise = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = Number(normalise);
  return Number.isFinite(n) ? n : Number.NaN;
};

const MOIS_FR = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];

/** « 2026-03 », « 03/2026 », « 3/26 », « mars 2026 », « 01/03/2026 » → « 2026-03-01 ». */
export const lireMois = (brut: string): string | null | "invalide" => {
  const t = brut.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (!t) return null;
  let m = t.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-01`;
  m = t.match(/^(?:\d{1,2}[/.-])?(\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (m) {
    const an = m[2].length === 2 ? `20${m[2]}` : m[2];
    const mo = Number(m[1]);
    if (mo >= 1 && mo <= 12) return `${an}-${String(mo).padStart(2, "0")}-01`;
  }
  m = t.match(/^([a-z]+)\.?\s+(\d{4})$/);
  if (m) {
    const i = MOIS_FR.findIndex((x) => x.startsWith(m![1].slice(0, 3)));
    if (i >= 0) return `${m[2]}-${String(i + 1).padStart(2, "0")}-01`;
  }
  return "invalide";
};

/** « 2026-03-31 », « 31/03/2026 », « 31/03/26 » → « 2026-03-31 ». */
export const lireDate = (brut: string): string | null | "invalide" => {
  const t = brut.trim();
  if (!t) return null;
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return t;
  m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (m) {
    const an = m[3].length === 2 ? `20${m[3]}` : m[3];
    const d = `${an}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    return Number.isNaN(Date.parse(d)) ? "invalide" : d;
  }
  return "invalide";
};

/** « oui », « Non », « à vérifier », « x », « ✓ » → valeur de check_result. */
export const lireVerif = (brut: string): string | null | "invalide" => {
  const t = brut.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (!t) return null;
  if (["oui", "o", "x", "✓", "ok", "vrai", "yes"].includes(t)) return "oui";
  if (["non", "n", "faux", "no"].includes(t)) return "non";
  if (t.startsWith("a verif") || t === "?") return "a_verifier";
  if (t.startsWith("sans objet") || t === "na" || t === "n/a") return "na";
  return "invalide";
};

/** Ligne de la base → valeurs affichées dans le tableau de saisie. */
export const versLigneInitiale = (table: NomTable, ligne: Record<string, unknown>): { cle: string; valeurs: Record<string, string> } => {
  const def = TABLES[table];
  const valeurs: Record<string, string> = {};
  for (const c of def.colonnes) {
    const v = ligne[c.cle];
    if (v === null || v === undefined) {
      valeurs[c.cle] = "";
    } else if (c.type === "mois") {
      valeurs[c.cle] = String(v).slice(0, 7);
    } else if (c.type === "heures" || c.type === "euros" || c.type === "nombre") {
      valeurs[c.cle] = String(v).replace(".", ",");
    } else {
      valeurs[c.cle] = String(v);
    }
  }
  const cle = def.cle === "mois" ? String(ligne.mois).slice(0, 10) : String(ligne[def.cle]);
  return { cle, valeurs };
};
