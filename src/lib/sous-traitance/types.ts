/** Données saisies du module sous-traitance (migration 0032). Dates au format AAAA-MM-JJ. */

export type Verif = "oui" | "non" | "na" | "a_verifier";

export interface ParametresST {
  periode_debut: string | null;
  periode_fin: string | null;
  /** € HT par heure : convertit une facture client qui ne porte qu'un montant. */
  taux_horaire_vendu: number | null;
  /** Durée mensuelle d'un temps plein (151,67 h par défaut). */
  heures_mensuelles_etp: number;
}

/** A — une ligne de vente du donneur d'ordre. */
export interface Vente {
  id: string;
  mois: string;
  client: string | null;
  bon_commande: string | null;
  heures_commandees: number | null;
  heures_facturees: number | null;
  montant_ht: number | null;
  numero_facture: string | null;
  tva: number | null;
  montant_ttc: number | null;
  montant_regle: number | null;
  date_reglement: string | null;
  note: string | null;
}

/** B — les heures des bulletins de paie du donneur d'ordre, pour un mois. */
export interface Paie {
  mois: string;
  effectif: number | null;
  /** Heures réalisées selon le planning ou le pointage. */
  heures_realisees: number | null;
  /** Heures rémunérées selon les bulletins. */
  heures_payees: number | null;
  masse_salariale: number | null;
  note: string | null;
}

export interface SousTraitant {
  id: string;
  raison_sociale: string;
  siren: string | null;
  adresse: string | null;
  dirigeant: string | null;
  activite: string | null;
  debut_relation: string | null;
  contrat_ref: string | null;
  montant_contrat_ht: number | null;
  rang: 1 | 2;
  donneur_id: string | null;
  note: string | null;
}

export interface Attestation {
  id: string;
  sous_traitant_id: string;
  date_delivrance: string | null;
  mois_reference: string | null;
  effectif_etp: number | null;
  remunerations: number | null;
  siren_conforme: Verif | null;
  authentifiee: Verif | null;
  note: string | null;
}

export interface FactureST {
  id: string;
  sous_traitant_id: string;
  numero: string | null;
  date_facture: string | null;
  mois: string | null;
  heures: number | null;
  montant_ht: number | null;
  montant_ttc: number | null;
  note: string | null;
}

export interface Paiement {
  id: string;
  sous_traitant_id: string;
  facture_id: string | null;
  date_paiement: string | null;
  montant: number | null;
  reference: string | null;
  compte_au_nom: Verif | null;
  note: string | null;
}

export interface Smic {
  valable_du: string;
  taux_brut: number;
  source?: string | null;
}

/** Un agent contrôlé (grilles 02 §7 et 03 §4). */
export interface Agent {
  id: string;
  sous_traitant_id: string | null;
  nom: string | null;
  employeur: string | null;
  carte_numero: string | null;
  heures: number | null;
  present_documents: Verif | null;
  carte_valide: Verif | null;
  carte_activite: Verif | null;
  dracar: Verif | null;
  planning: Verif | null;
  carte_fin: string | null;
  affecte_mission: Verif | null;
  note: string | null;
}
