import type { ActionPlan, Constat } from "@/lib/types";
import {
  ajouterAction,
  enregistrerAction,
  genererPlanActions,
  realignerAction,
} from "@/app/admin/actions";
import { DOMAINES } from "@/content/constat";

const PRIORITES: { valeur: string; libelle: string }[] = [
  { valeur: "P1", libelle: "P1 · immédiat" },
  { valeur: "P2", libelle: "P2 · sous 30 jours" },
  { valeur: "P3", libelle: "P3 · sous 90 jours" },
  { valeur: "P4", libelle: "P4 · amélioration" },
];
const STATUTS: { valeur: string; libelle: string }[] = [
  { valeur: "a_faire", libelle: "À faire" },
  { valeur: "en_cours", libelle: "En cours" },
  { valeur: "clos", libelle: "Clos" },
  { valeur: "accepte", libelle: "Risque accepté" },
];
const COULEUR: Record<string, string> = {
  P1: "var(--anm-critique)",
  P2: "var(--anm-majeur)",
  P3: "var(--anm-modere)",
  P4: "var(--anm-mineur)",
};
const champ = "rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm";

interface Props {
  missionId: string;
  ordre: string;
  actions: ActionPlan[];
  constats: Constat[];
}

/**
 * Étape 13 — le plan d'actions, réellement planifiable.
 *
 * Une action générée depuis un constat n'a ni responsable ni date négociée : c'est la
 * réunion de restitution qui les fixe. Tant qu'on ne peut pas les saisir ici, le plan
 * n'est qu'une liste — et il faut le refaire ailleurs.
 */
