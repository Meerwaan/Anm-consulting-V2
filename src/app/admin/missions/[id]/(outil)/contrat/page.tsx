import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigerRole } from "@/lib/supabase/session";
import FicheClient from "@/components/facturation/FicheClient";
import FormContrat from "@/components/facturation/FormContrat";
import Factures, { type FactureProposee } from "@/components/facturation/Factures";
import {
  LIBELLE_NATURE,
  contratPropose,
  estAnnulee,
  facturesPossibles,
  lireFacturation,
  manquesFacture,
  preparerFacture,
  prixPropose,
  tauxTva,
} from "@/lib/facturation/donnees";
import { fmtDate } from "@/lib/sous-traitance/format";
import { actionAnnuaire, completerDepuisAnnuaire, emettreAvoir, emettreFacture, enregistrerClient, enregistrerContrat, marquerPayee, rouvrirContrat, signerContrat } from "./actions";

export const metadata: Metadata = { title: "Contrat et factures — ANM Consulting", robots: { index: false } };

/**
 * Contrat et factures d'une mission (demande de Sofia du 24/09/2026) : tout ce que l'outil sait
 * est déjà rempli. Le client depuis sa fiche et l'annuaire des entreprises, la prestation et le
 * prix depuis l'offre et la grille, le cabinet depuis la page Cabinet.
 */
