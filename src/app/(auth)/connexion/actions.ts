"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface EtatConnexion {
  message: string | null;
  erreur: string | null;
}

/**
 * Envoie un lien magique.
 *
 * La réponse est volontairement identique que l'adresse soit connue ou non :
 * un message différent permettrait d'énumérer les comptes existants. Créer un
 * compte ne donne aucun droit — sans invitation, le profil naît « client » sans
 * organisation et la RLS ne renvoie rien (migration 0008).
 */
export const envoyerLienMagique = async (
  _etat: EtatConnexion,
  formData: FormData,
): Promise<EtatConnexion> => {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { message: null, erreur: "Cette adresse email n'est pas valide." };
  }

  const enTetes = await headers();
  const origine =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `https://${enTetes.get("x-forwarded-host") ?? enTetes.get("host") ?? "localhost:3000"}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origine}/auth/confirm` },
  });

  if (error) {
    // Une limite d'envoi est la seule erreur qu'il est utile de montrer.
    const trop = error.status === 429;
    return {
      message: null,
      erreur: trop
        ? "Trop de demandes en peu de temps. Réessaie dans quelques minutes."
        : "L'envoi a échoué. Réessaie dans un instant.",
    };
  }

  return {
    message: `Si un accès existe pour ${email}, le lien de connexion vient d'y être envoyé. Il est valable une heure.`,
    erreur: null,
  };
};
