/**
 * Résolution des variables d'environnement Supabase.
 *
 * Deux noms cohabitent pour la clé publique : Supabase pousse désormais
 * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (clés `sb_publishable_…`, rotables
 * indépendamment), alors que l'intégration Vercel et l'ancien tooling
 * injectent encore `NEXT_PUBLIC_SUPABASE_ANON_KEY`. On accepte les deux pour
 * que le projet démarre quelle que soit la source des variables.
 */

/** URL de l'API Supabase (projet anm-consulting, eu-west-3). */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Clé publique côté navigateur. La RLS reste la seule barrière de sécurité. */
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Renvoie les identifiants Supabase ou échoue avec un message lisible.
 * Évite le `!` qui produit un « Invalid URL » incompréhensible au runtime.
 */
export const requireSupabaseEnv = (): { url: string; key: string } => {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Supabase n'est pas configuré : renseigner NEXT_PUBLIC_SUPABASE_URL et " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY) " +
        "dans .env.local, ou lancer `vercel env pull .env.local`.",
    );
  }
  return { url: SUPABASE_URL, key: SUPABASE_PUBLISHABLE_KEY };
};
