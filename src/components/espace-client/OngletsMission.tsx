"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Les trois onglets d'une mission côté client, avec un compteur quand il y a quelque chose à faire. */
const OngletsMission = ({ missionId, aDeposer, nonLus }: { missionId: string; aDeposer: number; nonLus: number }) => {
  const chemin = usePathname();
  const racine = `/app/missions/${missionId}`;
  const onglets = [
    { href: racine, libelle: "Suivi", compteur: 0, etiquette: "" },
    { href: `${racine}/pieces`, libelle: "Pièces", compteur: aDeposer, etiquette: "à déposer" },
    { href: `${racine}/echanges`, libelle: "Échanges", compteur: nonLus, etiquette: "non lus" },
  ];

  return (
    <nav aria-label="Mission" className="-mx-4 overflow-x-auto border-b border-filet px-4 md:mx-0 md:px-0">
      <ul className="flex gap-1">
        {onglets.map((o) => {
          const actif = chemin === o.href;
          return (
            <li key={o.href}>
              <Link
                href={o.href}
                aria-current={actif ? "page" : undefined}
                className={`-mb-px flex min-h-12 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-corps transition-colors ${
                  actif ? "border-vert font-medium text-vert" : "border-transparent text-encre-2 hover:text-encre"
                }`}
              >
                {o.libelle}
                {o.compteur ? (
                  <span className="rounded-full bg-majeur-l px-2 text-note font-medium tabular-nums text-majeur">
                    {o.compteur}
                    <span className="sr-only"> {o.etiquette}</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default OngletsMission;
