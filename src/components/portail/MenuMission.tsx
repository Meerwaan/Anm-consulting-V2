"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMenuReduit } from "./CadreMission";

/**
 * La barre latérale d'une mission (demande de Sofia du 21/09/2026 : une barre à gauche plutôt
 * qu'un menu en haut). Les étapes suivent l'ordre d'un audit : réunir les pièces, saisir les
 * données, contrôler (DGFiP, URSSAF, CNAPS, dans l'ordre de sa lettre), puis conclure.
 */

interface Etape {
  n: number;
  chemin: string;
  libelle: string;
  detail?: string;
  /** Actif seulement sur ce chemin exact (la synthèse de la sous-traitance, pas ses sous-pages). */
  exact?: boolean;
}

const GROUPES: { titre: string; etapes: Etape[] }[] = [
  { titre: "Préparer", etapes: [{ n: 1, chemin: "pieces", libelle: "Pièces justificatives" }] },
  {
    titre: "Saisir",
    etapes: [
      { n: 2, chemin: "sous-traitance/heures", libelle: "Heures de l’entreprise", detail: "Vendues et payées" },
      { n: 3, chemin: "sous-traitance", libelle: "Sous-traitance", exact: true },
    ],
  },
  {
    titre: "Contrôler",
    etapes: [
      { n: 4, chemin: "dgfip", libelle: "DGFiP", detail: "Factures" },
      { n: 5, chemin: "urssaf", libelle: "URSSAF", detail: "Travail illégal, salariés" },
      { n: 6, chemin: "cnaps", libelle: "CNAPS", detail: "Dracar Ultimate" },
    ],
  },
  {
    titre: "Conclure",
    etapes: [
      { n: 7, chemin: "actions", libelle: "Plan d’actions" },
      { n: 8, chemin: "rapport", libelle: "Rapport" },
    ],
  },
];

const lien = (actif: boolean) =>
  `flex min-h-11 items-center gap-3 rounded-[5px] px-3 py-2 text-meta transition-colors ${
    actif ? "bg-menthe font-medium text-vert" : "text-encre-2 hover:bg-fond hover:text-encre"
  }`;

const MenuMission = ({
  missionId,
  sousTraitants,
  actionsOuvertes,
}: {
  missionId: string;
  sousTraitants: { id: string; nom: string; rang: number }[];
  actionsOuvertes: number;
}) => {
  const chemin = usePathname();
  const reduit = useMenuReduit();
  const racine = `/admin/missions/${missionId}`;
  const estActif = (e: Etape) => {
    const href = `${racine}/${e.chemin}`;
    if (e.chemin === "sous-traitance") return chemin === href || (chemin.startsWith(`${href}/`) && !chemin.startsWith(`${href}/heures`));
    return chemin === href || chemin.startsWith(`${href}/`);
  };

  if (reduit) {
    return (
      <nav aria-label="Étapes de la mission">
        <ul className="flex flex-col gap-1">
          {GROUPES.flatMap((g) => g.etapes).map((e) => {
            const actif = estActif(e);
            return (
              <li key={e.chemin}>
                <Link
                  href={`${racine}/${e.chemin}`}
                  aria-current={actif ? "page" : undefined}
                  aria-label={`${e.n}. ${e.libelle}`}
                  title={e.libelle}
                  className={`flex size-11 items-center justify-center rounded-[5px] font-mono text-meta tabular-nums transition-colors ${
                    actif ? "bg-menthe font-medium text-vert" : "text-encre-2 hover:bg-fond hover:text-encre"
                  }`}
                >
                  {e.n}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Étapes de la mission" className="flex flex-col gap-5">
      {GROUPES.map((g) => (
        <div key={g.titre} className="flex flex-col gap-1">
          <p className="etiquette px-3">{g.titre}</p>
          <ul className="flex flex-col gap-0.5">
            {g.etapes.map((e) => {
              const actif = estActif(e);
              return (
                <li key={e.chemin}>
                  <Link href={`${racine}/${e.chemin}`} aria-current={actif ? "page" : undefined} className={lien(actif)}>
                    <span className="w-4 shrink-0 font-mono text-note text-gris tabular-nums">{e.n}</span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span>{e.libelle}</span>
                      {e.detail ? <span className="text-note font-normal text-gris">{e.detail}</span> : null}
                    </span>
                    {e.chemin === "actions" && actionsOuvertes ? (
                      <span className="rounded-[4px] bg-critique px-1.5 py-0.5 text-note font-medium text-papier tabular-nums" title="Actions ouvertes">
                        {actionsOuvertes}
                      </span>
                    ) : null}
                  </Link>
                  {e.chemin === "sous-traitance" && sousTraitants.length ? (
                    <ul className="ml-7 mt-0.5 flex flex-col gap-0.5 border-l border-filet pl-2">
                      {sousTraitants.map((s) => {
                        const href = `${racine}/sous-traitance/${s.id}`;
                        const ici = chemin === href;
                        return (
                          <li key={s.id}>
                            <Link href={href} aria-current={ici ? "page" : undefined} className={`${lien(ici)} min-h-10 py-1.5`}>
                              <span className="min-w-0 flex-1 truncate">{s.nom}</span>
                              {s.rang > 1 ? <span className="text-note text-gris">rang {s.rang}</span> : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default MenuMission;
