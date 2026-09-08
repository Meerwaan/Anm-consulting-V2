import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "./env";

/**
 * Client Supabase pour les Server Components, Server Actions et Route Handlers.
 * À créer à chaque requête : ne jamais le stocker dans une variable de module,
 * sinon la session d'un utilisateur fuiterait vers un autre.
 */
export const createClient = async () => {
  const { url, key } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component : l'écriture de cookies y est
          // interdite. Sans effet tant que le middleware rafraîchit la session.
        }
      },
    },
  });
};
