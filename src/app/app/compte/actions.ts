"use server";

import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";

export interface EtatMotDePasseClient {
  erreur: string | null;
  ok: string | null;
}

const LONGUEUR_MIN = 10;

/**
 * Changement de mot de passe depuis l'espace client. Le mot de passe actuel est revérifié :
 * une session restée ouverte sur un ordinateur partagé ne doit pas suffire à prendre le compte.
 */
export const changerMotDePasseClient = async (
  _etat: EtatMotDePasseClient,
  formData: FormData,
): Promise<EtatMotDePasseClient> => {
  const session = await exigerRole("client");
  const actuel = String(formData.get("actuel") ?? "");
  const nouveau = String(formData.get("nouveau") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (!actuel) return { erreur: "Saisissez votre mot de passe actuel.", ok: null };
  if (nouveau.length < LONGUEUR_MIN) {
    return { erreur: `Le nouveau mot de passe doit faire au moins ${LONGUEUR_MIN} caractères.`, ok: null };
  }
  if (nouveau !== confirmation) return { erreur: "Les deux saisies du nouveau mot de passe ne sont pas identiques.", ok: null };
  if (nouveau === actuel) return { erreur: "Le nouveau mot de passe est identique à l’actuel.", ok: null };
  if (!session.email) return { erreur: "Adresse du compte introuvable. Déconnectez-vous puis reconnectez-vous.", ok: null };

  const supabase = await createClient();
  const { error: erreurVerif } = await supabase.auth.signInWithPassword({ email: session.email, password: actuel });
  if (erreurVerif) return { erreur: "Le mot de passe actuel est incorrect.", ok: null };

  const { error } = await supabase.auth.updateUser({ password: nouveau });
  if (error) {
    console.error("[espace-client] mot de passe", { status: error.status, code: error.code });
    return {
      erreur: /weak|pwned|leaked/i.test(error.message)
        ? "Ce mot de passe est trop faible ou figure dans des listes de fuites connues. Choisissez-en un autre."
        : "Le changement n’a pas abouti. Réessayez dans un instant.",
      ok: null,
    };
  }
  return { erreur: null, ok: "Mot de passe changé. Utilisez-le dès votre prochaine connexion." };
};
