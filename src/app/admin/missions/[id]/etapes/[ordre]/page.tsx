import { redirect } from "next/navigation";
import { etapeEquivalente } from "@/lib/modules/anciennes-etapes";

/**
 * Ancienne adresse de l'écran en 15 étapes, remplacé le 21/09/2026 par la barre latérale en
 * 8 étapes. Plus rien n'y mène dans l'outil ; une adresse restée en favori ou dans l'historique
 * ouvre l'étape qui fait aujourd'hui ce travail.
 */
export default async function AncienneEtapePage({ params }: { params: Promise<{ id: string; ordre: string }> }) {
  const { id, ordre } = await params;
  redirect(`/admin/missions/${id}/${etapeEquivalente(ordre)}`);
}
