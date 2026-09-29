import Link from "next/link";
import { notFound } from "next/navigation";
import { lireSession } from "@/lib/supabase/session";
import { aDeposer, lireMaMission, lireMesMissions, lireMessages, lirePieces } from "@/lib/espace-client/lecture";
import { TYPE_MISSION_CLIENT } from "@/content/espace-client";
import OngletsMission from "@/components/espace-client/OngletsMission";

/** Une mission du client : son intitulé, puis Suivi, Pièces, Échanges. */
export default async function MissionClientLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, mission, toutes] = await Promise.all([lireSession(), lireMaMission(id), lireMesMissions()]);
  if (!mission || !session) notFound();
  const [pieces, messages] = await Promise.all([lirePieces(id), lireMessages(id, session.utilisateurId)]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        {toutes.length > 1 ? (
          <Link href="/app" className="flex min-h-11 w-fit items-center text-meta text-encre-2 underline-offset-4 hover:text-vert hover:underline">
            ← Toutes vos missions
          </Link>
        ) : null}
        <p className="etiquette">{mission.organisation}</p>
        <h1 className="font-display text-t2 text-encre">{TYPE_MISSION_CLIENT[mission.type]}</h1>
        <p className="text-meta text-gris">Mission {mission.reference}</p>
      </div>
      <OngletsMission
        missionId={id}
        aDeposer={pieces.filter(aDeposer).length}
        nonLus={messages.filter((m) => !m.deMoi && !m.lu).length}
      />
      {children}
    </div>
  );
}
