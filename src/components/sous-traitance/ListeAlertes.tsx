import type { Alerte } from "@/lib/sous-traitance/calculs";

/**
 * Les alertes calculées. Chacune décrit un écart chiffré et ce qu'il faut vérifier,
 * jamais une qualification : le système calcule, la consultante qualifie.
 * Le niveau se lit sans couleur : le mot est écrit.
 */
const ListeAlertes = ({ alertes, vide }: { alertes: Alerte[]; vide: string }) => {
  if (alertes.length === 0) {
    return <p className="rounded-[5px] border border-mineur/30 bg-mineur-l/40 px-4 py-3 text-meta text-encre">{vide}</p>;
  }
  const triees = [...alertes].sort((a, b) => (a.niveau === b.niveau ? 0 : a.niveau === "alerte" ? -1 : 1));
  return (
    <ul className="flex flex-col divide-y divide-filet border-y border-filet">
      {triees.map((a, i) => (
        <li key={`${a.code}-${i}`} className="flex gap-3 py-3">
          <span className={`mt-[7px] size-2 shrink-0 rounded-full ${a.niveau === "alerte" ? "bg-critique" : "bg-majeur"}`} aria-hidden />
          <p className="text-meta text-encre">
            <span className={`font-medium ${a.niveau === "alerte" ? "text-critique" : "text-majeur"}`}>
              {a.niveau === "alerte" ? "Alerte" : "À vérifier"}
            </span>
            {" · "}
            {a.texte}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default ListeAlertes;
