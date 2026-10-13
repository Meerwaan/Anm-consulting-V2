"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CheckCircle, FilePdf } from "@phosphor-icons/react";
import type { EtatAccord } from "@/app/devis/[jeton]/actions";
import { typographie as t } from "@/lib/observatoire/typographie";
import { boutonPrincipal, boutonSecondaire } from "./styles";

/** 16 px au moins dans les champs : en dessous, Safari sur iPhone zoome à chaque saisie. */
const saisie = "h-12 w-full rounded-[5px] border border-gris/60 bg-papier px-3 text-base text-encre outline-none transition-colors focus:border-vert focus:ring-1 focus:ring-vert";

interface Props {
  action: (etat: EtatAccord, fd: FormData) => Promise<EtatAccord>;
  etat: "ouvert" | "accepte" | "expire";
  /** La version affichée du devis : l'accord ne vaut que pour elle. */
  version: string;
  numero: string;
  client: string;
  /** Le montant engagé, déjà mis en forme : « 4 176,00 € TTC ». */
  montant: string;
  validite: string;
  nom: string;
  fonction: string;
  /** L'accord déjà donné, dates mises en forme côté serveur. */
  accord: { le: string; signataire: string; montant: string } | null;
  pdf: string;
  contact: string;
}

/**
 * Le « Bon pour accord » du client sur la page de son devis : il dit qui engage la société, coche,
 * confirme. Une fois l'accord donné, le même cadre le rappelle et annonce la suite.
 */
