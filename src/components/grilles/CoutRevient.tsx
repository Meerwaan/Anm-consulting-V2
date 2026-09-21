"use client";

import { useState, useTransition } from "react";
import { Check, WarningCircle } from "@phosphor-icons/react";
import { enregistrerCoutRevient } from "@/app/admin/missions/[id]/(outil)/dgfip/actions";

const champ = "h-12 w-full rounded-[5px] border border-gris/60 bg-papier px-3 text-corps text-encre outline-none focus:border-vert";

/** Saisie du coût de revient horaire de référence et de sa source (module DGFiP). */
const CoutRevient = ({ missionId, valeur, source }: { missionId: string; valeur: number | null; source: string | null }) => {
  const [v, setV] = useState(valeur === null ? "" : String(valeur).replace(".", ","));
  const [s, setS] = useState(source ?? "");
  const [retour, setRetour] = useState<{ ok: boolean; texte: string } | null>(null);
  const [enCours, demarrer] = useTransition();
  return (
    <form
      className="flex flex-col gap-4 rounded-[5px] border border-filet bg-papier p-5"
      onSubmit={(e) => {
        e.preventDefault();
        demarrer(async () => {
          const r = await enregistrerCoutRevient({ missionId, valeur: v, source: s });
          setRetour(r.ok ? { ok: true, texte: "Enregistré. Les ventes et la sous-traitance sont comparées à ce coût." } : { ok: false, texte: r.erreur });
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <label className="flex flex-col gap-1.5">
          <span className="text-meta font-medium text-encre">Coût de revient horaire (€ HT)</span>
          <input value={v} onChange={(e) => setV(e.target.value)} inputMode="decimal" className={`${champ} text-right tabular-nums`} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-meta font-medium text-encre">Source</span>
          <input value={s} onChange={(e) => setS(e.target.value)} placeholder="Organisme, publication, année" className={champ} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={enCours} className="min-h-11 rounded-[5px] border border-encre px-4 text-meta font-medium text-encre transition-colors hover:bg-encre hover:text-papier disabled:opacity-60">
          {enCours ? "Enregistrement…" : "Enregistrer"}
        </button>
        {retour ? (
          <p role={retour.ok ? "status" : "alert"} className={`flex items-center gap-2 text-meta ${retour.ok ? "text-encre-2" : "text-critique"}`}>
            {retour.ok ? <Check size={14} className="text-mineur" aria-hidden /> : <WarningCircle size={16} aria-hidden />} {retour.texte}
          </p>
        ) : null}
      </div>
    </form>
  );
};

export default CoutRevient;
