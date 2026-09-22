import type { Metadata } from "next";
import EtapePage from "@/components/portail/EtapePage";
import Link from "next/link";
import GrilleSaisie from "@/components/grilles/GrilleSaisie";
import ConclusionsSaisie from "@/components/grilles/ConclusionsSaisie";
import BilanGrille from "@/components/grilles/BilanGrille";
import EnTeteSection from "@/components/grilles/EnTeteSection";
import AlertesParSousTraitant from "@/components/grilles/AlertesParSousTraitant";
import ListeAlertes from "@/components/sous-traitance/ListeAlertes";
import CoutRevient from "@/components/grilles/CoutRevient";
import { GRILLE_DGFIP } from "@/content/grilles";
import { lireGrilles } from "@/lib/grilles/lecture";
import { lireDonneesST } from "@/lib/sous-traitance/lecture";
import { alertesDesModules, bilanGrille } from "@/lib/modules/analyse";
import { fmtEuros, fmtPct } from "@/lib/sous-traitance/format";

export const metadata: Metadata = { title: "DGFiP — ANM Consulting", robots: { index: false } };

const somme = (xs: (number | null)[]) => xs.reduce<number>((t, x) => t + (x ?? 0), 0);

/**
 * Le contrôle DGFiP (dictée de Sofia du 21/09/2026) : tout le module sur la facture fictive et la
 * facture de complaisance. Fléchage commande ↔ facture ↔ prestation ↔ paiement, pour les factures
 * émises aux clients comme pour celles reçues des sous-traitants.
 */
