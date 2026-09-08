import type { LignePoint } from "@/lib/portail/mission";
import { definirResultatPoint, marquerEtapeConforme } from "@/app/admin/actions";

const LIBELLE: Record<string, string> = {
  conforme: "Conforme",
  partiel: "Partiel",
  non_conforme: "Écart",
  na: "Sans objet",
  a_verifier: "À vérifier",
};

const COULEUR_GRAVITE: Record<string, string> = {
  critique: "var(--anm-critique)",
  majeur: "var(--anm-majeur)",
  modere: "var(--anm-modere)",
  mineur: "var(--anm-mineur)",
};

const CHOIX: string[] = ["conforme", "partiel", "non_conforme", "na"];

interface Props {
  missionId: string;
  ordre: string;
  points: LignePoint[];
}

/**
 * Feuille de contrôle d'une étape.
 * Le bouton « tout marquer conforme » ne touche que les points encore à
 * vérifier : sur une mission 360°, l'essentiel est conforme, et le temps de la
 * consultante doit aller aux écarts, pas à la saisie de la normalité.
 */
const TableauPoints = ({ missionId, ordre, points }: Props) => {
  const restants = points.filter((p) => !p.resultat || p.resultat.status === "a_verifier");

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl">Points de contrôle</h2>
        {restants.length > 0 ? (
          <form action={marquerEtapeConforme}>
            <input type="hidden" name="missionId" value={missionId} />
            <input type="hidden" name="ordre" value={ordre} />
            <input type="hidden" name="pointsIds" value={restants.map((p) => p.id).join(",")} />
            <button
              type="submit"
              className="rounded border border-[var(--anm-green)] px-3 py-1.5 text-sm text-[var(--anm-green)]"
            >
              Marquer conformes les {restants.length} points restants
            </button>
          </form>
        ) : (
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--anm-mineur)]">
            Étape entièrement saisie
          </p>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--anm-hairline)] text-left font-mono text-[0.66rem] uppercase tracking-widest text-[var(--anm-muted)]">
              <th className="py-2 pr-3">Réf.</th>
              <th className="py-2 pr-3">Point de contrôle</th>
              <th className="py-2 pr-3">Risque si écart</th>
              <th className="py-2">Résultat</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => {
              const statut = p.resultat?.status ?? "a_verifier";
              return (
                <tr key={p.id} className="border-b border-[var(--anm-hairline)] align-top">
                  <td className="py-3 pr-3 font-mono text-xs text-[var(--anm-muted)]">{p.code}</td>
                  <td className="py-3 pr-3">
                    <span className="font-medium">{p.question}</span>
                    {p.evidence ? (
                      <span className="mt-1 block text-xs text-[var(--anm-muted)]">Preuve : {p.evidence}</span>
                    ) : null}
                    {p.reference_kind === "source" && p.reference ? (
                      <span className="mt-0.5 block font-mono text-[0.68rem] text-[var(--anm-muted)]">
                        Source du pack : {p.reference}
                      </span>
                    ) : null}
                    {p.reference_kind === "interne" ? (
                      <span className="mt-0.5 block font-mono text-[0.68rem] text-[var(--anm-muted)]">
                        Point interne — pas de texte opposable
                      </span>
                    ) : null}
                    {p.reference_kind === "a_qualifier" ? (
                      <span className="mt-0.5 block font-mono text-[0.68rem] text-[var(--anm-majeur)]">
                        Référence à établir avant publication
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className="font-mono text-[0.7rem] uppercase tracking-wide"
                      style={{ color: COULEUR_GRAVITE[p.initial_risk] }}
                    >
                      {p.initial_risk}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {CHOIX.map((choix) => (
                        <form key={choix} action={definirResultatPoint}>
                          <input type="hidden" name="missionId" value={missionId} />
                          <input type="hidden" name="ordre" value={ordre} />
                          <input type="hidden" name="pointId" value={p.id} />
                          <input type="hidden" name="statut" value={choix} />
                          <input type="hidden" name="risqueInitial" value={p.initial_risk} />
                          <button
                            type="submit"
                            aria-pressed={statut === choix}
                            className={`rounded border px-2 py-1 text-xs ${
                              statut === choix
                                ? "border-[var(--anm-green)] bg-[var(--anm-mint)] font-medium"
                                : "border-[var(--anm-hairline)] text-[var(--anm-muted)]"
                            }`}
                          >
                            {LIBELLE[choix]}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TableauPoints;
