import type { Metadata } from "next";
import EtapePage from "@/components/portail/EtapePage";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import SuiviActions from "@/components/grilles/SuiviActions";
import { createClient } from "@/lib/supabase/server";
import { lireGrilles } from "@/lib/grilles/lecture";

export const metadata: Metadata = { title: "Plan d’actions — ANM Consulting", robots: { index: false } };

/**
 * Le suivi des anomalies et des actions correctives (objectif de l'audit, §5) : constat, risque,
 * action, justificatif, responsable, échéance, contrôle de régularisation. L'entreprise garde ce
 * tableau après l'audit.
 */
export default async function ActionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [g, sts] = await Promise.all([
    lireGrilles(id),
    supabase.from("st_sous_traitants").select("id, raison_sociale").eq("mission_id", id).order("rang").order("raison_sociale"),
  ]);
  const ouvertes = g.nonConformites.filter((n) => n.statut !== "regularise").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <EtapePage chemin="actions" />
          <h2 className="font-display text-t3 text-encre">
            Plan d’actions
            {ouvertes ? <span className="text-critique"> · {ouvertes} ouverte{ouvertes > 1 ? "s" : ""}</span> : null}
          </h2>
          <p className="max-w-2xl text-corps text-encre-2">
            Chaque anomalie devient une action : constat, risque, action corrective, justificatif, responsable, échéance, contrôle de
            régularisation. Les alertes des étapes 3 à 6 s’y ajoutent d’un geste (« Créer une action »). L’entreprise garde ce tableau
            après l’audit.
          </p>
        </div>
        <a
          href={`/admin/missions/${id}/rapport/suivi`}
          className="flex min-h-11 items-center gap-2 rounded-[5px] border border-filet px-4 text-meta text-encre-2 transition-colors hover:border-vert hover:text-vert"
        >
          <DownloadSimple size={16} aria-hidden /> Exporter pour Excel
        </a>
      </div>
      <SuiviActions
        missionId={id}
        actions={g.nonConformites}
        sousTraitants={((sts.data ?? []) as { id: string; raison_sociale: string }[]).map((s) => ({ id: s.id, nom: s.raison_sociale }))}
      />
    </div>
  );
}
