import type { Alerte } from "@/lib/sous-traitance/calculs";
import CreerAction from "@/components/grilles/CreerAction";

/**
 * Les alertes calculées. Chacune décrit un écart chiffré et ce qu'il faut vérifier,
 * jamais une qualification : le système calcule, la consultante qualifie.
 * Le niveau se lit sans couleur : le mot est écrit. Chaque alerte peut devenir une action.
 */
const ListeAlertes = ({
  alertes,
  vide,
  missionId,
  sousTraitantId,
  constatsExistants = [],
}: {
  alertes: Alerte[];
  vide: string;
  /** Avec une mission, chaque alerte propose « Créer une action ». */
  missionId?: string;
  sousTraitantId?: string;
  constatsExistants?: string[];
}) => {
  if (alertes.length === 0) {
    return <p className="rounded-[5px] border border-mineur/30 bg-mineur-l/40 px-4 py-3 text-meta text-encre">{vide}</p>;
  }
  const triees = [...alertes].sort((a, b) => (a.niveau === b.niveau ? 0 : a.niveau === "alerte" ? -1 : 1));
  const existants = new Set(constatsExistants);
  return (
    <ul className="flex flex-col divide-y divide-filet border-y border-filet">
      {triees.map((a, i) => (
        <li key={`${a.code}-${i}`} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 py-3">
          <p className="flex min-w-0 flex-1 basis-72 gap-3 text-meta text-encre">
            <span className={`mt-[7px] size-2 shrink-0 rounded-full ${a.niveau === "alerte" ? "bg-critique" : "bg-majeur"}`} aria-hidden />
            <span>
              <span className={`font-medium ${a.niveau === "alerte" ? "text-critique" : "text-majeur"}`}>
                {a.niveau === "alerte" ? "Alerte" : "À vérifier"}
              </span>
              {" · "}
              {a.texte}
            </span>
          </p>
          {missionId ? (
            <CreerAction missionId={missionId} sousTraitantId={a.sousTraitantId ?? sousTraitantId} code={a.code} texte={a.texte} dejaCreee={existants.has(a.texte)} />
          ) : null}
        </li>
      ))}
    </ul>
  );
};

export default ListeAlertes;
