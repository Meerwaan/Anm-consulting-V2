import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import ListeAlertes from "@/components/sous-traitance/ListeAlertes";
import type { AlertesParSousTraitant as Groupe } from "@/lib/modules/analyse";

/** Les alertes d'un module, sous-traitant par sous-traitant, avec le lien vers son dossier. */
const AlertesParSousTraitant = ({ missionId, groupes, vide, constatsExistants }: { missionId: string; groupes: Groupe[]; vide: string; constatsExistants: string[] }) => {
  if (groupes.length === 0) return <p className="text-meta text-gris">Aucun sous-traitant saisi pour cette mission.</p>;
  return (
    <div className="flex flex-col gap-6">
      {groupes.map(({ dossier, alertes }) => (
        <div key={dossier.st.id} className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-corps font-medium text-encre">
              {dossier.st.raison_sociale}
              <span className="ml-2 text-note font-normal text-gris">rang {dossier.st.rang}</span>
            </h4>
            <Link href={`/admin/missions/${missionId}/sous-traitance/${dossier.st.id}`} className="flex min-h-11 items-center gap-1 text-meta text-vert underline-offset-4 hover:underline">
              Ouvrir le dossier <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
          <ListeAlertes alertes={alertes} vide={vide} missionId={missionId} constatsExistants={constatsExistants} />
        </div>
      ))}
    </div>
  );
};

export default AlertesParSousTraitant;
