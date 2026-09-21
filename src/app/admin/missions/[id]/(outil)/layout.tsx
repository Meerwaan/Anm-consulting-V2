import Link from "next/link";
import { notFound } from "next/navigation";
import { exigerRole } from "@/lib/supabase/session";
import { lireMission } from "@/lib/portail/mission";
import OngletsMission from "@/components/sous-traitance/OngletsMission";

/**
 * L'en-tête d'une mission : le client, la référence, et les grandes parties de l'outil.
 * Refonte du 21/09/2026 : l'outil suit les grilles de Sofia, la sous-traitance en premier.
 */
export default async function LayoutMission({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  await exigerRole("consultant");
  const { id } = await params;
  const mission = await lireMission(id);
  if (!mission) notFound();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 border-b border-filet pb-0">
        <div className="flex flex-col gap-2">
          <Link href="/admin" className="flex min-h-11 w-fit items-center text-meta text-encre-2 underline-offset-4 hover:text-vert hover:underline">
            ← Toutes les missions
          </Link>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h1 className="font-display text-t2 text-encre">{mission.organisation?.name ?? "Client"}</h1>
            <p className="text-meta text-gris">Mission {mission.reference}</p>
          </div>
          {mission.control_in_progress ? (
            <p className="text-meta font-medium text-critique">
              Contrôle {mission.control_body ?? ""} en cours
              {mission.control_deadline ? ` · échéance le ${new Date(`${mission.control_deadline}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" })}` : ""}
            </p>
          ) : null}
        </div>
        <OngletsMission missionId={id} />
      </header>
      {children}
    </div>
  );
}
