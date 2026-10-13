import { NextResponse } from "next/server";
import { lireDevisPublic } from "@/lib/facturation/devis-public";
import { nomPdfDevis, produirePdfDevis } from "@/lib/facturation/pdf-devis";

export const runtime = "nodejs";

/** Le PDF du devis, pour le client qui présente son lien. Même document que celui de l'email. */
export const GET = async (_req: Request, { params }: { params: Promise<{ jeton: string }> }): Promise<NextResponse> => {
  const { jeton } = await params;
  const d = await lireDevisPublic(jeton);
  if (!d || d === "retire") return new NextResponse("Ce devis n’est pas disponible.", { status: 404 });
  let pdf: Buffer;
  try {
    pdf = await produirePdfDevis(d.devis, d.cabinet, d.client);
  } catch (e) {
    console.error("[devis] PDF public", (e as Error).stack);
    return new NextResponse("Le devis n’a pas pu être produit. Réessayez dans un instant, ou écrivez à contact@anm-consulting.fr.", { status: 500 });
  }
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${encodeURIComponent(nomPdfDevis(d.devis.numero, d.client.name))}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    },
  });
};
