"use client";

import { useActionState } from "react";
import { nouveauDevis } from "@/app/admin/commercial/actions";
import { Message, boutonPrincipal, champ } from "./FicheClient";

/** Un client qui a appelé sans passer par le site : son nom, son SIREN, et l'outil prépare le devis. */
const NouveauDevis = () => {
  const [etat, action, enCours] = useActionState(nouveauDevis, { ok: false, message: null });
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-end">
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Client</span>
          <input name="client" required placeholder="Raison sociale" className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">SIREN</span>
          <input name="siren" inputMode="numeric" placeholder="Remplit le reste" className={`${champ} tabular-nums`} />
        </label>
        <button type="submit" disabled={enCours} className={boutonPrincipal}>
          {enCours ? "Préparation…" : "Préparer le devis"}
        </button>
      </div>
      <Message etat={etat} />
    </form>
  );
};

export default NouveauDevis;
