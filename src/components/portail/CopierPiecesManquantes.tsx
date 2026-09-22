"use client";

import { useRef, useState } from "react";
import { Copy } from "@phosphor-icons/react";
import { demanderPiecesManquantes } from "@/app/admin/actions";

/**
 * Aucun email ne part de l'outil (pas de domaine d'envoi) : le bouton ne le prétend pas.
 * Il copie la liste, prête à coller dans le mail de la consultante, et note la date de
 * la demande sur chaque pièce — c'est cette date qui servira aux relances.
 */
const CopierPiecesManquantes = ({ missionId, ordre, noms }: { missionId: string; ordre: string; noms: string[] }) => {
  const [etat, setEtat] = useState<"repos" | "copie" | "manuel">("repos");
  const formulaire = useRef<HTMLFormElement>(null);
  const texte = `Pièces à nous transmettre :\n${noms.map((n) => `– ${n}`).join("\n")}`;

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte);
      setEtat("copie");
    } catch {
      setEtat("manuel");
    }
    formulaire.current?.requestSubmit();
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <form ref={formulaire} action={demanderPiecesManquantes}>
        <input type="hidden" name="missionId" value={missionId} />
        <input type="hidden" name="ordre" value={ordre} />
      </form>
      <button
        type="button"
        onClick={copier}
        className="flex min-h-12 items-center gap-2 rounded-[5px] border border-encre px-5 text-meta font-medium text-encre transition-colors hover:bg-encre hover:text-papier"
      >
        <Copy size={18} aria-hidden />
        Copier la liste des {noms.length} pièces manquantes
      </button>
      {etat === "copie" ? (
        <p role="status" className="text-meta text-vert">
          Liste copiée. Colle-la dans ton email au client ; la date de la demande est notée sur chaque pièce.
        </p>
      ) : null}
      {etat === "manuel" ? (
        <label className="flex w-full flex-col gap-1">
          <span className="text-meta text-encre-2">La copie automatique a été refusée : sélectionne le texte ci-dessous.</span>
          <textarea readOnly value={texte} rows={Math.min(12, noms.length + 1)} className="w-full rounded-[5px] border border-gris/60 bg-papier p-3 text-meta text-encre" onFocus={(e) => e.currentTarget.select()} />
        </label>
      ) : null}
    </div>
  );
};

export default CopierPiecesManquantes;
