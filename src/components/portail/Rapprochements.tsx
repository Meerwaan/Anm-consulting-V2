import { RAPPROCHEMENTS } from "@/content/rapprochements";
import type { LigneRapprochement } from "@/lib/types";
import { enregistrerRapprochement } from "@/app/admin/actions";

const COULEUR: Record<string, string> = {
  a_saisir: "var(--anm-muted)",
  coherent: "var(--anm-mineur)",
  ecart: "var(--anm-critique)",
};
const LIBELLE: Record<string, string> = {
  a_saisir: "à saisir",
  coherent: "cohérent",
  ecart: "écart",
};

interface Props {
  missionId: string;
  ordre: string;
  lignes: LigneRapprochement[];
}

/**
 * Le contrôle croisé de la méthode : deux sources qui devraient dire la même chose.
 * Le système calcule l'écart et le compare à la tolérance ; il ne conclut rien.
 */
const Rapprochements = ({ missionId, ordre, lignes }: Props) => {
  const parKind = new Map(lignes.map((l) => [l.kind, l]));

  return (
    <section>
      <h2 className="text-xl">Contrôles croisés</h2>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">
        Deux sources qui devraient dire la même chose. L&apos;écart est calculé, pas interprété :
        c&apos;est toi qui décides s&apos;il devient un constat.
      </p>

      <div className="mt-5 flex flex-col gap-4">
        {RAPPROCHEMENTS.map((r) => {
          const l = parKind.get(r.kind);
          const statut = l?.statut ?? "a_saisir";
          return (
            <form
              key={r.kind}
              action={enregistrerRapprochement}
              className="rounded border border-[var(--anm-hairline)] bg-[var(--anm-paper)] p-4"
            >
              <input type="hidden" name="missionId" value={missionId} />
              <input type="hidden" name="ordre" value={ordre} />
              <input type="hidden" name="kind" value={r.kind} />

              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold">{r.titre}</h3>
                <span
                  className="font-mono text-[0.68rem] uppercase tracking-wide"
                  style={{ color: COULEUR[statut] }}
                >
                  {LIBELLE[statut]}
                  {l?.ecart_pct != null && statut !== "a_saisir" ? ` · ${l.ecart_pct} %` : ""}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--anm-muted)]">{r.pourquoi}</p>

              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                <label className="flex flex-col gap-1 text-xs">
                  {r.libelleA} <span className="text-[var(--anm-muted)]">({r.unite})</span>
                  <input
                    name="valeurA" type="text" inputMode="decimal" defaultValue={l?.valeur_a ?? ""}
                    className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 font-mono text-sm tabular-nums"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  {r.libelleB} <span className="text-[var(--anm-muted)]">({r.unite})</span>
                  <input
                    name="valeurB" type="text" inputMode="decimal" defaultValue={l?.valeur_b ?? ""}
                    className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 font-mono text-sm tabular-nums"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  Période
                  <input
                    name="periode" type="text" placeholder="juillet-août" defaultValue={l?.periode ?? ""}
                    className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  Tolérance (%)
                  <input
                    name="tolerance" type="text" inputMode="decimal"
                    defaultValue={l?.tolerance_pct ?? r.toleranceParDefaut}
                    className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 font-mono text-sm tabular-nums"
                  />
                </label>
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-xs">
                  Ce que tu en retiens
                  <input
                    name="note" type="text" defaultValue={l?.note ?? ""}
                    placeholder="Source des chiffres, explication de l'écart, suite à donner…"
                    className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded border border-[var(--anm-green)] px-3 py-1.5 text-sm text-[var(--anm-green)]"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          );
        })}
      </div>
    </section>
  );
};

export default Rapprochements;
