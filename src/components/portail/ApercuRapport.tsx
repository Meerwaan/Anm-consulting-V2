import type { ActionPlan, Constat, HeuresAgent } from "@/lib/types";
import type { EnTeteMission } from "@/lib/portail/mission";
import { SECTIONS_RAPPORT } from "@/content/methode";
import { AXES_RAPPORT, axeIncoherent } from "@/content/vision";
import { ESCALADES, cequiManque } from "@/content/constat";

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
  /** Section 7 du modèle 07 : les heures reconstituées agent par agent. */
  heures: HeuresAgent[];
}

/**
 * Étape 14 — ce que contiendra le rapport, assemblé depuis les étapes 11 à 13.
 *
 * Écran de vérification avant génération : ce qui est prêt, et ce qui bloque encore.
 * Rien ne se ressaisit ici — tout vient du travail déjà fait.
 */
const ApercuRapport = ({ mission, constats, actions, heures }: Props) => {
  const top = constats
    .filter((c) => c.report_rank)
    .sort((a, b) => (a.report_rank ?? 9) - (b.report_rank ?? 9));
  const risques = constats.filter((c) => c.nature === "risque_controle");
  const aOrienter = constats.filter((c) => c.escalation && c.escalation !== "aucune");
  const sansEscalade = constats.filter((c) => !c.escalation).length;
  const heuresAInvestiguer = heures.filter((h) => h.a_investiguer).length;
  const heuresIncompletes = heures.filter((h) => h.incomplet).length;
  const ameliorations = constats.filter((c) => c.nature === "amelioration");

  const bloquants: string[] = [];
  if (constats.length === 0) bloquants.push("aucun constat n'a été écrit (étape 11)");
  /**
   * Ne rien mettre en avant est un résultat légitime : un client bien tenu n'a pas de
   * constat qui doit ouvrir son rapport. Ça ne devient bloquant que s'il porte un écart
   * critique ou majeur — sinon la synthèse s'ouvrirait sur rien pendant qu'il est exposé.
   */
  const graves = constats.filter((c) => c.severity === "critique" || c.severity === "majeur").length;
  if (top.length === 0 && graves > 0)
    bloquants.push(
      `aucun constat mis en avant alors que ${graves} sont cotés critique ou majeur (étape 12)`,
    );
  /**
   * On applique ici la chaîne entière, pas la seule référence. Un constat sans fait ni
   * preuve mais dont la case « référence vérifiée » était cochée ne produisait aucun
   * bloquant : l'étape 11 le classait « à finir » pendant que l'étape 14 affichait
   * « tout est en place ». Le verrou de sortie du rapport disait le contraire de la
   * vérité au moment où elle allait le sortir.
   */
  const incomplets = constats.filter((c) => cequiManque(c).length > 0);
  if (incomplets.length > 0)
    bloquants.push(
      `${incomplets.length} constat(s) incomplet(s) — ${incomplets
        .slice(0, 3)
        .map((c) => `${c.title} : il manque ${cequiManque(c).join(", ")}`)
        .join(" ; ")}${incomplets.length > 3 ? " ; …" : ""} (étape 11)`,
    );
  const sansResp = actions.filter((a) => !a.client_owner).length;
  if (sansResp > 0) bloquants.push(`${sansResp} action(s) sans responsable (étape 13)`);
  // P4 est « amélioration continue » : le pack ne lui donne pas de date, donc son absence
  // n'est pas un oubli. La compter manquante forçait à inventer une échéance.
  const sansDate = actions.filter((a) => !a.due_on && a.priority !== "P4").length;
  if (sansDate > 0) bloquants.push(`${sansDate} action(s) sans échéance (étape 13)`);
  // La section 7 du rapport est un tableau par salarié : sans une seule ligne, elle sort vide.
  if (heures.length === 0)
    bloquants.push("aucune heure reconstituée agent par agent — la section 7 du rapport serait vide (étape 10)");
  if (heuresIncompletes > 0)
    bloquants.push(`${heuresIncompletes} ligne(s) d'heures où une des quatre sources manque (étape 10)`);
  const malClasses = constats.filter((c) => axeIncoherent(c.nature, c.severity)).length;
  if (malClasses > 0)
    bloquants.push(
      `${malClasses} constat(s) critique ou majeur rangé(s) en axe d'amélioration (étape 11)`,
    );

  return (
    <section>
      <h2 className="text-xl">Ce que contiendra le rapport</h2>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">
        Un dossier complet : les {constats.length} constats y figurent, plus le plan d&apos;actions
        et les pièces. Assemblé depuis les étapes 11 à 13, rien ne se ressaisit ici.
      </p>

      {bloquants.length > 0 ? (
        <div className="mt-4 border-l-2 border-[var(--anm-majeur)] bg-[var(--anm-sable)] px-3 py-2 text-sm">
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
        Synthèse dirigeant — {top.length === 0 ? "aucun constat mis en avant" : `${top.length} constat${top.length > 1 ? "s" : ""} mis en avant`}
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
        {top.length === 0 ? (
          <li className="py-2 text-sm text-[var(--anm-muted)]">
            {graves > 0
              ? "— à désigner à l'étape 12"
              : "— rien ne se détache ; le rapport ouvrira sur le classement par criticité."}
          </li>
        ) : null}
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
        Contrôle croisé par salarié — {heures.length} ligne{heures.length > 1 ? "s" : ""}
      </p>
      <ul className="mt-1 flex flex-col">
        {heures.slice(0, 8).map((h) => (
          <li key={h.id} className="flex flex-wrap items-baseline gap-x-3 border-b border-[var(--anm-hairline)] py-1.5 text-sm last:border-b-0">
            <span className="font-medium">{h.salarie}</span>
            <span className="font-mono text-[0.66rem] text-[var(--anm-muted)]">
              {[h.site, h.periode].filter(Boolean).join(" · ") || "—"}
            </span>
            <span className="font-mono text-[0.66rem] tabular-nums text-[var(--anm-muted)]">
              {h.planning ?? "—"} / {h.pointage ?? "—"} / {h.paye ?? "—"} / {h.facture ?? "—"}
            </span>
            {h.a_investiguer ? (
              <span className="font-mono text-[0.64rem] uppercase" style={{ color: "var(--anm-critique)" }}>
                écart
              </span>
            ) : null}
          </li>
        ))}
        {heures.length > 8 ? (
          <li className="py-1.5 text-sm text-[var(--anm-muted)]">… et {heures.length - 8} autre(s).</li>
        ) : null}
        {heures.length === 0 ? (
          <li className="py-1.5 text-sm text-[var(--anm-muted)]">
            — rien de saisi : la section 7 du rapport sortirait vide. Elle se remplit à l&apos;étape 10.
          </li>
        ) : (
          <li className="py-1.5 text-[0.7rem] text-[var(--anm-muted)]">
            planning / pointage / payé / facturé
            {heuresAInvestiguer > 0 ? ` · ${heuresAInvestiguer} ligne(s) portent un écart à investiguer` : ""}
          </li>
        )}
      </ul>

      {/* Modèle 07 §9 : « les éventuels sujets à faire valider par avocat /
          expert-comptable / autre spécialiste ». La liste se déduit des constats. */}
      <p className="mt-7 border-b border-[var(--anm-hairline)] pb-1 font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
        Sujets à faire valider par un spécialiste — {aOrienter.length}
      </p>
      <ul className="mt-1 flex flex-col">
        {ESCALADES.filter((e) => e.valeur !== "aucune").map((e) => {
          const liste = aOrienter.filter((c) => c.escalation === e.valeur);
          if (liste.length === 0) return null;
          return (
            <li key={e.valeur} className="border-b border-[var(--anm-hairline)] py-2 text-sm last:border-b-0">
              <span className="font-medium">{e.libelle}</span>
              <ul className="mt-0.5 flex flex-col gap-0.5 text-[var(--anm-muted)]">
                {liste.map((c) => (
                  <li key={c.id}>
                    — {c.title}
                    {c.escalation_note ? ` : ${c.escalation_note}` : ""}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
        {aOrienter.length === 0 ? (
          <li className="py-2 text-sm text-[var(--anm-muted)]">
            {sansEscalade > 0
              ? `— ${sansEscalade} constat(s) sans décision d'escalade : à trancher à l'étape 11.`
              : "— aucun : tous les sujets restent dans le périmètre du diagnostic."}
          </li>
        ) : null}
      </ul>

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