export default async function DgfipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [g, d] = await Promise.all([lireGrilles(id), lireDonneesST(id)]);
  const m = alertesDesModules(d, new Date().toISOString().slice(0, 10));
  const bilan = bilanGrille(g, "dgfip", "mission", GRILLE_DGFIP.sections);
  const constats = g.nonConformites.map((n) => n.constat ?? "");

  const venduHT = somme(d.ventes.map((v) => v.montant_ht));
  const encaisse = somme(d.ventes.map((v) => v.montant_regle));
  const achatHT = somme(m.dossiers.map((x) => x.totalHT));
  const part = venduHT > 0 ? (achatHT / venduHT) * 100 : null;
  const ventesChiffrees = d.ventes.filter((v) => v.heures_facturees && v.montant_ht !== null);
  const heuresV = somme(ventesChiffrees.map((v) => v.heures_facturees));
  const prixVente = heuresV > 0 ? somme(ventesChiffrees.map((v) => v.montant_ht)) / heuresV : null;

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <EtapePage chemin="dgfip" />
        <h2 className="font-display text-t3 text-encre">Contrôle DGFiP</h2>
        <p className="max-w-2xl text-corps text-encre-2">
          Factures fictives et factures de complaisance. Une facture doit reposer sur une commande, une prestation réellement
          réalisée et un paiement au bon destinataire, qu’elle soit émise aux clients ou reçue d’un sous-traitant.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-filet py-5 sm:grid-cols-4">
        {[
          ["Facturé aux clients HT", fmtEuros(venduHT)],
          ["Encaissé", fmtEuros(encaisse)],
          ["Sous-traitance achetée HT", fmtEuros(achatHT)],
          ["Part du chiffre d’affaires", part === null ? "—" : fmtPct(part)],
        ].map(([t, v]) => (
          <div key={t} className="flex flex-col gap-1">
            <dt className="text-note text-gris">{t}</dt>
            <dd className="font-display text-t4 tabular-nums text-encre">{v}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="emises" className="flex flex-col gap-5">
        <EnTeteSection id="emises" titre="Factures émises aux clients" texte="Commande, numérotation, TVA, règlement, prix de l’heure, et sous-traitance facturée au-delà de ce que les ventes demandent." />
        <ListeAlertes alertes={m.dgfip.emises} vide="Les ventes saisies ne font ressortir aucune alerte." missionId={id} constatsExistants={constats} />
        <p className="text-meta text-encre-2">
          Pour corriger une vente : <Link href={`/admin/missions/${id}/sous-traitance/heures`} className="text-vert underline underline-offset-4">heures vendues et payées</Link>.
        </p>
      </section>

      <section aria-labelledby="recues" className="flex flex-col gap-5">
        <EnTeteSection id="recues" titre="Factures reçues des sous-traitants" texte="Heures que l’effectif ne peut pas avoir produites, factures sans paiement ou paiements sans facture, compte d’un tiers, prix incohérent." />
        {m.dossiers.length ? (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-meta">
              <thead>
                <tr className="border-b border-encre text-note text-encre-2">
                  <th scope="col" className="py-2 pr-3 font-medium">Sous-traitant</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Facturé TTC</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Payé</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Écart</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Sans paiement</th>
                  <th scope="col" className="py-2 text-right font-medium">Paiements sans facture</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {m.dossiers.map((x) => {
                  const facture = x.totalTTC || x.totalHT;
                  const ecart = x.totalPaye - facture;
                  const sansPaiement = x.flechage.filter((f) => f.paiements.length === 0).length;
                  return (
                    <tr key={x.st.id} className="border-b border-filet">
                      <th scope="row" className="py-3 pr-3 font-medium text-encre">{x.st.raison_sociale}</th>
                      <td className="py-3 pr-3 text-right">{fmtEuros(facture)}</td>
                      <td className="py-3 pr-3 text-right">{fmtEuros(x.totalPaye)}</td>
                      <td className={`py-3 pr-3 text-right ${Math.abs(ecart) >= 1 ? "text-critique" : ""}`}>{fmtEuros(ecart)}</td>
                      <td className={`py-3 pr-3 text-right ${sansPaiement ? "text-majeur" : ""}`}>{sansPaiement}</td>
                      <td className={`py-3 text-right ${x.paiementsSansFacture.length ? "text-critique" : ""}`}>{x.paiementsSansFacture.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
        <AlertesParSousTraitant missionId={id} groupes={m.dgfip.recues} vide="Aucune alerte sur les factures et les paiements." constatsExistants={constats} />
      </section>

      <section aria-labelledby="taux" className="flex flex-col gap-5">
        <EnTeteSection
          id="taux"
          titre="Taux horaires"
          texte="Le coût de revient d’une heure d’agent publié par la branche sert de plancher : une heure vendue ou achetée en dessous est à justifier. Saisis la valeur de l’année et sa source ; l’outil n’en propose aucune."
        />
        <CoutRevient missionId={id} valeur={d.parametres.cout_revient_horaire ?? null} source={d.parametres.cout_revient_source ?? null} />
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-filet py-5 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <dt className="text-note text-gris">Heure vendue, en moyenne</dt>
            <dd className="font-display text-t4 tabular-nums text-encre">{prixVente === null ? "—" : fmtEuros(prixVente)}</dd>
          </div>
          {m.dossiers.map((x) => {
            const cout = x.totalHeures > 0 ? x.totalHT / x.totalHeures : null;
            const sous = cout !== null && d.parametres.cout_revient_horaire ? cout < d.parametres.cout_revient_horaire : false;
            return (
              <div key={x.st.id} className="flex flex-col gap-1">
                <dt className="text-note text-gris">Heure achetée à {x.st.raison_sociale}</dt>
                <dd className={`font-display text-t4 tabular-nums ${sous ? "text-critique" : "text-encre"}`}>{cout === null ? "—" : fmtEuros(cout)}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section aria-labelledby="points" className="flex flex-col gap-5">
        <EnTeteSection id="points" titre="Points de contrôle" texte="Dans la section des indices, réponds « oui » quand l’indice est constaté." />
        <BilanGrille b={bilan} />
        <GrilleSaisie missionId={id} grille="dgfip" cible="mission" sections={GRILLE_DGFIP.sections} reponses={g.reponses} />
      </section>

      <section aria-labelledby="conclusion" className="flex flex-col gap-6">
        <EnTeteSection id="conclusion" titre="Conclusion" />
        <ConclusionsSaisie missionId={id} grille="dgfip" cible="mission" conclusions={GRILLE_DGFIP.conclusions} valeurs={g.conclusions} reponses={g.reponses} />
      </section>
    </div>
  );
}
