import Link from "next/link";
import type { Metadata } from "next";
import EtapePage from "@/components/portail/EtapePage";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import AjoutSousTraitant from "@/components/sous-traitance/AjoutSousTraitant";
import ListeAlertes from "@/components/sous-traitance/ListeAlertes";
import { lireDonneesST } from "@/lib/sous-traitance/lecture";
import { analyserEntreprise, analyserSousTraitant, boucler, calculerEcart } from "@/lib/sous-traitance/calculs";
import { fmtHeures, fmtMois, fmtPct } from "@/lib/sous-traitance/format";
import ConclusionsSaisie from "@/components/grilles/ConclusionsSaisie";
import { GRILLE_RAPPROCHEMENT, GRILLE_SOUS_TRAITANT } from "@/content/grilles";
import { lireGrilles } from "@/lib/grilles/lecture";

export const metadata: Metadata = { title: "Sous-traitance — ANM Consulting", robots: { index: false } };

/**
 * Synthèse de la sous-traitance : les heures vendues sont-elles couvertes par la paie
 * et par des sous-traitants dont la capacité est démontrée ?
 * Grilles 03, 04 et 05 de Sofia, formule centrale : A − B = volume hypothétique.
 */
export default async function SousTraitancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [d, g] = await Promise.all([lireDonneesST(id), lireGrilles(id)]);
  const ecart = calculerEcart(d.ventes, d.paie, d.parametres);
  const bouclage = boucler(ecart, d.sousTraitants, d.factures);
  const dossiers = d.sousTraitants.map((s) => analyserSousTraitant(s, d.attestations, d.factures, d.paiements, d.parametres, d.smics, d.agents));
  const controles = analyserEntreprise(d.ventes, d.paie, d.smics);
  const constats = g.nonConformites.map((n) => n.constat ?? "");
  const groupes = [
    { titre: "Rapprochement des heures", alertes: bouclage.alertes, vide: "Chaque mois complet est couvert par la paie et la sous-traitance facturée." },
    { titre: "Ventes, factures, TVA et règlements (DGFiP)", alertes: controles.ventes, vide: "Aucune incohérence sur les ventes." },
    { titre: "Heures réalisées, payées et masse salariale (URSSAF)", alertes: controles.paie, vide: "Aucune incohérence sur la paie." },
  ];
  const nbAlertes = groupes.reduce((n, x) => n + x.alertes.filter((a) => a.niveau === "alerte").length, 0);
  const heuresSaisies = d.ventes.length > 0 || d.paie.length > 0;

  const chiffres: [string, string, string?][] = [
    ["A · Heures vendues", fmtHeures(ecart.totalVendues)],
    ["B · Heures payées", fmtHeures(ecart.totalPayees)],
    ["A − B · À expliquer", fmtHeures(bouclage.totalEcart), ecart.totalEcartPct !== null ? `${fmtPct(ecart.totalEcartPct)} de A` : undefined],
    ["Facturées par les sous-traitants", fmtHeures(bouclage.totalDocumentees)],
    ["Reste inexpliqué", fmtHeures(bouclage.totalReste)],
    ["Facturé en trop par les sous-traitants", fmtHeures(bouclage.totalExcedent)],
  ];

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        <EtapePage chemin="sous-traitance" />
        <h2 className="font-display text-t3 text-encre">Sous-traitance</h2>
        <p className="max-w-2xl text-corps text-encre-2">
          Les heures vendues par l’entreprise doivent être couvertes par ses propres salariés ou par des sous-traitants capables de les
          réaliser, déclarés, facturés et payés. Ce qui n’est couvert par rien est le point à investiguer.
        </p>
      </div>

      {/* Le chemin, dans l'ordre où on le parcourt. */}
      <ol className="grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet md:grid-cols-2">
        <li className="bg-papier">
          <Link href={`/admin/missions/${id}/sous-traitance/heures`} className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-fond">
            <span className="flex flex-col gap-1">
              <span className="text-note text-gris">D’abord · étape 2 de la mission</span>
              <span className="text-corps font-medium text-encre">Heures de l’entreprise</span>
              <span className="text-meta text-encre-2">
                {heuresSaisies ? `${d.ventes.length} vente${d.ventes.length > 1 ? "s" : ""} · ${d.paie.length} mois de paie` : "Ventes et paie à saisir"}
              </span>
            </span>
            <CaretRight size={20} className="shrink-0 text-gris" aria-hidden />
          </Link>
        </li>
        <li className="bg-papier">
          <a href="#sous-traitants" className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-fond">
            <span className="flex flex-col gap-1">
              <span className="text-note text-gris">Ensuite · sur cette page</span>
              <span className="text-corps font-medium text-encre">Dossier de chaque sous-traitant</span>
              <span className="text-meta text-encre-2">
                {d.sousTraitants.length
                  ? `${d.sousTraitants.length} sous-traitant${d.sousTraitants.length > 1 ? "s" : ""}`
                  : "Attestations, factures, paiements"}
              </span>
            </span>
            <CaretRight size={20} className="shrink-0 text-gris" aria-hidden />
          </a>
        </li>
      </ol>

      <section aria-labelledby="bouclage" className="flex flex-col gap-6">
        <h3 id="bouclage" className="font-display text-t4 text-encre">Le rapprochement des heures</h3>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-filet py-5 md:grid-cols-3">
          {chiffres.map(([t, v, s], i) => (
            <div key={t} className="flex flex-col gap-1">
              <dt className="text-note text-gris">{t}</dt>
              <dd className={`font-display text-t4 tabular-nums ${(i === 4 && bouclage.totalReste > 0.5) || (i === 5 && bouclage.totalExcedent > 0.5) ? "text-critique" : "text-encre"}`}>{v}</dd>
              {s ? <dd className="text-note text-gris">{s}</dd> : null}
            </div>
          ))}
        </dl>

        {ecart.lignes.length === 0 ? (
          <p className="text-meta text-encre-2">
            Le tableau mois par mois apparaîtra dès que les heures vendues et payées seront saisies à l’étape 1.
          </p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-meta">
              <thead>
                <tr className="border-b-[1.5px] border-encre text-left text-note text-encre-2">
                  <th scope="col" className="py-2 pr-3 font-medium">Mois</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">A · Vendues</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Réalisées</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">B · Payées</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">A − B</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Sous-traitants</th>
                  <th scope="col" className="py-2 text-right font-medium">Reste à expliquer</th>
                </tr>
              </thead>
              <tbody>
                {ecart.lignes.map((l, i) => {
                  const b = bouclage.lignes[i];
                  return (
                    <tr key={l.mois} className="border-b border-filet">
                      <th scope="row" className="py-3 pr-3 text-left font-normal capitalize text-encre">{fmtMois(l.mois)}</th>
                      <td className="py-3 pr-3 text-right tabular-nums">
                        {fmtHeures(l.vendues)}
                        {l.avecConversion ? <span className="block text-note text-gris">dont montants convertis</span> : null}
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums">{fmtHeures(l.realisees)}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{fmtHeures(l.payees)}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{fmtHeures(l.ecart)}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{fmtHeures(b.documentees)}</td>
                      <td className={`py-3 text-right tabular-nums ${b.reste !== null && Math.abs(b.reste) > 0.5 ? "font-medium text-critique" : "text-encre"}`}>
                        {b.reste === null ? (
                          <span className="text-gris">incomplet</span>
                        ) : b.reste < -0.5 ? (
                          <>
                            {fmtHeures(-b.reste)}
                            <span className="block text-note font-normal">facturées en trop</span>
                          </>
                        ) : (
                          fmtHeures(b.reste)
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="max-w-3xl text-note text-gris">
          L’écart A − B est un indicateur de contrôle, pas une preuve : il se rapproche des plannings, des factures des sous-traitants,
          des paiements et des documents sociaux. Seuls les sous-traitants de rang 1 comptent ici, les heures du rang 2 étant déjà
          facturées à travers eux.
        </p>
      </section>

      <section aria-labelledby="alertes" className="flex flex-col gap-5">
        <h3 id="alertes" className="font-display text-t4 text-encre">
          Ce qui ressort{nbAlertes ? <span className="text-critique"> · {nbAlertes} alerte{nbAlertes > 1 ? "s" : ""}</span> : null}
        </h3>
        {heuresSaisies ? (
          groupes.map((x) => (
            <div key={x.titre} className="flex flex-col gap-3">
              <h4 className="text-corps font-medium text-encre">{x.titre}</h4>
              <ListeAlertes alertes={x.alertes} vide={x.vide} missionId={id} constatsExistants={constats} />
            </div>
          ))
        ) : (
          <p className="text-meta text-encre-2">Rien à signaler tant que les heures ne sont pas saisies.</p>
        )}
      </section>

      <section id="sous-traitants" aria-labelledby="titre-st" className="flex scroll-mt-6 flex-col gap-5">
        <h3 id="titre-st" className="font-display text-t4 text-encre">Sous-traitants</h3>
        {dossiers.length > 0 ? (
          <ul className="flex flex-col border-t-[1.5px] border-encre">
            {dossiers.map((x) => {
              const alertes = x.alertes.filter((a) => a.niveau === "alerte").length;
              const aVerifier = x.alertes.length - alertes;
              return (
                <li key={x.st.id} className="border-b border-filet">
                  <Link
                    href={`/admin/missions/${id}/sous-traitance/${x.st.id}`}
                    className="flex min-h-16 items-center justify-between gap-4 py-3 transition-colors hover:bg-papier"
                  >
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-corps font-medium text-encre">
                        {x.st.raison_sociale}
                        {x.st.rang === 2 ? <span className="ml-2 text-meta font-normal text-majeur">rang 2</span> : null}
                      </span>
                      {g.conclusions[`st-conclusion|${x.st.id}`]?.choix ? (
                        <span className="text-meta font-medium text-encre">{g.conclusions[`st-conclusion|${x.st.id}`]?.choix}</span>
                      ) : null}
                      <span className="text-meta text-encre-2">
                        {fmtHeures(x.totalHeures)} facturées · {(() => { const n = d.attestations.filter((a) => a.sous_traitant_id === x.st.id).length; return n === 0 ? "aucune attestation" : `${n} attestation${n > 1 ? "s" : ""}`; })()} · contrôle{" "}
                        {GRILLE_SOUS_TRAITANT.sections.reduce((n, s) => n + s.items.filter((i) => g.reponses[`st|${x.st.id}|${i.code}`]?.reponse).length, 0)}&nbsp;/&nbsp;
                        {GRILLE_SOUS_TRAITANT.sections.reduce((n, s) => n + s.items.length, 0)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-meta">
                      {alertes ? <span className="font-medium text-critique">{alertes} alerte{alertes > 1 ? "s" : ""}</span> : null}
                      {aVerifier ? <span className="text-majeur">{aVerifier} à vérifier</span> : null}
                      {!alertes && !aVerifier ? <span className="text-mineur">Rien à signaler</span> : null}
                      <CaretRight size={20} className="text-gris" aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-meta text-encre-2">Aucun sous-traitant pour l’instant.</p>
        )}
        <AjoutSousTraitant
          missionId={id}
          rang1={d.sousTraitants.filter((s) => s.rang === 1).map((s) => ({ id: s.id, nom: s.raison_sociale }))}
        />
      </section>

      <section aria-labelledby="conclusion-rp" className="flex flex-col gap-6">
        <div>
          <h3 id="conclusion-rp" className="font-display text-t4 text-encre">Ta conclusion sur le rapprochement</h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">
            Ce que tu retiens de l’écart entre heures vendues et heures payées (grille 04). C’est ce qui figure au rapport.
          </p>
        </div>
        <ConclusionsSaisie
          missionId={id}
          grille="rapprochement"
          cible="mission"
          conclusions={GRILLE_RAPPROCHEMENT.conclusions}
          valeurs={g.conclusions}
          reponses={g.reponses}
        />
      </section>
    </div>
  );
}
