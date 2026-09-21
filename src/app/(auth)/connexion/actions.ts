"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { accueilDuRole } from "@/lib/supabase/session";
import type { Role } from "@/lib/types";

export interface EtatConnexion {
  erreur: string | null;
  email: string;
}

/**
 * Connexion par adresse et mot de passe.
 *
 * Le lien magique a été abandonné le 21/09/2026 : sans domaine d'envoi, le serveur
 * d'email de Supabase ne délivre qu'aux membres de l'équipe du projet, et sur iPad un
 * lien ouvert depuis l'app Gmail atterrit dans son navigateur intégré, pas dans Safari.
 * Le mot de passe, retenu par le trousseau iCloud, ne dépend d'aucun email.
 *
 * Le message d'échec est le même que l'adresse existe ou non : un message différent
 * permettrait de savoir quels comptes existent.
 */
export const seConnecter = async (_etat: EtatConnexion, formData: FormData): Promise<EtatConnexion> => {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const motDePasse = String(formData.get("mot_de_passe") ?? "");

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { erreur: "Cette adresse email n’est pas valide.", email };
  }
  if (!motDePasse) {
    return { erreur: "Saisis ton mot de passe.", email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });

  if (error || !data.user) {
    if (error?.status === 429) {
      return { erreur: "Trop de tentatives en peu de temps. Attends quelques minutes avant de réessayer.", email };
    }
    // Supabase ne renvoie « email non confirmé » qu'une fois le mot de passe reconnu :
    // le dire n'apprend rien à quelqu'un qui ne connaît pas déjà le mot de passe.
    if (error?.code === "email_not_confirmed") {
      return { erreur: "Ce compte n’est pas encore activé. Demande à Merwan de l’activer, ton mot de passe est le bon.", email };
    }
    if (error && error.status && error.status >= 500) {
      console.error("[connexion] échec serveur", { status: error.status, message: error.message });
      return { erreur: "Le service de connexion ne répond pas. Réessaie dans un instant.", email };
    }
    // Tout autre refus que les identifiants invalides est tracé : c'est ce qui a manqué
    // le 21/09 pour voir qu'un compte n'était simplement pas confirmé.
    if (error?.code && error.code !== "invalid_credentials") {
      console.error("[connexion] refus", { code: error.code, status: error.status });
    }
    return { erreur: "Adresse ou mot de passe incorrect.", email };
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle<{ role: Role }>();

  redirect(accueilDuRole(profil?.role));
};
