import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";

/** Ouvre une version émise du rapport, par une URL signée de 60 secondes. */
export const GET = async (_req: Request, { params }: { params: Promise<{ id: string; rapport: string }> }): Promise<NextResponse> => {
  await exigerRole("consultant");
  const { id, rapport } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("reports").select("storage_path").eq("id", rapport).eq("mission_id", id).maybeSingle<{ storage_path: string | null }>();
  if (!data?.storage_path) return new NextResponse("Version introuvable.", { status: 404 });
  const { data: signe } = await supabase.storage.from("pieces").createSignedUrl(data.storage_path, 60);
  if (!signe) return new NextResponse("Le stockage n’a pas répondu.", { status: 502 });
  const r = NextResponse.redirect(signe.signedUrl);
  r.headers.set("Cache-Control", "no-store");
  return r;
};
