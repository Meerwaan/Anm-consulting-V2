import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FicheIdentite from "@/components/sous-traitance/FicheIdentite";
import EtapePage from "@/components/portail/EtapePage";
import ListeAlertes from "@/components/sous-traitance/ListeAlertes";
import TableauSaisie from "@/components/sous-traitance/TableauSaisie";
import EcheancierVigilance from "@/components/sous-traitance/EcheancierVigilance";
import { lireDonneesST } from "@/lib/sous-traitance/lecture";
import { SEUIL_VIGILANCE_HT, analyserSousTraitant } from "@/lib/sous-traitance/calculs";
import { versLigneInitiale } from "@/lib/sous-traitance/tables";
import { fmtDate, fmtEuros, fmtEurosRond, fmtHeures, fmtMois, fmtNombre, fmtPct } from "@/lib/sous-traitance/format";
import GrilleSaisie from "@/components/grilles/GrilleSaisie";
import ConclusionsSaisie from "@/components/grilles/ConclusionsSaisie";
import { GRILLE_SOUS_TRAITANT } from "@/content/grilles";
import { lireGrilles } from "@/lib/grilles/lecture";

export const metadata: Metadata = { title: "Dossier sous-traitant — ANM Consulting", robots: { index: false } };

const Titre = ({ id, children, sous }: { n?: string; id: string; children: React.ReactNode; sous?: string }) => (
  <div>
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
const VUES = [
  { cle: "ensemble", libelle: "Vue d’ensemble" },
  { cle: "donnees", libelle: "Pièces et chiffres" },
  { cle: "controle", libelle: "Contrôle" },
  { cle: "conclusion", libelle: "Conclusion" },
] as const;
type Vue = (typeof VUES)[number]["cle"];

export default async function DossierSousTraitantPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; st: string }>;
  searchParams: Promise<{ vue?: string }>;
}) {
  const { id, st: stId } = await params;
  const { vue: vueDemandee } = await searchParams;
  const vue: Vue = VUES.some((v) => v.cle === vueDemandee) ? (vueDemandee as Vue) : "ensemble";
  const [d, g] = await Promise.all([lireDonneesST(id), lireGrilles(id)]);
  const st = d.sousTraitants.find((s) => s.id === stId);
  if (!st) notFound();
  const x = analyserSousTraitant(st, d.attestations, d.factures, d.paiements, d.parametres, d.smics, d.agents);
  const agentsST = d.agents.filter((a) => a.sous_traitant_id === st.id);
  const donneur = st.donneur_id ? d.sousTraitants.find((s) => s.id === st.donneur_id) : null;
  const facturesST = d.factures.filter((f) => f.sous_traitant_id === st.id);
  const optionsFactures = facturesST.map((f) => ({
    id: f.id,
    libelle: [f.numero ? `N° ${f.numero}` : "Sans numéro", f.mois ? fmtMois(f.mois) : null, f.montant_ttc !== null ? fmtEuros(f.montant_ttc) : f.montant_ht !== null ? `${fmtEuros(f.montant_ht)} HT` : null]
      .filter(Boolean)
      .join(" · "),
  }));
  const nbAlertes = x.alertes.filter((a) => a.niveau === "alerte").length;
  const totalQuestions = GRILLE_SOUS_TRAITANT.sections.reduce((n, s) => n + s.items.length, 0);
  const repondues = GRILLE_SOUS_TRAITANT.sections.reduce(
    (n, s) => n + s.items.filter((i) => g.reponses[`st|${st.id}|${i.code}`]?.reponse).length,
    0,
  );

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        <Link href={`/admin/missions/${id}/sous-traitance#sous-traitants`} className="flex min-h-11 w-fit items-center text-meta text-encre-2 underline-offset-4 hover:text-vert hover:underline">
          ← Tous les sous-traitants
        </Link>
        <EtapePage chemin="sous-traitance" sous="Dossier d’un sous-traitant" />
        <h2 className="font-display text-t3 text-encre">{st.raison_sociale}</h2>
        <p className="text-corps text-encre-2">
          {st.rang === 2 ? (
            <>
              Sous-traitant de rang 2{donneur ? <>, travaille pour <strong className="font-medium text-encre">{donneur.raison_sociale}</strong></> : null}
            </>
          ) : (
            "Sous-traitant de rang 1"
          )}
          {x.vigilanceObligatoire === true ? ` · relation d’au moins ${fmtEurosRond(SEUIL_VIGILANCE_HT)} HT : vigilance obligatoire` : null}
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
      {/* Quatre vues : on ne voit jamais tout le dossier d'un coup. */}
      <nav aria-label="Parties du dossier" className="-mt-6 flex gap-1 overflow-x-auto border-b border-filet">
        {VUES.map((v) => (
          <Link
            key={v.cle}
            href={`/admin/missions/${id}/sous-traitance/${st.id}${v.cle === "ensemble" ? "" : `?vue=${v.cle}`}`}
            aria-current={vue === v.cle ? "page" : undefined}
            className={`-mb-px flex min-h-12 shrink-0 items-center border-b-2 px-4 text-meta transition-colors ${
              vue === v.cle ? "border-vert font-medium text-encre" : "border-transparent text-encre-2 hover:text-vert"
            }`}
          >
            {v.libelle}
            {v.cle === "controle" ? <span className="ml-2 tabular-nums text-gris">{repondues}&nbsp;/&nbsp;{totalQuestions}</span> : null}
          </Link>
        ))}
      </nav>

      {vue === "ensemble" ? (
        <>
      <section aria-labelledby="alertes-st" className="flex flex-col gap-5">
        <Titre n="Ce qui ressort" id="alertes-st">Alertes et points à vérifier</Titre>
        <ListeAlertes alertes={x.alertes} vide="Aucune alerte : attestations, faisabilité et paiements sont cohérents avec ce qui est saisi." missionId={id} sousTraitantId={st.id} constatsExistants={g.nonConformites.map((n) => n.constat ?? "")} />
      </section>
      <section aria-labelledby="resume-conclusion" className="flex flex-col gap-4">
        <h3 id="resume-conclusion" className="font-display text-t4 text-encre">Conclusions</h3>
        <dl className="grid gap-x-8 gap-y-4 border-y border-filet py-5 sm:grid-cols-2">
          {GRILLE_SOUS_TRAITANT.conclusions.filter((c) => c.type === "choix").map((c) => {
            const v = g.conclusions[`${c.code}|${st.id}`]?.choix;
            return (
              <div key={c.code} className="flex flex-col gap-1">
                <dt className="text-note text-gris">{c.titre}</dt>
                <dd className={`text-corps ${v ? "text-encre" : "text-gris"}`}>{v ?? "Pas encore conclu"}</dd>
              </div>
            );
          })}
        </dl>
        <Link href={`/admin/missions/${id}/sous-traitance/${st.id}?vue=conclusion`} className="flex min-h-11 w-fit items-center text-meta font-medium text-vert underline underline-offset-4">
          Rédiger ou modifier la conclusion
        </Link>
      </section>
      <section aria-labelledby="faisabilite" className="flex flex-col gap-5">
        <Titre
          n="Calcul"
          id="faisabilite"
          sous={`Heures disponibles = salariés en équivalent temps plein sur l’attestation de vigilance × ${fmtNombre(d.parametres.heures_mensuelles_etp)} h : c’est le nombre d’heures réelles dont disposait le sous-traitant pour répondre aux commandes. Des heures facturées au-delà ne peuvent pas être produites par ses seuls salariés déclarés. Plafond SMIC (indicatif) = rémunérations déclarées ÷ SMIC horaire.`}
        >
          Faisabilité : l’effectif déclaré peut-il produire les heures facturées ?
        </Titre>
        {x.mois.length === 0 ? (
          <p className="text-meta text-encre-2">Ce calcul apparaît dès qu’une facture a un mois de prestation.</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[43rem] border-collapse text-meta">
              <thead>
                <tr className="border-b-[1.5px] border-encre text-left text-note text-encre-2">
                  <th scope="col" className="py-2 pr-3 font-medium">Mois</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Heures facturées</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Attestation</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Effectif</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Heures disponibles</th>
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
          L’effectif de l’attestation est un indicateur de cohérence : il ne dit pas quels salariés ont travaillé sur le marché, et le
          sous-traitant peut avoir d’autres clients. Un dépassement est à expliquer, pas à qualifier.
        </p>
      </section>
      <section aria-labelledby="flechage" className="flex flex-col gap-5">
        <Titre n="Calcul" id="flechage" sous="Chaque facture rapprochée de ses paiements. Montant attendu : TTC s’il est saisi, sinon HT.">
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
        </>
      ) : null}

      {vue === "donnees" ? (
        <>
      <section aria-labelledby="identite" className="flex flex-col gap-5">
        <Titre n="1" id="identite">Identification</Titre>
        <FicheIdentite missionId={id} st={st} />
      </section>
      <section aria-labelledby="attestations" className="flex flex-col gap-5">
        <Titre
          n="2"
          id="attestations"
          sous="Chaque attestation de vigilance URSSAF, avec l’effectif et les rémunérations qu’elle indique, et le mois de déclaration auquel ils se rapportent. Elle vaut 6 mois : elle doit être renouvelée pendant toute la relation."
        >
          Attestations de vigilance
        </Titre>
        <EcheancierVigilance e={x.echeancier} />
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
        <Titre n="3" id="factures" sous="Les factures du sous-traitant, avec le nombre d’heures et le mois de prestation : c’est ce qui permet de contrôler la faisabilité.">
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
      <section aria-labelledby="agents" className="flex flex-col gap-5">
        <Titre
          n="5"
          id="agents"
          sous="Pour chaque agent vu sur le marché : est-il dans les documents du sous-traitant, sa carte est-elle valide, est-il rattaché dans Dracar Ultimate et présent sur le planning ?"
        >
          Agents contrôlés
        </Titre>
        <TableauSaisie
          missionId={id}
          table="st_agents"
          sousTraitantId={st.id}
          lignes={d.agents.filter((a) => a.sous_traitant_id === st.id).map((a) => versLigneInitiale("st_agents", a as unknown as Record<string, unknown>))}
          titreVide="Aucun agent contrôlé."
          libelleAjout="Ajouter un agent"
        />
        {agentsST.length ? (
          <div className="flex flex-col gap-3">
            <h4 className="text-corps font-medium text-encre">Identité et titre de travail</h4>
            <p className="-mt-2 max-w-2xl text-meta text-encre-2">
              Carte d’identité, passeport ou titre de séjour : sa fin de validité, et pour un titre de séjour, l’autorisation de travailler (« Sans objet » pour un ressortissant français ou européen).
            </p>
            <TableauSaisie
              missionId={id}
              table="identite_st"
              sousTraitantId={st.id}
              lignes={agentsST.map((a) => versLigneInitiale("identite_st", a as unknown as Record<string, unknown>))}
              libelles={Object.fromEntries(agentsST.map((a) => [a.id, a.nom ?? "Agent sans nom"]))}
              titreVide=""
            />
          </div>
        ) : null}
      </section>

        </>
      ) : null}

      {vue === "controle" ? (
        <>
      <section aria-labelledby="controle" className="flex flex-col gap-5">
        <div>
          <h3 id="controle" className="font-display text-t4 text-encre">Contrôle du sous-traitant</h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">
            Les points de tes grilles 02 et 05. Ouvre une partie, réponds au toucher ; ajoute une observation quand c’est utile.
            Les parties « points d’alerte » se lisent à l’envers : « oui » veut dire que l’anomalie est constatée.
          </p>
        </div>
        <GrilleSaisie missionId={id} grille="st" cible={st.id} sections={GRILLE_SOUS_TRAITANT.sections} reponses={g.reponses} />
      </section>
        </>
      ) : null}

      {vue === "conclusion" ? (
        <>
      <section aria-labelledby="conclusion" className="flex flex-col gap-6">
        <div>
          <h3 id="conclusion" className="font-display text-t4 text-encre">Conclusion sur {st.raison_sociale}</h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">
            Ce que tu retiens de ce dossier, avec les choix de tes grilles. C’est ce qui figure au rapport.
          </p>
        </div>
        <ConclusionsSaisie
          missionId={id}
          grille="st"
          cible={st.id}
          conclusions={GRILLE_SOUS_TRAITANT.conclusions}
          valeurs={g.conclusions}
          reponses={g.reponses}
        />
        <p className="text-meta text-encre-2">
          Une non-conformité à formaliser (nature, action corrective, délai) ?{" "}
          <Link href={`/admin/missions/${id}/actions`} className="font-medium text-vert underline underline-offset-4">
            Elle se note dans le plan d’actions.
          </Link>
        </p>
      </section>
        </>
      ) : null}
    </div>
  );
}
