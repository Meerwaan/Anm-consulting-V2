"use client";

import { useEffect, useState } from "react";
import { ArrowSquareOut, Check, Copy } from "@phosphor-icons/react";
import { boutonSecondaire } from "./styles";

/**
 * Le lien personnel du client vers son devis : à copier pour le transmettre autrement que par
 * l'email de l'outil (SMS, messagerie), ou à ouvrir pour voir ce qu'il voit.
 */
const LienDevis = ({ url }: { url: string }) => {
  const [copie, setCopie] = useState(false);
  useEffect(() => {
    if (!copie) return;
    const t = setTimeout(() => setCopie(false), 2500);
    return () => clearTimeout(t);
  }, [copie]);

  return (
    <div className="flex max-w-3xl flex-col gap-2">
      <label htmlFor="lien-devis" className="text-meta font-medium text-encre">
        Le lien du client
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="lien-devis"
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="h-12 w-full min-w-0 rounded-[5px] border border-filet bg-fond px-3 font-mono text-note text-encre outline-none focus:border-vert"
        />
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopie(true);
            } catch {
              setCopie(false);
            }
          }}
          className={`${boutonSecondaire} shrink-0 whitespace-nowrap`}
        >
          {copie ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
          <span aria-live="polite">{copie ? "Copié" : "Copier le lien"}</span>
        </button>
        <a href={url} target="_blank" rel="noopener" className={`${boutonSecondaire} shrink-0 whitespace-nowrap`}>
          <ArrowSquareOut size={18} aria-hidden /> Voir sa page
        </a>
      </div>
      <p className="text-note text-encre-2">
        Il y relit le devis, télécharge le PDF et donne son accord. Le lien est personnel : qui l’ouvre peut accepter le devis au nom du client.
      </p>
    </div>
  );
};

export default LienDevis;
