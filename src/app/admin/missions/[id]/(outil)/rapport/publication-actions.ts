"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";

/**
 * Rend une version émise du rapport visible (ou non) dans l'espace client. Le déclencheur
 * reports_publication date la publication et prévient les accès client de la mission.
 */
export const publierRapport = async (
  missionId: string,
  rapportId: string,
  visible: boolean,
): Promise<{ ok: true } | { ok: false; erreur: string }> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .update({ published_to_client: visible })
    .eq("id", rapportId)
    .eq("mission_id", missionId)
    .select("id");
  if (error || !data?.length) {
    console.error("[rapport] publication", { message: error?.message });
    return { ok: false, erreur: "Le réglage n’a pas pu être enregistré. Réessayez." };
  }
  revalidatePath(`/admin/missions/${missionId}`, "layout");
  revalidatePath(`/app/missions/${missionId}`, "layout");
  return { ok: true };
};
