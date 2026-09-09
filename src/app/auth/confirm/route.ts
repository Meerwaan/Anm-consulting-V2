import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { accueilDuRole } from "@/lib/supabase/session";
import type { Role } from "@/lib/types";

/**
 * Retour du lien magique.
 *
 * Deux formes possibles selon le gabarit d'email configuré dans Supabase :
 *   - `?token_hash=…&type=email` — gabarit `{{ .TokenHash }}`, la forme recommandée
 *     côté serveur : rien de sensible ne transite par le fragment d'URL ;
 *   - `?code=…` — gabarit par défaut `{{ .ConfirmationURL }}` avec PKCE, où le
 *     vérificateur est un cookie posé au moment de la demande (donc le lien doit
 *     être ouvert dans le même navigateur).
 * On accepte les deux pour que la connexion marche que le gabarit ait été
 * personnalisé ou non.
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();

  const { error } = tokenHash && type
    ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    : code
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: { message: "lien incomplet" } };

  if (error) {
    // La cause exacte n'est jamais montrée à l'utilisateur (elle parle de jetons), mais
    // elle est tracée : sans elle, un échec de connexion est indébogable.
    console.error("[auth/confirm] échec", { message: error.message, avecTokenHash: Boolean(tokenHash), avecCode: Boolean(code) });
    const url = new URL("/connexion", origin);
    url.searchParams.set("erreur", /expir/i.test(error.message) ? "expire" : "lien");
    return NextResponse.redirect(url);
  }

  const { data } = await supabase.auth.getUser();
  let role: Role | undefined;
  if (data.user) {
    const { data: profil } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle<{ role: Role }>();
    role = profil?.role;
  }

  return NextResponse.redirect(new URL(accueilDuRole(role), origin));
};
