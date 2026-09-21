/** Données saisies du module sous-traitance (migration 0032). Dates au format AAAA-MM-JJ. */

export type Verif = "oui" | "non" | "na" | "a_verifier";

export interface ParametresST {
  periode_debut: string | null;
  periode_fin: string | null;
  /** € HT par heure : convertit une facture client qui ne porte qu'un montant. */
  taux_horaire_vendu: number | null;
  /** Durée mensuelle d'un temps plein (151,67 h par défaut). */
  heures_mensuelles_etp: number;
  /** Coût de revient horaire de référence de la branche (€ HT), saisi avec sa source. */
  cout_revient_horaire?: number | null;
  cout_revient_source?: string | null;
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
  /** Conclusion du contrat : point de départ de l'échéancier de vigilance. */
  date_conclusion_contrat: string | null;
  date_fin_contrat: string | null;
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
  /** Identité (Sofia, 21/09/2026) : pièce, fin de validité, autorisation de travail. */
  piece_identite?: "cni" | "passeport" | "titre_sejour" | "autre" | null;
  piece_fin?: string | null;
  autorisation_travail?: Verif | null;
  titre_authentifie?: Verif | null;
  /** Salariés de l'entreprise auditée (module URSSAF). */
  type_contrat?: string | null;
  date_entree?: string | null;
  date_sortie?: string | null;
  date_dpae?: string | null;
  contrat_signe?: Verif | null;
  registre?: Verif | null;
  visite_medicale?: string | null;
  visite_prochaine?: string | null;
  note: string | null;
}
