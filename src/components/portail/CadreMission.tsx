"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SidebarSimple } from "@phosphor-icons/react";

/**
 * Le cadre d'une mission : barre latérale à gauche, travail à droite. La barre peut se réduire à
 * une colonne de numéros, pour laisser la place aux tableaux sur un iPad tenu en portrait.
 * Le choix est retenu sur l'appareil.
 */
const Reduit = createContext(false);
export const useMenuReduit = () => useContext(Reduit);

const CLE = "anm-menu-reduit";

const CadreMission = ({ entete, menu, children }: { entete: React.ReactNode; menu: React.ReactNode; children: React.ReactNode }) => {
  const [reduit, setReduit] = useState(false);
  useEffect(() => {
    try {
      setReduit(localStorage.getItem(CLE) === "1");
    } catch {}
  }, []);
  const basculer = () => {
    setReduit((r) => {
      try {
        localStorage.setItem(CLE, r ? "0" : "1");
      } catch {}
      return !r;
    });
  };

  return (
    <Reduit.Provider value={reduit}>
      <div
        className={`flex flex-col gap-8 md:grid md:items-start ${
          reduit ? "md:grid-cols-[3.25rem_minmax(0,1fr)] md:gap-6" : "md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10"
        }`}
      >
        <aside className="flex flex-col gap-6 md:sticky md:top-6 md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto md:border-r md:border-filet md:pr-3">
          <button
            type="button"
            onClick={basculer}
            aria-expanded={!reduit}
            className="hidden min-h-11 w-fit items-center gap-2 rounded-[5px] px-2 text-meta text-encre-2 transition-colors hover:bg-fond hover:text-encre md:flex"
          >
            <SidebarSimple size={20} aria-hidden />
            {reduit ? <span className="sr-only">Afficher le menu</span> : <span>Réduire le menu</span>}
          </button>
          {reduit ? null : entete}
          {menu}
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Reduit.Provider>
  );
};

export default CadreMission;
