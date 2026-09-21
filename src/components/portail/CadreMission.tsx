"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, List, X } from "@phosphor-icons/react";
import { MenuComplet, MenuRail, type PropsMenu } from "./MenuMission";
import { ETAPES, etapeCourante } from "./etapes";

/**
 * Le cadre d'une mission : barre latérale à gauche, travail à droite, étape suivante en bas.
 * iPad couché : la barre complète. iPad tenu droit : une colonne de numéros, et un bouton
 * « Menu » qui ouvre la barre complète par-dessus la page, pour laisser la place aux tableaux.
 */
const CadreMission = ({ entete, children, ...menu }: PropsMenu & { entete: React.ReactNode; children: React.ReactNode }) => {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  useEffect(() => {
    if (!ouvert) return;
    const fermer = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    window.addEventListener("keydown", fermer);
    return () => window.removeEventListener("keydown", fermer);
  }, [ouvert]);

  const courante = etapeCourante(chemin, menu.missionId);
  const i = courante ? ETAPES.indexOf(courante) : -1;
  const precedente = i > 0 ? ETAPES[i - 1] : null;
  const suivante = i >= 0 && i < ETAPES.length - 1 ? ETAPES[i + 1] : null;
  const racine = `/admin/missions/${menu.missionId}`;

  return (
    <div className="grid grid-cols-[2.875rem_minmax(0,1fr)] items-start gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      {/* iPad couché : la barre complète */}
      <aside className="sticky top-4 hidden max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-y-auto border-r border-filet pr-3 lg:flex">
        {entete}
        <MenuComplet {...menu} />
      </aside>

      {/* iPad tenu droit : la colonne de numéros */}
      <aside className="sticky top-4 flex flex-col gap-2 border-r border-filet pr-0.5 lg:hidden">
        <button
          type="button"
          onClick={() => setOuvert(true)}
          aria-expanded={ouvert}
          className="flex h-14 w-11 flex-col items-center justify-center gap-0.5 rounded-[5px] bg-encre text-papier"
        >
          <List size={20} aria-hidden />
          <span className="text-[0.625rem] leading-none">Menu</span>
        </button>
        <MenuRail missionId={menu.missionId} avancement={menu.avancement} />
      </aside>

      {ouvert ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu de la mission">
          <button type="button" aria-label="Fermer le menu" onClick={() => setOuvert(false)} className="absolute inset-0 bg-encre/30" />
          {/* Un lien touché ferme le menu : la page change dessous. */}
          <div onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOuvert(false); }} className="absolute inset-y-0 left-0 flex w-[19rem] max-w-[85vw] flex-col gap-4 overflow-y-auto border-r border-filet bg-papier p-5 shadow-[0_0_40px_rgba(14,31,28,0.18)]">
            <button type="button" onClick={() => setOuvert(false)} className="flex min-h-11 w-fit items-center gap-2 text-meta text-encre-2">
              <X size={18} aria-hidden /> Fermer
            </button>
            {entete}
            <MenuComplet {...menu} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-16">
        {children}
        {courante ? (
          <nav aria-label="Étape précédente et suivante" className="flex flex-wrap items-stretch justify-between gap-3 border-t border-filet pt-6">
            {precedente ? (
              <Link href={`${racine}/${precedente.chemin}`} className="flex min-h-14 items-center gap-3 rounded-[5px] border border-filet px-4 text-meta text-encre-2 transition-colors hover:border-gris hover:text-encre">
                <ArrowLeft size={18} aria-hidden />
                <span className="flex flex-col leading-tight">
                  <span className="text-note text-gris">Étape {precedente.n}</span>
                  {precedente.libelle}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {suivante ? (
              <Link href={`${racine}/${suivante.chemin}`} className="flex min-h-14 items-center gap-3 rounded-[5px] bg-encre px-5 text-meta font-medium text-papier transition-colors hover:bg-vert">
                <span className="flex flex-col leading-tight">
                  <span className="text-note font-normal text-papier/70">Étape suivante · {suivante.n}</span>
                  {suivante.libelle}
                </span>
                <ArrowRight size={18} aria-hidden />
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </div>
  );
};

export default CadreMission;
