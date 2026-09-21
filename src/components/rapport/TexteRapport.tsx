"use client";

import { useState } from "react";
import { ArrowCounterClockwise, Check, WarningCircle } from "@phosphor-icons/react";
import { enregistrerTexte } from "@/app/admin/missions/[id]/(outil)/grilles-actions";

/**
 * Un texte du rapport. Tant que Sofia ne l'a pas relu, c'est la proposition de l'outil
 * (rédigée à partir de ses réponses) qui s'affiche, signalée comme telle. Le modifier ou
 * le valider en fait son texte.
 */
const TexteRapport = ({
  missionId,
  cle,
  titre,
  proposition,
  enregistre,
}: {
  missionId: string;
  cle: string;
  titre: string;
  proposition: string;
  enregistre: string | null;
}) => {
  const [texte, setTexte] = useState(enregistre ?? proposition);
  const [sauve, setSauve] = useState<string | null>(enregistre);
  const [etat, setEtat] = useState<"ok" | "erreur" | null>(null);
  const valide = sauve !== null && sauve === texte;

  const enregistrer = async (valeur: string) => {
    const r = await enregistrerTexte({ missionId, cle, texte: valeur });
    setEtat(r.ok ? "ok" : "erreur");
    if (r.ok) setSauve(valeur);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <label htmlFor={`texte-${cle}`} className="font-display text-t4 text-encre">{titre}</label>
        <span className={`flex items-center gap-1.5 text-meta ${valide ? "text-mineur" : "text-majeur"}`}>
          {valide ? <Check size={14} aria-hidden /> : null}
          {valide ? "Ton texte, enregistré" : sauve === null ? "Proposition de l’outil, à relire" : "Modifié, pas encore enregistré"}
        </span>
      </div>
      <textarea
        id={`texte-${cle}`}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        onBlur={() => texte !== sauve && sauve !== null && enregistrer(texte)}
        rows={Math.max(4, Math.ceil(texte.length / 95))}
        className={`w-full rounded-[5px] border px-4 py-3 text-corps leading-relaxed text-encre outline-none focus:border-vert ${valide ? "border-gris/60 bg-papier" : "border-majeur/40 bg-majeur-l/30"}`}
      />
      <div className="flex flex-wrap items-center gap-3">
        {!valide ? (
          <button type="button" onClick={() => enregistrer(texte)} className="min-h-11 rounded-[5px] bg-encre px-4 text-meta font-medium text-papier transition-colors hover:bg-vert">
            {sauve === null && texte === proposition ? "Valider ce texte" : "Enregistrer mon texte"}
          </button>
        ) : null}
        {texte !== proposition ? (
          <button type="button" onClick={() => setTexte(proposition)} className="flex min-h-11 items-center gap-1.5 text-meta text-encre-2 underline-offset-4 hover:underline">
            <ArrowCounterClockwise size={14} aria-hidden /> Revenir à la proposition
          </button>
        ) : null}
        {etat === "erreur" ? (
          <span className="flex items-center gap-1 text-meta text-critique"><WarningCircle size={16} aria-hidden /> Non enregistré, réessaie.</span>
        ) : null}
      </div>
    </div>
  );
};

export default TexteRapport;
