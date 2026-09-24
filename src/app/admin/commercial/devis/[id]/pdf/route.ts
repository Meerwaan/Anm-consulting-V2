import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { lireCabinet, partieCabinet, partieClient, type ClientFiche } from "@/lib/facturation/donnees";
import { normaliserDevis, type Devis } from "@/lib/facturation/devis";
import { DocumentDevis } from "@/lib/facturation/DocumentDevis";

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
    pdf = await renderToBuffer(
      DocumentDevis({
        devis,
        vendeur: partieCabinet({ ...cabinet, capital: cabinet.capital === null ? null : Number(cabinet.capital) }),
        client: { ...partieClient(org), representant: org.representant, fonction: org.representant_fonction },
      }),
    );
  } catch (e) {
    console.error("[devis] PDF", (e as Error).stack);
    return new NextResponse("Le devis n’a pas pu être produit. Réessaie ; si l’erreur persiste, préviens Merwan.", { status: 500 });
  }
  const nom = `Devis-${devis.numero}-${org.name.replace(/[^\p{L}\p{N}]+/gu, "-")}.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${encodeURIComponent(nom)}"`, "Cache-Control": "no-store" },
  });
};
