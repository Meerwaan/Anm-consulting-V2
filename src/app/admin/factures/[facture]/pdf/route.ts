import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { lireCabinet, normaliserFacture, type Facture } from "@/lib/facturation/donnees";
import { DocumentFacture } from "@/lib/facturation/DocumentFacture";

export const runtime = "nodejs";

/** Une facture : le PDF archivé à l'émission ; à défaut, reproduit depuis la ligne figée en base. */
export const GET = async (_req: Request, { params }: { params: Promise<{ facture: string }> }): Promise<NextResponse> => {
  await exigerRole("consultant");
  const { facture } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("factures").select("*").eq("id", facture).maybeSingle();
  if (!data) return new NextResponse("Facture introuvable.", { status: 404 });
  const f = normaliserFacture(data as Facture);
  const nom = `${f.numero}-${f.client.nom.replace(/[^\p{L}\p{N}]+/gu, "-")}.pdf`;
  let pdf: Uint8Array<ArrayBuffer> | null = null;
  if (f.archive_path) {
    const { data: fichier } = await supabase.storage.from("pieces").download(f.archive_path);
    if (fichier) pdf = new Uint8Array(await fichier.arrayBuffer());
  }
  if (!pdf) {
    const cabinet = await lireCabinet();
    const origine = f.facture_origine
      ? ((await supabase.from("factures").select("numero, emise_le").eq("id", f.facture_origine).maybeSingle()).data as { numero: string; emise_le: string } | null)
      : null;
    pdf = new Uint8Array(await renderToBuffer(DocumentFacture({ facture: f, origine, iban: f.nature === "avoir" ? null : cabinet.iban, bic: cabinet.bic, delaiJours: cabinet.delai_paiement_jours })));
  }
  return new NextResponse(pdf, {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${encodeURIComponent(nom)}"`, "Cache-Control": "no-store" },
  });
};
