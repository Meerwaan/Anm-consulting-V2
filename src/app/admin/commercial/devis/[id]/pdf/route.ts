import { NextResponse } from "next/server";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { lireCabinet, type ClientFiche } from "@/lib/facturation/donnees";
import { normaliserDevis, type Devis } from "@/lib/facturation/devis";
import { nomPdfDevis, produirePdfDevis } from "@/lib/facturation/pdf-devis";

export const runtime = "nodejs";

/** Le devis tel qu'il part chez le client. */
export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
  await exigerRole("consultant");
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("devis").select("*, organisation:organizations (*)").eq("id", id).maybeSingle();
  if (!data) return new NextResponse("Devis introuvable.", { status: 404 });
  const org = data.organisation as ClientFiche;
  const devis = normaliserDevis(data as Devis);
  const cabinet = await lireCabinet();
  let pdf: Buffer;
  try {
    pdf = await produirePdfDevis(devis, cabinet, org);
  } catch (e) {
    console.error("[devis] PDF", (e as Error).stack);
    return new NextResponse("Le devis n’a pas pu être produit. Réessayez ; si l’erreur persiste, prévenez Merwan.", { status: 500 });
  }
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${encodeURIComponent(nomPdfDevis(devis.numero, org.name))}"`,
      "Cache-Control": "no-store",
    },
  });
};
