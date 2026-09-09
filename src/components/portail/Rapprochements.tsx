import { RAPPROCHEMENTS } from "@/content/rapprochements";
import type { LigneRapprochement } from "@/lib/types";
import { enregistrerRapprochement, supprimerRapprochement } from "@/app/admin/actions";

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
const champ = "rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm";
const champNombre = `${champ} font-mono tabular-nums`;

interface Props {
  missionId: string;
  ordre: string;
  lignes: LigneRapprochement[];
}

/**
 * Le contrôle croisé de la méthode : deux sources qui devraient dire la même chose.
 * Le système calcule l'écart et le compare à la tolérance ; il ne conclut rien.
 *
 * La procédure §7 raisonne par SITE et par MOIS — « prendre un site client et un mois
 * représentatif » — et le §5 demande d'élargir quand une anomalie sérieuse apparaît.
 * L'écran portait un seul croisement par type pour toute la mission : le deuxième site
 * écrasait le premier sans le dire. Chaque type porte maintenant autant de lignes que
 * la mission en demande, chacune identifiée par son site et sa période.
 */
const Rapprochements = ({ missionId, ordre, lignes }: Props) => {
  const parKind = new Map<string, LigneRapprochement[]>();
  for (const l of lignes) {
    const liste = parKind.get(l.kind) ?? [];
    liste.push(l);
    parKind.set(l.kind, liste);
  }

  const formulaire = (
    kind: string,
    r: (typeof RAPPROCHEMENTS)[number],
    l: LigneRapprochement | null,
  ) => (
    <form
      key={l?.id ?? `${kind}-nouveau`}
      action={enregistrerRapprochement}
      className={`rounded border p-3 ${
        l ? "border-[var(--anm-hairline)] bg-white" : "border-dashed border-[var(--anm-hairline)]"
      }`}
    >
      <input type="hidden" name="missionId" value={missionId} />
      <input type="hidden" name="ordre" value={ordre} />
      <input type="hidden" name="kind" value={kind} />
      {l ? <input type="hidden" name="ligneId" value={l.id} /> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs">
          Site client
          <input name="site" defaultValue={l?.site ?? ""} placeholder="Nom du site" className={champ} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Période
          <input name="periode" defaultValue={l?.periode ?? ""} placeholder="juillet 2026" className={champ} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Tolérance (%)
          <input
            name="tolerance" type="text" inputMode="decimal"
            defaultValue={l?.tolerance_pct ?? r.toleranceParDefaut}
            className={champNombre}
          />
        </label>
      </div>

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          {r.libelleA} <span className="text-[var(--anm-muted)]">({r.unite})</span>
          <input name="valeurA" type="text" inputMode="decimal" defaultValue={l?.valeur_a ?? ""} className={champNombre} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          {r.libelleB} <span className="text-[var(--anm-muted)]">({r.unite})</span>
          <input name="valeurB" type="text" inputMode="decimal" defaultValue={l?.valeur_b ?? ""} className={champNombre} />
        </label>
      </div>

      <div className="mt-2 flex flex-wrap items-end gap-3">
        <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-xs">
          Ce que tu en retiens
          <input
            name="note" defaultValue={l?.note ?? ""}
            placeholder="Source des chiffres, explication de l'écart, suite à donner…"
            className={champ}
          />
        </label>
        {l ? (
          <span
            className="font-mono text-[0.68rem] uppercase tracking-wide"
            style={{ color: COULEUR[l.statut] }}
          >
            {LIBELLE[l.statut]}
            {l.ecart_pct != null && l.statut !== "a_saisir" ? ` · ${l.ecart_pct} %` : ""}
          </span>
        ) : null}
        <button
          type="submit"
          className="rounded border border-[var(--anm-green)] px-3 py-1.5 text-sm text-[var(--anm-green)]"
        >
          {l ? "Enregistrer" : "Ajouter ce croisement"}
        </button>
      </div>
    </form>
  );

  return (
    <section>
      <h2 className="text-xl">Contrôles croisés</h2>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">
        Deux sources qui devraient dire la même chose. L&apos;écart est calculé, pas interprété :
        c&apos;est toi qui décides s&apos;il devient un constat. Un croisement porte sur{" "}
        <strong>un site et une période</strong> — si une anomalie sérieuse apparaît, ajoute un
        second site pour savoir si elle est isolée ou systémique.
      </p>

      <div className="mt-5 flex flex-col gap-7">
        {RAPPROCHEMENTS.map((r) => {
          const saisies = parKind.get(r.kind) ?? [];
          const enEcart = saisies.filter((l) => l.statut === "ecart").length;
          return (
            <div key={r.kind}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--anm-hairline)] pb-1">
                <h3 className="text-base font-semibold">{r.titre}</h3>
                <span className="font-mono text-[0.66rem] uppercase tracking-wide text-[var(--anm-muted)]">
                  {saisies.length === 0
                    ? "aucun croisement saisi"
                    : `${saisies.length} croisement${saisies.length > 1 ? "s" : ""}`}
                  {enEcart > 0 ? (
                    <span style={{ color: "var(--anm-critique)" }}> · {enEcart} en écart</span>
                  ) : null}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--anm-muted)]">{r.pourquoi}</p>

              <div className="mt-3 flex flex-col gap-3">
                {saisies.map((l) => (
                  <div key={l.id}>
                    {formulaire(r.kind, r, l)}
                    <details className="mt-1 px-3">
                      <summary className="cursor-pointer font-mono text-[0.62rem] uppercase tracking-wider text-[var(--anm-muted)]">
                        Supprimer ce croisement
                      </summary>
                      <form action={supprimerRapprochement} className="mt-1 pb-1">
                        <input type="hidden" name="missionId" value={missionId} />
                        <input type="hidden" name="ordre" value={ordre} />
                        <input type="hidden" name="ligneId" value={l.id} />
                        <button
                          type="submit"
                          className="rounded border border-[var(--anm-critique)] px-2.5 py-1 text-xs"
                          style={{ color: "var(--anm-critique)" }}
                        >
                          Supprimer définitivement
                        </button>
                      </form>
                    </details>
                  </div>
                ))}
                {formulaire(r.kind, r, null)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Rapprochements;
