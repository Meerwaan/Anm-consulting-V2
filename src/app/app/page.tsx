import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { lireSession } from "@/lib/supabase/session";
import { lireMesMissions } from "@/lib/espace-client/lecture";
import { ETAPES_CLIENT, TYPE_MISSION_CLIENT, dateClient } from "@/content/espace-client";

export const metadata: Metadata = { title: "Espace client — ANM Consulting", robots: { index: false, follow: false } };

/** L'accueil de l'espace client : une seule mission, on y va directement ; plusieurs, on choisit. */
export default async function EspaceClientPage({ searchParams }: { searchParams: Promise<{ bienvenue?: string }> }) {
  const { bienvenue } = await searchParams;
  const [session, missions] = await Promise.all([lireSession(), lireMesMissions()]);
  if (missions.length === 1) redirect(`/app/missions/${missions[0].id}${bienvenue ? "?bienvenue=1" : ""}`);

  const prenom = session?.profil?.full_name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <p className="etiquette">Espace client</p>
        <h1 className="font-display text-t2 text-encre">Bonjour{prenom ? ` ${prenom}` : ""}</h1>
        {bienvenue ? (
          <p role="status" className="rounded-[5px] border border-vert/40 bg-menthe-2 px-4 py-3 text-meta text-vert">
            Votre mot de passe est enregistré. Vous pourrez désormais vous connecter avec votre adresse e-mail.
          </p>
        ) : null}
      </div>
      {missions.length ? (
        <ul className="flex flex-col divide-y divide-filet border-y border-filet">
          {missions.map((m) => {
            const etape = ETAPES_CLIENT.find((e) => e.statut === m.status);
            return (
              <li key={m.id}>
                <Link href={`/app/missions/${m.id}`} className="flex min-h-16 items-center justify-between gap-4 py-4 text-encre transition-colors hover:text-vert">
                  <span className="flex flex-col gap-1">
                    <span className="text-corps font-medium">{TYPE_MISSION_CLIENT[m.type]}</span>
                    <span className="text-meta text-encre-2">
                      {etape?.titre ?? ""} · ouverte le {dateClient(m.opened_on)}
                    </span>
                  </span>
                  <ArrowRight size={20} aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="max-w-xl text-corps text-encre-2">
          Aucune mission n’est encore rattachée à votre compte. Si vous attendez l’ouverture d’une mission, votre consultante vous préviendra dès qu’elle sera prête.
        </p>
      )}
    </div>
  );
}
