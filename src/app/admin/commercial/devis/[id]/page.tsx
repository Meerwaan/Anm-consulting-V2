import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import FicheClient from "@/components/facturation/FicheClient";
import FormDevis from "@/components/facturation/FormDevis";
import { ModifsDevis } from "@/components/facturation/ModifsDevis";
import SuiteDevis from "@/components/facturation/SuiteDevis";
import { OFFRES } from "@/content/offres";
import { aujourdHui, lireCabinet, type ClientFiche } from "@/lib/facturation/donnees";
import { ADRESSE_FICTIVE, LIBELLE_SITUATION, libelleStatutDevis, normaliserDevis, type Demande, type Devis } from "@/lib/facturation/devis";
import { urlDevisPublic } from "@/lib/facturation/devis-public";
import { fmtDate, fmtEuros } from "@/lib/sous-traitance/format";
import { actionAnnuaire, completerDepuisAnnuaire, enregistrerClient } from "@/app/admin/missions/[id]/(outil)/contrat/actions";
import { accepterDevis, changerStatutDevis, enregistrerDevis, envoyerDevis } from "../../actions";

export const metadata: Metadata = { title: "Devis — ANM Consulting", robots: { index: false } };

const CHAMPS_CLIENT =
  "id, name, siren, headcount, establishments, client_sites, forme_juridique, adresse, code_postal, ville, representant, representant_fonction, annuaire_le, exemple";

/** Un devis : la demande d'où il vient, le client, le chiffrage, puis l'envoi et l'acceptation. */
export default async function DevisPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await exigerRole("consultant");
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
  // La référence que prendra la mission si le devis est accepté (même règle que l'action serveur).
  const { data: refs } = accepte ? { data: [] } : await supabase.from("missions").select("reference");
  const annee = Number(aujourdHui().slice(0, 4));
  const rang = Math.max(0, ...((refs ?? []) as { reference: string }[]).map((m) => Number(m.reference.match(new RegExp(`^${annee}-(\\d+)$`))?.[1] ?? 0)));
  const referenceProposee = `${annee}-${String(rang + 1).padStart(2, "0")}`;
  const offreDemandee = OFFRES.find((o) => o.id === demande?.offre);

  // À qui le devis part : la dernière adresse utilisée, sinon celle de la demande du site.
  // (L'adresse de la demande d'exemple est fictive : rien n'y arrive, on ne la propose pas.)
  const emailDemande = demande?.email && !ADRESSE_FICTIVE.test(demande.email) ? demande.email : null;
  const emailPropose = devis.destinataire_email ?? emailDemande ?? (client.exemple ? session.email : null) ?? "";
  const nomPropose = devis.destinataire_nom ?? demande?.full_name ?? client.representant ?? "";

  return (
    <ModifsDevis>
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-3">
          <Link href="/admin/commercial" className="flex min-h-11 w-fit items-center text-meta text-encre-2 underline-offset-4 hover:text-vert hover:underline">
            ← Commercial
          </Link>
          <p className="etiquette">Devis {devis.numero} · {libelleStatutDevis(devis)}</p>
          <h1 className="font-display text-t2 text-encre">{client.name}</h1>
          <p className="text-corps text-encre-2">
            Créé le {fmtDate(devis.cree_le)}, valable jusqu’au {fmtDate(devis.valable_jusquau)}
            {devis.envoye_le ? ` · envoyé le ${fmtDate(devis.envoye_le)}` : ""}
            {devis.accepte_le ? ` · accepté le ${fmtDate(devis.accepte_le)}` : ""}.
          </p>
        </div>

        {/* Les suites du devis, en tête : c'est ce que Sofia vient faire ici. */}
        <SuiteDevis
          devis={devis}
          aDemande={Boolean(demande)}
          exemple={Boolean(client.exemple)}
          referenceProposee={referenceProposee}
          emailPropose={emailPropose}
          nomPropose={nomPropose}
          lien={devis.jeton ? urlDevisPublic(devis.jeton) : null}
          actions={{
            envoyer: envoyerDevis.bind(null, id),
            marquerEnvoye: changerStatutDevis.bind(null, id, "envoye"),
            accepter: accepterDevis.bind(null, id),
            refuser: changerStatutDevis.bind(null, id, "refuse"),
            reprendre: changerStatutDevis.bind(null, id, "brouillon"),
          }}
        />

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
          {accepte ? (
            <p className="text-meta text-encre-2">Accepté : le devis est figé. Le prix et les conditions se retrouvent dans le contrat de la mission.</p>
          ) : devis.accord_le ? (
            <p className="text-meta text-encre-2">Le client a donné son accord : le devis est figé. Le prix et les conditions se retrouveront dans le contrat de la mission.</p>
          ) : null}
          <FormDevis
            valeurs={devis}
            franchise={cabinet.franchise_tva}
            fige={accepte || Boolean(devis.accord_le)}
            pdf={`${chemin}/pdf`}
            enregistrer={enregistrerDevis.bind(null, id)}
            signalControle={demande?.situation === "controle_annonce"}
          />
        </section>
      </div>
    </ModifsDevis>
  );
}
