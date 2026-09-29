import { NextResponse, type NextRequest } from "next/server";
import { desinscrire } from "@/lib/email/desinscription";

/**
 * Désinscription en un clic depuis la messagerie (en-têtes List-Unsubscribe et
 * List-Unsubscribe-Post, RFC 8058) : la messagerie envoie un POST, sans page ni confirmation.
 * Un GET (lien ouvert à la main) renvoie vers la page, qui demande une confirmation : les
 * antivirus de messagerie ouvrent les liens et ne doivent pas désinscrire à la place du lecteur.
 */
export const POST = async (request: NextRequest) => {
  const resultat = await desinscrire(request.nextUrl.searchParams.get("jeton"));
  return new NextResponse(null, { status: resultat === "erreur" ? 500 : resultat === "ok" ? 200 : 404 });
};

export const GET = (request: NextRequest) => {
  const url = new URL("/desinscription", request.nextUrl.origin);
  const jeton = request.nextUrl.searchParams.get("jeton");
  if (jeton) url.searchParams.set("jeton", jeton);
  return NextResponse.redirect(url);
};
