import type { EcheancierVigilance as Echeancier, StatutEcheance } from "@/lib/sous-traitance/calculs";
import { fmtDate } from "@/lib/sous-traitance/format";

const STATUTS: Record<StatutEcheance, { libelle: string; classe: string }> = {
  fournie: { libelle: "Attestation à jour", classe: "text-mineur" },
  tardive: { libelle: "Fournie en retard", classe: "text-majeur" },
  manquante: { libelle: "Manquante", classe: "font-medium text-critique" },
  prochaine: { libelle: "Prochaine échéance", classe: "font-medium text-encre" },
  a_venir: { libelle: "À venir", classe: "text-gris" },
};

/**
 * Les dates où l'attestation de vigilance doit être demandée : à la conclusion du contrat, puis
 * tous les 6 mois jusqu'à sa fin (demande de Sofia du 21/09/2026). Calculées à partir des dates
 * saisies dans l'identification.
 */
const EcheancierVigilance = ({ e }: { e: Echeancier | null }) => {
  if (!e) {
    return (
      <p className="rounded-[5px] border border-dashed border-filet-2 bg-papier px-4 py-3 text-meta text-encre-2">
        Renseigne la date de conclusion du contrat dans l’identification : l’outil donnera les dates de renouvellement de
        l’attestation, tous les 6 mois jusqu’à la fin du contrat.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-meta text-encre-2">
        Contrat conclu le {fmtDate(e.debut)}
        {e.fin ? `, jusqu’au ${fmtDate(e.fin)}` : ", sans date de fin : l’échéancier s’arrête à la prochaine échéance"}. Une attestation
        de moins de 6 mois est due à chacune de ces dates.
      </p>
      <ol className="flex flex-col divide-y divide-filet border-y border-filet">
        {e.echeances.map((x, i) => (
          <li key={x.date} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 text-meta">
            <span className="tabular-nums text-encre">
              <span className="mr-3 inline-block w-6 text-gris">{i + 1}</span>
              {fmtDate(x.date)}
              <span className="ml-2 text-gris">{i === 0 ? "conclusion" : `+ ${i * 6} mois`}</span>
            </span>
            <span className={STATUTS[x.statut].classe}>
              {STATUTS[x.statut].libelle}
              {x.attestation?.date_delivrance ? <span className="font-normal text-gris"> · attestation du {fmtDate(x.attestation.date_delivrance)}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default EcheancierVigilance;
