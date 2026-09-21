import Link from "next/link";
import type { Metadata } from "next";
import FormulaireParametres from "@/components/sous-traitance/FormulaireParametres";
import TableauSaisie from "@/components/sous-traitance/TableauSaisie";
import { lireDonneesST } from "@/lib/sous-traitance/lecture";
import { calculerEcart } from "@/lib/sous-traitance/calculs";
import { versLigneInitiale } from "@/lib/sous-traitance/tables";
import { fmtHeures, fmtPct } from "@/lib/sous-traitance/format";

export const metadata: Metadata = { title: "Heures de l’entreprise — ANM Consulting", robots: { index: false } };

/**
 * A et B : ce que l'entreprise a vendu, ce que ses bulletins de paie montrent.
 * Tout le reste du contrôle de la sous-traitance part de cet écart.
 */
export default async function HeuresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await lireDonneesST(id);
  const ecart = calculerEcart(d.ventes, d.paie, d.parametres);

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        <Link href={`/admin/missions/${id}/sous-traitance`} className="flex min-h-11 w-fit items-center text-meta text-encre-2 underline-offset-4 hover:text-vert hover:underline">
          ← Synthèse de la sous-traitance
        </Link>
        <h2 className="font-display text-t3 text-encre">Heures de l’entreprise</h2>
        <p className="max-w-2xl text-corps text-encre-2">
          Les heures vendues aux clients (A) et les heures figurant sur les bulletins de paie (B). La différence, A − B, est le volume
          de sous-traitance à expliquer.
        </p>
        <dl className="mt-2 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-4 border-y border-filet py-5 sm:grid-cols-4">
          {[
            ["A · Heures vendues", fmtHeures(ecart.totalVendues)],
            ["B · Heures payées", fmtHeures(ecart.totalPayees)],
            ["A − B", fmtHeures(ecart.totalEcart)],
            ["Part de A", fmtPct(ecart.totalEcartPct)],
          ].map(([t, v]) => (
            <div key={t} className="flex flex-col gap-1">
              <dt className="text-note text-gris">{t}</dt>
              <dd className="font-display text-t4 tabular-nums text-encre">{v}</dd>
            </div>
          ))}
        </dl>
        {ecart.moisIncomplets.length > 0 ? (
          <p className="text-meta text-majeur">
            {ecart.moisIncomplets.length} mois sans A ou sans B ne sont pas comptés dans l’écart.
          </p>
        ) : null}
      </div>

      <section aria-labelledby="reperes" className="flex flex-col gap-5">
        <div>
          <p className="etiquette">1</p>
          <h3 id="reperes" className="mt-1 font-display text-t4 text-encre">Période et repères de calcul</h3>
        </div>
        <FormulaireParametres missionId={id} parametres={d.parametres} />
      </section>

      <section aria-labelledby="ventes" className="flex flex-col gap-5">
        <div>
          <p className="etiquette">2</p>
          <h3 id="ventes" className="mt-1 font-display text-t4 text-encre">A · Heures vendues aux clients</h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">
            Une ligne par bon de commande ou par facture client. Si les heures facturées manquent, le montant HT est converti avec le taux horaire vendu. Sources : bons de commande, contrats clients, factures, facturation mensuelle.
          </p>
        </div>
        <TableauSaisie
          missionId={id}
          table="st_ventes"
          lignes={d.ventes.map((v) => versLigneInitiale("st_ventes", v as unknown as Record<string, unknown>))}
          titreVide="Aucune vente saisie. Ajoute une ligne, ou colle le tableau de facturation depuis Excel."
          libelleAjout="Ajouter une vente"
        />
      </section>

      <section aria-labelledby="paie" className="flex flex-col gap-5">
        <div>
          <p className="etiquette">3</p>
          <h3 id="paie" className="mt-1 font-display text-t4 text-encre">B · Heures payées aux salariés</h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">
            Une ligne par mois : le total des heures figurant sur les bulletins de paie. Sources : bulletins, DSN, livre de paie.
          </p>
        </div>
        <TableauSaisie
          missionId={id}
          table="st_paie"
          lignes={d.paie.map((p) => versLigneInitiale("st_paie", p as unknown as Record<string, unknown>))}
          titreVide="Aucun mois saisi. Ajoute le premier mois de la période."
          libelleAjout="Ajouter un mois"
        />
      </section>

      <section aria-labelledby="smic" className="flex flex-col gap-5">
        <div>
          <p className="etiquette">4</p>
          <h3 id="smic" className="mt-1 font-display text-t4 text-encre">SMIC horaire brut</h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">
            Sert à vérifier qu’un sous-traitant a pu payer les heures qu’il facture : rémunérations déclarées ÷ SMIC = heures payables au
            maximum. Commun à toutes les missions. Saisis chaque valeur avec sa date d’entrée en vigueur et sa source.
          </p>
        </div>
        <TableauSaisie
          missionId={id}
          table="smic_horaire"
          lignes={d.smics.map((s) => versLigneInitiale("smic_horaire", s as unknown as Record<string, unknown>))}
          titreVide="Aucun SMIC saisi : le contrôle par les rémunérations déclarées reste inactif."
          libelleAjout="Ajouter une valeur du SMIC"
        />
      </section>
    </div>
  );
}
