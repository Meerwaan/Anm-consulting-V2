import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lireSession } from "@/lib/supabase/session";
import { lireMaMission, lireMessages } from "@/lib/espace-client/lecture";
import FilEchanges from "@/components/espace-client/FilEchanges";

export const metadata: Metadata = { title: "Échanges — ANM Consulting", robots: { index: false, follow: false } };

export default async function EchangesClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, mission] = await Promise.all([lireSession(), lireMaMission(id)]);
  if (!mission || !session) notFound();
  const messages = await lireMessages(id, session.utilisateurId);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-t3 text-encre">Échanges</h2>
        <p className="text-corps text-encre-2">
          Une question sur une pièce, une date, un document que vous ne trouvez pas : écrivez à {mission.consultante ?? "votre consultante"}. La réponse s’affiche ici.
        </p>
      </div>
      <FilEchanges
        missionId={id}
        messages={messages}
        vide="Aucun message pour l’instant."
        aide="Pour transmettre un document, déposez-le plutôt dans l’onglet Pièces : il sera rangé avec votre dossier."
      />
    </div>
  );
}
