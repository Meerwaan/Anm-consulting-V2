import Link from "next/link";
import type { Bouclage, EcartHeures } from "@/lib/sous-traitance/calculs";
import { fmtHeures, fmtPct } from "@/lib/sous-traitance/format";

/**
 * Le capacitaire de sous-traitance, base de travail de toute l'étape (notes vocales de Sofia du
 * 22/09/2026) : heures facturées par l'entreprise à ses clients − heures de ses propres salariés
 * = maximum d'heures qui peuvent avoir été sous-traitées. Rappelé en tête de la synthèse et de
 * chaque dossier de sous-traitant.
 */
const Capacitaire = ({
  missionId,
  ecart,
  bouclage,
  sousTraitant,
}: {
  missionId: string;
  ecart: EcartHeures;
  bouclage: Bouclage;
  /** Dans un dossier : ce que ce sous-traitant facture sur la période. */
  sousTraitant?: { nom: string; heures: number; rang: number };
}) => {
  if (ecart.lignes.length === 0) {
    return (
      <section aria-labelledby="capacitaire" className="flex flex-col gap-2 rounded-[5px] border border-filet bg-papier px-5 py-4">
        <h3 id="capacitaire" className="text-corps font-medium text-encre">Capacitaire de sous-traitance</h3>
        <p className="text-meta text-encre-2">
          Heures facturées aux clients − heures des salariés de l’entreprise = maximum d’heures sous-traitables. Il se calcule dès que
          les{" "}
          <Link href={`/admin/missions/${missionId}/sous-traitance/heures`} className="text-vert underline underline-offset-4">
            heures vendues et payées
          </Link>{" "}
          sont saisies.
        </p>
      </section>
    );
  }

  const capacitaire = bouclage.totalEcart;
  const facturees = bouclage.totalDocumentees;
  const depasse = bouclage.totalExcedent > 0.5;
  const nonCouvert = bouclage.totalReste > 0.5;
  const part = sousTraitant && sousTraitant.rang === 1 && capacitaire > 0 ? (sousTraitant.heures / capacitaire) * 100 : null;
  const ligne = "flex items-baseline justify-between gap-6 py-2.5";

  return (
    <section aria-labelledby="capacitaire" className="flex flex-col gap-4 rounded-[5px] border border-filet bg-papier px-5 py-5">
      <div>
        <h3 id="capacitaire" className="font-display text-t4 text-encre">Capacitaire de sous-traitance</h3>
        <p className="mt-1 max-w-2xl text-meta text-encre-2">
          La base de travail : le maximum d’heures que l’entreprise a pu confier à des sous-traitants sur la période contrôlée.
        </p>
      </div>
      <dl className="flex max-w-xl flex-col text-meta">
        <div className={`${ligne} border-b border-filet`}>
          <dt className="text-encre-2">Heures facturées par l’entreprise à ses clients</dt>
          <dd className="tabular-nums text-encre">{fmtHeures(ecart.totalVendues)}</dd>
        </div>
        <div className={`${ligne} border-b border-encre`}>
          <dt className="text-encre-2">− Heures de ses salariés (bulletins de paie)</dt>
          <dd className="tabular-nums text-encre">{fmtHeures(ecart.totalPayees)}</dd>
        </div>
        <div className={ligne}>
          <dt className="font-medium text-encre">= Capacitaire de sous-traitance</dt>
          <dd className="font-display text-t4 tabular-nums text-encre">{fmtHeures(capacitaire)}</dd>
        </div>
      </dl>
      <p className="max-w-2xl text-meta text-encre">
        {sousTraitant ? (
          <>
            {sousTraitant.nom} facture {fmtHeures(sousTraitant.heures)}
            {part !== null ? `, soit ${fmtPct(part)} du capacitaire` : ""}
            {sousTraitant.rang > 1 ? ", déjà comptées dans les factures de son donneur d’ordre de rang 1" : ""}. Tous sous-traitants de rang 1
            confondus : {fmtHeures(facturees)}.
          </>
        ) : (
          <>Les sous-traitants de rang 1 facturent {fmtHeures(facturees)}.</>
        )}{" "}
        {depasse ? (
          <span className="font-medium text-critique">
            Certains mois, ils facturent {fmtHeures(bouclage.totalExcedent)} au-delà du capacitaire : ces heures ne correspondent à aucune
            vente.
          </span>
        ) : null}{" "}
        {nonCouvert ? (
          <span className="font-medium text-critique">
            {fmtHeures(bouclage.totalReste)} du capacitaire ne sont couvertes par aucune facture de sous-traitant.
          </span>
        ) : null}
        {!depasse && !nonCouvert ? <span className="text-mineur">Chaque mois complet est couvert, sans dépassement.</span> : null}
      </p>
      {ecart.moisIncomplets.length ? (
        <p className="text-note text-gris">
          {ecart.moisIncomplets.length} mois sans heures vendues ou sans paie ne sont pas comptés.
        </p>
      ) : null}
    </section>
  );
};

export default Capacitaire;