const AccordDevis = ({ action, etat, version, numero, client, montant, validite, nom, fonction, accord, pdf, contact }: Props) => {
  const [resultat, envoyer, enCours] = useActionState(action, { ok: false, erreur: null, confirmationA: null });
  // Nom et qualité tenus par l'état : une erreur renvoyée par le serveur ne doit pas effacer la saisie.
  // La case, elle, se décoche après chaque réponse : l'accord se redonne en connaissance de cause.
  const [qui, setQui] = useState(nom);
  const [qualite, setQualite] = useState(fonction);
  const question = `mailto:${contact}?subject=${encodeURIComponent(`Devis ${numero}`)}`;

  if (accord) {
    return (
      <section aria-labelledby="accord" role="status" className="mt-12 flex flex-col gap-4 rounded-[5px] border border-vert bg-menthe-2 p-5 md:p-7">
        <h2 id="accord" className="flex items-start gap-3 font-display text-t3 text-encre">
          <CheckCircle size={28} weight="fill" className="mt-0.5 shrink-0 text-vert" aria-hidden />
          Votre accord est enregistré.
        </h2>
        <p className="text-corps text-encre">{t(`Bon pour accord donné le ${accord.le} par ${accord.signataire}, au nom de ${client}, pour ${accord.montant}.`)}</p>
        {resultat.confirmationA ? (
          <p className="text-corps text-encre">{t(`Une confirmation vient de partir à ${resultat.confirmationA}, avec le devis qui porte la mention de votre accord.`)}</p>
        ) : null}
        <p className="text-corps text-encre-2">
          {t("La suite : nous vous adressons le contrat de prestation de services, qui reprend ces conditions, puis nous arrêtons ensemble le calendrier de la mission.")}
        </p>
        <a href={pdf} target="_blank" rel="noopener" className={`${boutonSecondaire} w-full whitespace-nowrap sm:w-fit`}>
          <FilePdf size={18} aria-hidden /> Télécharger le devis accepté (PDF)
        </a>
      </section>
    );
  }

  // Accepté sans accord en ligne : le client a signé sur papier, ANM l'a enregistré.
  if (etat === "accepte") {
    return (
      <section aria-labelledby="accord" className="mt-12 flex flex-col gap-4 rounded-[5px] border border-vert bg-menthe-2 p-5 md:p-7">
        <h2 id="accord" className="flex items-start gap-3 font-display text-t3 text-encre">
          <CheckCircle size={28} weight="fill" className="mt-0.5 shrink-0 text-vert" aria-hidden />
          Ce devis est accepté.
        </h2>
        <p className="text-corps text-encre-2">
          {t("Nous avons enregistré votre accord. La suite : le contrat de prestation de services, qui reprend ces conditions, puis le calendrier de la mission.")}
        </p>
      </section>
    );
  }

  if (etat === "expire") {
    return (
      <section aria-labelledby="accord" className="mt-12 flex flex-col gap-4 rounded-[5px] border border-majeur/50 bg-papier p-5 md:p-7">
        <h2 id="accord" className="font-display text-t3 text-encre">La validité de ce devis est dépassée.</h2>
        <p className="text-corps text-encre-2">
          {t(`Il était valable jusqu’au ${validite} et ne peut plus être accepté en ligne. Écrivez-nous : nous vous l’adressons de nouveau, à jour.`)}
        </p>
        <a href={question} className={`${boutonPrincipal} w-full whitespace-nowrap sm:w-fit`}>
          Demander un devis à jour
        </a>
      </section>
    );
  }

  return (
    <section aria-labelledby="accord" className="mt-12 flex flex-col gap-6 rounded-[5px] border border-encre bg-papier p-5 md:p-7">
      <div className="flex flex-col gap-2">
        <h2 id="accord" className="font-display text-t3 text-encre">Bon pour accord</h2>
        <p className="text-corps text-encre-2">{t(`Pour accepter ce devis, indiquez qui engage ${client}, puis confirmez. Rien à imprimer ni à renvoyer.`)}</p>
      </div>

      <form action={envoyer} className="flex flex-col gap-5">
        <input type="hidden" name="version" value={version} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-meta font-medium text-encre">Prénom et nom</span>
            <input name="nom" required minLength={3} maxLength={120} autoComplete="name" value={qui} onChange={(e) => setQui(e.target.value)} className={saisie} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-meta font-medium text-encre">Qualité</span>
            <input
              name="fonction"
              required
              maxLength={120}
              autoComplete="organization-title"
              placeholder="Gérant, Président, Directeur…"
              value={qualite}
              onChange={(e) => setQualite(e.target.value)}
              className={saisie}
            />
          </label>
        </div>
        <label className="flex items-start gap-3 text-corps text-encre">
          <input type="checkbox" name="accord" required className="mt-0.5 size-5 shrink-0 accent-vert" />
          <span>{t(`J’ai lu le devis n° ${numero} et je l’accepte au nom de ${client}, pour ${montant}.`)}</span>
        </label>
        {resultat.erreur ? (
          <p role="alert" className="text-meta font-medium text-critique">
            {t(resultat.erreur)}
          </p>
        ) : null}
        <button type="submit" disabled={enCours} className={`${boutonPrincipal} w-full whitespace-nowrap sm:w-fit`}>
          {enCours ? "Enregistrement…" : "J’accepte ce devis"}
        </button>
        <p className="text-note text-gris">
          Votre accord vaut commande. Il est enregistré avec votre nom, votre qualité, la date, l’heure et l’adresse IP de cette connexion, conservés avec le devis pour en
          garder la preuve.{" "}
          <Link href="/confidentialite" className="underline underline-offset-4 hover:text-vert">
            Politique de confidentialité
          </Link>
          .
        </p>
      </form>

      <div className="flex flex-col gap-2 border-t border-filet pt-5 text-meta text-encre-2">
        <p>
          {t("Vous préférez signer sur papier ? Imprimez le PDF, portez la mention « Bon pour accord », la date et votre signature, puis renvoyez-le à")}{" "}
          <a href={question} className="text-vert underline underline-offset-4">
            {contact}
          </a>
          .
        </p>
        <p>
          {t("Une question, un point à ajuster avant d’accepter ?")}{" "}
          <a href={question} className="text-vert underline underline-offset-4">
            Écrivez-nous
          </a>
          .
        </p>
      </div>
    </section>
  );
};

export default AccordDevis;
