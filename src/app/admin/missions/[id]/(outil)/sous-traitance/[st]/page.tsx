import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FicheIdentite from "@/components/sous-traitance/FicheIdentite";
import ListeAlertes from "@/components/sous-traitance/ListeAlertes";
import TableauSaisie from "@/components/sous-traitance/TableauSaisie";
import { lireDonneesST } from "@/lib/sous-traitance/lecture";
import { SEUIL_VIGILANCE_HT, analyserSousTraitant } from "@/lib/sous-traitance/calculs";
import { versLigneInitiale } from "@/lib/sous-traitance/tables";
import { fmtDate, fmtEuros, fmtEurosRond, fmtHeures, fmtMois, fmtNombre, fmtPct } from "@/lib/sous-traitance/format";

export const metadata: Metadata = { title: "Dossier sous-traitant — ANM Consulting", robots: { index: false } };

const Titre = ({ n, id, children, sous }: { n: string; id: string; children: React.ReactNode; sous?: string }) => (
  <div>
    <p className="etiquette">{n}</p>
    <h3 id={id} className="mt-1 font-display text-t4 text-encre">{children}</h3>
    {sous ? <p className="mt-1 max-w-2xl text-meta text-encre-2">{sous}</p> : null}
  </div>
);

/**
 * Le dossier de vigilance d'un sous-traitant (grilles 03 et 05 de Sofia).
 * On saisit : identité, attestations, factures, paiements. L'outil calcule : la faisabilité
 * (l'effectif déclaré peut-il produire les heures facturées ?) et le fléchage DGFiP
 * (chaque facture est-elle payée, au bon montant, sur un compte à son nom ?).
 */
