import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Rafraîchit la session Supabase avant chaque requête authentifiée. */
export const middleware = async (request: NextRequest) => updateSession(request);

/**
 * Limité aux espaces authentifiés : portail client, back-office consultante et
 * connexion. La vitrine est publique et servie depuis le cache — inutile de
 * lui coûter un aller-retour d'authentification à chaque page.
 */
export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/connexion/:path*", "/auth/:path*"],
};
