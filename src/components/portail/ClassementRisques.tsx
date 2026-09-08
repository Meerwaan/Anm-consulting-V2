import type { Constat } from "@/lib/types";

const NIVEAUX: { valeur: string; label: string; traitement: string; couleur: string }[] = [
  { valeur: "critique", label: "Critique", traitement: "P1 · immédiat", couleur: "var(--anm-critique)" },
  { valeur: "majeur", label: "Majeur", traitement: "P2 · sous 30 jours", couleur: "var(--anm-majeur)" },
  { valeur: "modere", label: "Modéré", traitement: "P3 · sous 90 jours", couleur: "var(--anm-modere)" },
  { valeur: "mineur", label: "Mineur", traitement: "P4 · amélioration", couleur: "var(--anm-mineur)" },
];

interface Props {
  constats: Constat[];
}

/**
 * Étape 12 — le classement, pas une deuxième saisie.
 *
 * La criticité se fixe en écrivant le constat (étape 11). Ce qu'il reste à faire ici, c'est
 * de REGARDER l'ensemble : combien de chaque niveau, et lesquels ouvriront le rapport. Les
 * « 5 constats prioritaires » sont une section du modèle de rapport 07 — c'est ici qu'on les
 * choisit, pas au moment de la rédaction.
 */
const ClassementRisques = ({ constats }: Props) => {
  const parNiveau = NIVEAUX.map((n) => ({
    ...n,
    liste: constats.filter((c) => c.severity === n.valeur),
  }));
  const ordre = ["critique", "majeur", "modere", "mineur"];
  const top5 = [...constats]
    .sort((a, b) => ordre.indexOf(a.severity) - ordre.indexOf(b.severity))
    .slice(0, 5);
  const sansReference = constats.filter((c) => c.reference_checked !== "oui").length;

  if (constats.length === 0) {
    return (
      <section>
        <h2 className="text-xl">Classement des risques</h2>
        <p className="mt-3 rounded border border-dashed border-[var(--anm-hairline)] p-5 text-sm text-[var(--anm-muted)]">
          Rien à classer : aucun constat n&apos;a encore été écrit. Reviens ici après l&apos;étape 11.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl">Classement des risques</h2>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">
        La criticité se fixe en écrivant le constat. Ici tu regardes l&apos;ensemble et tu choisis
        ce qui ouvrira le rapport.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded border border-[var(--anm-hairline)] bg-[var(--anm-hairline)] sm:grid-cols-4">
        {parNiveau.map((n) => (
          <div key={n.valeur} className="bg-[var(--anm-paper)] p-3">
            <b
              className="block font-[family-name:var(--font-display)] text-3xl leading-none tabular-nums"
              style={{ color: n.couleur }}
            >
              {n.liste.length}
            </b>
            <span className="mt-1 block text-sm font-medium">{n.label}</span>
            <span className="block font-mono text-[0.64rem] uppercase tracking-wide text-[var(--anm-muted)]">
              {n.traitement}
            </span>
          </div>
        ))}
      </div>

      {sansReference > 0 ? (
        <p className="mt-3 border-l-2 border-[var(--anm-majeur)] bg-[var(--anm-mint)] px-3 py-2 text-sm">
          {sansReference} constat{sansReference > 1 ? "s" : ""} sans référence vérifiée — à régler
          à l&apos;étape 11 avant le rapport.
        </p>
      ) : null}

      <h3 className="mt-7 font-[family-name:var(--font-display)] text-lg">
        Les 5 constats prioritaires
      </h3>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">
        Ce sont eux qui ouvrent la synthèse dirigeant du rapport.
      </p>
      <ol className="mt-3 flex flex-col">
        {top5.map((c, i) => (
          <li
            key={c.id}
            className="flex items-baseline gap-3 border-b border-[var(--anm-hairline)] py-2.5 text-sm last:border-b-0"
          >
            <span className="font-[family-name:var(--font-display)] text-xl tabular-nums text-[var(--anm-muted)]">
              {i + 1}
            </span>
            <span className="flex-1">
              {c.title}
              <span className="mt-0.5 block font-mono text-[0.66rem] text-[var(--anm-muted)]">
                {c.code_point ?? "—"} · {c.domain} ·{" "}
                {c.nature === "risque_controle" ? "risque de contrôle" : "amélioration"}
              </span>
            </span>
            <span
              className="font-mono text-[0.68rem] uppercase tracking-wide"
              style={{ color: NIVEAUX.find((n) => n.valeur === c.severity)?.couleur }}
            >
              {c.severity} · {c.priority}
            </span>
          </li>
        ))}
      </ol>

      <h3 className="mt-7 font-[family-name:var(--font-display)] text-lg">Tout le classement</h3>
      {parNiveau
        .filter((n) => n.liste.length > 0)
        .map((n) => (
          <div key={n.valeur} className="mt-4">
            <p
              className="border-b border-[var(--anm-hairline)] pb-1 font-mono text-[0.68rem] uppercase tracking-widest"
              style={{ color: n.couleur }}
            >
              {n.label} — {n.traitement}
            </p>
            <ul className="mt-1 flex flex-col">
              {n.liste.map((c) => (
                <li key={c.id} className="border-b border-[var(--anm-hairline)] py-2 text-sm last:border-b-0">
                  {c.title}
                  <span className="ml-2 font-mono text-[0.66rem] text-[var(--anm-muted)]">
                    {c.code_point ?? ""} {c.visible_to_client ? "· publié" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </section>
  );
};

export default ClassementRisques;
