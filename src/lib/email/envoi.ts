/**
 * Envoi des emails transactionnels par l’API HTTP de Resend (https://resend.com/docs/api-reference).
 *
 * Serveur uniquement : la clé `RESEND_API_KEY` n’est jamais exposée au navigateur (pas de préfixe
 * NEXT_PUBLIC_). À n’importer que depuis une action serveur ou une route.
 *
 * Règle du projet : ne jamais promettre à l’écran un email qui ne part pas. Ces fonctions ne lèvent
 * donc jamais d’exception : elles renvoient `{ ok }` et l’appelant choisit un message vrai. L’échec
 * est journalisé (sans la clé ni le contenu du message) : clé absente, domaine anm-consulting.fr pas
 * encore vérifié chez Resend (réponse 403), réseau, quota.
 */

const API = "https://api.resend.com";
const DELAI_MS = 10_000;
/** Plafond de l’API batch de Resend : 100 emails par appel. */
const TAILLE_LOT = 100;

export const EXPEDITEUR = "ANM Consulting <contact@anm-consulting.fr>";
export const ADRESSE_CONTACT = "contact@anm-consulting.fr";

export interface Email {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Par défaut contact@anm-consulting.fr : une réponse arrive dans la boîte d’ANM. */
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface ResultatEnvoi {
  ok: boolean;
}

export interface ResultatLot {
  ok: boolean;
  /** Nombre d’emails acceptés par Resend. */
  envoyes: number;
  /** Nombre d’emails refusés ou non partis. */
  echecs: number;
}

const corps = (e: Email) => ({
  from: EXPEDITEUR,
  to: Array.isArray(e.to) ? e.to : [e.to],
  subject: e.subject,
  html: e.html,
  text: e.text,
  reply_to: e.replyTo ?? ADRESSE_CONTACT,
  ...(e.headers ? { headers: e.headers } : {}),
});

const appeler = async (chemin: string, charge: unknown, contexte: string): Promise<boolean> => {
  const cle = process.env.RESEND_API_KEY?.trim();
  if (!cle) {
    console.error(`[email] ${contexte} : RESEND_API_KEY absente, aucun email envoyé.`);
    return false;
  }
  try {
    const reponse = await fetch(`${API}${chemin}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
      body: JSON.stringify(charge),
      signal: AbortSignal.timeout(DELAI_MS),
      cache: "no-store",
    });
    if (reponse.ok) return true;
    const detail = await reponse.text().catch(() => "");
    console.error(`[email] ${contexte} : refusé par Resend (${reponse.status}) ${detail.slice(0, 300)}`);
    return false;
  } catch (erreur) {
    console.error(`[email] ${contexte} : échec réseau`, erreur instanceof Error ? erreur.message : erreur);
    return false;
  }
};

/** Envoie un email. Ne lève jamais : `{ ok: false }` si l’email n’est pas parti. */
export const envoyerEmail = async (email: Email, contexte = "envoi"): Promise<ResultatEnvoi> => ({
  ok: await appeler("/emails", corps(email), contexte),
});

/**
 * Envoie une série d’emails individuels (un destinataire chacun) par lots de 100 via l’API batch.
 * Un lot refusé n’empêche pas les suivants de partir.
 */
export const envoyerLot = async (emails: Email[], contexte = "lot"): Promise<ResultatLot> => {
  let envoyes = 0;
  let echecs = 0;
  for (let i = 0; i < emails.length; i += TAILLE_LOT) {
    const lot = emails.slice(i, i + TAILLE_LOT);
    const ok = await appeler("/emails/batch", lot.map(corps), `${contexte} (lot ${i / TAILLE_LOT + 1})`);
    if (ok) envoyes += lot.length;
    else echecs += lot.length;
  }
  return { ok: echecs === 0 && envoyes > 0, envoyes, echecs };
};
