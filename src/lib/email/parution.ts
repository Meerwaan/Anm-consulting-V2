/**
 * Avis de parution de l’Observatoire : à la PREMIÈRE publication d’un article, un email à chaque
 * inscrit « Être prévenu » (leads de source `observatoire`).
 *
 * - Dédoublonnage par adresse (insensible à la casse) : l’inscription la plus récente fait foi, avec
 *   son jeton de désinscription.
 * - Une adresse désinscrite (`desabonne_le`) ne reçoit plus rien, sauf si elle s’est réinscrite depuis.
 * - Les lignes d’exemple de l’espace commercial sont exclues.
 * - Envoi par lots de 100 (API batch Resend). Un échec n’annule jamais la publication.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Article } from "@/lib/observatoire/article";
import { envoyerLot } from "./envoi";
import { parutionObservatoire } from "./messages";

interface Inscription {
  email: string;
  created_at: string;
  desabonne_le: string | null;
  jeton_desinscription: string;
}

export interface ResultatParution {
  /** Destinataires retenus après dédoublonnage et désinscriptions. */
  inscrits: number;
  envoyes: number;
  /** false si la liste n’a pas pu être lue ou si au moins un lot n’est pas parti. */
  ok: boolean;
}

export const annoncerParution = async (
  supabase: SupabaseClient,
  article: Pick<Article, "titre" | "slug" | "type" | "territoire" | "accroche">,
): Promise<ResultatParution> => {
  const { data, error } = await supabase
    .from("leads")
    .select("email, created_at, desabonne_le, jeton_desinscription")
    .eq("source", "observatoire")
    .eq("exemple", false)
    .order("created_at", { ascending: false })
    .returns<Inscription[]>();
  if (error || !data) {
    console.error("[email] parution Observatoire : lecture des inscrits impossible", error?.message);
    return { inscrits: 0, envoyes: 0, ok: false };
  }

  // Trié du plus récent au plus ancien : la première ligne vue pour une adresse fait foi.
  const retenues = new Map<string, Inscription>();
  for (const ligne of data) {
    const cle = ligne.email.trim().toLowerCase();
    if (!retenues.has(cle)) retenues.set(cle, ligne);
  }
  const destinataires = [...retenues.entries()].filter(([, l]) => !l.desabonne_le);
  if (!destinataires.length) return { inscrits: 0, envoyes: 0, ok: true };

  const resultat = await envoyerLot(
    destinataires.map(([email, l]) => parutionObservatoire(article, email, l.jeton_desinscription)),
    `parution Observatoire /${article.slug}`,
  );
  return { inscrits: destinataires.length, envoyes: resultat.envoyes, ok: resultat.ok };
};

/** Message honnête pour l’espace de travail, selon ce qui est réellement parti. */
export const messageParution = (r: ResultatParution): string => {
  if (!r.ok && r.envoyes === 0) return "L’email aux inscrits n’a pas pu partir.";
  if (!r.ok) return `L’email n’est parti qu’à ${r.envoyes} inscrit${r.envoyes > 1 ? "s" : ""} sur ${r.inscrits}.`;
  if (r.inscrits === 0) return "Aucun inscrit à prévenir pour l’instant.";
  return `Email envoyé à ${r.envoyes} inscrit${r.envoyes > 1 ? "s" : ""}.`;
};