export default async function ContratPage({ params }: { params: Promise<{ id: string }> }) {
  await exigerRole("consultant");
  const { id } = await params;
  const d = await lireFacturation(id);
  if (!d) notFound();

  // Première ouverture : le client est complété depuis l'annuaire sans rien écraser. Les valeurs
  // sont reportées ici : relire la base dans le même rendu renverrait la lecture mémorisée.
  const o = d.mission.organisation;
  if (o.siren && /^\d{9}/.test(o.siren) && !o.annuaire_le && (!o.adresse || !o.representant)) {
    const r = await completerDepuisAnnuaire(o.id);
    if (r.fiche) Object.assign(o, r.fiche);
  }

  const { cabinet, mission, contrat, factures } = d;
  const propose = contratPropose(d);
  const valeurs = contrat ?? propose;
  const prix = prixPropose(mission);
  const manques = manquesFacture(d);
  const possibles: FactureProposee[] = contrat && contrat.montant_ht !== null
    ? facturesPossibles(d).map((nature) => {
        const f = preparerFacture(d, nature as FactureProposee["nature"]);
        const titre = nature === "acompte" ? `Facture d’acompte (${contrat.acompte_pct} %)` : nature === "solde" ? "Facture de solde" : "Facture unique (100 %)";
        const detail =
          nature === "acompte"
            ? `Payable à réception. Le solde de ${100 - contrat.acompte_pct} % sera facturé à la remise des livrables.`
            : nature === "solde"
              ? `La prestation entière, moins ${f.acomptes.map((a) => `l’acompte ${a.numero}`).join(" et ")}. Payable à ${cabinet.delai_paiement_jours} jours.`
              : `La prestation entière, sans acompte. Payable à ${cabinet.delai_paiement_jours} jours.`;
        return { nature: nature as FactureProposee["nature"], titre, detail, ht: f.total_ht, ttc: f.total_ttc };
      })
    : [];

  const soldeActif = factures.find((f) => f.nature === "solde" && !estAnnulee(f, factures));
  const lignes = factures.map((f) => ({
    id: f.id,
    numero: f.numero,
    libelle: f.nature === "avoir" ? `Avoir sur ${factures.find((x) => x.id === f.facture_origine)?.numero ?? "une facture"}` : LIBELLE_NATURE[f.nature],
    emise_le: f.emise_le,
    echeance_le: f.echeance_le,
    net_a_payer: f.net_a_payer,
    payee_le: f.payee_le,
    annulee: estAnnulee(f, factures),
    avoir: f.nature === "avoir",
    // Un acompte déduit d'un solde encore valable ne s'annule qu'après le solde.
    annulable: f.nature !== "avoir" && !estAnnulee(f, factures) && !(f.nature === "acompte" && soldeActif?.acomptes.some((a) => a.numero === f.numero)),
  }));

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        <p className="etiquette">Administratif</p>
        <h2 className="font-display text-t3 text-encre">Contrat et factures</h2>
        <p className="max-w-2xl text-corps text-encre-2">
          Le contrat reprend ton modèle mot pour mot ; l’outil remplit tout ce qu’il connaît déjà. Les factures se calculent sur le contrat
          et portent toutes les mentions obligatoires.
        </p>
      </div>

      <section aria-labelledby="parties" className="flex flex-col gap-6">
        <h3 id="parties" className="font-display text-t4 text-encre">Les parties</h3>
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            <p className="text-meta font-medium text-encre">Le client</p>
            <FicheClient
              client={mission.organisation}
              enregistrer={enregistrerClient.bind(null, `/admin/missions/${id}/contrat`, mission.organisation.id)}
              annuaire={actionAnnuaire.bind(null, `/admin/missions/${id}/contrat`, mission.organisation.id)}
            />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-meta font-medium text-encre">ANM Consulting</p>
            <dl className="flex flex-col gap-2 rounded-[5px] border border-filet bg-papier p-5 text-corps">
              {[
                ["Forme", `${cabinet.forme_juridique}${cabinet.capital ? ` au capital de ${cabinet.capital.toLocaleString("fr-FR")} €` : ""}`],
                ["SIREN", cabinet.siren ? `${cabinet.siren}${cabinet.rcs_ville ? `, RCS ${cabinet.rcs_ville}` : ""}` : null],
                ["Siège", [cabinet.adresse, [cabinet.code_postal, cabinet.ville].filter(Boolean).join(" ")].filter(Boolean).join(", ") || null],
                ["Représentée par", `${cabinet.representant ?? "—"}, ${cabinet.fonction ?? ""}`],
                ["TVA", cabinet.franchise_tva ? "Franchise en base (art. 293 B du CGI)" : "20 %"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <dt className="text-note text-gris">{k}</dt>
                  <dd className={v ? "text-encre" : "font-medium text-critique"}>{v ?? "À compléter"}</dd>
                </div>
              ))}
              <Link href="/admin/cabinet" className="mt-2 flex min-h-11 w-fit items-center text-meta text-vert underline underline-offset-4">
                Modifier les informations du cabinet
              </Link>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="contrat" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 id="contrat" className="font-display text-t4 text-encre">Le contrat</h3>
          <p className="text-meta text-encre-2">
            {contrat ? `Enregistré${contrat.signe_le ? `, signé le ${fmtDate(contrat.signe_le)}` : ", pas encore signé"}.` : "Pas encore enregistré : voici ce que l’outil propose."}
            {contrat?.devis ? (
              <>
                {" "}Rempli avec le{" "}
                <Link href={`/admin/commercial/devis/${contrat.devis.id}`} className="underline underline-offset-4 hover:text-vert">
                  devis {contrat.devis.numero}
                </Link>
                {contrat.devis.accepte_le ? ` accepté le ${fmtDate(contrat.devis.accepte_le)}` : ""}.
              </>
            ) : null}
          </p>
        </div>
        <FormContrat
          valeurs={valeurs}
          propose={!contrat}
          prixDetail={prix?.detail ?? null}
          tauxTva={tauxTva(cabinet)}
          signeLe={contrat?.signe_le ?? null}
          pdf={`/admin/missions/${id}/contrat/pdf`}
          enregistrer={enregistrerContrat.bind(null, id)}
          signer={signerContrat.bind(null, id)}
          rouvrir={rouvrirContrat.bind(null, id)}
        />
      </section>

      <section aria-labelledby="factures" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 id="factures" className="font-display text-t4 text-encre">Les factures</h3>
          <p className="text-meta text-encre-2">
            {contrat && contrat.montant_ht !== null
              ? `Numérotées à la suite (F${new Date().getFullYear()}-0001, 0002…), sans trou. Toutes les factures du cabinet sont dans la page Commercial.`
              : "Enregistre d’abord le contrat avec son prix : les factures se calculent dessus."}
          </p>
        </div>
        <Factures
          factures={lignes}
          possibles={possibles}
          manques={manques}
          emettre={emettreFacture.bind(null, id)}
          avoir={emettreAvoir.bind(null, id)}
          payer={marquerPayee.bind(null, id)}
        />
      </section>
    </div>
  );
}
