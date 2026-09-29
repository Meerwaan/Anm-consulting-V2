import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";

/**
 * Télécharge une version publiée du rapport. Une version non publiée n'est pas lisible par le
 * client (RLS reports_read), et le stockage ne signe que les rapports publiés de sa mission.
 */
export const GET = async (_req: Request, { params }: { params: Promise<{ id: string; rapport: string }> }): Promise<NextResponse> => {
  await exigerRole("client");
  const { id, rapport } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("storage_path, version")
    .eq("id", rapport)
    .eq("mission_id", id)
    .eq("published_to_client", true)
    .maybeSingle<{ storage_path: string | null; version: string }>();
  if (!data?.storage_path) return new NextResponse("Rapport introuvable.", { status: 404 });

  const { data: signe } = await supabase.storage
    .from("pieces")
    .createSignedUrl(data.storage_path, 60, { download: `Rapport ANM Consulting ${data.version}.pdf` });
  if (!signe) return new NextResponse("Le stockage n’a pas répondu. Réessayez.", { status: 502 });
  const r = NextResponse.redirect(signe.signedUrl);
  r.headers.set("Cache-Control", "no-store");
  return r;
};
