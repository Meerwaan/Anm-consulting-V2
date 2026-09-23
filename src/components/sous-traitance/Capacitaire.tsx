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
  const reel = ecart.avecRealisees;
  const alerte = (n: number) => (n > 0.5 ? "font-medium text-critique" : "text-encre");
  const part = sousTraitant && sousTraitant.rang === 1 && capacitaire > 0 ? (sousTraitant.heures / capacitaire) * 100 : null;
  const cel = "py-2.5 pl-4 text-right tabular-nums";

  return (
    <section aria-labelledby="capacitaire" className="flex flex-col gap-4 rounded-[5px] border border-filet bg-papier px-5 py-5">
      <div>
        <h3 id="capacitaire" className="font-display text-t4 text-encre">Capacitaire de sous-traitance</h3>
        <p className="mt-1 max-w-2xl text-meta text-encre-2">
          La base de travail : le maximum d’heures que l’entreprise a pu confier à des sous-traitants sur la période contrôlée, calculé
          sur la paie et sur les heures réellement réalisées par ses salariés.
        </p>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[30rem] max-w-2xl border-collapse text-meta">
          <thead>
            <tr className="text-note text-encre-2">
              <th scope="col" className="pb-2 text-left font-normal"><span className="sr-only">Calcul</span></th>
              <th scope="col" className="pb-2 pl-4 text-right font-medium">Selon la paie</th>
              {reel ? <th scope="col" className="pb-2 pl-4 text-right font-medium">Selon le réel</th> : null}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-filet">
              <th scope="row" className="py-2.5 text-left font-normal text-encre-2">Heures facturées par l’entreprise à ses clients</th>
              <td className={cel}>{fmtHeures(ecart.totalVendues)}</td>
              {reel ? <td className={cel}>{fmtHeures(ecart.totalVendues)}</td> : null}
            </tr>
            <tr className="border-b border-encre">
              <th scope="row" className="py-2.5 text-left font-normal text-encre-2">
                − Heures de ses salariés
                <span className="block text-note text-gris">payées (bulletins) · réalisées (planning, pointage)</span>
              </th>
              <td className={cel}>{fmtHeures(ecart.totalPayees)}</td>
              {reel ? <td className={cel}>{fmtHeures(ecart.totalRealisees)}</td> : null}
            </tr>
            <tr className="border-b border-filet">
              <th scope="row" className="py-2.5 text-left font-medium text-encre">= Capacitaire de sous-traitance</th>
              <td className={`${cel} font-display text-t4 text-encre`}>{fmtHeures(capacitaire)}</td>
              {reel ? <td className={`${cel} font-display text-t4 text-encre`}>{fmtHeures(bouclage.totalEcartReel)}</td> : null}
            </tr>
            <tr className="border-b border-filet">
              <th scope="row" className="py-2.5 text-left font-normal text-encre-2">Facturé par les sous-traitants de rang 1</th>
              <td className={cel}>{fmtHeures(facturees)}</td>
              {reel ? <td className={cel}>{fmtHeures(facturees)}</td> : null}
            </tr>
            <tr className="border-b border-filet">
              <th scope="row" className="py-2.5 text-left font-normal text-encre-2">Facturé au-delà du capacitaire</th>
              <td className={`${cel} ${alerte(bouclage.totalExcedent)}`}>{fmtHeures(bouclage.totalExcedent)}</td>
              {reel ? <td className={`${cel} ${alerte(bouclage.totalExcedentReel)}`}>{fmtHeures(bouclage.totalExcedentReel)}</td> : null}
            </tr>
            <tr>
              <th scope="row" className="py-2.5 text-left font-normal text-encre-2">Capacitaire couvert par aucune facture</th>
              <td className={`${cel} ${alerte(bouclage.totalReste)}`}>{fmtHeures(bouclage.totalReste)}</td>
              {reel ? <td className={`${cel} ${alerte(bouclage.totalResteReel)}`}>{fmtHeures(bouclage.totalResteReel)}</td> : null}
            </tr>
          </tbody>
        </table>
      </div>
      {sousTraitant ? (
        <p className="max-w-2xl text-meta text-encre">
          {sousTraitant.nom} facture {fmtHeures(sousTraitant.heures)}
          {part !== null ? `, soit ${fmtPct(part)} du capacitaire selon la paie` : ""}
          {sousTraitant.rang > 1 ? ", déjà comptées dans les factures de son donneur d’ordre de rang 1" : ""}.
        </p>
      ) : null}
      <p className="max-w-2xl text-note text-gris">
        Les mois ne se compensent pas entre eux : un dépassement en mars n’explique pas un manque en avril.
        {!reel ? " Saisis les heures réalisées (planning, pointage) pour obtenir le calcul selon le réel." : ""}
        {ecart.moisIncomplets.length ? ` ${ecart.moisIncomplets.length} mois sans heures vendues ou sans paie ne sont pas comptés.` : ""}
      </p>
    </section>
  );
};

export default Capacitaire;
