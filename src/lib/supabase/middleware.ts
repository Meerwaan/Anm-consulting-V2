import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requireSupabaseEnv } from "./env";

export interface ResultatSession {
  response: NextResponse;
  utilisateurId: string | null;
}

/**
 * Rafraîchit la session Supabase et la réécrit dans les cookies de la réponse.
 *
 * L'appel à `auth.getUser()` est indispensable : c'est lui qui revalide le
 * token auprès de Supabase et déclenche la rotation du refresh token. Sans
 * lui, la session expire silencieusement et l'utilisateur est déconnecté en
 * pleine mission. `getUser()` (et non `getSession()`) car seul le premier
 * vérifie le JWT côté serveur ; `getSession()` fait confiance au cookie.
 */
export const updateSession = async (request: NextRequest): Promise<ResultatSession> => {
  let supabaseResponse = NextResponse.next({ request });

  const { url, key } = requireSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  return { response: supabaseResponse, utilisateurId: data.user?.id ?? null };
};
