"use client";

import { useState, useTransition } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { publierRapport } from "@/app/admin/missions/[id]/(outil)/rapport/publication-actions";

/** « Rendre visible au client » pour une version émise du rapport. */
const PublierRapport = ({ missionId, rapportId, visible }: { missionId: string; rapportId: string; visible: boolean }) => {
  const [etat, setEtat] = useState(visible);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const basculer = () =>
    demarrer(async () => {
      setErreur(null);
      const suivant = !etat;
      setEtat(suivant);
      const r = await publierRapport(missionId, rapportId, suivant);
      if (!r.ok) {
        setEtat(!suivant);
        setErreur(r.erreur);
      }
    });

  return (
    <span className="flex flex-col items-end gap-1">
      {etat ? (
        <span className="flex flex-wrap items-center justify-end gap-x-1">
          <span className="flex items-center gap-2 text-meta font-medium text-vert">
            <Eye size={18} aria-hidden /> Visible par le client
          </span>
          <button
            type="button"
            disabled={enCours}
            onClick={basculer}
            className="flex min-h-12 items-center gap-1.5 px-3 text-meta text-encre-2 underline-offset-4 hover:text-critique hover:underline disabled:cursor-wait"
          >
            <EyeSlash size={16} aria-hidden /> Masquer
          </button>
        </span>
      ) : (
        <button
          type="button"
          disabled={enCours}
          onClick={basculer}
          className="flex min-h-12 items-center gap-2 whitespace-nowrap rounded-[5px] border border-filet px-3 text-meta text-encre-2 transition-colors hover:border-gris hover:text-encre disabled:cursor-wait"
        >
          <Eye size={18} aria-hidden /> Rendre visible au client
        </button>
      )}
      {erreur ? (
        <span role="alert" className="text-note text-critique">
          {erreur}
        </span>
      ) : null}
    </span>
  );
};

export default PublierRapport;
