import type { Metadata } from "next";
import Link from "next/link";
import { CaretRight, FilePdf } from "@phosphor-icons/react/dist/ssr";
import { exigerRole } from "@/lib/supabase/session";
import NouveauDevis from "@/components/facturation/NouveauDevis";
import { boutonPrincipal, boutonSecondaire } from "@/components/facturation/styles";
import { OFFRES } from "@/content/offres";
import { LIBELLE_NATURE, aujourdHui } from "@/lib/facturation/donnees";
import { LIBELLE_SITUATION, LIBELLE_STATUT_DEVIS, lireCommercial } from "@/lib/facturation/devis";
import { fmtDate, fmtEuros } from "@/lib/sous-traitance/format";
import { classerDemande, creerExemple, effacerExemple, preparerDevisDepuisDemande } from "./actions";

export const metadata: Metadata = { title: "Commercial — ANM Consulting", robots: { index: false } };

const SOURCES: Record<string, string> = {
  contact: "Formulaire de contact",
  abonnement: "Page abonnement",
  formation: "Liste d’attente formation",
  "checklist-cnaps": "Checklist CNAPS",
  "checklist-urssaf": "Checklist URSSAF",
  "checklist-inspection": "Checklist Inspection",
  "checklist-fiscal": "Checklist DGFiP",
};

const Exemple = () => <span className="rounded-full bg-fond px-2.5 py-0.5 text-note font-medium text-majeur ring-1 ring-majeur/30">Exemple</span>;

const Titre = ({ id, n, titre, sous }: { id: string; n: string; titre: string; sous: string }) => (
  <div className="flex flex-col gap-1">
    <p className="font-mono text-note text-gris">{n}</p>
    <h2 id={id} className="font-display text-t3 text-encre">{titre}</h2>
    <p className="max-w-2xl text-meta text-encre-2">{sous}</p>
  </div>
);

/**
 * Le commercial au même endroit (demande de Merwan du 24/09/2026) : la demande reçue du site,
 * le devis qu'elle donne, le contrat de la mission une fois le devis accepté, les factures.
 * Chaque étape se remplit avec la précédente.
 */
