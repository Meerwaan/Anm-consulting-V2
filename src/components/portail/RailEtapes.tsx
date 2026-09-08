import Link from "next/link";
import type { AvancementEtape } from "@/lib/types";
import type { HorsEtape } from "@/lib/portail/mission";

const COULEUR_STATUT: Record<string, string> = {
  todo: "var(--anm-hairline)",
  doing: "var(--anm-majeur)",
  done: "var(--anm-mineur)",
  na: "var(--anm-muted)",
};

interface Props {
  missionId: string;
  etapes: AvancementEtape[];
  ordreActif: number;
  horsEtape: HorsEtape[];
}

/**
 * Colonne vertébrale de l'écran : les 15 étapes dans l'ordre de la méthode.
 * Le bloc « hors étape » n'apparaît que s'il reste des points qu'aucune étape
 * ne couvre — aujourd'hui le fiscal.
 */
const RailEtapes = ({ missionId, etapes, ordreActif, horsEtape }: Props) => {
  const pointsHors = horsEtape.reduce((n, h) => n + h.points_total, 0);
  const traitesHors = horsEtape.reduce((n, h) => n + h.points_traites, 0);

  return (
    <nav aria-label="Étapes de la mission" className="flex flex-col gap-0.5">
      {etapes.map((e) => {
        const actif = e.sort_order === ordreActif;
        return (
          <Link
            key={e.step_id}
            href={`/admin/missions/${missionId}/etapes/${e.sort_order}`}
            aria-current={actif ? "page" : undefined}
            className={`flex items-start gap-2.5 rounded px-2.5 py-2 text-sm ${
              actif ? "bg-[var(--anm-mint)] font-medium" : "hover:bg-[var(--anm-paper)]"
            }`}
          >
            <span
              aria-hidden
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ background: COULEUR_STATUT[e.status] ?? "var(--anm-hairline)" }}
            />
            <span className="min-w-0 flex-1">
              <span className="font-mono text-[0.68rem] text-[var(--anm-muted)]">
                {String(e.sort_order).padStart(2, "0")}
              </span>{" "}
              {e.name}
              {e.points_total > 0 ? (
                <span className="mt-0.5 block font-mono text-[0.68rem] tabular-nums text-[var(--anm-muted)]">
                  {e.points_traites} / {e.points_total} points
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}

      {pointsHors > 0 ? (
        <Link
          href={`/admin/missions/${missionId}/etapes/hors-etape`}
          aria-current={ordreActif === -1 ? "page" : undefined}
          className={`mt-2 flex items-start gap-2.5 rounded border border-dashed border-[var(--anm-majeur)] px-2.5 py-2 text-sm ${
            ordreActif === -1 ? "bg-[var(--anm-mint)] font-medium" : ""
          }`}
        >
          <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--anm-majeur)]" />
          <span>
            Hors étape
            <span className="mt-0.5 block font-mono text-[0.68rem] tabular-nums text-[var(--anm-muted)]">
              {traitesHors} / {pointsHors} points
            </span>
          </span>
        </Link>
      ) : null}
    </nav>
  );
};

export default RailEtapes;
