import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";

/**
 * Ouvre un fichier d'une pièce, pour le client. La ligne n'est lisible que si la pièce est
 * de sa mission (RLS), et l'URL signée n'est produite que pour ce même chemin (policy
 * pieces_client_lecture). Valable 60 secondes.
 */
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fichier: string }> },
): Promise<NextResponse> => {
  await exigerRole("client");
  const { id, fichier } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("mission_document_files")
    .select("storage_path, file_name")
    .eq("id", fichier)
    .eq("mission_id", id)
    .maybeSingle<{ storage_path: string; file_name: string }>();
  if (!data) return new NextResponse("Fichier introuvable.", { status: 404 });

  const telecharger = request.nextUrl.searchParams.get("telecharger") === "1";
  const { data: signe, error } = await supabase.storage
    .from("pieces")
    .createSignedUrl(data.storage_path, 60, telecharger ? { download: data.file_name } : undefined);
  if (error || !signe) return new NextResponse("Le stockage n’a pas répondu. Réessayez.", { status: 502 });

  const reponse = NextResponse.redirect(signe.signedUrl);
  reponse.headers.set("Cache-Control", "no-store");
  return reponse;
};
