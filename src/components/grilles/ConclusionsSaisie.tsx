"use client";

import { useState } from "react";
import { Check, WarningCircle } from "@phosphor-icons/react";
import type { CodeGrille, Conclusion } from "@/content/grilles";
import type { Reponse, ValeurConclusion } from "@/lib/grilles/lecture";
import { enregistrerConclusion, enregistrerReponse } from "@/app/admin/missions/[id]/(outil)/grilles-actions";

/**
 * Les conclusions d'une grille : un choix parmi ceux de Sofia, plusieurs cases, ou un texte.
 * Un choix s'enregistre au toucher, un texte quand on quitte le champ.
 */

const Etat = ({ etat }: { etat: "ok" | "erreur" | null }) =>
  etat === "ok" ? (
    <Check size={14} className="text-mineur" aria-label="Enregistré" />
  ) : etat === "erreur" ? (
    <WarningCircle size={16} className="text-critique" aria-label="Non enregistré" />
  ) : null;

const Choix = ({ missionId, grille, cible, c, initiale }: { missionId: string; grille: CodeGrille; cible: string; c: Conclusion; initiale?: ValeurConclusion }) => {
  const [valeur, setValeur] = useState(initiale?.choix ?? null);
  const [etat, setEtat] = useState<"ok" | "erreur" | null>(null);
  const choisir = async (v: string) => {
    const nouvelle = valeur === v ? null : v;
    const precedente = valeur;
    setValeur(nouvelle);
    const r = await enregistrerConclusion({ missionId, grille, cible, code: c.code, choix: nouvelle });
    if (!r.ok) setValeur(precedente);
    setEtat(r.ok ? "ok" : "erreur");
  };
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="flex items-center gap-2 text-corps font-medium text-encre">
        {c.titre} <Etat etat={etat} />
      </legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={c.titre}>
        {(c.choix ?? []).map((x) => (
          <button
            key={x}
            type="button"
            role="radio"
            aria-checked={valeur === x}
            onClick={() => choisir(x)}
            className={`min-h-11 rounded-[5px] border px-4 text-left text-meta transition-colors ${
              valeur === x ? "border-encre bg-encre font-medium text-papier" : "border-filet bg-papier text-encre hover:border-gris"
            }`}
          >
            {x}
          </button>
        ))}
      </div>
      <p className="text-note text-gris">{c.source}</p>
    </fieldset>
  );
};

const Multi = ({ missionId, grille, cible, c, reponses }: { missionId: string; grille: CodeGrille; cible: string; c: Conclusion; reponses: Record<string, Reponse> }) => {
  const [coches, setCoches] = useState<Record<number, boolean>>(() =>
    Object.fromEntries((c.choix ?? []).map((_, i) => [i, reponses[`${grille}|${cible}|${c.code}.${i}`]?.reponse === "oui"])),
  );
  const [etat, setEtat] = useState<"ok" | "erreur" | null>(null);
  const basculer = async (i: number) => {
    const v = !coches[i];
    setCoches((x) => ({ ...x, [i]: v }));
    const r = await enregistrerReponse({ missionId, grille, cible, item: `${c.code}.${i}`, reponse: v ? "oui" : null });
    if (!r.ok) setCoches((x) => ({ ...x, [i]: !v }));
    setEtat(r.ok ? "ok" : "erreur");
  };
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="flex items-center gap-2 text-corps font-medium text-encre">
        {c.titre} <Etat etat={etat} />
      </legend>
      <div className="flex flex-wrap gap-2">
        {(c.choix ?? []).map((x, i) => (
          <button
            key={x}
            type="button"
            role="checkbox"
            aria-checked={coches[i]}
            onClick={() => basculer(i)}
            className={`flex min-h-11 items-center gap-2 rounded-[5px] border px-4 text-meta transition-colors ${
              coches[i] ? "border-vert bg-menthe-2 font-medium text-vert" : "border-filet bg-papier text-encre hover:border-gris"
            }`}
          >
            {coches[i] ? <Check size={14} aria-hidden /> : null}
            {x}
          </button>
        ))}
      </div>
      <p className="text-note text-gris">{c.source}</p>
    </fieldset>
  );
};

const Texte = ({ missionId, grille, cible, c, initiale }: { missionId: string; grille: CodeGrille; cible: string; c: Conclusion; initiale?: ValeurConclusion }) => {
  const [texte, setTexte] = useState(initiale?.synthese ?? "");
  const [enregistre, setEnregistre] = useState(initiale?.synthese ?? "");
  const [etat, setEtat] = useState<"ok" | "erreur" | null>(null);
  const id = `conclusion-${c.code}-${cible}`;
  const enregistrer = async () => {
    if (texte === enregistre) return;
    const r = await enregistrerConclusion({ missionId, grille, cible, code: c.code, synthese: texte });
    if (r.ok) setEnregistre(texte);
    setEtat(r.ok ? "ok" : "erreur");
  };
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-center gap-2 text-corps font-medium text-encre">
        {c.titre} <Etat etat={etat} />
      </label>
      {c.aide ? <p className="text-meta text-encre-2">{c.aide}</p> : null}
      <textarea
        id={id}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        onBlur={enregistrer}
        rows={4}
        className="w-full rounded-[5px] border border-gris/60 bg-papier px-3 py-2.5 text-corps text-encre outline-none focus:border-vert"
      />
      <p className="text-note text-gris">{c.source}</p>
    </div>
  );
};

interface Props {
  missionId: string;
  grille: CodeGrille;
  cible: string;
  conclusions: Conclusion[];
  valeurs: Record<string, ValeurConclusion>;
  reponses: Record<string, Reponse>;
}

const ConclusionsSaisie = ({ missionId, grille, cible, conclusions, valeurs, reponses }: Props) => (
  <div className="flex flex-col gap-8">
    {conclusions.map((c) =>
      c.type === "choix" ? (
        <Choix key={c.code} missionId={missionId} grille={grille} cible={cible} c={c} initiale={valeurs[`${c.code}|${cible}`]} />
      ) : c.type === "multi" ? (
        <Multi key={c.code} missionId={missionId} grille={grille} cible={cible} c={c} reponses={reponses} />
      ) : (
        <Texte key={c.code} missionId={missionId} grille={grille} cible={cible} c={c} initiale={valeurs[`${c.code}|${cible}`]} />
      ),
    )}
  </div>
);

export default ConclusionsSaisie;
