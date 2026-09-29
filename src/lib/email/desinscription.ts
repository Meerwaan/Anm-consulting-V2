/**
 * Désinscription de l’avis de parution de l’Observatoire, sans compte : le jeton aléatoire porté par
 * le lien de chaque email (colonne `leads.jeton_desinscription`, migration 0044) suffit.
 * La base fait le travail dans `desinscrire_lead`, seule fonction ouverte aux visiteurs anonymes.
 */
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/supabase/env";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const jetonValide = (jeton: string | null | undefined): jeton is string => !!jeton && UUID.test(jeton);

export type ResultatDesinscription = "ok" | "inconnu" | "erreur";

/** Ne lève jamais : « inconnu » si le jeton ne correspond à aucune inscription. */
export const desinscrire = async (jeton: string | null | undefined): Promise<ResultatDesinscription> => {
  if (!jetonValide(jeton)) return "inconnu";
  try {
    const { url, key } = requireSupabaseEnv();
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase.rpc("desinscrire_lead", { p_jeton: jeton });
    if (error) {
      console.error("[désinscription] refus de la base", error.message);
      return "erreur";
    }
    return data === true ? "ok" : "inconnu";
  } catch (erreur) {
    console.error("[désinscription] échec", erreur instanceof Error ? erreur.message : erreur);
    return "erreur";
  }
};
