"use client";

import { useActionState, useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import type { EtatFormulaire } from "@/app/admin/missions/[id]/(outil)/contrat/actions";
import { Message, boutonPrincipal, champ, zone } from "./FicheClient";
import { useModifsDevis } from "./ModifsDevis";

type Action = (etat: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;

/**
 * L'envoi du devis au client, depuis l'outil : son adresse, son nom pour la formule d'appel, un mot
 * d'accompagnement. L'email part de contact@anm-consulting.fr avec le PDF et le lien d'acceptation.
 */
const EnvoiDevis = ({ envoyer, email, nom, renvoi, exemple }: { envoyer: Action; email: string; nom: string; renvoi: boolean; exemple: boolean }) => {
  const [etat, action, enCours] = useActionState(envoyer, { ok: false, message: null });
  const { modifie } = useModifsDevis();
  // Champs tenus par l'état : si l'email ne part pas, l'adresse et le mot saisis restent.
  const [adresse, setAdresse] = useState(email);
  const [destinataire, setDestinataire] = useState(nom);
  const [mot, setMot] = useState("");

  return (
    <form action={action} className="flex max-w-3xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Adresse email du client</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="off"
            required
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="prenom.nom@societe.fr"
            className={champ}
          />
          {exemple ? <span className="text-note text-majeur">Exemple : envoyez-le à votre propre adresse pour voir ce que reçoit un client.</span> : null}
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">À l’attention de</span>
          <input name="nom" value={destinataire} onChange={(e) => setDestinataire(e.target.value)} placeholder="Prénom Nom" autoComplete="off" className={champ} />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-meta font-medium text-encre">Un mot d’accompagnement (facultatif)</span>
          <textarea
            name="mot"
            maxLength={1200}
            value={mot}
            onChange={(e) => setMot(e.target.value)}
            placeholder="Ex. Comme convenu ce matin, voici le devis pour la préparation de votre contrôle."
            className={zone}
          />
        </label>
      </div>
      {/* Le message sous le bouton, jamais à côté : un échec d'envoi s'explique en deux lignes. */}
      <div className="flex flex-col items-start gap-3">
        <button type="submit" disabled={enCours || modifie} className={`${boutonPrincipal} whitespace-nowrap`}>
          <PaperPlaneTilt size={18} aria-hidden />
          {enCours ? "Envoi…" : renvoi ? "Renvoyer le devis" : "Envoyer le devis au client"}
        </button>
        {modifie ? (
          <p role="status" className="text-meta text-majeur">
            Des modifications du devis ne sont pas enregistrées : touchez d’abord « Enregistrer le devis », plus bas.
          </p>
        ) : (
          <Message etat={etat} />
        )}
      </div>
    </form>
  );
};

export default EnvoiDevis;
