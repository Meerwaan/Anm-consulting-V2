import type { Constat } from "@/lib/types";
import { definirPlaceDansRapport } from "@/app/admin/actions";

const NIVEAUX: { valeur: string; label: string; traitement: string; couleur: string }[] = [
  { valeur: "critique", label: "Critique", traitement: "P1 · immédiat", couleur: "var(--anm-critique)" },
  { valeur: "majeur", label: "Majeur", traitement: "P2 · sous 30 jours", couleur: "var(--anm-majeur)" },
  { valeur: "modere", label: "Modéré", traitement: "P3 · sous 90 jours", couleur: "var(--anm-modere)" },
  { valeur: "mineur", label: "Mineur", traitement: "P4 · amélioration", couleur: "var(--anm-mineur)" },
];
const couleurDe = (s: string) => NIVEAUX.find((n) => n.valeur === s)?.couleur;

interface Props {
  missionId: string;
  constats: Constat[];
}

/**
 * Étape 12 — le classement, et ce qui ouvre la synthèse.
 *
 * Le rapport est un dossier complet : TOUS les constats y figurent, rien ne s'en exclut.
 * On ne choisit donc pas ce qui entre, seulement ce qui est mis en avant — « les 5 constats
 * prioritaires » du modèle 07, que le dirigeant lit en premier. Le reste suit, classé par
 * criticité.
 */
const ClassementRisques = ({ missionId, constats }: Props) => {
  const top = constats
    .filter((c) => c.report_rank)
    .sort((a, b) => (a.report_rank ?? 9) - (b.report_rank ?? 9));
  const rangsUtilises = top.map((c) => c.report_rank);
  const doublons = rangsUtilises.filter((r, i) => rangsUtilises.indexOf(r) !== i);
  const incomplets = constats.filter((c) => c.reference_checked !== "oui").length;

  if (constats.length === 0) {
    return (
      <section>
        <h2 className="text-xl">Ce qui entre dans le rapport</h2>
        <p className="mt-3 rounded border border-dashed border-[var(--anm-hairline)] p-5 text-sm text-[var(--anm-muted)]">
          Rien à classer : aucun constat n&apos;a encore été écrit. Reviens après l&apos;étape 11.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl">Classement et mise en avant</h2>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">
        <strong>Les {constats.length} constats figureront au rapport</strong> — c&apos;est un
        dossier complet, rien ne s&apos;en exclut. Donne un rang de 1 à 5 à ceux que le dirigeant
        doit lire en premier : ils ouvrent la synthèse, le reste suit classé par criticité.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded border border-[var(--anm-hairline)] bg-[var(--anm-hairline)] sm:grid-cols-4">
        {NIVEAUX.map((n) => {
          const total = constats.filter((c) => c.severity === n.valeur).length;
          const misEnAvant = top.filter((c) => c.severity === n.valeur).length;
          return (
            <div key={n.valeur} className="bg-[var(--anm-paper)] p-3">
              <b
                className="block font-[family-name:var(--font-display)] text-3xl leading-none tabular-nums"
                style={{ color: n.couleur }}
              >
                {total}
              </b>
              <span className="mt-1 block text-sm font-medium">{n.label}</span>
              <span className="block font-mono text-[0.64rem] uppercase tracking-wide text-[var(--anm-muted)]">
                {misEnAvant > 0 ? `${misEnAvant} en avant · ` : ""}{n.traitement}
              </span>
            </div>
          );
        })}
      </div>

      {doublons.length > 0 ? (
        <p className="mt-3 border-l-2 border-[var(--anm-critique)] px-3 py-2 text-sm" style={{ color: "var(--anm-critique)" }}>
          Deux constats portent le même rang. Chaque place de 1 à 5 doit être unique.
        </p>
      ) : null}
      {incomplets > 0 ? (
        <p className="mt-3 border-l-2 border-[var(--anm-majeur)] bg-[var(--anm-mint)] px-3 py-2 text-sm">
          {incomplets} constat{incomplets > 1 ? "s" : ""} sans référence vérifiée — à régler à
          l&apos;étape 11 avant de sortir le rapport.
        </p>
      ) : null}

      <p className="mt-7 border-b border-[var(--anm-hairline)] pb-1 font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
        Ce que le dirigeant lit en premier — {top.length} sur 5
      </p>
      {top.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--anm-muted)]">
          Aucun rang attribué. Donne un rang 1 à 5 ci-dessous : ce sont eux qui ouvriront le rapport.
        </p>
      ) : (
        <ol className="mt-1 flex flex-col">
          {top.map((c) => (
            <li key={c.id} className="flex items-baseline gap-3 border-b border-[var(--anm-hairline)] py-2 text-sm last:border-b-0">
              <span className="font-[family-name:var(--font-display)] text-xl tabular-nums text-[var(--anm-muted)]">
                {c.report_rank}
              </span>
              <span className="flex-1">{c.title}</span>
              <span className="font-mono text-[0.68rem] uppercase" style={{ color: couleurDe(c.severity) }}>
                {c.severity}
              </span>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-8 border-b border-[var(--anm-hairline)] pb-1 font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
        Tous les constats — {constats.length}, tous au rapport
      </p>
      <div className="mt-1 flex flex-col">
        {NIVEAUX.flatMap((n) => constats.filter((c) => c.severity === n.valeur)).map((c) => (
          <form
            key={c.id}
            action={definirPlaceDansRapport}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--anm-hairline)] py-2.5 text-sm last:border-b-0"
          >
            <input type="hidden" name="missionId" value={missionId} />
            <input type="hidden" name="constatId" value={c.id} />

            <span className="min-w-[14rem] flex-1">
              {c.title}
              <span className="mt-0.5 block font-mono text-[0.66rem] text-[var(--anm-muted)]">
                {c.code_point ?? "—"} · {c.nature === "risque_controle" ? "risque de contrôle" : "amélioration"}
                {c.reference_checked !== "oui" ? " · référence non vérifiée" : ""}
              </span>
            </span>

            <span className="font-mono text-[0.68rem] uppercase" style={{ color: couleurDe(c.severity) }}>
              {c.severity} · {c.priority}
            </span>

            <label className="flex items-center gap-2 text-xs">
              mettre en avant
              <select
                name="rang"
                defaultValue={c.report_rank ? String(c.report_rank) : ""}
                className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1 text-sm"
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>

            <button type="submit" className="rounded border border-[var(--anm-green)] px-2.5 py-1 text-xs text-[var(--anm-green)]">
              Appliquer
            </button>
          </form>
        ))}
      </div>
    </section>
  );
};

export default ClassementRisques;
