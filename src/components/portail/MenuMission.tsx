"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle, Circle, CircleHalf, Receipt } from "@phosphor-icons/react";
import type { Avancement, CheminEtape } from "@/lib/modules/avancement";
import { ETAPES, GROUPES, etapeCourante } from "./etapes";

/**
 * Le menu d'une mission. Chaque étape dit où elle en est : cercle vide (à faire), demi-cercle
 * (en cours), coche (faite), avec le détail en toutes lettres. Deux formes : la barre complète,
 * et la colonne de numéros de l'iPad tenu droit (le bouton « Menu » ouvre alors la barre complète).
 */

export interface PropsMenu {
  missionId: string;
  sousTraitants: { id: string; nom: string; rang: number }[];
  avancement: Record<CheminEtape, Avancement>;
  /** Où en sont le contrat et les factures, en quelques mots. */
  facturation: string;
}

const LIBELLE_ETAT = { a_faire: "à faire", en_cours: "en cours", fait: "fait" } as const;

const Marque = ({ etat }: { etat: Avancement["etat"] }) =>
  etat === "fait" ? (
    <CheckCircle size={18} weight="fill" className="shrink-0 text-vert" aria-hidden />
  ) : etat === "en_cours" ? (
    <CircleHalf size={18} weight="fill" className="shrink-0 text-majeur" aria-hidden />
  ) : (
    <Circle size={18} className="shrink-0 text-gris/60" aria-hidden />
  );

export const MenuComplet = ({ missionId, sousTraitants, avancement, facturation }: PropsMenu) => {
  const chemin = usePathname();
  const racine = `/admin/missions/${missionId}`;
  const courante = etapeCourante(chemin, missionId);

  return (
    <nav aria-label="Étapes de la mission" className="flex flex-col gap-3">
      {GROUPES.map((g) => (
        <div key={g.titre} className="flex flex-col gap-0.5">
          <p className="etiquette px-2.5 pb-0.5">{g.titre}</p>
          <ul className="flex flex-col gap-0.5">
            {g.etapes.map((e) => {
              const actif = courante?.chemin === e.chemin;
              const a = avancement[e.chemin];
              return (
                <li key={e.chemin}>
                  <Link
                    href={`${racine}/${e.chemin}`}
                    aria-current={actif && chemin === `${racine}/${e.chemin}` ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-2.5 rounded-[5px] px-2.5 py-1 transition-colors ${
                      actif ? "bg-menthe text-vert" : "text-encre-2 hover:bg-fond hover:text-encre"
                    }`}
                  >
                    <span className="w-3.5 shrink-0 font-mono text-note text-gris tabular-nums">{e.n}</span>
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className={`text-meta ${actif ? "font-medium" : ""}`}>{e.libelle}</span>
                      <span className="truncate text-note text-gris">{a.detail}</span>
                    </span>
                    <Marque etat={a.etat} />
                    <span className="sr-only">, {LIBELLE_ETAT[a.etat]}</span>
                  </Link>
                  {e.chemin === "sous-traitance" && actif && sousTraitants.length ? (
                    <ul className="ml-[1.4rem] mt-0.5 flex flex-col border-l border-filet pl-1.5">
                      {sousTraitants.map((s) => {
                        const href = `${racine}/sous-traitance/${s.id}`;
                        const ici = chemin === href;
                        return (
                          <li key={s.id}>
                            <Link
                              href={href}
                              aria-current={ici ? "page" : undefined}
                              className={`flex min-h-10 items-center gap-2 rounded-[5px] px-2.5 text-meta transition-colors ${
                                ici ? "font-medium text-vert" : "text-encre-2 hover:bg-fond hover:text-encre"
                              }`}
                            >
                              <span className="min-w-0 flex-1 truncate">{s.nom}</span>
                              {s.rang > 1 ? <span className="text-note font-normal text-gris">rang {s.rang}</span> : null}
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
      <div className="flex flex-col gap-0.5 border-t border-filet pt-3">
        <p className="etiquette px-2.5 pb-0.5">Administratif</p>
        <Link
          href={`${racine}/contrat`}
          aria-current={chemin === `${racine}/contrat` ? "page" : undefined}
          className={`flex min-h-11 items-center gap-2.5 rounded-[5px] px-2.5 py-1 transition-colors ${
            chemin === `${racine}/contrat` ? "bg-menthe text-vert" : "text-encre-2 hover:bg-fond hover:text-encre"
          }`}
        >
          <Receipt size={16} className="w-3.5 shrink-0 text-gris" aria-hidden />
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className={`text-meta ${chemin === `${racine}/contrat` ? "font-medium" : ""}`}>Contrat et factures</span>
            <span className="truncate text-note text-gris">{facturation}</span>
          </span>
        </Link>
      </div>
    </nav>
  );
};

/** La colonne de numéros : le numéro de l'étape, et sa marque d'avancement en dessous. */
export const MenuRail = ({ missionId, avancement }: Pick<PropsMenu, "missionId" | "avancement">) => {
  const chemin = usePathname();
  const courante = etapeCourante(chemin, missionId);
  return (
    <nav aria-label="Étapes de la mission">
      <ul className="flex flex-col gap-1">
        {ETAPES.map((e) => {
          const actif = courante?.chemin === e.chemin;
          const a = avancement[e.chemin];
          return (
            <li key={e.chemin}>
              <Link
                href={`/admin/missions/${missionId}/${e.chemin}`}
                aria-label={`${e.n}. ${e.libelle}, ${LIBELLE_ETAT[a.etat]}`}
                className={`flex h-14 w-11 flex-col items-center justify-center gap-1 rounded-[5px] font-mono text-meta tabular-nums transition-colors ${
                  actif ? "bg-menthe font-medium text-vert" : "text-encre-2 hover:bg-fond hover:text-encre"
                }`}
              >
                {e.n}
                <Marque etat={a.etat} />
              </Link>
            </li>
          );
        })}
        <li className="mt-1 border-t border-filet pt-1">
          <Link
            href={`/admin/missions/${missionId}/contrat`}
            aria-label="Contrat et factures"
            className={`flex h-14 w-11 items-center justify-center rounded-[5px] transition-colors ${
              chemin === `/admin/missions/${missionId}/contrat` ? "bg-menthe text-vert" : "text-encre-2 hover:bg-fond hover:text-encre"
            }`}
          >
            <Receipt size={20} aria-hidden />
          </Link>
        </li>
      </ul>
    </nav>
  );
};
