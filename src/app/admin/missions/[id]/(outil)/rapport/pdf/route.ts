import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { exigerRole } from "@/lib/supabase/session";
import { chargerRapport } from "@/lib/rapport/charger";
import { DocumentRapport } from "@/lib/rapport/DocumentRapport";

export const runtime = "nodejs";

/** Aperçu du rapport : le PDF tel qu'il serait émis maintenant, sans l'archiver. */
export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
  const session = await exigerRole("consultant");
  const { id } = await params;
  const r = await chargerRapport(id, session.profil?.full_name ?? "L’auditrice");
  if (!r) return new NextResponse("Mission introuvable.", { status: 404 });
  const date = new Date().toLocaleDateString("fr-FR");
  let pdf: Buffer;
  try {
    pdf = await renderToBuffer(DocumentRapport({ r, version: "aperçu", dateEmission: date }));
  } catch (e) {
    console.error("[rapport] PDF", (e as Error).stack);
    return new NextResponse("Le rapport n’a pas pu être produit. Réessaie ; si l’erreur persiste, préviens Merwan.", { status: 500 });
  }
  const nom = `Rapport-${r.mission.client.replace(/[^\p{L}\p{N}]+/gu, "-")}-apercu.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${encodeURIComponent(nom)}"`,
      "Cache-Control": "no-store",
    },
  });
};
