"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { lireSession } from "@/lib/supabase/session";

/**
 * Échanges entre la consultante et le client, sur une mission.
 * La RLS décide seule qui écrit où (msg_insert) ; le déclencheur messages_garde interdit
 * au client de réécrire un message et crée la notification de l'autre côté.
 */

const LONGUEUR_MAX = 4000;

const rafraichir = (missionId: string) => {
  revalidatePath(`/app/missions/${missionId}`, "layout");
  revalidatePath(`/admin/missions/${missionId}/client`);
};

export const envoyerMessage = async (
  missionId: string,
  texte: string,
): Promise<{ ok: true } | { ok: false; erreur: string }> => {
  const session = await lireSession();
  if (!session || (session.profil?.role !== "client" && session.profil?.role !== "consultant")) {
    return { ok: false, erreur: "Votre session a expiré. Reconnectez-vous." };
  }
  const corps = texte.trim();
  if (!corps) return { ok: false, erreur: "Le message est vide." };
  if (corps.length > LONGUEUR_MAX) {
    return { ok: false, erreur: `Le message dépasse ${LONGUEUR_MAX.toLocaleString("fr-FR")} caractères. Découpez-le en deux.` };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("mission_messages")
    .insert({ mission_id: missionId, author_id: session.utilisateurId, body: corps });
  if (error) {
    console.error("[echanges] envoi", { code: error.code, message: error.message });
    return { ok: false, erreur: "Le message n’a pas pu être envoyé. Réessayez dans un instant." };
  }
  rafraichir(missionId);
  return { ok: true };
};

/** Accusé de lecture des messages reçus. */
export const marquerLus = async (missionId: string): Promise<void> => {
  const session = await lireSession();
  if (!session) return;
  const supabase = await createClient();
  await supabase
    .from("mission_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("mission_id", missionId)
    .neq("author_id", session.utilisateurId)
    .is("read_at", null);
  rafraichir(missionId);
};
