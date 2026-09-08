import type { Constat } from "@/lib/types";
import { enregistrerConstat } from "@/app/admin/actions";
import { REGLE_OR } from "@/content/methode";

const CRITICITES: { valeur: string; label: string; priorite: string }[] = [
  { valeur: "critique", label: "Critique", priorite: "P1 · immédiat" },
  { valeur: "majeur", label: "Majeur", priorite: "P2 · 30 jours" },
  { valeur: "modere", label: "Modéré", priorite: "P3 · 90 jours" },
  { valeur: "mineur", label: "Mineur", priorite: "P4 · amélioration" },
];

const COULEUR: Record<string, string> = {
  critique: "var(--anm-critique)",
  majeur: "var(--anm-majeur)",
  modere: "var(--anm-modere)",
  mineur: "var(--anm-mineur)",
};

interface Props {
  missionId: string;
  ordre: string;
  constats: Constat[];
}

/**
 * Les constats de la mission.
 *
 * Chaque champ suit la chaîne du pack, dans l'ordre. Le verrou est en bas : un constat
 * ne part au client que si sa référence est marquée vérifiée — la règle d'or rendue
 * mécanique plutôt que laissée à la vigilance en fin de journée.
 */
const Constats = ({ missionId, ordre, constats }: Props) => {
  const publiables = constats.filter((c) => c.reference_checked !== "oui").length;

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl">Constats</h2>
        <p className="font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
          {REGLE_OR.join(" → ")}
        </p>
      </div>

      {constats.length === 0 ? (
        <p className="mt-3 rounded border border-dashed border-[var(--anm-hairline)] p-5 text-sm text-[var(--anm-muted)]">
          Aucun constat pour l&apos;instant. Ils s&apos;ouvrent depuis les étapes de contrôle :
          marque un point en écart, puis clique « Rédiger le constat » — il arrive ici déjà
          pré-rempli.
        </p>
      ) : null}

      {publiables > 0 ? (
        <p className="mt-3 border-l-2 border-[var(--anm-majeur)] bg-[var(--anm-mint)] px-3 py-2 text-sm">
          {publiables} constat{publiables > 1 ? "s" : ""} sans référence vérifiée. Ils ne
          peuvent pas être publiés au client tant que la référence n&apos;est pas confirmée et datée.
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-4">
        {constats.map((c) => (
          <form
            key={c.id}
            action={enregistrerConstat}
            className="rounded border border-[var(--anm-hairline)] bg-[var(--anm-paper)] p-4"
          >
            <input type="hidden" name="missionId" value={missionId} />
            <input type="hidden" name="ordre" value={ordre} />
            <input type="hidden" name="constatId" value={c.id} />

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-[0.68rem] text-[var(--anm-muted)]">
                {c.code_point ?? "—"} · {c.domain}
              </span>
              <span
                className="font-mono text-[0.68rem] uppercase tracking-wide"
                style={{ color: COULEUR[c.severity] }}
              >
                {c.severity} · {c.priority}
                {c.visible_to_client ? " · publié" : ""}
              </span>
            </div>

            <label className="mt-2 flex flex-col gap-1 text-xs">
              Titre
              <input
                name="title" defaultValue={c.title}
                className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm font-medium"
              />
            </label>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs">
                Le fait constaté
                <textarea
                  name="fact" rows={4} defaultValue={c.fact}
                  className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                La preuve — documents, dates, site, salarié
                <textarea
                  name="evidence" rows={4} defaultValue={c.evidence ?? ""}
                  className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm"
                />
              </label>
            </div>

            <label className="mt-3 flex flex-col gap-1 text-xs">
              La référence — texte applicable, article, date de vérification
              <textarea
                name="reference" rows={2} defaultValue={c.reference ?? ""}
                className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm"
              />
            </label>

            <label className="mt-3 flex flex-col gap-1 text-xs">
              La recommandation — action, responsable, délai
              <textarea
                name="recommendation" rows={2} defaultValue={c.recommendation ?? ""}
                placeholder="Il est recommandé de …, sous la responsabilité de …, avant le …"
                className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm"
              />
            </label>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs">
                Criticité — fixe la priorité
                <select
                  name="severity" defaultValue={c.severity}
                  className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm"
                >
                  {CRITICITES.map((s) => (
                    <option key={s.valeur} value={s.valeur}>{s.label} → {s.priorite}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs">
                Axe du rapport
                <select
                  name="nature" defaultValue={c.nature}
                  className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm"
                >
                  <option value="risque_controle">Risque réel en cas de contrôle</option>
                  <option value="amelioration">Axe d&apos;amélioration</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs">
                Statut
                <select
                  name="statut" defaultValue={c.status}
                  className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm"
                >
                  <option value="ouvert">Ouvert</option>
                  <option value="en_analyse">En analyse</option>
                  <option value="valide">Validé</option>
                  <option value="clos">Clos</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--anm-hairline)] pt-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="referenceVerifiee" defaultChecked={c.reference_checked === "oui"} />
                Référence vérifiée et datée
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="publier" defaultChecked={c.visible_to_client} />
                Publier au client
              </label>
              <span className="font-mono text-[0.66rem] text-[var(--anm-muted)]">
                sans référence vérifiée, la publication est refusée
              </span>
              <button
                type="submit"
                className="ml-auto rounded bg-[var(--anm-green)] px-3 py-1.5 text-sm font-medium text-[var(--anm-paper)]"
              >
                Enregistrer
              </button>
            </div>
          </form>
        ))}
      </div>
    </section>
  );
};

export default Constats;
