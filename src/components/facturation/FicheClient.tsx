"use client";

import { useActionState } from "react";
import { ArrowsClockwise } from "@phosphor-icons/react";
import type { EtatFormulaire } from "@/app/admin/missions/[id]/(outil)/contrat/actions";
import type { ClientFiche } from "@/lib/facturation/donnees";

export const champ = "h-12 w-full rounded-[5px] border border-gris/60 bg-papier px-3 text-corps text-encre outline-none focus:border-vert disabled:bg-fond disabled:text-encre-2";
export const zone = "min-h-24 w-full rounded-[5px] border border-gris/60 bg-papier px-3 py-2.5 text-corps text-encre outline-none focus:border-vert disabled:bg-fond disabled:text-encre-2";
export const boutonPrincipal = "flex min-h-12 items-center justify-center gap-2 rounded-[5px] bg-encre px-6 text-meta font-medium text-papier transition-colors hover:bg-vert disabled:opacity-60";
export const boutonSecondaire = "flex min-h-12 items-center justify-center gap-2 rounded-[5px] border border-gris/60 bg-papier px-5 text-meta text-encre transition-colors hover:border-encre disabled:opacity-60";

export const Message = ({ etat }: { etat: EtatFormulaire }) =>
  etat.message ? (
    <p role={etat.ok ? "status" : "alert"} className={`text-meta ${etat.ok ? "text-vert" : "text-critique"}`}>
      {etat.message}
    </p>
  ) : null;

type Action = (etat: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;

/** La fiche du client pour le contrat et les factures : complétée depuis l'annuaire, corrigeable. */
const FicheClient = ({ client, enregistrer, annuaire }: { client: ClientFiche; enregistrer: Action; annuaire: Action }) => {
  const [etat, action, enCours] = useActionState(enregistrer, { ok: false, message: null });
  const [etatAnnuaire, actionAnnuaire, recherche] = useActionState(annuaire, { ok: false, message: null });
  const lu = client.annuaire_le ? new Date(client.annuaire_le).toLocaleDateString("fr-FR") : null;

  return (
    <div className="flex flex-col gap-5">
      {/* La clé force les champs à reprendre les valeurs de la base après une lecture de l'annuaire. */}
      <form key={client.annuaire_le ?? "vide"} action={action} className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-meta font-medium text-encre">Raison sociale</span>
          <input name="name" required defaultValue={client.name} className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">SIREN</span>
          <input name="siren" inputMode="numeric" defaultValue={client.siren ?? ""} placeholder="9 chiffres" className={`${champ} tabular-nums`} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Forme juridique</span>
          <input name="forme_juridique" defaultValue={client.forme_juridique ?? ""} placeholder="SARL, SAS…" className={champ} />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-meta font-medium text-encre">Adresse du siège</span>
          <input name="adresse" defaultValue={client.adresse ?? ""} className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Code postal</span>
          <input name="code_postal" inputMode="numeric" defaultValue={client.code_postal ?? ""} className={`${champ} tabular-nums`} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Ville</span>
          <input name="ville" defaultValue={client.ville ?? ""} className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Représenté par</span>
          <input name="representant" defaultValue={client.representant ?? ""} placeholder="Prénom Nom" className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">En qualité de</span>
          <input name="representant_fonction" defaultValue={client.representant_fonction ?? ""} placeholder="Gérant, Président…" className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Effectif</span>
          <input name="headcount" type="number" inputMode="numeric" min={0} defaultValue={client.headcount ?? ""} className={`${champ} tabular-nums`} />
        </label>
        <div className="flex flex-col justify-end gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-start">
          <button type="submit" disabled={enCours} className={boutonPrincipal}>
            {enCours ? "Enregistrement…" : "Enregistrer la fiche"}
          </button>
          <Message etat={etat} />
        </div>
      </form>

      <form action={actionAnnuaire} className="flex flex-col gap-2 border-t border-filet pt-4">
        <p className="text-meta text-encre-2">
          {lu
            ? `Complétée depuis l’annuaire des entreprises le ${lu}. Les données de l’INSEE sont en majuscules et sans accents : corrige-les si besoin.`
            : "Avec le SIREN, l’annuaire des entreprises donne la forme juridique, le siège et le dirigeant."}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button type="submit" disabled={recherche || !client.siren} className={boutonSecondaire}>
            <ArrowsClockwise size={18} aria-hidden />
            {recherche ? "Lecture de l’annuaire…" : lu ? "Relire l’annuaire et remplacer" : "Compléter depuis le SIREN"}
          </button>
          <Message etat={etatAnnuaire} />
        </div>
      </form>
    </div>
  );
};

export default FicheClient;
