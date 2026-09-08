import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "./env";

/**
 * Client Supabase pour les composants client (« use client »).
 * Lit la session depuis les cookies du navigateur.
 */
export const createClient = () => {
  const { url, key } = requireSupabaseEnv();
  return createBrowserClient(url, key);
};
