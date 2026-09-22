"use client";

import { useActionState, useState } from "react";
import { creerMission, type EtatCreation } from "@/app/admin/actions";

const champ = "h-12 w-full rounded-[5px] border border-gris/60 bg-papier px-3 text-corps text-encre outline-none focus:border-vert";
const ORGANISMES = ["URSSAF", "DGFiP", "Inspection du travail", "CNAPS"];

/** Création d'une mission : le client, le contexte du contrôle, la période. */
const NouvelleMission = ({ offres, referenceProposee }: { offres: { id: string; nom: string }[]; referenceProposee: string }) => {
  const [etat, action, enCours] = useActionState<EtatCreation, FormData>(creerMission, { erreur: null });
  const [organisme, setOrganisme] = useState("");

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-meta font-medium text-encre">Client (raison sociale)</span>
          <input name="client" required className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">SIREN</span>
          <input name="siren" inputMode="numeric" placeholder="9 chiffres" className={`${champ} tabular-nums`} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Référence de mission</span>
          <input name="reference" required defaultValue={referenceProposee} className={`${champ} tabular-nums`} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Nature de la mission</span>
          <select name="type" defaultValue="social_urssaf" className={champ}>
            {offres.map((o) => (
              <option key={o.id} value={o.id}>{o.nom}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Effectif de l’entreprise</span>
          <input name="effectif" type="number" inputMode="numeric" min={0} className={`${champ} tabular-nums`} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Contrôle en cours</span>
          <select name="organisme" value={organisme} onChange={(e) => setOrganisme(e.target.value)} className={champ}>
            <option value="">Aucun, audit préventif</option>
            {ORGANISMES.map((o) => (
              <option key={o} value={o}>Contrôle {o}</option>
            ))}
          </select>
        </label>
        <label className={`flex flex-col gap-2 ${organisme ? "" : "invisible"}`} aria-hidden={!organisme}>
          <span className="text-meta font-medium text-encre">Échéance du contrôle</span>
          <input name="echeance" type="date" disabled={!organisme} className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Période contrôlée : début</span>
          <input name="periode_debut" type="month" className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Période contrôlée : fin</span>
          <input name="periode_fin" type="month" className={champ} />
        </label>
      </div>
      {etat.erreur ? <p role="alert" className="text-meta text-critique">{etat.erreur}</p> : null}
      <div>
        <button type="submit" disabled={enCours} className="min-h-12 rounded-[5px] bg-encre px-6 text-meta font-medium text-papier transition-colors hover:bg-vert disabled:opacity-60">
          {enCours ? "Création…" : "Créer la mission"}
        </button>
      </div>
    </form>
  );
};

export default NouvelleMission;
