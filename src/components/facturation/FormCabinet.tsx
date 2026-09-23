"use client";

import { useActionState } from "react";
import { enregistrerCabinet } from "@/app/admin/cabinet/actions";
import type { Cabinet } from "@/lib/facturation/donnees";
import { Message, boutonPrincipal, champ } from "./FicheClient";

const Champ = ({ nom, libelle, valeur, aide, ...rest }: { nom: string; libelle: string; valeur: string | number | null; aide?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="flex flex-col gap-2">
    <span className="text-meta font-medium text-encre">{libelle}</span>
    <input name={nom} defaultValue={valeur ?? ""} className={champ} {...rest} />
    {aide ? <span className="text-note text-gris">{aide}</span> : null}
  </label>
);

const FormCabinet = ({ cabinet: c, tva }: { cabinet: Cabinet; tva: string | null }) => {
  const [etat, action, enCours] = useActionState(enregistrerCabinet, { ok: false, message: null });
  return (
    <form action={action} className="flex flex-col gap-8">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-display text-t4 text-encre">La société</legend>
        <Champ nom="raison_sociale" libelle="Raison sociale" valeur={c.raison_sociale} required />
        <Champ nom="forme_juridique" libelle="Forme juridique" valeur={c.forme_juridique} required />
        <Champ nom="capital" libelle="Capital (€)" valeur={c.capital} inputMode="decimal" />
        <Champ
          nom="siren"
          libelle="SIREN"
          valeur={c.siren}
          inputMode="numeric"
          placeholder="9 chiffres, sur l’extrait Kbis"
          aide={c.siren ? (tva ? `TVA intracommunautaire calculée : ${tva}` : undefined) : "Obligatoire sur les factures : à renseigner avant la première."}
        />
        <Champ nom="rcs_ville" libelle="Greffe du RCS" valeur={c.rcs_ville} aide="Sèvres relève du greffe de Nanterre." />
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">TVA</span>
          <select name="franchise_tva" defaultValue={c.franchise_tva ? "oui" : "non"} className={champ}>
            <option value="non">Assujettie, TVA à 20 %</option>
            <option value="oui">Franchise en base (art. 293 B du CGI)</option>
          </select>
          <span className="text-note text-gris">Le choix fait avec l’expert-comptable à la création de la société.</span>
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-display text-t4 text-encre">Le siège et la représentante</legend>
        <div className="sm:col-span-2">
          <Champ nom="adresse" libelle="Adresse" valeur={c.adresse} />
        </div>
        <Champ nom="code_postal" libelle="Code postal" valeur={c.code_postal} inputMode="numeric" />
        <Champ nom="ville" libelle="Ville" valeur={c.ville} />
        <Champ nom="representant" libelle="Représentée par" valeur={c.representant} />
        <Champ nom="fonction" libelle="En qualité de" valeur={c.fonction} aide="Dans une EURL : gérante." />
        <Champ nom="email" libelle="Email" valeur={c.email} type="email" />
        <Champ nom="telephone" libelle="Téléphone" valeur={c.telephone} type="tel" />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-display text-t4 text-encre">Le paiement</legend>
        <div className="sm:col-span-2">
          <Champ nom="iban" libelle="IBAN" valeur={c.iban} aide="Imprimé sur les factures pour le virement." autoCapitalize="characters" />
        </div>
        <Champ nom="bic" libelle="BIC" valeur={c.bic} autoCapitalize="characters" />
        <Champ nom="delai_paiement_jours" libelle="Délai de paiement (jours)" valeur={c.delai_paiement_jours} type="number" min={0} max={60} inputMode="numeric" aide="30 jours par défaut entre professionnels." />
        <Champ nom="acompte_pct" libelle="Acompte proposé (%)" valeur={c.acompte_pct} type="number" min={0} max={100} inputMode="numeric" aide="Ton contrat prévoit 50 % à la commande." />
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={enCours} className={boutonPrincipal}>
          {enCours ? "Enregistrement…" : "Enregistrer"}
        </button>
        <Message etat={etat} />
      </div>
    </form>
  );
};

export default FormCabinet;
