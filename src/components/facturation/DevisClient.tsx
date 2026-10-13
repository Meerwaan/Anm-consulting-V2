import Link from "next/link";
import { FilePdf } from "@phosphor-icons/react/dist/ssr";
import type { EtatAccord } from "@/app/devis/[jeton]/actions";
import { Logo } from "@/components/marque/Logo";
import { ADRESSE_CONTACT } from "@/lib/email/envoi";
import type { DevisPublic } from "@/lib/facturation/devis-public";
import { partieCabinet, partieClient, type PartieFacture } from "@/lib/facturation/donnees";
import { typographie as t } from "@/lib/observatoire/typographie";
import { fmtDate, fmtDateHeure, fmtEuros } from "@/lib/sous-traitance/format";
import AccordDevis from "./AccordDevis";
import { boutonSecondaire } from "./styles";

/**
 * La page du devis côté client (/devis/<jeton>) : une feuille sobre, hors du site et hors de
 * l'outil. Le client y relit le devis, télécharge le PDF et donne son « Bon pour accord ».
 */

export const CadreDevis = ({ children }: { children: React.ReactNode }) => (
  <main className="min-h-dvh bg-fond">
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-10 md:py-14">
      <Link href="/" className="block w-fit" aria-label="ANM Consulting, le site">
        <Logo largeur={160} prioritaire />
      </Link>
      <div className="flex-1">{children}</div>
      <footer className="mt-14 flex flex-wrap gap-x-4 gap-y-1 border-t border-filet pt-5 text-note text-gris">
        <span>ANM Consulting · Audit et préparation aux contrôles en sécurité privée</span>
        <a href={`mailto:${ADRESSE_CONTACT}`} className="underline underline-offset-4 hover:text-vert">
          {ADRESSE_CONTACT}
        </a>
        <Link href="/confidentialite" className="underline underline-offset-4 hover:text-vert">
          Confidentialité
        </Link>
      </footer>
    </div>
  </main>
);

export const DevisIndisponible = ({ titre, texte }: { titre: string; texte: string }) => (
  <CadreDevis>
    <div className="mt-10 flex max-w-xl flex-col gap-4">
      <p className="etiquette">Devis</p>
      <h1 className="font-display text-t2 text-encre">{titre}</h1>
      <p className="text-corps text-encre-2">{t(texte)}</p>
      <a href={`mailto:${ADRESSE_CONTACT}`} className={`${boutonSecondaire} w-full whitespace-nowrap sm:w-fit`}>
        Écrire à {ADRESSE_CONTACT}
      </a>
    </div>
  </CadreDevis>
);

const Partie = ({ titre, p, attention }: { titre: string; p: PartieFacture; attention?: string | null }) => (
  <div className="flex flex-col gap-1 bg-papier p-5 text-meta text-encre-2">
    <dt className="etiquette">{titre}</dt>
    <dd className="flex flex-col">
      <span className="text-corps font-medium text-encre">{p.nom}</span>
      {p.mentions?.split(" · ").map((m) => <span key={m}>{m}</span>)}
      {p.lignes.map((l) => (
        <span key={l}>{l}</span>
      ))}
      {p.siren && !p.mentions ? <span>SIREN {p.siren.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}</span> : null}
      {attention ? <span className="mt-1 text-encre">{t(`À l’attention de ${attention}`)}</span> : null}
    </dd>
  </div>
);

