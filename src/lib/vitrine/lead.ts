/**
 * État d'un envoi de lead, partagé entre l'action serveur et les formulaires clients.
 * Séparé de actions.ts : un module « use server » ne peut exporter que des fonctions async.
 */
export interface EtatLead {
  ok: boolean;
  message: string | null;
  erreur: string | null;
}

export const ETAT_LEAD_INITIAL: EtatLead = { ok: false, message: null, erreur: null };