export default async function DossierSousTraitantPage({ params }: { params: Promise<{ id: string; st: string }> }) {
  const { id, st: stId } = await params;
  const d = await lireDonneesST(id);
  const st = d.sousTraitants.find((s) => s.id === stId);
  if (!st) notFound();
  const x = analyserSousTraitant(st, d.attestations, d.factures, d.paiements, d.parametres, d.smics);
  const donneur = st.donneur_id ? d.sousTraitants.find((s) => s.id === st.donneur_id) : null;
  const facturesST = d.factures.filter((f) => f.sous_traitant_id === st.id);
  const optionsFactures = facturesST.map((f) => ({
    id: f.id,
    libelle: [f.numero ? `N° ${f.numero}` : "Sans numéro", f.mois ? fmtMois(f.mois) : null, f.montant_ttc !== null ? fmtEuros(f.montant_ttc) : f.montant_ht !== null ? `${fmtEuros(f.montant_ht)} HT` : null]
      .filter(Boolean)
      .join(" · "),
  }));
  const nbAlertes = x.alertes.filter((a) => a.niveau === "alerte").length;

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        <Link href={`/admin/missions/${id}/sous-traitance#sous-traitants`} className="flex min-h-11 w-fit items-center text-meta text-encre-2 underline-offset-4 hover:text-vert hover:underline">
          ← Tous les sous-traitants
        </Link>
        <h2 className="font-display text-t3 text-encre">{st.raison_sociale}</h2>
        <p className="text-corps text-encre-2">
          {st.rang === 2 ? (
            <>
              Sous-traitant de rang 2{donneur ? <>, travaille pour <strong className="font-medium text-encre">{donneur.raison_sociale}</strong></> : null}
            </>
          ) : (
            "Sous-traitant de rang 1"
          )}
          {x.vigilanceObligatoire === true ? ` · relation d’au moins ${fmtEurosRond(SEUIL_VIGILANCE_HT)} HT : vigilance obligatoire` : null}
          {x.vigilanceObligatoire === false ? ` · relation sous ${fmtEurosRond(SEUIL_VIGILANCE_HT)} HT` : null}
        </p>
        <dl className="mt-2 grid max-w-4xl grid-cols-2 gap-x-8 gap-y-4 border-y border-filet py-5 sm:grid-cols-4">
          {[
            ["Heures facturées", fmtHeures(x.totalHeures)],
            x.totalTTC > 0 ? ["Facturé TTC", fmtEuros(x.totalTTC)] : ["Facturé HT", fmtEuros(x.totalHT)],
            ["Payé", fmtEuros(x.totalPaye)],
            ["Alertes", nbAlertes ? String(nbAlertes) : "Aucune"],
          ].map(([t, v], i) => (
            <div key={t} className="flex flex-col gap-1">
              <dt className="text-note text-gris">{t}</dt>
              <dd className={`font-display text-t4 tabular-nums ${i === 3 && nbAlertes ? "text-critique" : "text-encre"}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section aria-labelledby="alertes-st" className="flex flex-col gap-5">
        <Titre n="Ce qui ressort" id="alertes-st">Alertes et points à vérifier</Titre>
        <ListeAlertes alertes={x.alertes} vide="Aucune alerte : attestations, faisabilité et paiements sont cohérents avec ce qui est saisi." />
      </section>

      <section aria-labelledby="identite" className="flex flex-col gap-5">
        <Titre n="1" id="identite">Identification</Titre>
        <FicheIdentite missionId={id} st={st} />
      </section>

      <section aria-labelledby="attestations" className="flex flex-col gap-5">
        <Titre
          n="2"
          id="attestations"
          sous="Chaque attestation de vigilance URSSAF, avec l’effectif et les rémunérations qu’elle indique, et le mois de déclaration auquel ils se rapportent. Elle vaut 6 mois : elle doit être renouvelée pendant toute la relation."
        >
          Attestations de vigilance
        </Titre>
        <TableauSaisie
          missionId={id}
          table="st_attestations"
          sousTraitantId={st.id}
          lignes={d.attestations.filter((a) => a.sous_traitant_id === st.id).map((a) => versLigneInitiale("st_attestations", a as unknown as Record<string, unknown>))}
          titreVide="Aucune attestation saisie."
          libelleAjout="Ajouter une attestation"
        />
      </section>

      <section aria-labelledby="factures" className="flex flex-col gap-5">
        <Titre n="3" id="factures" sous="Les factures du sous-traitant, avec le nombre d’heures et le mois de prestation : c’est ce qui permet de contrôler la faisabilité.">
          Factures du sous-traitant
        </Titre>
        <TableauSaisie
          missionId={id}
          table="st_factures"
          sousTraitantId={st.id}
          lignes={facturesST.map((f) => versLigneInitiale("st_factures", f as unknown as Record<string, unknown>))}
          titreVide="Aucune facture saisie."
          libelleAjout="Ajouter une facture"
        />
      </section>

      <section aria-labelledby="paiements" className="flex flex-col gap-5">
        <Titre n="4" id="paiements" sous="Chaque paiement, rattaché à la facture qu’il règle. La DGFiP regarde que l’argent va bien au sous-traitant qui a facturé.">
          Paiements
        </Titre>
        <TableauSaisie
          missionId={id}
          table="st_paiements"
          sousTraitantId={st.id}
          factures={optionsFactures}
          lignes={d.paiements.filter((p) => p.sous_traitant_id === st.id).map((p) => versLigneInitiale("st_paiements", p as unknown as Record<string, unknown>))}
          titreVide="Aucun paiement saisi."
          libelleAjout="Ajouter un paiement"
        />
      </section>

      <section aria-labelledby="faisabilite" className="flex flex-col gap-5">
        <Titre
          n="5"
          id="faisabilite"
          sous={`Capacité = effectif de l’attestation × ${fmtNombre(d.parametres.heures_mensuelles_etp)} h. Plafond SMIC = rémunérations déclarées ÷ SMIC horaire. Des heures facturées au-delà ne peuvent pas être produites par les seuls salariés déclarés.`}
        >
          Faisabilité : l’effectif déclaré peut-il produire les heures facturées ?
        </Titre>
        {x.mois.length === 0 ? (
          <p className="text-meta text-encre-2">Ce calcul apparaît dès qu’une facture a un mois de prestation.</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-meta">
              <thead>
                <tr className="border-b-[1.5px] border-encre text-left text-note text-encre-2">
                  <th scope="col" className="py-2 pr-3 font-medium">Mois</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Heures facturées</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Attestation</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Effectif</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Capacité</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Utilisée</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">h / salarié</th>
                  <th scope="col" className="py-2 text-right font-medium">Plafond SMIC</th>
                </tr>
              </thead>
              <tbody>
                {x.mois.map((m) => {
                  const depasse = m.heuresFacturees !== null && m.capacite !== null && m.heuresFacturees > m.capacite;
                  const smicDepasse = m.heuresFacturees !== null && m.plafondSmic !== null && m.heuresFacturees > m.plafondSmic;
                  return (
                    <tr key={m.mois} className="border-b border-filet">
                      <th scope="row" className="py-3 pr-3 text-left font-normal capitalize text-encre">{fmtMois(m.mois)}</th>
                      <td className="py-3 pr-3 text-right tabular-nums">{fmtHeures(m.heuresFacturees)}</td>
                      <td className={`py-3 pr-3 ${m.attestation ? "text-encre" : "font-medium text-critique"}`}>
                        {m.attestation ? `du ${fmtDate(m.attestation.date_delivrance)}` : "aucune valide"}
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums">{m.attestation?.effectif_etp != null ? `${fmtNombre(m.attestation.effectif_etp)} ETP` : "—"}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{fmtHeures(m.capacite)}</td>
                      <td className={`py-3 pr-3 text-right tabular-nums ${depasse ? "font-medium text-critique" : ""}`}>{fmtPct(m.tauxCapacite)}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{m.heuresParSalarie !== null ? fmtHeures(m.heuresParSalarie) : "—"}</td>
                      <td className={`py-3 text-right tabular-nums ${smicDepasse ? "font-medium text-critique" : ""}`}>{fmtHeures(m.plafondSmic)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="max-w-3xl text-note text-gris">
          L’effectif de l’attestation est un indicateur de cohérence : il ne dit pas quels salariés ont travaillé sur le marché, et le
          sous-traitant peut avoir d’autres clients. Un dépassement est à expliquer, pas à qualifier.
        </p>
      </section>

      <section aria-labelledby="flechage" className="flex flex-col gap-5">
        <Titre n="6" id="flechage" sous="Chaque facture rapprochée de ses paiements. Montant attendu : TTC s’il est saisi, sinon HT.">
          Fléchage des factures vers les paiements
        </Titre>
        {x.flechage.length === 0 && x.paiementsSansFacture.length === 0 ? (
          <p className="text-meta text-encre-2">Ce rapprochement apparaît dès qu’une facture ou un paiement est saisi.</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-meta">
              <thead>
                <tr className="border-b-[1.5px] border-encre text-left text-note text-encre-2">
                  <th scope="col" className="py-2 pr-3 font-medium">Facture</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Attendu</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Payé</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Écart</th>
                  <th scope="col" className="py-2 font-medium">Paiements</th>
                </tr>
              </thead>
              <tbody>
                {x.flechage.map((fl) => (
                  <tr key={fl.facture.id} className="border-b border-filet">
                    <th scope="row" className="py-3 pr-3 text-left font-normal text-encre">
                      {fl.facture.numero ? `N° ${fl.facture.numero}` : "Sans numéro"}
                      {fl.facture.mois ? <span className="block text-note capitalize text-gris">{fmtMois(fl.facture.mois)}</span> : null}
                    </th>
                    <td className="py-3 pr-3 text-right tabular-nums">
                      {fmtEuros(fl.attendu)}
                      {fl.baseAttendu ? <span className="block text-note text-gris">{fl.baseAttendu === "ttc" ? "TTC" : "HT"}</span> : null}
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums">{fmtEuros(fl.paye)}</td>
                    <td className={`py-3 pr-3 text-right tabular-nums ${fl.ecart !== null && Math.abs(fl.ecart) >= 1 ? "font-medium text-critique" : ""}`}>
                      {fl.paiements.length === 0 ? <span className="text-majeur">non payée</span> : fmtEuros(fl.ecart)}
                    </td>
                    <td className="py-3 text-encre-2">
                      {fl.paiements.map((p) => fmtDate(p.date_paiement)).join(", ") || "—"}
                    </td>
                  </tr>
                ))}
                {x.paiementsSansFacture.map((p) => (
                  <tr key={p.id} className="border-b border-filet">
                    <th scope="row" className="py-3 pr-3 text-left font-medium text-critique">Sans facture</th>
                    <td className="py-3 pr-3 text-right">—</td>
                    <td className="py-3 pr-3 text-right tabular-nums">{fmtEuros(p.montant)}</td>
                    <td className="py-3 pr-3 text-right">—</td>
                    <td className="py-3 text-encre-2">{fmtDate(p.date_paiement)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
