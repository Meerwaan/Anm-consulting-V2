import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Déconnexion. En POST uniquement : une déconnexion ne doit pas être déclenchée par un lien. */
export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/connexion", request.nextUrl.origin), { status: 303 });
};
