import type { ActionPlan, Constat } from "@/lib/types";
import { genererPlanActions } from "@/app/admin/actions";

const DELAI: Record<string, string> = {
  P1: "immédiat",
  P2: "sous 30 jours",
  P3: "sous 90 jours",
  P4: "amélioration continue",
};
const COULEUR: Record<string, string> = {
  P1: "var(--anm-critique)",
  P2: "var(--anm-majeur)",
  P3: "var(--anm-modere)",
  P4: "var(--anm-mineur)",
};

interface Props {
  missionId: string;
  ordre: string;
  actions: ActionPlan[];
  constats: Constat[];
}

/** Plan d'actions P1 → P4, généré depuis les constats puis ajusté. */
const PlanActions = ({ missionId, ordre, actions, constats }: Props) => {
  const couverts = new Set(actions.map((a) => a.finding_id));
  const restants = constats.filter((c) => !couverts.has(c.id)).length;

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl">Plan d&apos;actions</h2>
        {restants > 0 ? (
          <form action={genererPlanActions}>
            <input type="hidden" name="missionId" value={missionId} />
            <input type="hidden" name="ordre" value={ordre} />
            <button
              type="submit"
              className="rounded bg-[var(--anm-green)] px-3 py-1.5 text-sm font-medium text-[var(--anm-paper)]"
            >
              Générer les {restants} actions manquantes
            </button>
          </form>
        ) : (
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--anm-mineur)]">
            Chaque constat a son action
          </p>
        )}
      </div>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">
        Une action par constat, avec la priorité et l&apos;échéance conseillées par la criticité.
        Le client pourra cocher ce qu&apos;il a fait ; tu es notifiée.
      </p>

      {actions.length === 0 ? (
        <p className="mt-4 rounded border border-dashed border-[var(--anm-hairline)] p-5 text-sm text-[var(--anm-muted)]">
          Aucune action. Qualifie d&apos;abord les constats à l&apos;étape 11, puis génère le plan ici.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--anm-hairline)] text-left font-mono text-[0.66rem] uppercase tracking-widest text-[var(--anm-muted)]">
                <th className="py-2 pr-3">Priorité</th>
                <th className="py-2 pr-3">Action</th>
                <th className="py-2 pr-3">Domaine</th>
                <th className="py-2 pr-3">Échéance</th>
                <th className="py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a) => (
                <tr key={a.id} className="border-b border-[var(--anm-hairline)] align-top">
                  <td className="py-2.5 pr-3">
                    <span className="font-mono text-xs font-semibold" style={{ color: COULEUR[a.priority] }}>
                      {a.priority}
                    </span>
                    <span className="block font-mono text-[0.64rem] text-[var(--anm-muted)]">
                      {DELAI[a.priority]}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">{a.title}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-[var(--anm-muted)]">{a.domain}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs tabular-nums">{a.due_on ?? "—"}</td>
                  <td className="py-2.5 font-mono text-xs text-[var(--anm-muted)]">
                    {a.status.replace(/_/g, " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default PlanActions;
