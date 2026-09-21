"use server";

import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";

export interface EtatMotDePasse {
  erreur: string | null;
  ok: string | null;
}

const LONGUEUR_MIN = 10;

/**
 * Changement de mot de passe.
 *
 * Le mot de passe actuel est revérifié avant la modification : une session laissée
 * ouverte sur l'iPad ne doit pas suffire à prendre le compte.
 */
export const changerMotDePasse = async (_etat: EtatMotDePasse, formData: FormData): Promise<EtatMotDePasse> => {
  const session = await exigerRole("consultant");
  const actuel = String(formData.get("actuel") ?? "");
  const nouveau = String(formData.get("nouveau") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (!actuel) return { erreur: "Saisis ton mot de passe actuel.", ok: null };
  if (nouveau.length < LONGUEUR_MIN) {
    return { erreur: `Le nouveau mot de passe doit faire au moins ${LONGUEUR_MIN} caractères.`, ok: null };
  }
  if (nouveau !== confirmation) return { erreur: "Les deux saisies du nouveau mot de passe ne sont pas identiques.", ok: null };
  if (nouveau === actuel) return { erreur: "Le nouveau mot de passe est identique à l’actuel.", ok: null };
  if (!session.email) return { erreur: "Adresse du compte introuvable. Déconnecte-toi puis reconnecte-toi.", ok: null };

  const supabase = await createClient();
  const { error: erreurVerif } = await supabase.auth.signInWithPassword({ email: session.email, password: actuel });
  if (erreurVerif) return { erreur: "Le mot de passe actuel est incorrect.", ok: null };

  const { error } = await supabase.auth.updateUser({ password: nouveau });
  if (error) {
    console.error("[compte] changement de mot de passe", { status: error.status, message: error.message });
    return {
      erreur: /weak|pwned|leaked/i.test(error.message)
        ? "Ce mot de passe est trop faible ou connu des listes de fuites. Choisis-en un autre."
        : "Le changement n’a pas abouti. Réessaie dans un instant.",
      ok: null,
    };
  }

  return { erreur: null, ok: "Mot de passe changé. Le trousseau de l’iPad te proposera de l’enregistrer." };
};
