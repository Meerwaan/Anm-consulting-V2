/**
 * Types applicatifs alignés sur le schéma Supabase (migrations 0002 → 0008).
 * À régénérer si le schéma bouge : `supabase gen types typescript`.
 */

export type Role = "consultant" | "client" | "learner";

export interface Profil {
  id: string;
  org_id: string | null;
  role: Role;
  full_name: string | null;
  job_title: string | null;
}

export type TypeMission =
  | "flash" | "cnaps" | "social_urssaf" | "inspection" | "fiscal"
  | "audit_360" | "suivi_conformite";

export type StatutMission =
  | "qualification" | "documents_en_attente" | "analyse" | "sur_site"
  | "rapport" | "restitution" | "clos";

export type NatureEtape =
  | "entretien" | "perimetre" | "collecte" | "analyse" | "echantillon" | "controle"
  | "rapprochement" | "qualification" | "plan_actions" | "rapport" | "restitution";

export type StatutEtape = "todo" | "doing" | "done" | "na";

/** control_status : résultat d'un point de contrôle. */
export type ResultatPoint = "conforme" | "partiel" | "non_conforme" | "na" | "a_verifier";

export type Criticite = "critique" | "majeur" | "modere" | "mineur";

export type Domaine =
  | "gouvernance" | "cnaps" | "social" | "paie" | "temps" | "urssaf"
  | "inspection_sst" | "sous_traitance" | "operationnel" | "fiscal";

export interface Mission {
  id: string;
  reference: string;
  type: TypeMission;
  status: StatutMission;
  opened_on: string;
  control_in_progress: boolean;
  control_body: string | null;
  control_deadline: string | null;
  intervention_on: string | null;
  restitution_on: string | null;
  scope: string | null;
  initial_hotspots: string | null;
  org_id: string;
}

export interface AvancementEtape {
  step_id: number;
  sort_order: number;
  name: string;
  kind: NatureEtape;
  phase_id: number | null;
  status: StatutEtape;
  points_total: number;
  points_traites: number;
}

/** Qualité de la référence héritée du pack. */
export type NatureReference = "source" | "interne" | "a_qualifier";

export interface PointDeControle {
  id: number;
  code: string;
  domain: Domaine;
  theme: string;
  subtheme: string | null;
  question: string;
  evidence: string | null;
  initial_risk: Criticite;
  reference: string | null;
  reference_kind: NatureReference;
}

export interface ResultatDePoint {
  control_point_id: number;
  status: ResultatPoint;
  severity: Criticite | null;
  note: string | null;
  finding_id: string | null;
}

export interface PieceMission {
  id: string;
  name: string;
  category: string;
  required: boolean;
  received: "oui" | "non" | "na" | "a_verifier";
  received_on: string | null;
  complete: "oui" | "non" | "a_verifier" | "na";
  requested_on: string | null;
  module_id: number | null;
  kind: string;
}

/** État de validité d'une pièce (vue mission_documents_validite). */
export type EtatValidite =
  | "sans_objet" | "non_recue" | "date_manquante" | "valide" | "bientot_perimee" | "perimee";

export interface ValiditePiece {
  id: string;
  name: string;
  category: string;
  required: boolean;
  received: "oui" | "non" | "na" | "a_verifier";
  document_date: string | null;
  validite_nature: "texte" | "pratique" | "date_du_document" | "indefinie" | null;
  validite_note: string | null;
  validite_jours: number | null;
  echeance: string | null;
  etat: EtatValidite;
}

/** Contrôle croisé (vue mission_reconciliation_status). */
export interface LigneRapprochement {
  id: string;
  kind: string;
  periode: string | null;
  valeur_a: number | null;
  valeur_b: number | null;
  tolerance_pct: number;
  note: string | null;
  ecart: number | null;
  ecart_pct: number | null;
  statut: "a_saisir" | "coherent" | "ecart";
}

export type StatutConstat = "ouvert" | "en_analyse" | "valide" | "clos";
export type NatureConstat = "risque_controle" | "amelioration";
export type Priorite = "P1" | "P2" | "P3" | "P4";

export interface Constat {
  id: string;
  control_point_id: number | null;
  domain: Domaine;
  title: string;
  fact: string;
  evidence: string | null;
  severity: Criticite;
  reference: string | null;
  reference_checked: "oui" | "non" | "na" | "a_verifier";
  recommendation: string | null;
  priority: Priorite;
  nature: NatureConstat;
  status: StatutConstat;
  visible_to_client: boolean;
  in_report: boolean;
  /** Position parmi les 5 constats prioritaires de la synthèse dirigeant. */
  report_rank: number | null;
  /** Rappels du référentiel, affichés sous les champs pour guider la rédaction. */
  code_point?: string | null;
  question_point?: string | null;
  preuve_attendue?: string | null;
}

export type StatutAction = "a_faire" | "en_cours" | "clos" | "accepte";

export interface ActionPlan {
  id: string;
  finding_id: string | null;
  domain: Domaine;
  title: string;
  client_owner: string | null;
  due_on: string | null;
  priority: Priorite;
  status: StatutAction;
  comment: string | null;
  /** Titre du constat d'origine, quand l'action en vient. */
  constat?: string | null;
}
