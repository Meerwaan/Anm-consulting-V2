"use server";

import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";
import { chargerRapport } from "@/lib/rapport/charger";
import { DocumentRapport } from "@/lib/rapport/DocumentRapport";

/**
 * Émet une version du rapport : le PDF est produit, archivé dans le dossier de la mission
 * (bucket `pieces`, sous `{mission}/rapports/`) et consigné dans `reports`. La version remise
 * au client reste ainsi retrouvable telle quelle, même si le dossier évolue ensuite.
 */
export const emettreRapport = async (missionId: string): Promise<{ ok: true; version: string } | { ok: false; erreur: string }> => {
  const session = await exigerRole("consultant");
  const r = await chargerRapport(missionId, session.profil?.full_name ?? "L’auditrice");
  if (!r) return { ok: false, erreur: "Mission introuvable." };
  const supabase = await createClient();
  const { count } = await supabase.from("reports").select("id", { count: "exact", head: true }).eq("mission_id", missionId);
  const version = `v${(count ?? 0) + 1}`;
  const maintenant = new Date();
  const pdf = await renderToBuffer(DocumentRapport({ r, version, dateEmission: maintenant.toLocaleDateString("fr-FR") }));
  const chemin = `${missionId}/rapports/rapport-${version}-${maintenant.toISOString().slice(0, 10)}.pdf`;
  const { error: errStockage } = await supabase.storage.from("pieces").upload(chemin, new Uint8Array(pdf), { contentType: "application/pdf", upsert: false });
  if (errStockage) {
    console.error("[rapport] archivage", errStockage.message);
    return { ok: false, erreur: "Le PDF n’a pas pu être archivé. Réessaie." };
  }
  const { error } = await supabase.from("reports").insert({
    mission_id: missionId,
    version,
    generated_by: session.utilisateurId,
    storage_path: chemin,
    summary: r.manques.length ? `Version de travail : ${r.manques.length} point(s) à compléter.` : "Version complète.",
  });
  if (error) {
    await supabase.storage.from("pieces").remove([chemin]);
    return { ok: false, erreur: "La version n’a pas pu être enregistrée. Réessaie." };
  }
  revalidatePath(`/admin/missions/${missionId}`, "layout");
  return { ok: true, version };
};
