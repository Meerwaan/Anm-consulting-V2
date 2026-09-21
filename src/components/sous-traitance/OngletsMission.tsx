"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  { chemin: "sous-traitance", libelle: "Sous-traitance" },
  { chemin: "dracar", libelle: "Dracar Ultimate" },
  { chemin: "pieces", libelle: "Pièces" },
  { chemin: "rapport", libelle: "Rapport" },
] as const;

/** Onglets de la mission. Un onglet ne s'ajoute ici que quand sa partie existe. */
const OngletsMission = ({ missionId }: { missionId: string }) => {
  const chemin = usePathname();
  return (
    <nav aria-label="Parties de la mission" className="-mb-px flex gap-1 overflow-x-auto">
      {ONGLETS.map((o) => {
        const href = `/admin/missions/${missionId}/${o.chemin}`;
        const actif = chemin.startsWith(href);
        return (
          <Link
            key={o.chemin}
            href={href}
            aria-current={actif ? "page" : undefined}
            className={`flex min-h-12 shrink-0 items-center border-b-2 px-4 text-corps transition-colors ${
              actif ? "border-encre font-medium text-encre" : "border-transparent text-encre-2 hover:text-vert"
            }`}
          >
            {o.libelle}
          </Link>
        );
      })}
    </nav>
  );
};

export default OngletsMission;
