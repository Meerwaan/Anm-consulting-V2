import type { Metadata } from "next";
import EtapePage from "@/components/portail/EtapePage";
import Link from "next/link";
import GrilleSaisie from "@/components/grilles/GrilleSaisie";
import ConclusionsSaisie from "@/components/grilles/ConclusionsSaisie";
import BilanGrille from "@/components/grilles/BilanGrille";
import EnTeteSection from "@/components/grilles/EnTeteSection";
import AlertesParSousTraitant from "@/components/grilles/AlertesParSousTraitant";
import ListeAlertes from "@/components/sous-traitance/ListeAlertes";
import TableauSaisie from "@/components/sous-traitance/TableauSaisie";
import { versLigneInitiale } from "@/lib/sous-traitance/tables";
import { GRILLE_URSSAF } from "@/content/grilles";
import { lireGrilles } from "@/lib/grilles/lecture";
import { lireDonneesST } from "@/lib/sous-traitance/lecture";
import { alertesDesModules, bilanGrille } from "@/lib/modules/analyse";
import { boucler, calculerEcart } from "@/lib/sous-traitance/calculs";
import { fmtHeures } from "@/lib/sous-traitance/format";

export const metadata: Metadata = { title: "URSSAF — ANM Consulting", robots: { index: false } };

const CONCLUSIONS_ST = [
  ["st-td", "Travail dissimulé"],
  ["st-pi", "Prêt illicite"],
  ["st-ma", "Marchandage"],
  ["st-vigilance", "Vigilance"],
] as const;

/**
 * Le contrôle URSSAF (dictée de Sofia du 21/09/2026) : travail dissimulé, dissimulation
 * d'activité, prêt illicite de main-d'œuvre et marchandage. L'assiette des cotisations est
 * volontairement laissée de côté. Les chiffres viennent de la sous-traitance : rien n'est ressaisi.
 */