const DevisClient = ({ d, jeton, accorder }: { d: DevisPublic; jeton: string; accorder: (etat: EtatAccord, fd: FormData) => Promise<EtatAccord> }) => {
  const { devis, client, cabinet, etat } = d;
  const franchise = devis.taux_tva === 0;
  const suivi = devis.prestation === "suivi_conformite";
  const parMois = suivi ? " par mois" : "";
  const acompteTTC = Math.round(devis.total_ttc * devis.acompte_pct) / 100;
  const pdf = `/devis/${jeton}/pdf`;
  const montant = (ttc: number) => (franchise ? `${fmtEuros(ttc)}, TVA non applicable${parMois}` : `${fmtEuros(ttc)} TTC${parMois}`);
  // La personne à qui le devis a été adressé ; sa qualité n'est proposée que si c'est le dirigeant connu.
  const destinataire = devis.destinataire_nom ?? "";
  const estDirigeant = Boolean(destinataire) && destinataire.toLowerCase() === (client.representant ?? "").toLowerCase();
  const reglement = suivi
    ? "Facturation mensuelle, à terme à échoir."
    : devis.acompte_pct > 0 && devis.acompte_pct < 100
      ? `Acompte de ${devis.acompte_pct} % à la commande, soit ${fmtEuros(acompteTTC)} TTC ; solde à la remise des livrables.`
      : devis.acompte_pct >= 100
        ? "Totalité à la commande."
        : "Totalité à la remise des livrables.";

  return (
    <CadreDevis>
      <header className="mt-10 flex flex-col gap-4">
        <p className="etiquette">
          {t(`Devis n° ${devis.numero}`)}
          {client.exemple ? " · Exemple, sans valeur" : ""}
        </p>
        <h1 className="font-display text-t2 text-encre">{t(devis.intitule)}</h1>
        <p className="text-corps text-encre-2">
          Établi le {fmtDate(devis.cree_le)} pour <span className="font-medium text-encre">{client.name}</span>,{" "}
          {devis.accord_le ? `accepté le ${fmtDateHeure(devis.accord_le)}` : etat === "accepte" ? "accepté" : `valable jusqu’au ${fmtDate(devis.valable_jusquau)}`}.
        </p>
        {devis.description ? <p className="text-corps text-encre-2">{t(devis.description)}</p> : null}
        <a href={pdf} target="_blank" rel="noopener" className={`${boutonSecondaire} w-full whitespace-nowrap sm:w-fit`}>
          <FilePdf size={18} aria-hidden /> Télécharger le devis (PDF)
        </a>
      </header>

      <section aria-labelledby="chiffrage" className="mt-12 flex flex-col gap-4">
        <h2 id="chiffrage" className="font-display text-t4 text-encre">Le chiffrage</h2>
        <div className="flex flex-col rounded-[5px] border border-filet bg-papier">
          <ul className="flex flex-col">
            {devis.lignes.map((l, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 border-b border-filet px-5 py-3 text-corps">
                <span className="flex min-w-0 flex-col">
                  <span className={i === 0 ? "font-medium text-encre" : "text-encre"}>{t(l.designation)}</span>
                  {l.detail ? <span className="text-meta text-encre-2">{t(l.detail)}</span> : null}
                  {l.quantite !== 1 ? (
                    <span className="text-meta tabular-nums text-encre-2">
                      {l.quantite.toLocaleString("fr-FR")} × {fmtEuros(l.prix_unitaire_ht)}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 tabular-nums text-encre">{fmtEuros(l.quantite * l.prix_unitaire_ht)}</span>
              </li>
            ))}
          </ul>
          <dl className="flex flex-col gap-1 px-5 py-4 text-corps tabular-nums">
            <div className="flex items-baseline justify-between gap-4 text-encre-2">
              <dt>Total HT{parMois}</dt>
              <dd>{fmtEuros(devis.total_ht)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 text-encre-2">
              <dt>{franchise ? "TVA non applicable, art. 293 B du CGI" : t(`TVA ${devis.taux_tva.toLocaleString("fr-FR")} %`)}</dt>
              <dd>{franchise ? "—" : fmtEuros(devis.total_ttc - devis.total_ht)}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-4 border-t-[1.5px] border-encre pt-3 font-medium text-encre">
              <dt>Total TTC{parMois}</dt>
              <dd className="font-display text-t4 font-normal">{fmtEuros(devis.total_ttc)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="conditions" className="mt-12 flex flex-col gap-4">
        <h2 id="conditions" className="font-display text-t4 text-encre">Les conditions</h2>
        <dl className="flex flex-col divide-y divide-filet rounded-[5px] border border-filet bg-papier text-corps">
          <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
            <dt className="etiquette shrink-0 sm:w-28 sm:pt-1">Règlement</dt>
            <dd className="text-encre">{t(reglement)}</dd>
          </div>
          {devis.calendrier ? (
            <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
              <dt className="etiquette shrink-0 sm:w-28 sm:pt-1">Calendrier</dt>
              <dd className="text-encre">{t(devis.calendrier)}</dd>
            </div>
          ) : null}
          {devis.livrables.length ? (
            <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
              <dt className="etiquette shrink-0 sm:w-28 sm:pt-1">Livrables</dt>
              <dd className="text-encre">
                <ul className="flex list-disc flex-col gap-1 pl-5 marker:text-brume">
                  {devis.livrables.map((l) => (
                    <li key={l}>{t(l.charAt(0).toUpperCase() + l.slice(1))}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="text-meta text-encre-2">
          Ce devis est complété par le contrat de prestation de services d’ANM Consulting, qui en reprend les conditions et précise le périmètre, les limites et les
          responsabilités de la mission. Aucune garantie de résultat n’est donnée sur l’issue d’un contrôle.
        </p>
      </section>

      <section aria-labelledby="parties" className="mt-12 flex flex-col gap-4">
        <h2 id="parties" className="font-display text-t4 text-encre">Les parties</h2>
        <dl className="grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet sm:grid-cols-2">
          <Partie titre="Émetteur" p={partieCabinet(cabinet)} />
          <Partie titre="Client" p={partieClient(client)} attention={client.representant ? `${client.representant}${client.representant_fonction ? `, ${client.representant_fonction}` : ""}` : null} />
        </dl>
      </section>

      <AccordDevis
        action={accorder}
        etat={etat}
        version={d.version}
        numero={devis.numero}
        client={client.name}
        montant={montant(devis.total_ttc)}
        validite={fmtDate(devis.valable_jusquau)}
        nom={destinataire}
        fonction={estDirigeant ? (client.representant_fonction ?? "") : ""}
        accord={
          devis.accord_le
            ? {
                le: fmtDateHeure(devis.accord_le),
                signataire: `${devis.accord_nom ?? "le client"}${devis.accord_fonction ? `, ${devis.accord_fonction}` : ""}`,
                montant: montant(devis.accord_total_ttc ?? devis.total_ttc),
              }
            : null
        }
        pdf={pdf}
        contact={ADRESSE_CONTACT}
      />
    </CadreDevis>
  );
};

export default DevisClient;
