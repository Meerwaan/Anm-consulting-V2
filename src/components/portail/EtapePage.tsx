import { ETAPES, GROUPES } from "./etapes";
import type { CheminEtape } from "@/lib/modules/avancement";

/** Le rappel de l'étape en tête de chaque page, dans les mêmes mots que la barre latérale. */
const EtapePage = ({ chemin, sous }: { chemin: CheminEtape; sous?: string }) => {
  const e = ETAPES.find((x) => x.chemin === chemin);
  const groupe = GROUPES.find((g) => g.etapes.some((x) => x.chemin === chemin));
  if (!e || !groupe) return null;
  return (
    <p className="etiquette">
      Étape {e.n} · {groupe.titre}
      {sous ? ` · ${sous}` : ""}
    </p>
  );
};

export default EtapePage;
