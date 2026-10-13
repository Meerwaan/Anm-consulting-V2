import Link from "next/link";
import { ArrowRight, CaretRight, CheckCircle, PaperPlaneTilt, XCircle } from "@phosphor-icons/react/dist/ssr";
import type { EtatFormulaire } from "@/app/admin/missions/[id]/(outil)/contrat/actions";
import { ADRESSE_CONTACT } from "@/lib/email/envoi";
import { aujourdHui } from "@/lib/facturation/donnees";
import type { Devis } from "@/lib/facturation/devis";
import { fmtDate, fmtDateHeure, fmtEuros } from "@/lib/sous-traitance/format";
import BoutonConfirme from "./BoutonConfirme";
import EnvoiDevis from "./EnvoiDevis";
import LienDevis from "./LienDevis";
import { boutonCritique, boutonPrincipal, boutonSecondaire } from "./styles";

interface Props {
  devis: Devis;
  /** Le devis vient d'une demande du site : la refuser classe aussi la demande. */
  aDemande: boolean;
  exemple: boolean;
  /** La référence que prendra la mission si le devis est accepté. */
  referenceProposee: string;
  emailPropose: string;
  nomPropose: string;
  /** Le lien personnel du client (/devis/<jeton>), ou null tant que la base ne le fournit pas. */
  lien: string | null;
  actions: {
    envoyer: (etat: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;
    marquerEnvoye: () => Promise<void>;
    accepter: () => Promise<void>;
    refuser: () => Promise<void>;
    reprendre: () => Promise<void>;
  };
}

/**
 * Les suites d'un devis, en tête de sa page : l'envoyer au client, suivre son accord, créer la
 * mission. Un seul cadre, qui ne montre que le geste du moment.
 */
const SuiteDevis = ({ devis, aDemande, exemple, referenceProposee, emailPropose, nomPropose, lien, actions }: Props) => {
  const accepte = devis.statut === "accepte";
  const expire = devis.valable_jusquau < aujourdHui();
  const modifieDepuisEnvoi = Boolean(devis.email_envoye_le) && new Date(devis.maj_le).getTime() > new Date(devis.email_envoye_le!).getTime();
  const signataire = `${devis.accord_nom ?? "le client"}${devis.accord_fonction ? `, ${devis.accord_fonction}` : ""}`;
  const refuser = (
    <BoutonConfirme
      action={actions.refuser}
      classe={`${boutonSecondaire} text-critique`}
      classeConfirmer={boutonCritique}
      confirmer="Confirmer : devis refusé"
      consequence={
        <>
          Le devis {devis.numero} passe en « Refusé »{aDemande ? " et la demande d’origine est classée sans suite" : ""}. Son numéro reste pris.
          {lien && devis.statut === "envoye" ? " Le lien du client ne l’affiche plus." : ""} Vous pourrez le remettre en brouillon pour le retravailler.
          {devis.accord_le ? <span className="mt-2 block font-medium text-critique">Le client a donné son accord en ligne : ne refusez que s’il s’est rétracté.</span> : null}
        </>
      }
    >
      <XCircle size={18} aria-hidden /> Refusé
    </BoutonConfirme>
  );

  return (
    <section aria-label="Suite du devis" className="flex flex-col gap-5 rounded-[5px] border border-encre bg-papier p-5">
      {accepte && devis.mission_id ? (
        <>
          <p className="flex items-start gap-2 text-corps text-vert">
            <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
            <span>
              Accepté : la mission et son contrat ont été créés avec ce devis.
              {devis.accord_le ? ` Accord donné en ligne le ${fmtDateHeure(devis.accord_le)} par ${signataire}.` : ""}
            </span>
          </p>
          <Link href={`/admin/missions/${devis.mission_id}/contrat`} className={`${boutonPrincipal} w-fit`}>
            Ouvrir le contrat et les factures <ArrowRight size={18} aria-hidden />
          </Link>
        </>
      ) : accepte ? (
        <p className="text-meta text-encre-2">
          Ce devis est marqué accepté, mais sa mission n’a pas été créée (création interrompue). Rechargez la page ; si rien ne change, contactez Merwan.
        </p>
      ) : devis.statut === "brouillon" ? (
        <>
          <p className="max-w-3xl text-meta text-encre-2">
            Relisez le chiffrage plus bas, puis envoyez le devis : le client le reçoit par email, en PDF, avec un lien pour le relire et l’accepter en ligne. S’il
            répond à l’email, sa réponse arrive sur {ADRESSE_CONTACT}.
          </p>
          <EnvoiDevis envoyer={actions.envoyer} email={emailPropose} nom={nomPropose} renvoi={false} exemple={exemple} />
          <details className="group border-t border-filet pt-1 text-meta text-encre-2">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-encre [&::-webkit-details-marker]:hidden">
              <CaretRight size={14} className="shrink-0 text-gris transition-transform group-open:rotate-90" aria-hidden />
              Devis remis autrement (en main propre, par courrier, depuis votre messagerie)
            </summary>
            <div className="flex flex-col gap-3 pb-1">
              <p className="max-w-3xl">
                Ouvrez le PDF, remettez-le au client, puis indiquez ici qu’il est parti : c’est ensuite seulement qu’il peut être accepté. Aucun email ne part de
                l’outil ; le lien du client reste disponible pour une acceptation en ligne.
              </p>
              <form action={actions.marquerEnvoye}>
                <button type="submit" className={boutonSecondaire}>
                  Marquer comme envoyé, sans email
                </button>
              </form>
            </div>
          </details>
          <div className="flex flex-wrap items-start gap-2">{refuser}</div>
        </>
      ) : devis.statut === "envoye" && devis.accord_le ? (
        <>
          <p className="flex items-start gap-2 text-corps text-vert">
            <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
            <span>
              Bon pour accord donné en ligne le {fmtDateHeure(devis.accord_le)} par <span className="font-medium">{signataire}</span>, pour{" "}
              <span className="tabular-nums">{fmtEuros(devis.accord_total_ttc ?? devis.total_ttc)} TTC</span>.
            </span>
          </p>
          <p className="max-w-3xl text-meta text-encre-2">
            L’accord porte sur cette version : le devis ne se modifie plus.{devis.accord_ip ? ` Adresse de connexion enregistrée : ${devis.accord_ip}.` : ""} Il reste à
            créer la mission ; son contrat sera rempli avec ce devis.
          </p>
          <div className="flex flex-wrap items-start gap-2">
            <BoutonConfirme
              action={actions.accepter}
              classe={boutonPrincipal}
              confirmer="Confirmer : créer la mission et le contrat"
              consequence={
                <>
                  Crée la mission {referenceProposee} et son contrat, remplis avec ce devis ({fmtEuros(devis.total_ht)} HT). Le devis {devis.numero} devient
                  « Accepté ». Irréversible depuis l’outil.
                </>
              }
            >
              <CheckCircle size={18} aria-hidden /> Créer la mission et le contrat
            </BoutonConfirme>
            {refuser}
          </div>
          {lien ? (
            <a href={lien} target="_blank" rel="noopener" className="flex min-h-11 w-fit items-center text-meta text-vert underline underline-offset-4 hover:text-encre">
              Voir le devis tel que le client l’a accepté
            </a>
          ) : null}
        </>
      ) : devis.statut === "envoye" ? (
        <>
          <p className="flex items-start gap-2 text-corps text-encre">
            <PaperPlaneTilt size={20} className="mt-0.5 shrink-0 text-vert" aria-hidden />
            <span>
              {devis.email_envoye_le ? (
                <>
                  Envoyé par email le {fmtDateHeure(devis.email_envoye_le)} à <span className="font-medium">{devis.destinataire_email}</span>, PDF joint.
                </>
              ) : (
                <>Marqué comme envoyé le {fmtDate(devis.envoye_le)}, sans email de l’outil.</>
              )}
            </span>
          </p>
          {expire ? (
            <p className="max-w-3xl text-meta font-medium text-critique">
              La validité est dépassée depuis le {fmtDate(devis.valable_jusquau)} : le client ne peut plus accepter ce devis en ligne. Repoussez « Valable jusqu’au »,
              enregistrez le devis, puis renvoyez-le.
            </p>
          ) : null}
          {modifieDepuisEnvoi ? (
            <p className="max-w-3xl text-meta font-medium text-majeur">
              Le devis a été enregistré après son envoi : le lien du client montre la version à jour, mais le PDF joint à l’email est l’ancien. Renvoyez le devis pour
              que le client ait le bon.
            </p>
          ) : null}
          {lien ? <LienDevis url={lien} /> : null}
          <p className="max-w-3xl text-meta text-encre-2">
            {lien ? `Dès que le client donne son accord en ligne, un email vous prévient sur ${ADRESSE_CONTACT} et ce cadre l’indique. ` : ""}
            S’il vous renvoie le devis signé « Bon pour accord » sur papier, acceptez-le vous-même : la mission et son contrat se créent tout seuls, déjà remplis.
          </p>
          <div className="flex flex-wrap items-start gap-2">
            <BoutonConfirme
              action={actions.accepter}
              classe={boutonPrincipal}
              confirmer="Confirmer : créer la mission et le contrat"
              consequence={
                <>
                  Crée la mission {referenceProposee} et son contrat, remplis avec ce devis ({fmtEuros(devis.total_ht)} HT). Le devis {devis.numero} devient
                  « Accepté » et ne se modifie plus. Irréversible depuis l’outil : à faire seulement avec le devis signé « Bon pour accord » en main.
                  {expire ? (
                    <span className="mt-2 block font-medium text-critique">
                      Attention : la validité du devis a expiré le {fmtDate(devis.valable_jusquau)}. Vérifiez que le client l’a bien signé à temps, ou
                      établissez un nouveau devis.
                    </span>
                  ) : null}
                </>
              }
            >
              <CheckCircle size={18} aria-hidden /> Accepté : créer la mission et le contrat
            </BoutonConfirme>
            {refuser}
          </div>
          {lien ? (
            <details className="group border-t border-filet pt-1 text-meta text-encre-2">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-encre [&::-webkit-details-marker]:hidden">
                <CaretRight size={14} className="shrink-0 text-gris transition-transform group-open:rotate-90" aria-hidden />
                {devis.email_envoye_le ? "Renvoyer le devis par email" : "L’envoyer aussi par email"}
              </summary>
              <div className="flex flex-col gap-3 pb-1 pt-1">
                <p className="max-w-3xl">
                  {devis.email_envoye_le
                    ? "À la même adresse ou à une autre : l’email repart avec le PDF à jour et le même lien."
                    : "Le client reçoit le PDF et le lien ci-dessus, pour accepter en ligne sans rien imprimer."}
                </p>
                <EnvoiDevis envoyer={actions.envoyer} email={emailPropose} nom={nomPropose} renvoi={Boolean(devis.email_envoye_le)} exemple={exemple} />
              </div>
            </details>
          ) : null}
        </>
      ) : (
        <>
          <p className="text-meta text-encre-2">Ce devis est refusé. Vous pouvez le remettre en brouillon pour le retravailler, puis le renvoyer.</p>
          <form action={actions.reprendre}>
            <button type="submit" className={boutonSecondaire}>Remettre en brouillon</button>
          </form>
        </>
      )}
    </section>
  );
};

export default SuiteDevis;