export default async function UrssafPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [g, d] = await Promise.all([lireGrilles(id), lireDonneesST(id)]);
  const aujourdHui = new Date().toISOString().slice(0, 10);
  const m = alertesDesModules(d, aujourdHui);
  const ecart = calculerEcart(d.ventes, d.paie, d.parametres);
  const bouclage = boucler(ecart, d.sousTraitants, d.factures);
  const bilan = bilanGrille(g, "urssaf", "mission", GRILLE_URSSAF.sections);
  const constats = g.nonConformites.map((n) => n.constat ?? "");
  const salaries = d.agents.filter((a) => a.sous_traitant_id === null);
  const libellesSalaries = Object.fromEntries(salaries.map((a) => [a.id, a.nom ?? "Salarié sans nom"]));
  const nonPayees = d.paie.reduce((t, p) => t + (p.heures_realisees !== null && p.heures_payees !== null ? Math.max(0, p.heures_realisees - p.heures_payees) : 0), 0);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <EtapePage chemin="urssaf" />
        <h2 className="font-display text-t3 text-encre">Contrôle URSSAF</h2>
        <p className="max-w-2xl text-corps text-encre-2">
          Travail dissimulé, dissimulation d’activité, prêt illicite de main-d’œuvre et marchandage. L’entreprise est contrôlée ici pour
          elle-même ; chaque sous-traitant l’est dans son dossier, dont les conclusions sont reprises plus bas.
        </p>
      </div>

      <section aria-labelledby="chiffres" className="flex flex-col gap-5">
        <EnTeteSection id="chiffres" titre="Ce que disent les heures" texte="Heures vendues, réalisées et payées, saisies dans la sous-traitance." />
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-filet py-5 sm:grid-cols-4">
          {[
            ["Capacitaire de sous-traitance", fmtHeures(bouclage.totalEcart), "text-encre"],
            ["Couvert par la sous-traitance", fmtHeures(bouclage.totalDocumentees), "text-encre"],
            ["Reste inexpliqué", fmtHeures(bouclage.totalReste), bouclage.totalReste > 0.5 ? "text-critique" : "text-encre"],
            ["Réalisées non payées", fmtHeures(nonPayees), nonPayees > 0.5 ? "text-critique" : "text-encre"],
          ].map(([t, v, c]) => (
            <div key={t} className="flex flex-col gap-1">
              <dt className="text-note text-gris">{t}</dt>
              <dd className={`font-display text-t4 tabular-nums ${c}`}>{v}</dd>
            </div>
          ))}
        </dl>
        <ListeAlertes alertes={m.urssaf.entreprise} vide="Les heures saisies ne font ressortir aucune alerte pour l’entreprise." missionId={id} constatsExistants={constats} />
        <p className="text-meta text-encre-2">
          Pour corriger une donnée : <Link href={`/admin/missions/${id}/sous-traitance/heures`} className="text-vert underline underline-offset-4">heures vendues et payées</Link>.
        </p>
      </section>

      <section aria-labelledby="salaries" className="flex flex-col gap-5">
        <EnTeteSection
          id="salaries"
          titre="Les salariés de l’entreprise"
          texte="Un salarié par ligne, tel qu’il figure au registre unique du personnel : contrat, entrée, DPAE, sortie. La liste est la même que celle des agents dans CNAPS."
        />
        <TableauSaisie
          missionId={id}
          table="salaries_entreprise"
          lignes={salaries.map((a) => versLigneInitiale("salaries_entreprise", a as unknown as Record<string, unknown>))}
          titreVide="Aucun salarié saisi. Ajoute-les un par un, ou colle la liste depuis Excel ou le registre."
          libelleAjout="Ajouter un salarié"
        />
        {salaries.length ? (
          <>
            {([
              ["salaries_registre", "Contrat, registre du personnel et médecine du travail", null],
              ["salaries_identite", "Identité et titre de travail", "Carte d’identité, passeport ou titre de séjour : sa fin de validité, et pour un titre de séjour, l’autorisation de travailler (« Sans objet » pour un ressortissant français ou européen)."],
            ] as const).map(([table, titre, texte]) => (
              <div key={table} className="flex flex-col gap-3">
                <h4 className="text-corps font-medium text-encre">{titre}</h4>
                {texte ? <p className="-mt-2 max-w-2xl text-meta text-encre-2">{texte}</p> : null}
                <TableauSaisie
                  missionId={id}
                  table={table}
                  lignes={salaries.map((a) => versLigneInitiale(table, a as unknown as Record<string, unknown>))}
                  libelles={libellesSalaries}
                  titreVide=""
                />
              </div>
            ))}
          </>
        ) : null}
        <ListeAlertes alertes={m.urssaf.salaries} vide="Aucune alerte sur les salariés saisis." missionId={id} constatsExistants={constats} />
      </section>

      <section aria-labelledby="st" className="flex flex-col gap-5">
        <EnTeteSection id="st" titre="Les sous-traitants" texte="Les conclusions retenues dans chaque dossier, et les alertes de travail dissimulé et de vigilance." />
        {d.sousTraitants.length ? (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-meta">
              <thead>
                <tr className="border-b border-encre text-note text-encre-2">
                  <th scope="col" className="py-2 pr-3 font-medium">Sous-traitant</th>
                  {CONCLUSIONS_ST.map(([, t]) => <th key={t} scope="col" className="py-2 pr-3 font-medium">{t}</th>)}
                </tr>
              </thead>
              <tbody>
                {d.sousTraitants.map((st) => (
                  <tr key={st.id} className="border-b border-filet">
                    <th scope="row" className="py-3 pr-3 font-medium text-encre">
                      <Link href={`/admin/missions/${id}/sous-traitance/${st.id}?vue=conclusion`} className="underline-offset-4 hover:underline">{st.raison_sociale}</Link>
                    </th>
                    {CONCLUSIONS_ST.map(([code]) => {
                      const v = g.conclusions[`${code}|${st.id}`]?.choix;
                      return <td key={code} className={`py-3 pr-3 ${v ? "text-encre" : "text-gris"}`}>{v ?? "Non conclu"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <AlertesParSousTraitant missionId={id} groupes={m.urssaf.sousTraitants} vide="Aucune alerte de travail dissimulé ni de vigilance." constatsExistants={constats} />
      </section>

      <section aria-labelledby="points" className="flex flex-col gap-5">
        <EnTeteSection id="points" titre="Points de contrôle de l’entreprise" texte="« Sans objet » pour ce qui ne concerne pas l’entreprise." />
        <BilanGrille b={bilan} />
        <GrilleSaisie missionId={id} grille="urssaf" cible="mission" sections={GRILLE_URSSAF.sections} reponses={g.reponses} />
      </section>

      <section aria-labelledby="conclusion" className="flex flex-col gap-6">
        <EnTeteSection id="conclusion" titre="Conclusion" texte="Par infraction, puis la conclusion d’ensemble pour l’entreprise." />
        <ConclusionsSaisie missionId={id} grille="urssaf" cible="mission" conclusions={GRILLE_URSSAF.conclusions} valeurs={g.conclusions} reponses={g.reponses} />
      </section>
    </div>
  );
}
