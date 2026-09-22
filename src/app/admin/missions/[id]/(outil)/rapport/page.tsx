import type { Metadata } from "next";
import EtapePage from "@/components/portail/EtapePage";
import { notFound } from "next/navigation";
import { ArrowRight, DownloadSimple, FilePdf } from "@phosphor-icons/react/dist/ssr";
import TexteRapport from "@/components/rapport/TexteRapport";
import EmettreRapport from "@/components/rapport/EmettreRapport";
import Link from "next/link";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { chargerRapport } from "@/lib/rapport/charger";
import { CLES_TEXTES, TITRES_TEXTES, propositionsTextes } from "@/lib/rapport/modele";
import { lireGrilles } from "@/lib/grilles/lecture";

export const metadata: Metadata = { title: "Rapport — ANM Consulting", robots: { index: false } };

/**
 * Le rapport : ce qu'il manque, les textes de Sofia, le suivi des actions, et le PDF.
 * Le PDF se regarde à tout moment ; une version s'émet quand elle part chez le client.
 */
export default async function RapportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await exigerRole("consultant");
  const { id } = await params;
  const [r, g] = await Promise.all([chargerRapport(id, session.profil?.full_name ?? "L’auditrice"), lireGrilles(id)]);
  if (!r) notFound();
  const supabase = await createClient();
  const { data: versions } = await supabase
    .from("reports")
    .select("id, version, generated_at, summary")
    .eq("mission_id", id)
    .order("generated_at", { ascending: false });
  const propositions = propositionsTextes(r);
  const prochaine = `v${(versions?.length ?? 0) + 1}`;
  const actionsOuvertes = r.nonConformites.filter((n) => n.statut !== "regularise").length;

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        <EtapePage chemin="rapport" />
        <h2 className="font-display text-t3 text-encre">Rapport</h2>
        <p className="max-w-2xl text-corps text-encre-2">
          Le rapport se construit tout seul à partir de ce que tu as saisi et conclu. Ici, tu relis les textes et tu émets la version qui part chez le client.
        </p>
      </div>

      <section aria-labelledby="etat" className="flex flex-col gap-5">
        <h3 id="etat" className="font-display text-t4 text-encre">
          {r.manques.length ? `Avant la version définitive : ${r.manques.length} point${r.manques.length > 1 ? "s" : ""}` : "Le rapport est complet"}
        </h3>
        {r.manques.length ? (
          <>
            <ul className="flex flex-col divide-y divide-filet border-y border-filet">
              {r.aFaire.map((m) => (
                <li key={m.texte}>
                  <Link href={`/admin/missions/${id}/${m.lien}`} className="flex min-h-12 items-center gap-3 py-2 text-meta text-encre transition-colors hover:text-vert">
                    <span className="size-2 shrink-0 rounded-full bg-majeur" aria-hidden />
                    <span className="flex-1">{m.texte}</span>
                    <span className="flex shrink-0 items-center gap-1 text-note text-vert">Y aller <ArrowRight size={14} aria-hidden /></span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-meta text-encre-2">
              Tu peux émettre le rapport dès maintenant : tant qu’il manque un point, il porte la mention « version de travail ».
            </p>
          </>
        ) : (
          <p className="rounded-[5px] border border-mineur/30 bg-mineur-l/40 px-4 py-3 text-meta text-encre">
            Toutes les conclusions sont choisies et tous les textes sont relus.
          </p>
        )}
        <div className="flex flex-wrap items-start gap-3">
          <a
            href={`/admin/missions/${id}/rapport/pdf`}
            target="_blank"
            rel="noopener"
            className="flex min-h-12 items-center gap-2 rounded-[5px] bg-encre px-5 text-meta font-medium text-papier transition-colors hover:bg-vert"
          >
            <FilePdf size={18} aria-hidden /> Voir le rapport
          </a>
          <EmettreRapport missionId={id} prochaine={prochaine} incomplet={r.manques.length > 0} />
        </div>
        {versions && versions.length ? (
          <div className="flex flex-col gap-2">
            <p className="text-meta font-medium text-encre">Versions émises</p>
            <ul className="flex flex-col divide-y divide-filet border-y border-filet">
              {versions.map((v) => (
                <li key={v.id}>
                  <a
                    href={`/admin/missions/${id}/rapport/version/${v.id}`}
                    target="_blank"
                    rel="noopener"
                    className="flex min-h-12 items-center justify-between gap-4 py-2 text-meta text-encre hover:text-vert"
                  >
                    <span>
                      <strong className="font-medium">{v.version}</strong> · {new Date(v.generated_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
                      {v.summary ? <span className="block text-note text-gris">{v.summary}</span> : null}
                    </span>
                    <DownloadSimple size={18} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="textes" className="flex flex-col gap-10">
        <div>
          <h3 id="textes" className="font-display text-t4 text-encre">Les textes du rapport</h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">
            L’outil propose une rédaction à partir de tes réponses et des chiffres. Relis-la, change ce qui ne te ressemble pas, puis valide.
          </p>
        </div>
        {CLES_TEXTES.map((k) => (
          <TexteRapport key={k} missionId={id} cle={k} titre={TITRES_TEXTES[k]} proposition={propositions[k]} enregistre={g.textes[k] ?? null} />
        ))}
      </section>

      <section aria-labelledby="titre-actions" className="flex flex-col gap-3">
        <h3 id="titre-actions" className="font-display text-t4 text-encre">Plan d’actions</h3>
        <p className="max-w-2xl text-meta text-encre-2">
          {r.nonConformites.length
            ? `${r.nonConformites.length} action${r.nonConformites.length > 1 ? "s" : ""} au rapport, dont ${actionsOuvertes} ouverte${actionsOuvertes > 1 ? "s" : ""}. `
            : "Aucune action pour l’instant. "}
          <Link href={`/admin/missions/${id}/actions`} className="text-vert underline underline-offset-4">Ouvrir le plan d’actions</Link>
        </p>
      </section>
    </div>
  );
}
