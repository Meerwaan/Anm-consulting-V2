import type { ActionPlan, Constat } from "@/lib/types";
import type { EnTeteMission } from "@/lib/portail/mission";
import { SECTIONS_RAPPORT } from "@/content/methode";
import { AXES_RAPPORT } from "@/content/vision";

const COULEUR: Record<string, string> = {
  critique: "var(--anm-critique)",
  majeur: "var(--anm-majeur)",
  modere: "var(--anm-modere)",
  mineur: "var(--anm-mineur)",
};

interface Props {
  mission: EnTeteMission;
  constats: Constat[];
  actions: ActionPlan[];
}

/**
 * Étape 14 — ce que contiendra le rapport, assemblé depuis les étapes 11 à 13.
 *
 * Écran de vérification avant génération : ce qui est prêt, et ce qui bloque encore.
 * Rien ne se ressaisit ici — tout vient du travail déjà fait.
 */
const ApercuRapport = ({ mission, constats, actions }: Props) => {
  const top = constats
    .filter((c) => c.report_rank)
    .sort((a, b) => (a.report_rank ?? 9) - (b.report_rank ?? 9));
  const risques = constats.filter((c) => c.nature === "risque_controle");
  const ameliorations = constats.filter((c) => c.nature === "amelioration");

  const bloquants: string[] = [];
  if (constats.length === 0) bloquants.push("aucun constat n'a été écrit (étape 11)");
  if (top.length === 0 && constats.length > 0) bloquants.push("aucun constat mis en avant pour la synthèse (étape 12)");
  const sansRef = constats.filter((c) => c.reference_checked !== "oui").length;
  if (sansRef > 0) bloquants.push(`${sansRef} constat(s) sans référence vérifiée (étape 11)`);
  const sansResp = actions.filter((a) => !a.client_owner).length;
  if (sansResp > 0) bloquants.push(`${sansResp} action(s) sans responsable (étape 13)`);
  const sansDate = actions.filter((a) => !a.due_on).length;
  if (sansDate > 0) bloquants.push(`${sansDate} action(s) sans échéance (étape 13)`);

  return (
    <section>
      <h2 className="text-xl">Ce que contiendra le rapport</h2>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">
        Un dossier complet : les {constats.length} constats y figurent, plus le plan d&apos;actions
        et les pièces. Assemblé depuis les étapes 11 à 13, rien ne se ressaisit ici.
      </p>

      {bloquants.length > 0 ? (
        <div className="mt-4 border-l-2 border-[var(--anm-majeur)] bg-[var(--anm-mint)] px-3 py-2 text-sm">
          <p className="font-medium">Il reste à régler avant de sortir le rapport :</p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {bloquants.map((b) => <li key={b}>— {b}</li>)}
          </ul>
        </div>
      ) : (
        <p className="mt-4 border-l-2 border-[var(--anm-mineur)] bg-[var(--anm-mint)] px-3 py-2 text-sm">
          Tout est en place : constats retenus, rangs attribués, références vérifiées, actions
          affectées et datées.
        </p>
      )}

      <p className="mt-7 border-b border-[var(--anm-hairline)] pb-1 font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
        Synthèse dirigeant — {top.length} constat{top.length > 1 ? "s" : ""} mis en avant
      </p>
      <ol className="mt-1 flex flex-col">
        {top.map((c) => (
          <li key={c.id} className="border-b border-[var(--anm-hairline)] py-2 text-sm last:border-b-0">
            <span className="font-[family-name:var(--font-display)] text-lg tabular-nums text-[var(--anm-muted)]">
              {c.report_rank}.
            </span>{" "}
            {c.title}
            <span className="ml-2 font-mono text-[0.66rem] uppercase" style={{ color: COULEUR[c.severity] }}>
              {c.severity}
            </span>
          </li>
        ))}
        {top.length === 0 ? <li className="py-2 text-sm text-[var(--anm-muted)]">— à désigner à l&apos;étape 12</li> : null}
      </ol>

      <div className="mt-7 grid gap-6 md:grid-cols-2">
        {AXES_RAPPORT.map((axe) => {
          const liste = axe.nature === "risque_controle" ? risques : ameliorations;
          return (
            <div key={axe.nature}>
              <p
                className="border-b border-[var(--anm-hairline)] pb-1 font-mono text-[0.68rem] uppercase tracking-widest"
                style={{ color: axe.nature === "risque_controle" ? "var(--anm-critique)" : "var(--anm-mineur)" }}
              >
                {axe.titre} — {liste.length}
              </p>
              <ul className="mt-1 flex flex-col">
                {liste.map((c) => (
                  <li key={c.id} className="border-b border-[var(--anm-hairline)] py-1.5 text-sm last:border-b-0">
                    {c.title}
                    <span className="ml-2 font-mono text-[0.64rem] uppercase" style={{ color: COULEUR[c.severity] }}>
                      {c.severity}
                    </span>
                  </li>
                ))}
                {liste.length === 0 ? <li className="py-1.5 text-sm text-[var(--anm-muted)]">—</li> : null}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-7 border-b border-[var(--anm-hairline)] pb-1 font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
        Plan d&apos;actions — {actions.length}
      </p>
      <ul className="mt-1 flex flex-col">
        {(["P1", "P2", "P3", "P4"] as const).map((p) => {
          const n = actions.filter((a) => a.priority === p).length;
          if (n === 0) return null;
          return (
            <li key={p} className="flex justify-between border-b border-[var(--anm-hairline)] py-1.5 text-sm last:border-b-0">
              <span className="font-mono text-xs" style={{ color: COULEUR[p === "P1" ? "critique" : p === "P2" ? "majeur" : p === "P3" ? "modere" : "mineur"] }}>
                {p}
              </span>
              <span className="flex-1 px-3">{n} action{n > 1 ? "s" : ""}</span>
            </li>
          );
        })}
      </ul>

      <details className="mt-7">
        <summary className="cursor-pointer font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
          Structure du rapport (modèle 07)
        </summary>
        <ol className="mt-2 flex flex-col gap-0.5 text-sm text-[var(--anm-muted)]">
          {SECTIONS_RAPPORT.map((s, i) => <li key={s}>{i + 1}. {s}</li>)}
        </ol>
      </details>

      <p className="mt-6 text-sm text-[var(--anm-muted)]">
        Mission {mission.reference}
        {mission.restitution_on ? ` · restitution prévue le ${mission.restitution_on}` : ""}. La
        génération du PDF reste à construire.
      </p>
    </section>
  );
};

export default ApercuRapport;
