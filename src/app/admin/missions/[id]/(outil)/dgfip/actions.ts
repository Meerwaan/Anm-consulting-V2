"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";
import { lireNombre } from "@/lib/sous-traitance/tables";

/**
 * Le coût de revient horaire de référence de la branche, et sa source (Sofia, 21/09/2026).
 * Sans source, la valeur n'est pas enregistrée : un chiffre de référence doit pouvoir être retrouvé.
 */
export const enregistrerCoutRevient = async (entree: { missionId: string; valeur: string; source: string }): Promise<{ ok: true } | { ok: false; erreur: string }> => {
  const session = await exigerRole("consultant");
  const n = lireNombre(entree.valeur);
  if (Number.isNaN(n)) return { ok: false, erreur: "Le coût de revient n’est pas un nombre. Exemple : 22,50." };
  if (n !== null && n <= 0) return { ok: false, erreur: "Le coût de revient doit être positif." };
  const source = entree.source.trim();
  if (n !== null && !source) return { ok: false, erreur: "Indique la source du chiffre (organisme, publication, année)." };
  const supabase = await createClient();
  const { error } = await supabase.from("st_parametres").upsert(
    { mission_id: entree.missionId, cout_revient_horaire: n, cout_revient_source: n === null ? null : source, updated_at: new Date().toISOString(), updated_by: session.utilisateurId },
    { onConflict: "mission_id" },
  );
  if (error) {
    console.error("[dgfip] coût de revient", error.message);
    return { ok: false, erreur: "L’enregistrement a échoué. Réessaie." };
  }
  revalidatePath(`/admin/missions/${entree.missionId}`, "layout");
  return { ok: true };
};
