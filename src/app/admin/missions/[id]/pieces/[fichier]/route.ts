import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";

/**
 * Ouvre un fichier déposé.
 *
 * Le bucket est privé : on ne donne jamais d'adresse publique d'un document de paie.
 * Chaque ouverture crée une URL signée valable 60 secondes, le temps que Safari la
 * charge. Un lien copié ou transféré ne sert plus à rien une minute plus tard.
 * `?telecharger=1` force l'enregistrement sous le nom d'origine.
 */
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fichier: string }> },
): Promise<NextResponse> => {
  await exigerRole("consultant");
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
  if (error || !signe) return new NextResponse("Le stockage n’a pas répondu. Réessaie.", { status: 502 });

  const reponse = NextResponse.redirect(signe.signedUrl);
  reponse.headers.set("Cache-Control", "no-store");
  return reponse;
};