const PlanActions = ({ missionId, ordre, actions, constats }: Props) => {
  const couverts = new Set(actions.map((a) => a.finding_id));
  const restants = constats.filter((c) => !couverts.has(c.id)).length;
  const sansResponsable = actions.filter((a) => !a.client_owner).length;
  const sansDate = actions.filter((a) => !a.due_on).length;

  /**
   * Une action née d'un constat garde la priorité qu'avait ce constat le jour de la
   * génération. Si la criticité change ensuite, plus rien ne le dit : le plan promet un
   * traitement sous 180 jours pour un écart devenu critique.
   *
   * On constate l'écart, on n'en donne pas la cause : elle a aussi le droit de décaler
   * une priorité à la main en restitution. Lui dire « la criticité a changé » serait
   * faux une fois sur deux, et l'inviterait à défaire son propre arbitrage.
   */
  const parConstat = new Map(constats.map((c) => [c.id, c]));
  const desaccordee = (a: ActionPlan) => {
    const c = a.finding_id ? parConstat.get(a.finding_id) : undefined;
    return c && c.priority !== a.priority ? c : null;
  };
  const desaccordees = actions.filter((a) => desaccordee(a) !== null).length;

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl">Plan d&apos;actions</h2>
        {restants > 0 ? (
          <form action={genererPlanActions}>
            <input type="hidden" name="missionId" value={missionId} />
            <input type="hidden" name="ordre" value={ordre} />
            <button type="submit" className="rounded bg-[var(--anm-green)] px-3 py-1.5 text-sm font-medium text-[var(--anm-paper)]">
              Générer les {restants} actions manquantes
            </button>
          </form>
        ) : sansResponsable > 0 || sansDate > 0 ? (
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--anm-majeur)]">
            Reste à affecter
          </p>
        ) : (
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--anm-mineur)]">
            Plan complet
          </p>
        )}
      </div>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">
        {actions.length} action{actions.length > 1 ? "s" : ""}
        {sansResponsable > 0 ? ` · ${sansResponsable} sans responsable` : ""}
        {sansDate > 0 ? ` · ${sansDate} sans date` : ""}
        {actions.length > 0 && sansResponsable === 0 && sansDate === 0
          ? " · toutes affectées et datées"
          : " — à fixer avec le dirigeant en restitution."}
      </p>
      {desaccordees > 0 ? (
        <p className="mt-3 border-l-2 border-[var(--anm-majeur)] bg-[var(--anm-sable)] px-3 py-2 text-sm">
          {desaccordees > 1
            ? `${desaccordees} actions n'ont pas la priorité de leur constat`
            : "Une action n'a pas la priorité de son constat"}{" "}
          — soit la criticité a changé depuis la génération, soit c&apos;est un choix fait en
          restitution. Chaque ligne concernée dit laquelle et propose de s&apos;aligner ;
          l&apos;échéance, elle, n&apos;est jamais réécrite.
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3">
        {actions.map((a) => (
          <form
            key={a.id}
            action={enregistrerAction}
            className="rounded border border-[var(--anm-hairline)] bg-[var(--anm-paper)] p-3"
          >
            <input type="hidden" name="missionId" value={missionId} />
            <input type="hidden" name="actionId" value={a.id} />

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-[0.66rem] uppercase tracking-wide" style={{ color: COULEUR[a.priority] }}>
                {a.priority}
              </span>
              {desaccordee(a) ? (
                <span className="font-mono text-[0.64rem] uppercase tracking-wide text-[var(--anm-majeur)]">
                  constat en {desaccordee(a)?.priority} · action en {a.priority}
                </span>
              ) : null}
              <span className="font-mono text-[0.66rem] text-[var(--anm-muted)]">
                {a.domain}
                {a.constat ? ` · depuis « ${a.constat} »` : " · action libre"}
              </span>
            </div>

            <label className="mt-2 flex flex-col gap-1 text-xs">
              L&apos;action
              <input name="title" defaultValue={a.title} className={`${champ} font-medium`} />
            </label>

            <div className="mt-2 grid gap-2 sm:grid-cols-4">
              <label className="flex flex-col gap-1 text-xs">
                Responsable côté client
                <input name="responsable" defaultValue={a.client_owner ?? ""} placeholder="Nom, fonction" className={champ} />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                Échéance
                <input name="echeance" type="date" defaultValue={a.due_on ?? ""} className={champ} />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                Priorité
                <select name="priorite" defaultValue={a.priority} className={champ}>
                  {PRIORITES.map((p) => <option key={p.valeur} value={p.valeur}>{p.libelle}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs">
                Où ça en est
                <select name="statut" defaultValue={a.status} className={champ}>
                  {STATUTS.map((s) => <option key={s.valeur} value={s.valeur}>{s.libelle}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-2 flex flex-wrap items-end gap-3">
              <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-xs">
                Commentaire
                <input name="commentaire" defaultValue={a.comment ?? ""} placeholder="Ce qui a été convenu, un blocage…" className={champ} />
              </label>
              {/* « Enregistrer » en premier : c'est lui que la touche Entrée déclenche. */}
              <button type="submit" className="rounded border border-[var(--anm-green)] px-3 py-1.5 text-sm text-[var(--anm-green)]">
                Enregistrer
              </button>
              {desaccordee(a) ? (
                <button
                  type="submit"
                  formAction={realignerAction}
                  className="rounded border border-[var(--anm-majeur)] px-3 py-1.5 text-sm"
                  style={{ color: "var(--anm-majeur)" }}
                >
                  Aligner sur le constat ({desaccordee(a)?.priority})
                </button>
              ) : null}
            </div>
          </form>
        ))}
      </div>

      <details className="mt-5 rounded border border-dashed border-[var(--anm-hairline)] p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Ajouter une action qui ne vient d&apos;aucun constat
        </summary>
        <p className="mt-1 text-sm text-[var(--anm-muted)]">
          Une procédure à écrire, un classement à reprendre : tout ne naît pas d&apos;un écart.
        </p>
        <form action={ajouterAction} className="mt-3 grid gap-2 sm:grid-cols-4">
          <input type="hidden" name="missionId" value={missionId} />
          <label className="flex flex-col gap-1 text-xs sm:col-span-2">
            L&apos;action
            <input name="title" required className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Responsable
            <input name="responsable" className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Échéance
            <input name="echeance" type="date" className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Priorité
            <select name="priorite" defaultValue="P3" className={champ}>
              {PRIORITES.map((p) => <option key={p.valeur} value={p.valeur}>{p.libelle}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Domaine
            <select name="domaine" defaultValue="operationnel" className={champ}>
              {DOMAINES.map((d) => (
                <option key={d.valeur} value={d.valeur}>{d.libelle}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="self-end rounded bg-[var(--anm-green)] px-3 py-1.5 text-sm font-medium text-[var(--anm-paper)]">
            Ajouter
          </button>
        </form>
      </details>
    </section>
  );
};

export default PlanActions;
