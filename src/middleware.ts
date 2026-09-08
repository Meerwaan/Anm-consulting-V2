import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ESPACES_PROTEGES = ["/app", "/admin"];

/**
 * Rafraîchit la session Supabase, puis barre l'entrée des espaces authentifiés
 * aux visiteurs anonymes. Le contrôle du RÔLE se fait dans les layouts, pas ici :
 * il demande une requête en base, qu'on ne veut pas payer à chaque navigation.
 */
export const middleware = async (request: NextRequest) => {
  const { response, utilisateurId } = await updateSession(request);

  const chemin = request.nextUrl.pathname;
  const protege = ESPACES_PROTEGES.some((p) => chemin === p || chemin.startsWith(`${p}/`));
  if (protege && !utilisateurId) {
    const url = new URL("/connexion", request.nextUrl.origin);
    url.searchParams.set("suite", chemin);
    return NextResponse.redirect(url);
  }

  return response;
};

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/connexion/:path*", "/auth/:path*"],
};
