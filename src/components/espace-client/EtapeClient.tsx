"use client";

import { useState, useTransition } from "react";
import { changerEtapeClient } from "@/app/admin/missions/[id]/acces-actions";
import { ETAPES_CLIENT } from "@/content/espace-client";
import type { StatutMission } from "@/lib/types";

/**
 * L'étape que le client voit dans son espace. Elle ne se déduit pas de l'outil (qui suit la
 * méthode) : la consultante la fait avancer quand elle veut que le client le sache.
 */
const EtapeClient = ({ missionId, statut }: { missionId: string; statut: StatutMission }) => {
  const [courant, setCourant] = useState(statut);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const choisir = (s: StatutMission) =>
    demarrer(async () => {
      setErreur(null);
      const precedent = courant;
      setCourant(s);
      const r = await changerEtapeClient(missionId, s);
      if (!r.ok) {
        setCourant(precedent);
        setErreur(r.erreur);
      }
    });

  const rang = ETAPES_CLIENT.findIndex((e) => e.statut === courant);

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col divide-y divide-filet border-y border-filet" aria-label="Étape affichée au client">
        {ETAPES_CLIENT.map((e, i) => {
          const actif = e.statut === courant;
          return (
            <li key={e.statut}>
              <button
                type="button"
                disabled={enCours}
                aria-pressed={actif}
                onClick={() => (actif ? undefined : choisir(e.statut))}
                className={`flex min-h-12 w-full items-center gap-3 px-2 py-2 text-left transition-colors disabled:cursor-wait ${
                  actif ? "bg-menthe text-vert" : "text-encre-2 hover:bg-fond hover:text-encre"
                }`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-note tabular-nums ${
                    i <= rang ? "bg-vert text-papier" : "border border-filet text-gris"
                  }`}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className={`text-meta ${actif ? "font-medium" : ""}`}>{e.titre}</span>
                  <span className="text-note text-gris">{e.texte}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {erreur ? (
        <p role="alert" className="text-meta text-critique">
          {erreur}
        </p>
      ) : null}
    </div>
  );
};

export default EtapeClient;
