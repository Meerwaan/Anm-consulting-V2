import Link from "next/link";
import { notFound } from "next/navigation";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { lireMission } from "@/lib/portail/mission";
import MenuMission from "@/components/portail/MenuMission";
import CadreMission from "@/components/portail/CadreMission";

/**
 * Une mission : la barre latérale à gauche (le client, puis les étapes de l'audit dans l'ordre),
 * le travail à droite. Demande de Sofia du 21/09/2026.
 */
export default async function LayoutMission({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  await exigerRole("consultant");
  const { id } = await params;
  const supabase = await createClient();
  const [mission, sts, ouvertes] = await Promise.all([
    lireMission(id),
    supabase.from("st_sous_traitants").select("id, raison_sociale, rang").eq("mission_id", id).order("rang").order("raison_sociale"),
    supabase.from("non_conformites").select("id", { count: "exact", head: true }).eq("mission_id", id).neq("statut", "regularise"),
  ]);
  if (!mission) notFound();

  const entete = (
    <div className="flex flex-col gap-2">
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
      menu={
        <MenuMission
          missionId={id}
          sousTraitants={((sts.data ?? []) as { id: string; raison_sociale: string; rang: number }[]).map((s) => ({ id: s.id, nom: s.raison_sociale, rang: s.rang }))}
          actionsOuvertes={ouvertes.count ?? 0}
        />
      }
    >
      {children}
    </CadreMission>
  );
}
