import type { HeuresAgent } from "@/lib/types";
import { enregistrerHeuresAgent, supprimerHeuresAgent } from "@/app/admin/actions";

const champ = "rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm";
const champNombre = `${champ} font-mono tabular-nums`;

/** Un écart s'affiche signé, en rouge dès qu'il n'est pas nul — la procédure §7 dit d'investiguer TOUT écart. */
const Ecart = ({ valeur }: { valeur: number | null }) => {
  if (valeur === null || valeur === undefined) return <span className="text-[var(--anm-muted)]">—</span>;
  const nul = Number(valeur) === 0;
  return (
    <span
      className="font-mono text-xs tabular-nums"
      style={{ color: nul ? "var(--anm-mineur)" : "var(--anm-critique)" }}
    >
      {nul ? "0" : `${Number(valeur) > 0 ? "+" : ""}${valeur}`}
    </span>
  );
};

interface Props {
  missionId: string;
  lignes: HeuresAgent[];
}

/**
 * Section 7 du rapport (modèle 07), remplie ici.
 *
 * Le portail ne stockait que des totaux par type de croisement : la section « Salarié |
 * Période | Planning | Pointage | Payé | Facturé | Écart » devait se retaper à la main
 * dans Word, agent par agent, à partir de chiffres qu'il avait déjà.
 *
 * La procédure §7 décrit la séquence : un site, un mois, le planning prévu puis réalisé,
 * la main courante, les variables puis le bulletin, la facture client. Chaque ligne ici
 * est une prestation reconstituée à partir de ces quatre sources indépendantes.
 */
const HeuresParAgent = ({ missionId, lignes }: Props) => {
  const aInvestiguer = lignes.filter((l) => l.a_investiguer).length;
  const incompletes = lignes.filter((l) => l.incomplet).length;

  const formulaire = (l: HeuresAgent | null) => (
    <form
      key={l?.id ?? "nouvelle"}
      action={enregistrerHeuresAgent}
      className={`rounded border p-3 ${
        l ? "border-[var(--anm-hairline)] bg-white" : "border-dashed border-[var(--anm-hairline)]"
      }`}
    >
      <input type="hidden" name="missionId" value={missionId} />
      {l ? <input type="hidden" name="ligneId" value={l.id} /> : null}

      <div className="grid gap-2 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs">
          Salarié
          <input name="salarie" required defaultValue={l?.salarie ?? ""} placeholder="Nom ou matricule" className={champ} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Site
          <input name="site" defaultValue={l?.site ?? ""} placeholder="Site client" className={champ} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Période
          <input name="periode" defaultValue={l?.periode ?? ""} placeholder="juillet 2026" className={champ} />
        </label>
      </div>

      {/*
        Les quatre sources, écrites en clair et non générées par une boucle : le script
        scripts/audit_coherence.py croise les `name=` des formulaires avec les
        `formData.get()` des actions serveur, et un champ dont le nom est calculé lui
        échappe. C'est précisément la famille de bug qu'il existe pour attraper.
      */}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs">
          Planning <span className="text-[var(--anm-muted)]">(heures)</span>
          <input name="planning" type="text" inputMode="decimal" defaultValue={l?.planning ?? ""} className={champNombre} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Pointage <span className="text-[var(--anm-muted)]">(heures)</span>
          <input name="pointage" type="text" inputMode="decimal" defaultValue={l?.pointage ?? ""} className={champNombre} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Payé <span className="text-[var(--anm-muted)]">(heures)</span>
          <input name="paye" type="text" inputMode="decimal" defaultValue={l?.paye ?? ""} className={champNombre} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Facturé <span className="text-[var(--anm-muted)]">(heures)</span>
          <input name="facture" type="text" inputMode="decimal" defaultValue={l?.facture ?? ""} className={champNombre} />
        </label>
      </div>

      {l ? (
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--anm-muted)]">
          <span>planning → pointage <Ecart valeur={l.ecart_planning_pointage} /></span>
          <span>pointage → payé <Ecart valeur={l.ecart_pointage_paye} /></span>
          <span>payé → facturé <Ecart valeur={l.ecart_paye_facture} /></span>
          {l.incomplet ? (
            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--anm-majeur)]">
              une source manque
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap items-end gap-3">
        <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-xs">
          Écart / conclusion — la colonne du rapport
          <input
            name="conclusion" defaultValue={l?.conclusion ?? ""}
            placeholder="Remplacement non facturé, heure non payée, erreur de saisie…"
            className={champ}
          />
        </label>
        <button
          type="submit"
          className="rounded border border-[var(--anm-green)] px-3 py-1.5 text-sm text-[var(--anm-green)]"
        >
          {l ? "Enregistrer" : "Ajouter la ligne"}
        </button>
      </div>
    </form>
  );

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl">Heures reconstituées, agent par agent</h2>
        <p className="font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
          {lignes.length} ligne{lignes.length > 1 ? "s" : ""}
          {aInvestiguer > 0 ? (
            <span style={{ color: "var(--anm-critique)" }}> · {aInvestiguer} à investiguer</span>
          ) : null}
          {incompletes > 0 ? ` · ${incompletes} incomplète${incompletes > 1 ? "s" : ""}` : ""}
        </p>
      </div>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">
        C&apos;est la section 7 du rapport, remplie ici plutôt que retapée dans Word. La séquence
        du pack : un site, un mois, le planning prévu puis réalisé, la main courante, les
        variables puis le bulletin, la facture client. <strong>Tout écart s&apos;investigue</strong> —
        erreur de saisie, remplacement, heure non payée, heure non déclarée, double facturation,
        sous-traitant différent.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {lignes.map((l) => (
          <div key={l.id}>
            {formulaire(l)}
            <details className="mt-1 px-3">
              <summary className="cursor-pointer font-mono text-[0.62rem] uppercase tracking-wider text-[var(--anm-muted)]">
                Supprimer cette ligne
              </summary>
              <form action={supprimerHeuresAgent} className="mt-1 pb-1">
                <input type="hidden" name="missionId" value={missionId} />
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
        {formulaire(null)}
      </div>
    </section>
  );
};

export default HeuresParAgent;
