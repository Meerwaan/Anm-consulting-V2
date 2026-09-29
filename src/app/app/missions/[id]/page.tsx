import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, DownloadSimple, FilePdf, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { aDeposer, lireMaMission, lireNotesPartagees, lirePieces, lireRapports } from "@/lib/espace-client/lecture";
import { ETAPES_CLIENT, dateClient } from "@/content/espace-client";

export const metadata: Metadata = { title: "Suivi de la mission — ANM Consulting", robots: { index: false, follow: false } };

/**
 * Le suivi : où en est la mission, ce qui est attendu du client, et le rapport quand il est publié.
 * Les étapes sont celles du client (préparer, transmettre, recevoir), jamais la méthode d'audit.
 */
export default async function SuiviMissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bienvenue?: string }>;
}) {
  const [{ id }, { bienvenue }] = await Promise.all([params, searchParams]);
  const mission = await lireMaMission(id);
  if (!mission) notFound();
  const [pieces, rapports, notes] = await Promise.all([lirePieces(id), lireRapports(id), lireNotesPartagees(id)]);

  const rang = ETAPES_CLIENT.findIndex((e) => e.statut === mission.status);
  const attendues = pieces.filter(aDeposer);
  const dernier = rapports[0];

  return (
    <div className="flex flex-col gap-12">
      {bienvenue ? (
        <p role="status" className="rounded-[5px] border border-vert/40 bg-menthe-2 px-4 py-3 text-meta text-vert">
          Votre mot de passe est enregistré. Vous pourrez désormais vous connecter avec votre adresse e-mail.
        </p>
      ) : null}

      {mission.control_in_progress ? (
        <p className="flex gap-3 rounded-[5px] border border-critique/30 bg-critique-l/50 px-4 py-3 text-meta text-encre">
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-critique" aria-hidden />
          <span>
            Contrôle {mission.control_body ? `${mission.control_body} ` : ""}en cours
            {mission.control_deadline ? `, échéance le ${dateClient(mission.control_deadline)}` : ""}. Nous en tenons compte dans l’ordre des priorités.
          </span>
        </p>
      ) : null}

      {dernier ? (
        <section aria-labelledby="rapport" className="flex flex-col gap-4 rounded-[5px] border border-filet bg-papier p-5 md:p-8">
          <h2 id="rapport" className="font-display text-t3 text-encre">Votre rapport est disponible</h2>
          <p className="max-w-2xl text-corps text-encre-2">
            Il présente les risques réels en cas de contrôle et les axes d’amélioration, avec le plan d’actions. Vous pouvez le transmettre à votre avocat ou à votre expert-comptable.
          </p>
          <ul className="flex flex-col divide-y divide-filet border-y border-filet">
            {rapports.map((r, i) => (
              <li key={r.id}>
                <a
                  href={`/app/missions/${id}/rapport/${r.id}`}
                  className="flex min-h-14 items-center justify-between gap-4 py-2 text-encre transition-colors hover:text-vert"
                >
                  <span className="flex items-center gap-3">
                    <FilePdf size={22} className="shrink-0 text-vert" aria-hidden />
                    <span className="flex flex-col leading-tight">
                      <span className="text-corps font-medium">
                        Rapport d’audit, version {r.version.replace(/^v/, "")}
                        {i === 0 && rapports.length > 1 ? " (la plus récente)" : ""}
                      </span>
                      <span className="text-note text-gris">Mis à disposition le {dateClient(r.published_at ?? r.generated_at)}</span>
                    </span>
                  </span>
                  <DownloadSimple size={20} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="avancement" className="flex flex-col gap-5">
        <h2 id="avancement" className="font-display text-t3 text-encre">Avancement</h2>
        <ol className="flex flex-col">
          {ETAPES_CLIENT.map((e, i) => {
            const faite = i < rang || mission.status === "clos";
            const courante = i === rang && mission.status !== "clos";
            return (
              <li key={e.statut} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4">
                <span className="flex flex-col items-center">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-meta font-medium tabular-nums ${
                      faite ? "bg-vert text-papier" : courante ? "border-2 border-vert bg-menthe text-vert" : "border border-filet bg-papier text-gris"
                    }`}
                  >
                    {faite ? <Check size={16} weight="bold" aria-hidden /> : i + 1}
                  </span>
                  {i < ETAPES_CLIENT.length - 1 ? <span className={`w-px flex-1 ${faite ? "bg-vert" : "bg-filet"}`} aria-hidden /> : null}
                </span>
                <div className={`flex flex-col gap-1 pb-6 ${courante ? "" : "pt-1"}`}>
                  <p className={`text-corps ${courante ? "font-medium text-encre" : faite ? "text-encre-2" : "text-gris"}`}>
                    {e.titre}
                    <span className="sr-only">{faite ? ", terminée" : courante ? ", en cours" : ", à venir"}</span>
                    {courante ? <span className="ml-2 rounded-full bg-menthe px-2 py-0.5 text-note font-medium text-vert">En cours</span> : null}
                  </p>
                  {courante ? <p className="max-w-xl text-meta text-encre-2">{e.texte}</p> : null}
                  {e.statut === "sur_site" && mission.intervention_on ? (
                    <p className="text-note text-gris">Prévue le {dateClient(mission.intervention_on)}</p>
                  ) : null}
                  {e.statut === "restitution" && mission.restitution_on ? (
                    <p className="text-note text-gris">Prévue le {dateClient(mission.restitution_on)}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="attendu" className="flex flex-col gap-4">
        <h2 id="attendu" className="font-display text-t3 text-encre">De votre côté</h2>
        {attendues.length ? (
          <Link
            href={`/app/missions/${id}/pieces`}
            className="flex min-h-14 items-center justify-between gap-4 rounded-[5px] border border-majeur/30 bg-majeur-l/50 px-4 py-3 text-encre transition-colors hover:border-majeur/60"
          >
            <span className="text-corps">
              <strong className="font-medium">
                {attendues.length} pièce{attendues.length > 1 ? "s" : ""} à déposer
              </strong>
              {attendues.some((p) => p.a_rendre_le) ? (
                <span className="block text-meta text-encre-2">
                  Première date demandée : {dateClient(attendues.map((p) => p.a_rendre_le).filter((d): d is string => Boolean(d)).sort()[0])}
                </span>
              ) : null}
            </span>
            <ArrowRight size={20} aria-hidden />
          </Link>
        ) : (
          <p className="text-corps text-encre-2">Rien à déposer pour l’instant. Nous vous préviendrons ici si une pièce nous manque.</p>
        )}
        <p className="text-meta text-encre-2">
          Une question ?{" "}
          <Link href={`/app/missions/${id}/echanges`} className="text-vert underline underline-offset-4">
            Écrire à {mission.consultante ?? "votre consultante"}
          </Link>
        </p>
      </section>

      {notes.length ? (
        <section aria-labelledby="notes" className="flex flex-col gap-4">
          <h2 id="notes" className="font-display text-t3 text-encre">Informations de votre consultante</h2>
          <ul className="flex flex-col gap-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-[5px] border border-filet bg-papier px-4 py-3">
                <p className="text-note text-gris">{dateClient(n.created_at)}</p>
                <p className="mt-1 whitespace-pre-wrap text-corps text-encre">{n.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!dernier ? (
        <section aria-labelledby="rapport-attente" className="flex flex-col gap-2">
          <h2 id="rapport-attente" className="font-display text-t3 text-encre">Rapport</h2>
          <p className="max-w-2xl text-corps text-encre-2">
            Le rapport sera disponible ici, en téléchargement, après la restitution.
          </p>
        </section>
      ) : null}
    </div>
  );
}
