import Link from "next/link";
import { notFound } from "next/navigation";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { lireMission, lireValiditePieces } from "@/lib/portail/mission";
import { lireGrilles } from "@/lib/grilles/lecture";
import { lireDonneesST } from "@/lib/sous-traitance/lecture";
import { avancementMission } from "@/lib/modules/avancement";
import CadreMission from "@/components/portail/CadreMission";

/**
 * Une mission : la barre latérale à gauche (le client, puis les étapes de l'audit dans l'ordre,
 * chacune avec son avancement), le travail à droite. Demande de Sofia du 21/09/2026.
 */
export default async function LayoutMission({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  await exigerRole("consultant");
  const { id } = await params;
  const supabase = await createClient();
  const [mission, d, g, pieces, versions] = await Promise.all([
    lireMission(id),
    lireDonneesST(id),
    lireGrilles(id),
    lireValiditePieces(id),
    supabase.from("reports").select("version").eq("mission_id", id).order("generated_at", { ascending: false }),
  ]);
  if (!mission) notFound();

  const entete = (
    <div className="flex flex-col gap-1">
      <Link href="/admin" className="flex min-h-11 w-fit items-center text-meta text-encre-2 underline-offset-4 hover:text-vert hover:underline">
        ← Toutes les missions
      </Link>
      <p className="font-display text-t4 leading-tight text-encre">{mission.organisation?.name ?? "Client"}</p>
      <p className="text-note text-gris">Mission {mission.reference}</p>
      {mission.control_in_progress ? (
        <p className="text-note font-medium text-critique">
          Contrôle {mission.control_body ?? ""} en cours
          {mission.control_deadline ? `, échéance le ${new Date(`${mission.control_deadline}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" })}` : ""}
        </p>
      ) : null}
    </div>
  );

  return (
    <CadreMission
      entete={entete}
      missionId={id}
      sousTraitants={d.sousTraitants.map((s) => ({ id: s.id, nom: s.raison_sociale, rang: s.rang }))}
      avancement={avancementMission(d, g, pieces, ((versions.data ?? []) as { version: string }[]).map((v) => v.version))}
    >
      {children}
    </CadreMission>
  );
}
