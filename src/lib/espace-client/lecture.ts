import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { StatutMission, TypeMission } from "@/lib/types";
import type { MessageFil } from "@/components/espace-client/FilEchanges";

/**
 * Lectures de l'espace client, toutes avec les droits du client (RLS). Les missions et les
 * pièces passent par des fonctions SQL qui ne rendent que les colonnes montrables
 * (migration 0045) : jamais les notes, le pense-bête ni les points chauds de la consultante.
 */

export interface MissionClient {
  id: string;
  reference: string;
  type: TypeMission;
  status: StatutMission;
  opened_on: string;
  intervention_on: string | null;
  restitution_on: string | null;
  control_in_progress: boolean;
  control_body: string | null;
  control_deadline: string | null;
  organisation: string;
  consultante: string | null;
}

export const lireMesMissions = cache(async (): Promise<MissionClient[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("espace_client_missions");
  if (error) console.error("[espace-client] missions", { message: error.message });
  return (data ?? []) as MissionClient[];
});

export const lireMaMission = async (id: string): Promise<MissionClient | null> =>
  (await lireMesMissions()).find((m) => m.id === id) ?? null;

export interface PieceClient {
  id: string;
  nom: string;
  categorie: string;
  obligatoire: boolean;
  recue: boolean;
  recue_le: string | null;
  demande_statut: "ouverte" | "relancee" | "recue" | null;
  demandee_le: string | null;
  a_rendre_le: string | null;
  message: string | null;
  relances: number | null;
}

export interface FichierClient {
  id: string;
  document_id: string;
  file_name: string;
  file_size: number | null;
  content_type: string | null;
  uploaded_at: string;
  deMoi: boolean;
}

export const lirePieces = cache(async (missionId: string): Promise<PieceClient[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("espace_client_pieces", { p_mission: missionId });
  if (error) console.error("[espace-client] pièces", { message: error.message });
  return ((data ?? []) as PieceClient[]).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
});

/** Pièces encore attendues : une demande ouverte ou relancée, pas encore reçue. */
export const aDeposer = (p: PieceClient) => !p.recue && (p.demande_statut === "ouverte" || p.demande_statut === "relancee");

export const lireFichiers = async (missionId: string, utilisateurId: string): Promise<FichierClient[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mission_document_files")
    .select("id, document_id, file_name, file_size, content_type, uploaded_at, uploaded_by")
    .eq("mission_id", missionId)
    .order("uploaded_at", { ascending: true });
  return ((data ?? []) as (Omit<FichierClient, "deMoi"> & { uploaded_by: string | null })[]).map(({ uploaded_by, ...f }) => ({
    ...f,
    deMoi: uploaded_by === utilisateurId,
  }));
};

export const lireMessages = cache(async (missionId: string, utilisateurId: string): Promise<MessageFil[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mission_messages")
    .select("id, body, created_at, author_id, read_at")
    .eq("mission_id", missionId)
    .order("created_at", { ascending: true });
  // Le client ne lit pas le profil des autres comptes : un message qui n'est pas le sien
  // vient de l'équipe ANM Consulting (ou d'un collègue disposant d'un accès à la même société).
  return ((data ?? []) as { id: string; body: string; created_at: string; author_id: string | null; read_at: string | null }[]).map(
    (m) => ({
      id: m.id,
      corps: m.body,
      le: m.created_at,
      deMoi: m.author_id === utilisateurId,
      auteur: m.author_id === utilisateurId ? "Vous" : "ANM Consulting",
      lu: Boolean(m.read_at),
    }),
  );
});

export interface RapportClient {
  id: string;
  version: string;
  generated_at: string;
  published_at: string | null;
}

export const lireRapports = async (missionId: string): Promise<RapportClient[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("id, version, generated_at, published_at")
    .eq("mission_id", missionId)
    .eq("published_to_client", true)
    .order("generated_at", { ascending: false });
  return (data ?? []) as RapportClient[];
};

export const lireNotesPartagees = async (missionId: string): Promise<{ id: string; body: string; created_at: string }[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mission_notes")
    .select("id, body, created_at")
    .eq("mission_id", missionId)
    .eq("visible_to_client", true)
    .order("created_at", { ascending: false });
  return (data ?? []) as { id: string; body: string; created_at: string }[];
};
