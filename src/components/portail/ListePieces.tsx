import type { PieceMission } from "@/lib/types";
import { demanderPiecesManquantes } from "@/app/admin/actions";

const ETAT = (p: PieceMission): { texte: string; couleur: string } => {
  if (p.received === "oui") return { texte: "Reçue", couleur: "var(--anm-mineur)" };
  if (p.received === "na") return { texte: "Sans objet", couleur: "var(--anm-muted)" };
  if (p.requested_on) return { texte: "Demandée", couleur: "var(--anm-majeur)" };
  return { texte: "Manquante", couleur: "var(--anm-critique)" };
};

interface Props {
  missionId: string;
  ordre: string;
  pieces: PieceMission[];
  /** Restreint la liste à un module (écran d'une étape de contrôle). */
  moduleId?: number | null;
  titre?: string;
}

/**
 * Checklist des pièces.
 * Le bouton unique « demander toutes les pièces manquantes » remplace une
 * demande par pièce : c'est le premier poste de temps perdu d'une mission, et
 * les relances partent ensuite seules tous les 3 jours (décision 06).
 */
const ListePieces = ({ missionId, ordre, pieces, moduleId, titre }: Props) => {
  const liste = pieces
    .filter((p) => p.kind === "piece_client")
    .filter((p) => (moduleId == null ? true : p.module_id === moduleId));
  const manquantes = liste.filter((p) => p.received !== "oui" && p.received !== "na" && p.required);

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl">{titre ?? "Pièces attendues"}</h2>
        {manquantes.length > 0 ? (
          <form action={demanderPiecesManquantes}>
            <input type="hidden" name="missionId" value={missionId} />
            <input type="hidden" name="ordre" value={ordre} />
            <button
              type="submit"
              className="rounded bg-[var(--anm-green)] px-3 py-1.5 text-sm font-medium text-[var(--anm-paper)]"
            >
              Demander les {manquantes.length} pièces manquantes
            </button>
          </form>
        ) : (
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--anm-mineur)]">
            Rien ne manque
          </p>
        )}
      </div>

      <ul className="mt-4 flex flex-col">
        {liste.length === 0 ? (
          <li className="py-2 text-sm text-[var(--anm-muted)]">Aucune pièce rattachée.</li>
        ) : null}
        {liste.map((p) => {
          const etat = ETAT(p);
          return (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 border-b border-[var(--anm-hairline)] py-2 text-sm last:border-b-0"
            >
              <span>
                {p.name}
                {p.received_on ? (
                  <span className="ml-2 font-mono text-[0.68rem] text-[var(--anm-muted)]">
                    reçue le {p.received_on}
                  </span>
                ) : null}
              </span>
              <span
                className="shrink-0 font-mono text-[0.68rem] uppercase tracking-wide"
                style={{ color: etat.couleur }}
              >
                {etat.texte}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ListePieces;
