import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * Client Supabase « clé de service » : contourne la RLS. Serveur uniquement.
 *
 * Réservé aux gestes qu'aucune policy ne peut autoriser : créer un compte, générer un lien
 * de définition du mot de passe, bloquer un compte. Ne jamais l'importer depuis un fichier
 * « use client » : la variable n'a pas de préfixe NEXT_PUBLIC_, Next ne l'enverrait pas au
 * navigateur, mais l'import ferait échouer le build.
 *
 * Renvoie null si la clé manque (préproduction mal configurée) : l'écran le dit au lieu de planter.
 */
export const clientAdmin = (): SupabaseClient | null => {
  if (typeof window !== "undefined") throw new Error("clientAdmin() est réservé au serveur.");
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !cle) return null;
  return createClient(SUPABASE_URL, cle, { auth: { persistSession: false, autoRefreshToken: false } });
};

export const MESSAGE_CLE_ABSENTE =
  "La clé de service Supabase (SUPABASE_SERVICE_ROLE_KEY) n’est pas configurée sur ce serveur : les accès client ne peuvent pas être créés. Prévenez Merwan.";
