import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { Profil, Role } from "@/lib/types";

export interface Session {
  utilisateurId: string;
  email: string | null;
  profil: Profil | null;
}

/**
 * Session courante, profil compris.
 * `profil` peut être null juste après la création du compte si le trigger
 * `handle_new_user` n'a pas encore posé la ligne : on traite ce cas comme
 * « aucun droit » plutôt que comme une erreur.
 */
export const lireSession = async (): Promise<Session | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profil } = await supabase
    .from("profiles")
    .select("id, org_id, role, full_name, job_title")
    .eq("id", data.user.id)
    .maybeSingle<Profil>();

  return { utilisateurId: data.user.id, email: data.user.email ?? null, profil: profil ?? null };
};

/** Route par défaut d'un rôle, après connexion. */
export const accueilDuRole = (role: Role | undefined): string =>
  role === "consultant" ? "/admin" : "/app";

/**
 * Garde de page : exige une session avec le rôle attendu, sinon redirige.
 * À appeler dans un layout ou une page serveur — jamais dans le middleware,
 * qui n'a pas accès à la base sans coûter une requête à chaque navigation.
 */
export const exigerRole = async (role: Role): Promise<Session> => {
  const session = await lireSession();
  if (!session) redirect("/connexion");
  if (session.profil?.role !== role) redirect(accueilDuRole(session.profil?.role));
  return session;
};
