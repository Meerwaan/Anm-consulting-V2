"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";
import { TAILLE_MAX_OCTETS, nomDeStockage, tailleLisible } from "@/lib/portail/fichiers";

/**
 * Dépôt d'une pièce par le client. Même circuit que la consultante (admin/pieces/actions.ts) :
 * le serveur choisit le chemin et signe une URL d'envoi, le navigateur envoie directement au
 * stockage, puis le serveur enregistre la ligne. Tout passe avec les droits du client : la RLS
 * n'autorise que le dossier {mission}/{pièce} d'une pièce de SA mission (migration 0045), et le
 * déclencheur marque la pièce reçue, clôt la demande et prévient la consultante.
 */

export const preparerDepotClient = async (entree: {
  missionId: string;
  documentId: string;
  nom: string;
  taille: number;
}): Promise<{ ok: true; chemin: string; url: string } | { ok: false; erreur: string }> => {
  await exigerRole("client");
  if (!entree.taille) return { ok: false, erreur: "Ce fichier est vide." };
  if (entree.taille > TAILLE_MAX_OCTETS) {
    return {
      ok: false,
      erreur: `Ce fichier fait ${tailleLisible(entree.taille)}, la limite est de ${tailleLisible(TAILLE_MAX_OCTETS)}. Découpez-le ou compressez-le.`,
    };
  }
  const supabase = await createClient();
  const { data: autorise } = await supabase.rpc("piece_client_de_ma_mission", {
    p_document: entree.documentId,
    p_mission: entree.missionId,
  });
  if (!autorise) return { ok: false, erreur: "Cette pièce n’est pas rattachée à votre mission. Rechargez la page." };

  const chemin = `${entree.missionId}/${entree.documentId}/${Date.now()}-${nomDeStockage(entree.nom)}`;
  const { data, error } = await supabase.storage.from("pieces").createSignedUploadUrl(chemin);
  if (error || !data) {
    console.error("[espace-client] URL d'envoi", { message: error?.message });
    return { ok: false, erreur: "Le stockage n’a pas répondu. Réessayez dans un instant." };
  }
  return { ok: true, chemin, url: data.signedUrl };
};

export const enregistrerFichierClient = async (entree: {
  missionId: string;
  documentId: string;
  chemin: string;
  nom: string;
  taille: number;
  type: string;
}): Promise<{ ok: true } | { ok: false; erreur: string }> => {
  const session = await exigerRole("client");
  if (!entree.chemin.startsWith(`${entree.missionId}/${entree.documentId}/`)) {
    return { ok: false, erreur: "Chemin de fichier invalide." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("mission_document_files").insert({
    mission_id: entree.missionId,
    document_id: entree.documentId,
    storage_path: entree.chemin,
    file_name: entree.nom.slice(0, 250),
    file_size: entree.taille,
    content_type: entree.type || null,
    uploaded_by: session.utilisateurId,
  });
  if (error) {
    // Le client ne peut pas supprimer dans le stockage : le fichier orphelin reste dans le
    // dossier de sa pièce, invisible, jusqu'à un nettoyage côté consultante.
    console.error("[espace-client] enregistrement", { message: error.message, chemin: entree.chemin });
    return { ok: false, erreur: "Le fichier est arrivé mais n’a pas pu être rattaché à la pièce. Réessayez." };
  }
  revalidatePath(`/app/missions/${entree.missionId}`, "layout");
  revalidatePath(`/admin/missions/${entree.missionId}`, "layout");
  return { ok: true };
};
