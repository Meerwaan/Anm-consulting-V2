"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { accueilDuRole } from "@/lib/supabase/session";
import type { Role } from "@/lib/types";

export interface EtatActivation {
  erreur: string | null;
  /** Le jeton a déjà été vérifié : la session existe, il ne reste qu'à poser le mot de passe. */
  verifie: boolean;
}

const LONGUEUR_MIN = 10;

/**
 * Premier mot de passe (ou mot de passe oublié) à partir du lien créé par la consultante.
 *
 * Le jeton n'est vérifié qu'ici, à l'envoi du formulaire : un aperçu de lien qui ouvre la
 * page ne le consomme pas. La saisie est contrôlée AVANT la vérification, pour qu'une faute
 * de frappe ne brûle pas un lien à usage unique.
 */
export const activerCompte = async (etat: EtatActivation, formData: FormData): Promise<EtatActivation> => {
  const jeton = String(formData.get("jeton") ?? "");
  const nouveau = String(formData.get("nouveau") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (nouveau.length < LONGUEUR_MIN) {
    return { ...etat, erreur: `Le mot de passe doit faire au moins ${LONGUEUR_MIN} caractères.` };
  }
  if (nouveau !== confirmation) return { ...etat, erreur: "Les deux saisies ne sont pas identiques." };

  const supabase = await createClient();

  if (!etat.verifie) {
    if (!jeton) return { ...etat, erreur: "Ce lien est incomplet. Demandez un nouveau lien à votre consultante." };
    const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: jeton });
    if (error) {
      console.error("[activer] jeton refusé", { code: error.code, status: error.status });
      return {
        erreur: "Ce lien a expiré ou a déjà servi. Demandez un nouveau lien à votre consultante : il remplacera celui-ci.",
        verifie: false,
      };
    }
  }

  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) {
    return { erreur: "Votre session a expiré. Demandez un nouveau lien à votre consultante.", verifie: false };
  }

  const { error } = await supabase.auth.updateUser({ password: nouveau });
  if (error) {
    console.error("[activer] mot de passe refusé", { code: error.code, status: error.status });
    return {
      erreur: /weak|pwned|leaked/i.test(error.message)
        ? "Ce mot de passe est trop faible ou figure dans des listes de fuites connues. Choisissez-en un autre."
        : error.code === "same_password"
          ? "Ce mot de passe est celui que vous utilisez déjà. Choisissez-en un autre, ou connectez-vous directement."
          : "Le mot de passe n’a pas pu être enregistré. Réessayez dans un instant.",
      verifie: true,
    };
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", utilisateur.user.id)
    .maybeSingle<{ role: Role }>();
  redirect(`${accueilDuRole(profil?.role)}${profil?.role === "client" ? "?bienvenue=1" : ""}`);
};
