"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";
import { TAILLE_MAX_OCTETS, nomDeStockage, tailleLisible } from "@/lib/portail/fichiers";

/**
 * Dépôt des pièces justificatives.
 *
 * Le fichier ne passe pas par le serveur de l'application : une action serveur
 * plafonne le corps de requête (1 Mo par défaut, 4,5 Mo sur Vercel), et un an de
 * bulletins de paie ne passerait pas. Le serveur prépare une URL d'envoi signée pour
 * un chemin qu'il choisit lui-même, le navigateur envoie directement à Supabase, puis
 * le serveur enregistre la ligne. Le chemin n'est jamais choisi par le navigateur.
 */

type Resultat = { ok: true; message?: string } | { ok: false; erreur: string };

const aujourdHui = () => new Date().toISOString().slice(0, 10);
// Rafraîchit toute la mission : l'onglet Pièces comme l'ancienne étape de collecte.
const rafraichir = (missionId: string) => revalidatePath(`/admin/missions/${missionId}`, "layout");

const pieceDeLaMission = async (missionId: string, documentId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mission_documents")
    .select("id, name")
    .eq("id", documentId)
    .eq("mission_id", missionId)
    .maybeSingle<{ id: string; name: string }>();
  return data;
};

export const preparerDepot = async (entree: {
  missionId: string;
  documentId: string;
  nom: string;
  taille: number;
}): Promise<{ ok: true; chemin: string; url: string } | { ok: false; erreur: string }> => {
  await exigerRole("consultant");

  if (!entree.taille) return { ok: false, erreur: "Ce fichier est vide." };
  if (entree.taille > TAILLE_MAX_OCTETS) {
    return {
      ok: false,
      erreur: `Ce fichier fait ${tailleLisible(entree.taille)}, la limite est de ${tailleLisible(TAILLE_MAX_OCTETS)}. Découpe-le ou compresse-le.`,
    };
  }
  if (!(await pieceDeLaMission(entree.missionId, entree.documentId))) {
    return { ok: false, erreur: "Cette pièce n’appartient pas à la mission. Recharge la page." };
  }

  const chemin = `${entree.missionId}/${entree.documentId}/${Date.now()}-${nomDeStockage(entree.nom)}`;
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("pieces").createSignedUploadUrl(chemin);
  if (error || !data) {
    console.error("[pieces] URL d'envoi", { message: error?.message });
    return { ok: false, erreur: "Le stockage n’a pas répondu. Réessaie dans un instant." };
  }
  return { ok: true, chemin, url: data.signedUrl };
};

export const enregistrerFichier = async (entree: {
  missionId: string;
  documentId: string;
  ordre: string;
  chemin: string;
  nom: string;
  taille: number;
  type: string;
}): Promise<Resultat> => {
  const session = await exigerRole("consultant");
  const supabase = await createClient();

  if (!entree.chemin.startsWith(`${entree.missionId}/${entree.documentId}/`)) {
    return { ok: false, erreur: "Chemin de fichier invalide." };
  }

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
    // Le fichier est arrivé mais la ligne n'a pas pu être écrite : on le retire pour ne
    // pas laisser dans le bucket un fichier que personne ne verrait jamais.
    await supabase.storage.from("pieces").remove([entree.chemin]);
    console.error("[pieces] enregistrement", { message: error.message });
    return { ok: false, erreur: "Le fichier n’a pas pu être rattaché à la pièce. Réessaie." };
  }

  // Un fichier déposé vaut réception. La date de réception n'est posée qu'une fois.
  await supabase
    .from("mission_documents")
    .update({ received: "oui", received_on: aujourdHui() })
    .eq("id", entree.documentId)
    .eq("mission_id", entree.missionId)
    .neq("received", "oui");

  rafraichir(entree.missionId);
  return { ok: true };
};

export const supprimerFichier = async (entree: {
  missionId: string;
  fichierId: string;
  ordre: string;
}): Promise<Resultat> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const { data: fichier } = await supabase
    .from("mission_document_files")
    .select("id, document_id, storage_path, file_name")
    .eq("id", entree.fichierId)
    .eq("mission_id", entree.missionId)
    .maybeSingle<{ id: string; document_id: string; storage_path: string; file_name: string }>();
  if (!fichier) return { ok: false, erreur: "Ce fichier n’existe plus. Recharge la page." };

  const { error: errStockage } = await supabase.storage.from("pieces").remove([fichier.storage_path]);
  if (errStockage) {
    console.error("[pieces] suppression stockage", { message: errStockage.message });
    return { ok: false, erreur: "Le fichier n’a pas pu être supprimé du stockage. Réessaie." };
  }
  const { error } = await supabase.from("mission_document_files").delete().eq("id", fichier.id);
  if (error) return { ok: false, erreur: "Le fichier a été retiré du stockage, mais pas de la liste. Recharge la page." };

  const { count } = await supabase
    .from("mission_document_files")
    .select("id", { count: "exact", head: true })
    .eq("document_id", fichier.document_id);

  let message = `« ${fichier.file_name} » supprimé.`;
  if (!count) {
    await supabase
      .from("mission_documents")
      .update({ received: "non", received_on: null })
      .eq("id", fichier.document_id)
      .eq("received", "oui");
    message += " La pièce n’a plus de fichier : elle repasse en manquante.";
  }

  rafraichir(entree.missionId);
  return { ok: true, message };
};

/**
 * Statut posé à la main : reçue sans fichier (original consulté sur place), manquante,
 * ou sans objet pour cette entreprise.
 */
export const changerStatutPiece = async (entree: {
  missionId: string;
  documentId: string;
  ordre: string;
  statut: "oui" | "non" | "na";
}): Promise<Resultat> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  if (entree.statut !== "oui") {
    const { count } = await supabase
      .from("mission_document_files")
      .select("id", { count: "exact", head: true })
      .eq("document_id", entree.documentId);
    if (count) {
      return {
        ok: false,
        erreur: `Cette pièce a ${count} fichier${count > 1 ? "s" : ""} déposé${count > 1 ? "s" : ""}. Supprime-les d’abord pour la déclarer ${entree.statut === "na" ? "sans objet" : "manquante"}.`,
      };
    }
  }

  const { error } = await supabase
    .from("mission_documents")
    .update({ received: entree.statut, received_on: entree.statut === "oui" ? aujourdHui() : null })
    .eq("id", entree.documentId)
    .eq("mission_id", entree.missionId);
  if (error) return { ok: false, erreur: "Le statut n’a pas été enregistré. Réessaie." };

  rafraichir(entree.missionId);
  return { ok: true };
};
