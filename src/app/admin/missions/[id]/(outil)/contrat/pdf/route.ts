import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { contratPropose, lireFacturation } from "@/lib/facturation/donnees";
import { DocumentContrat } from "@/lib/facturation/DocumentContrat";

export const runtime = "nodejs";

/** Le contrat : la version archivée s'il est signé, sinon le PDF tel qu'il serait signé maintenant. */
export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
  await exigerRole("consultant");
  const { id } = await params;
  const d = await lireFacturation(id);
  if (!d) return new NextResponse("Mission introuvable.", { status: 404 });
  const nom = `Contrat-${d.mission.reference}-${d.mission.organisation.name.replace(/[^\p{L}\p{N}]+/gu, "-")}.pdf`;
  let pdf: Uint8Array<ArrayBuffer>;
  if (d.contrat?.signe_le && d.contrat.archive_path) {
    const supabase = await createClient();
    const { data } = await supabase.storage.from("pieces").download(d.contrat.archive_path);
    if (!data) return new NextResponse("Le contrat archivé est introuvable.", { status: 404 });
    pdf = new Uint8Array(await data.arrayBuffer());
  } else {
    const contrat = d.contrat ?? { ...contratPropose(d), signe_le: null };
    try {
      pdf = new Uint8Array(await renderToBuffer(DocumentContrat({ cabinet: d.cabinet, client: d.mission.organisation, mission: d.mission, contrat })));
    } catch (e) {
      console.error("[contrat] PDF", (e as Error).stack);
      return new NextResponse("Le contrat n’a pas pu être produit. Réessaie ; si l’erreur persiste, préviens Merwan.", { status: 500 });
    }
  }
  return new NextResponse(pdf, {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${encodeURIComponent(nom)}"`, "Cache-Control": "no-store" },
  });
};
