"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "@phosphor-icons/react";
import { NATURE_PAR_ALERTE } from "@/content/grilles";
import { enregistrerNonConformite } from "@/app/admin/missions/[id]/(outil)/grilles-actions";

/**
 * Transforme une alerte calculée en action corrective (objectif de l'audit, §5 : « chaque
 * anomalie est transformée en constat → risque → action… »). Le constat reprend le texte de
 * l'alerte ; la nature est proposée d'après le type d'alerte, modifiable ensuite.
 */
const CreerAction = ({
  missionId,
  sousTraitantId,
  code,
  texte,
  dejaCreee,
}: {
  missionId: string;
  sousTraitantId?: string;
  code: string;
  texte: string;
  dejaCreee: boolean;
}) => {
  const [etat, setEtat] = useState<"repos" | "cours" | "creee" | "erreur">(dejaCreee ? "creee" : "repos");
  if (etat === "creee") {
    return (
      <Link href={`/admin/missions/${missionId}/rapport#actions`} className="flex min-h-11 shrink-0 items-center gap-1 text-meta text-vert underline-offset-4 hover:underline">
        Action créée <ArrowRight size={14} aria-hidden />
      </Link>
    );
  }
  return (
    <button
      type="button"
      disabled={etat === "cours"}
      onClick={async () => {
        setEtat("cours");
        const r = await enregistrerNonConformite({
          missionId,
          champs: { nature: NATURE_PAR_ALERTE[code] ?? "autre", constat: texte, sous_traitant_id: sousTraitantId ?? "" },
        });
        setEtat(r.ok ? "creee" : "erreur");
      }}
      className="flex min-h-11 shrink-0 items-center gap-1 rounded-[5px] border border-filet px-3 text-meta text-encre-2 transition-colors hover:border-vert hover:text-vert disabled:opacity-60"
    >
      <Plus size={14} aria-hidden />
      {etat === "erreur" ? "Réessayer" : "Créer une action"}
    </button>
  );
};

export default CreerAction;
