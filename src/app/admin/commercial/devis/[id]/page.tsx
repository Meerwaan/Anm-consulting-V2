import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle, PaperPlaneTilt, XCircle } from "@phosphor-icons/react/dist/ssr";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import FicheClient from "@/components/facturation/FicheClient";
import FormDevis from "@/components/facturation/FormDevis";
import { boutonPrincipal, boutonSecondaire } from "@/components/facturation/styles";
import { OFFRES } from "@/content/offres";
import { lireCabinet, type ClientFiche } from "@/lib/facturation/donnees";
import { LIBELLE_SITUATION, LIBELLE_STATUT_DEVIS, normaliserDevis, type Demande, type Devis } from "@/lib/facturation/devis";
import { fmtDate, fmtEuros } from "@/lib/sous-traitance/format";
import { actionAnnuaire, completerDepuisAnnuaire, enregistrerClient } from "@/app/admin/missions/[id]/(outil)/contrat/actions";
import { accepterDevis, changerStatutDevis, enregistrerDevis } from "../../actions";

export const metadata: Metadata = { title: "Devis — ANM Consulting", robots: { index: false } };

const CHAMPS_CLIENT =
  "id, name, siren, headcount, establishments, client_sites, forme_juridique, adresse, code_postal, ville, representant, representant_fonction, annuaire_le, exemple";