export default async function CommercialPage() {
  await exigerRole("consultant");
  const { demandes, devis, contratsASigner, factures } = await lireCommercial();
  const aTraiter = demandes.filter((d) => d.statut === "nouvelle" || d.statut === "en_cours");
  const traitees = demandes.filter((d) => !(d.statut === "nouvelle" || d.statut === "en_cours"));
  const devisOuverts = devis.filter((d) => d.statut === "brouillon" || d.statut === "envoye");
  const devisClos = devis.filter((d) => d.statut === "accepte" || d.statut === "refuse");
  const annulees = new Set(factures.filter((f) => f.nature === "avoir").map((f) => f.facture_origine));
  const valables = factures.filter((f) => f.nature !== "avoir" && !annulees.has(f.id));
  const jour = aujourdHui();
  const attendu = valables.filter((f) => !f.payee_le);
  const retard = attendu.filter((f) => f.echeance_le < jour);
  const exempleEnCours = demandes.some((d) => d.exemple) || devis.some((d) => d.exemple) || factures.some((f) => f.numero.startsWith("EXEMPLE"));

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-t2 text-encre">Commercial</h1>
        <p className="max-w-2xl text-corps text-encre-2">
          Tout se suit ici, dans l’ordre : la demande reçue du site devient un devis, le devis accepté devient la mission et son contrat,
          le contrat donne les factures. Chaque étape reprend la précédente : rien n’est à retaper.
        </p>
      </div>

      <section aria-label="Exemple" className="flex flex-col gap-3 rounded-[5px] border border-majeur/40 bg-papier p-5 md:flex-row md:items-center md:justify-between md:gap-8">
        <p className="max-w-2xl text-meta text-encre-2">
          {exempleEnCours ? (
            <>
              <span className="font-medium text-encre">Un client d’exemple est en cours.</span> Ses documents portent un numéro « EXEMPLE » et la mention en filigrane :
              ils n’entament pas la vraie numérotation. Efface-le quand tu as fini, ou recommence depuis le début.
            </>
          ) : (
            <>
              <span className="font-medium text-encre">Pas encore de client ?</span> Crée un client d’exemple : une demande arrive comme si elle venait du site, et tu
              déroules tout, devis, mission, contrat, factures. Rien ne compte, tout s’efface d’un bouton.
            </>
          )}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <form action={creerExemple}>
            <button type="submit" className={exempleEnCours ? boutonSecondaire : boutonPrincipal}>{exempleEnCours ? "Recommencer l’exemple" : "Créer un exemple"}</button>
          </form>
          {exempleEnCours ? (
            <form action={effacerExemple}>
              <button type="submit" className={boutonSecondaire}>Effacer l’exemple</button>
            </form>
          ) : null}
        </div>
      </section>

      <dl className="grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Demandes à traiter", String(aTraiter.length), "#demandes", false],
          ["Devis en cours", devisOuverts.length ? `${devisOuverts.length} · ${fmtEuros(devisOuverts.reduce((s, d) => s + d.total_ht, 0))} HT` : "0", "#devis", false],
          ["Contrats à signer", String(contratsASigner.length), "#contrats", false],
          [
            "À encaisser (TTC)",
            attendu.length ? `${fmtEuros(attendu.reduce((s, f) => s + f.net_a_payer, 0))}${retard.length ? ` · ${retard.length} en retard` : ""}` : "Rien",
            "#factures",
            retard.length > 0,
          ],
        ].map(([k, v, href, alerte]) => (
          <a key={k as string} href={href as string} className="flex flex-col gap-1 bg-papier p-5 transition-colors hover:bg-fond">
            <dt className="text-note text-gris">{k}</dt>
            <dd className={`font-display text-t4 tabular-nums ${alerte ? "text-critique" : "text-encre"}`}>{v}</dd>
          </a>
        ))}
      </dl>

      {/* 1. DEMANDES */}
      <section id="demandes" aria-labelledby="t-demandes" className="flex scroll-mt-6 flex-col gap-6">
        <Titre id="t-demandes" n="1" titre="Les demandes reçues du site" sous="Formulaire de contact et estimateur : le forfait choisi, l’effectif, les sites et l’estimation vue par le prospect arrivent avec la demande. Un bouton prépare le devis avec tout ça." />
        {aTraiter.length ? (
          <ul className="flex flex-col border-t-[1.5px] border-encre">
            {aTraiter.map((d) => {
              const offre = OFFRES.find((o) => o.id === d.offre);
              return (
                <li key={d.id} className="flex flex-col gap-3 border-b border-filet py-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-display text-t4 text-encre">{d.company || d.full_name || d.email}</span>
                      {d.exemple ? <Exemple /> : d.statut === "nouvelle" ? <span className="rounded-full bg-menthe px-2.5 py-0.5 text-note font-medium text-vert">Nouvelle</span> : null}
                      <span className="text-note text-gris">
                        {SOURCES[d.source ?? ""] ?? d.source} · le {new Date(d.created_at).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}
                      </span>
                    </p>
                    <p className="text-meta text-encre-2">
                      {d.full_name ? `${d.full_name} · ` : ""}
                      <a href={`mailto:${d.email}`} className="underline underline-offset-4">{d.email}</a>
                      {d.telephone ? <> · <a href={`tel:${d.telephone.replace(/\s/g, "")}`} className="underline underline-offset-4">{d.telephone}</a></> : null}
                    </p>
                    <p className="text-meta text-encre">
                      {[
                        offre ? offre.nom : null,
                        d.headcount ? `${d.headcount} salariés` : null,
                        d.sites ? `${d.sites} site${d.sites > 1 ? "s" : ""}` : null,
                        d.urgence ? "contrôle sous 7 jours" : null,
                        d.estimation_ht ? `estimation ${fmtEuros(d.estimation_ht)} HT` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {d.situation ? <p className="text-meta text-encre-2">{LIBELLE_SITUATION[d.situation] ?? d.situation}</p> : null}
                    {d.message ? <p className="line-clamp-3 max-w-2xl whitespace-pre-line text-meta text-encre-2">« {d.message} »</p> : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <form action={preparerDevisDepuisDemande.bind(null, d.id)}>
                      <button type="submit" className={boutonPrincipal}>Préparer le devis</button>
                    </form>
                    {d.statut === "nouvelle" ? (
                      <form action={classerDemande.bind(null, d.id, "en_cours")}>
                        <button type="submit" className={boutonSecondaire}>Rappelé, en cours</button>
                      </form>
                    ) : null}
                    <form action={classerDemande.bind(null, d.id, "sans_suite")}>
                      <button type="submit" className={boutonSecondaire}>Sans suite</button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-corps text-encre-2">Aucune demande à traiter. Les demandes du formulaire de contact et de l’estimateur arrivent ici.</p>
        )}
        {traitees.length ? (
          <details className="text-meta text-encre-2">
            <summary className="flex min-h-11 cursor-pointer items-center text-encre">Demandes déjà traitées ({traitees.length})</summary>
            <ul className="mt-2 flex flex-col">
              {traitees.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-filet py-2">
                  <span>
                    {d.company || d.full_name || d.email} · {new Date(d.created_at).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })} ·{" "}
                    {d.statut === "devis" ? "devis préparé" : d.statut === "gagnee" ? "devenue une mission" : "sans suite"}
                  </span>
                  {d.statut === "sans_suite" ? (
                    <form action={classerDemande.bind(null, d.id, "en_cours")}>
                      <button type="submit" className="min-h-11 px-2 text-vert underline underline-offset-4">Rouvrir</button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      {/* 2. DEVIS */}
      <section id="devis" aria-labelledby="t-devis" className="flex scroll-mt-6 flex-col gap-6">
        <Titre id="t-devis" n="2" titre="Les devis" sous="Chiffrés avec la grille du site. Accepté, un devis crée la mission et son contrat, déjà remplis." />
        {devisOuverts.length ? (
          <ul className="flex flex-col border-t-[1.5px] border-encre">
            {devisOuverts.map((d) => (
              <li key={d.id} className="border-b border-filet">
                <Link href={`/admin/commercial/devis/${d.id}`} className="flex min-h-20 items-center justify-between gap-4 py-3 transition-colors hover:bg-papier">
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-mono text-meta tabular-nums text-encre">{d.numero}</span>
                      <span className="font-display text-t4 text-encre">{d.client}</span>
                      {d.exemple ? <Exemple /> : null}
                    </span>
                    <span className="text-meta text-encre-2">
                      {d.intitule} · <span className="tabular-nums">{fmtEuros(d.total_ht)} HT</span> · {LIBELLE_STATUT_DEVIS[d.statut]}
                      {d.statut === "envoye" && d.valable_jusquau < jour ? <span className="font-medium text-critique"> · validité dépassée</span> : ` · valable jusqu’au ${fmtDate(d.valable_jusquau)}`}
                    </span>
                  </span>
                  <CaretRight size={22} className="shrink-0 text-gris" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-corps text-encre-2">Aucun devis en cours.</p>
        )}
        <div className="flex max-w-3xl flex-col gap-3 rounded-[5px] border border-filet bg-papier p-5">
          <p className="text-meta font-medium text-encre">Un client qui a appelé directement</p>
          <NouveauDevis />
        </div>
        {devisClos.length ? (
          <details className="text-meta text-encre-2">
            <summary className="flex min-h-11 cursor-pointer items-center text-encre">Devis acceptés et refusés ({devisClos.length})</summary>
            <ul className="mt-2 flex flex-col">
              {devisClos.map((d) => (
                <li key={d.id} className="border-b border-filet">
                  <Link href={`/admin/commercial/devis/${d.id}`} className="flex min-h-11 flex-wrap items-center gap-x-3 py-1 hover:text-vert">
                    <span className="font-mono tabular-nums">{d.numero}</span> {d.client} · {fmtEuros(d.total_ht)} HT · {LIBELLE_STATUT_DEVIS[d.statut].toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      {/* 3. CONTRATS */}
      <section id="contrats" aria-labelledby="t-contrats" className="flex scroll-mt-6 flex-col gap-6">
        <Titre id="t-contrats" n="3" titre="Les contrats à signer" sous="Ton modèle de contrat, rempli avec le devis accepté. Une fois signé, il s’archive dans la mission." />
        {contratsASigner.length ? (
          <ul className="flex flex-col border-t-[1.5px] border-encre">
            {contratsASigner.map((c) => (
              <li key={c.mission_id} className="border-b border-filet">
                <Link href={`/admin/missions/${c.mission_id}/contrat`} className="flex min-h-20 items-center justify-between gap-4 py-3 transition-colors hover:bg-papier">
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-display text-t4 text-encre">{c.client}</span>
                    <span className="text-meta text-encre-2">
                      Mission {c.reference} · contrat du {fmtDate(c.date_contrat)}
                      {c.montant_ht !== null ? <> · <span className="tabular-nums">{fmtEuros(c.montant_ht)} HT</span></> : null}
                    </span>
                  </span>
                  <CaretRight size={22} className="shrink-0 text-gris" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-corps text-encre-2">Aucun contrat en attente de signature.</p>
        )}
      </section>

      {/* 4. FACTURES */}
      <section id="factures" aria-labelledby="t-factures" className="flex scroll-mt-6 flex-col gap-6">
        <Titre id="t-factures" n="4" titre="Les factures" sous="Émises depuis le contrat de chaque mission (acompte, puis solde). Numérotées à la suite, sans trou ; une erreur se corrige par un avoir." />
        {factures.length ? (
          <ul className="flex flex-col border-t-[1.5px] border-encre">
            {factures.map((f) => {
              const annulee = annulees.has(f.id);
              const enRetard = f.nature !== "avoir" && !annulee && !f.payee_le && f.echeance_le < jour;
              return (
                <li key={f.id} className="flex flex-col gap-2 border-b border-filet py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-mono text-meta tabular-nums text-encre">{f.numero}</span>
                      <span className={`text-corps ${annulee ? "text-gris line-through" : "text-encre"}`}>{f.client.nom}</span>
                      <span className="text-corps font-medium tabular-nums text-encre">{fmtEuros(f.net_a_payer)} TTC</span>
                    </p>
                    <p className="text-meta text-encre-2">
                      {LIBELLE_NATURE[f.nature]} · émise le {fmtDate(f.emise_le)} ·{" "}
                      <Link href={`/admin/missions/${f.mission.id}/contrat`} className="underline underline-offset-4 hover:text-vert">
                        mission {f.mission.reference}
                      </Link>
                      {f.nature === "avoir" ? "" : annulee ? " · annulée" : f.payee_le ? ` · payée le ${fmtDate(f.payee_le)}` : ` · échéance le ${fmtDate(f.echeance_le)}`}
                      {enRetard ? <span className="font-medium text-critique"> · en retard</span> : null}
                    </p>
                  </div>
                  <a href={`/admin/factures/${f.id}/pdf`} target="_blank" rel="noopener" className={`${boutonSecondaire} w-fit`}>
                    <FilePdf size={18} aria-hidden /> PDF
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-corps text-encre-2">Aucune facture émise pour l’instant.</p>
        )}
      </section>
    </div>
  );
}
