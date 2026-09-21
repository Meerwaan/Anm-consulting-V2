import type { BilanGrille as Bilan } from "@/lib/modules/analyse";

/** Le compte des réponses d'une grille, en tête de module. */
const BilanGrille = ({ b }: { b: Bilan }) => (
  <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-filet py-5 sm:grid-cols-4">
    {[
      ["Points contrôlés", `${b.controles} / ${b.total}`, "text-encre"],
      ["Conformes", String(b.conformes), "text-encre"],
      ["Non-conformités", String(b.nonConformes), b.nonConformes ? "text-critique" : "text-encre"],
      ["À vérifier", String(b.aVerifier), b.aVerifier ? "text-majeur" : "text-encre"],
    ].map(([t, v, c]) => (
      <div key={t} className="flex flex-col gap-1">
        <dt className="text-note text-gris">{t}</dt>
        <dd className={`font-display text-t4 tabular-nums ${c}`}>{v}</dd>
      </div>
    ))}
  </dl>
);

export default BilanGrille;