/** Un devis : la demande d'où il vient, le client, le chiffrage, puis l'envoi et l'acceptation. */
export default async function DevisPage({ params }: { params: Promise<{ id: string }> }) {
  await exigerRole("consultant");
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("devis").select(`*, organisation:organizations (${CHAMPS_CLIENT}), demande:leads (*)`).eq("id", id).maybeSingle();
  if (!data) notFound();
  const devis = normaliserDevis(data as Devis);
  const client = data.organisation as ClientFiche;
  const demande = data.demande as Demande | null;
  const cabinet = await lireCabinet();
  const chemin = `/admin/commercial/devis/${id}`;

  if (client.siren && /^\d{9}/.test(client.siren) && !client.annuaire_le && (!client.adresse || !client.representant)) {
    const r = await completerDepuisAnnuaire(client.id);
    if (r.fiche) Object.assign(client, r.fiche);
  }

  const accepte = devis.statut === "accepte";
  const offreDemandee = OFFRES.find((o) => o.id === demande?.offre);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <Link href="/admin/commercial" className="flex min-h-11 w-fit items-center text-meta text-encre-2 underline-offset-4 hover:text-vert hover:underline">
          ← Commercial
        </Link>
        <p className="etiquette">Devis {devis.numero} · {LIBELLE_STATUT_DEVIS[devis.statut]}</p>
        <h1 className="font-display text-t2 text-encre">{client.name}</h1>
        <p className="text-corps text-encre-2">
          Créé le {fmtDate(devis.cree_le)}, valable jusqu’au {fmtDate(devis.valable_jusquau)}
          {devis.envoye_le ? ` · envoyé le ${fmtDate(devis.envoye_le)}` : ""}
          {devis.accepte_le ? ` · accepté le ${fmtDate(devis.accepte_le)}` : ""}.
        </p>
      </div>

      {/* Les suites du devis, en tête : c'est ce que Sofia vient faire ici. */}
      <section aria-label="Suite du devis" className="flex flex-col gap-3 rounded-[5px] border border-encre bg-papier p-5">
        {accepte && devis.mission_id ? (
          <>
            <p className="flex items-center gap-2 text-corps text-vert">
              <CheckCircle size={20} weight="fill" aria-hidden /> Accepté : la mission et son contrat ont été créés avec ce devis.
            </p>
            <Link href={`/admin/missions/${devis.mission_id}/contrat`} className={`${boutonPrincipal} w-fit`}>
              Ouvrir le contrat et les factures <ArrowRight size={18} aria-hidden />
            </Link>
          </>
        ) : (
          <>
            <p className="text-meta text-encre-2">
              {devis.statut === "brouillon"
                ? "Relis le chiffrage, ouvre le PDF, envoie-le au client, puis indique ici qu’il est parti."
                : devis.statut === "envoye"
                  ? "Quand le client renvoie le devis signé « Bon pour accord », accepte-le : la mission et son contrat se créent tout seuls, déjà remplis."
                  : "Ce devis est refusé. Tu peux le remettre en brouillon pour le retravailler."}
            </p>
            <div className="flex flex-wrap gap-2">
              {devis.statut === "brouillon" ? (
                <form action={changerStatutDevis.bind(null, id, "envoye")}>
                  <button type="submit" className={boutonSecondaire}>
                    <PaperPlaneTilt size={18} aria-hidden /> Marquer comme envoyé
                  </button>
                </form>
              ) : null}
              {devis.statut !== "refuse" ? (
                <form action={accepterDevis.bind(null, id)}>
                  <button type="submit" className={boutonPrincipal}>
                    <CheckCircle size={18} aria-hidden /> Accepté : créer la mission et le contrat
                  </button>
                </form>
              ) : null}
              {devis.statut === "refuse" ? (
                <form action={changerStatutDevis.bind(null, id, "brouillon")}>
                  <button type="submit" className={boutonSecondaire}>Remettre en brouillon</button>
                </form>
              ) : (
                <form action={changerStatutDevis.bind(null, id, "refuse")}>
                  <button type="submit" className={`${boutonSecondaire} text-critique`}>
                    <XCircle size={18} aria-hidden /> Refusé
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </section>

      {demande ? (
        <section aria-labelledby="demande" className="flex flex-col gap-3">
          <h2 id="demande" className="font-display text-t4 text-encre">La demande reçue du site</h2>
          <div className="flex flex-col gap-2 rounded-[5px] border border-filet bg-papier p-5 text-corps text-encre-2">
            <p>
              <span className="font-medium text-encre">{demande.full_name ?? "—"}</span> · <a href={`mailto:${demande.email}`} className="underline underline-offset-4">{demande.email}</a>
              {demande.telephone ? <> · <a href={`tel:${demande.telephone.replace(/\s/g, "")}`} className="underline underline-offset-4">{demande.telephone}</a></> : null}
              {" "}· le {new Date(demande.created_at).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}
            </p>
            <p>
              {[
                offreDemandee ? `Forfait choisi : ${offreDemandee.nom}` : null,
                demande.headcount ? `${demande.headcount} salariés` : null,
                demande.sites ? `${demande.sites} site${demande.sites > 1 ? "s" : ""}` : null,
                demande.urgence ? "contrôle sous 7 jours" : null,
                demande.estimation_ht ? `estimation vue sur le site : ${fmtEuros(demande.estimation_ht)} HT` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Sans forfait choisi."}
            </p>
            {demande.situation ? <p>Situation : {LIBELLE_SITUATION[demande.situation] ?? demande.situation}</p> : null}
            {demande.message ? <p className="whitespace-pre-line text-encre">« {demande.message} »</p> : null}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="client" className="flex flex-col gap-4">
        <h2 id="client" className="font-display text-t4 text-encre">Le client</h2>
        <div className="max-w-3xl">
          <FicheClient client={client} enregistrer={enregistrerClient.bind(null, chemin, client.id)} annuaire={actionAnnuaire.bind(null, chemin, client.id)} />
        </div>
      </section>

      <section aria-labelledby="chiffrage" className="flex max-w-3xl flex-col gap-4">
        <h2 id="chiffrage" className="font-display text-t4 text-encre">Le devis</h2>
        {accepte ? <p className="text-meta text-encre-2">Accepté : le devis est figé. Le prix et les conditions se retrouvent dans le contrat de la mission.</p> : null}
        <FormDevis
          valeurs={devis}
          franchise={cabinet.franchise_tva}
          fige={accepte}
          pdf={`${chemin}/pdf`}
          enregistrer={enregistrerDevis.bind(null, id)}
          signalControle={demande?.situation === "controle_annonce"}
        />
      </section>
    </div>
  );
}
