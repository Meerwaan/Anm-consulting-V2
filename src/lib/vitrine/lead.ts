/**
 * État d'un envoi de lead, partagé entre l'action serveur et les formulaires clients.
 * Séparé de actions.ts : un module « use server » ne peut exporter que des fonctions async.
 */
export interface EtatLead {
  ok: boolean;
  message: string | null;
  erreur: string | null;
  /** L’email promis (accusé de réception, checklist, confirmation) est réellement parti. */
  emailEnvoye?: boolean;
}

export const ETAT_LEAD_INITIAL: EtatLead = { ok: false, message: null, erreur: null };

/**
 * Les sources « inscription » : un email laissé pour recevoir une checklist ou être prévenu d'une
 * parution de l'Observatoire. Ce ne sont pas des demandes de devis : l'espace Commercial les range à
 * part, sans bouton devis, et le bandeau des missions ne les compte pas. Liste unique, à tenir à jour
 * avec les formulaires du site (`src/app/(marketing)/actions.ts`, `LeadMagnet`).
 */
export const SOURCES_INSCRIPTION = ["checklist-cnaps", "checklist-urssaf", "checklist-inspection", "checklist-fiscal", "observatoire"] as const;

/** Une inscription, pas une demande. Toute nouvelle checklist (`checklist-…`) en est une d'office. */
export const estInscription = (source: string | null | undefined): boolean =>
  Boolean(source) && ((SOURCES_INSCRIPTION as readonly string[]).includes(source!) || source!.startsWith("checklist-"));

/** Le libellé de chaque source, tel qu'affiché dans l'espace Commercial. */
export const LIBELLE_SOURCE: Record<string, string> = {
  contact: "Formulaire de contact",
  abonnement: "Page abonnement",
  formation: "Liste d’attente formation",
  "checklist-cnaps": "Checklist CNAPS",
  "checklist-urssaf": "Checklist URSSAF",
  "checklist-inspection": "Checklist Inspection du travail",
  "checklist-fiscal": "Checklist DGFiP",
  observatoire: "Alerte Observatoire",
};
