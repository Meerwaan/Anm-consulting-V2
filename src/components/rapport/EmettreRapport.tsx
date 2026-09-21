"use client";

import { useState, useTransition } from "react";
import { emettreRapport } from "@/app/admin/missions/[id]/(outil)/rapport/actions";

/** Émet une version : le PDF est archivé dans le dossier de la mission, daté et numéroté. */
const EmettreRapport = ({ missionId, prochaine, incomplet }: { missionId: string; prochaine: string; incomplet: boolean }) => {
  const [retour, setRetour] = useState<{ ok: boolean; texte: string } | null>(null);
  const [enCours, demarrer] = useTransition();
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={enCours}
        onClick={() =>
          demarrer(async () => {
            const r = await emettreRapport(missionId);
            setRetour(r.ok ? { ok: true, texte: `Version ${r.version} émise et archivée.` } : { ok: false, texte: r.erreur });
          })
        }
        className="min-h-12 rounded-[5px] border border-encre px-5 text-meta font-medium text-encre transition-colors hover:bg-encre hover:text-papier disabled:opacity-60"
      >
        {enCours ? "Émission…" : `Émettre la version ${prochaine}${incomplet ? " (de travail)" : ""}`}
      </button>
      {retour ? <p role={retour.ok ? "status" : "alert"} className={`text-meta ${retour.ok ? "text-vert" : "text-critique"}`}>{retour.texte}</p> : null}
    </div>
  );
};

export default EmettreRapport;
