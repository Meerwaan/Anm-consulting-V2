"use client";

import { useState } from "react";
import { CaretDown, ChatText, Check, WarningCircle } from "@phosphor-icons/react";
import type { CodeGrille, Section } from "@/content/grilles";
import type { Reponse } from "@/lib/grilles/lecture";
import { enregistrerReponse } from "@/app/admin/missions/[id]/(outil)/grilles-actions";

/**
 * Une grille de Sofia à remplir au doigt.
 *
 * Chaque section se replie : on voit d'un coup d'œil ce qui est rempli (« 6 / 11 ») et ce qui
 * ressort (« 2 non »), sans faire défiler cent questions. Une réponse s'enregistre au toucher ;
 * l'observation, facultative, s'enregistre quand on quitte le champ.
 */

type Valeur = "oui" | "non" | "a_verifier" | "na";

const OPTIONS: { v: Valeur; libelle: string }[] = [
  { v: "oui", libelle: "Oui" },
  { v: "non", libelle: "Non" },
  { v: "a_verifier", libelle: "À vérifier" },
  { v: "na", libelle: "Sans objet" },
];

/** Une réponse est « défavorable » si c'est un non, ou un oui sur un point d'alerte. */
const defavorable = (v: Valeur | null, alerte?: boolean) => (alerte ? v === "oui" : v === "non");

const classeOption = (v: Valeur, choisie: boolean, alerte?: boolean) => {
  if (!choisie) return "border-filet bg-papier text-encre-2 hover:border-gris";
  if (defavorable(v, alerte)) return "border-critique bg-critique text-papier";
  if (v === "a_verifier") return "border-majeur bg-majeur-l text-majeur";
  if (v === "na") return "border-gris bg-filet-2 text-encre";
  return "border-vert bg-vert text-papier";
};

interface Props {
  missionId: string;
  grille: CodeGrille;
  cible: string;
  sections: Section[];
  reponses: Record<string, Reponse>;
}

const Question = ({
  missionId,
  grille,
  cible,
  code,
  libelle,
  alerte,
  initiale,
  surChange,
}: {
  missionId: string;
  grille: CodeGrille;
  cible: string;
  code: string;
  libelle: string;
  alerte?: boolean;
  initiale: Reponse | undefined;
  surChange: (v: Valeur | null) => void;
}) => {
  const [valeur, setValeur] = useState<Valeur | null>(initiale?.reponse ?? null);
  const [observation, setObservation] = useState(initiale?.observation ?? "");
  const [obsEnregistree, setObsEnregistree] = useState(initiale?.observation ?? "");
  const [ouverte, setOuverte] = useState(Boolean(initiale?.observation));
  const [etat, setEtat] = useState<"ok" | "erreur" | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const choisir = async (v: Valeur) => {
    const nouvelle = valeur === v ? null : v;
    const precedente = valeur;
    setValeur(nouvelle);
    surChange(nouvelle);
    const r = await enregistrerReponse({ missionId, grille, cible, item: code, reponse: nouvelle });
    if (!r.ok) {
      setValeur(precedente);
      surChange(precedente);
      setEtat("erreur");
      setErreur(r.erreur);
      return;
    }
    setEtat("ok");
    setErreur(null);
    // Un « non » appelle presque toujours une explication : le champ s'ouvre.
    if (nouvelle && defavorable(nouvelle, alerte)) setOuverte(true);
  };

  const enregistrerObservation = async () => {
    if (observation === obsEnregistree) return;
    const r = await enregistrerReponse({ missionId, grille, cible, item: code, observation });
    if (!r.ok) {
      setEtat("erreur");
      setErreur(r.erreur);
      return;
    }
    setObsEnregistree(observation);
    setEtat("ok");
    setErreur(null);
  };

  return (
    <li className="flex flex-col gap-3 border-b border-filet py-4 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <p className="min-w-0 flex-1 basis-64 pt-2.5 text-corps text-encre">
          {libelle}
          {etat === "ok" ? <Check size={14} className="ml-2 inline text-mineur" aria-label="Enregistré" /> : null}
          {etat === "erreur" ? <WarningCircle size={16} className="ml-2 inline text-critique" aria-label="Non enregistré" /> : null}
        </p>
        <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label={libelle}>
          {OPTIONS.map((o) => (
            <button
              key={o.v}
              type="button"
              role="radio"
              aria-checked={valeur === o.v}
              onClick={() => choisir(o.v)}
              className={`min-h-11 rounded-[5px] border px-3 text-meta font-medium transition-colors ${classeOption(o.v, valeur === o.v, alerte)}`}
            >
              {o.libelle}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOuverte((x) => !x)}
            aria-expanded={ouverte}
            aria-label="Observation"
            className={`flex size-11 items-center justify-center rounded-[5px] ${obsEnregistree ? "text-vert" : "text-gris"} hover:text-vert`}
          >
            <ChatText size={20} weight={obsEnregistree ? "fill" : "regular"} aria-hidden />
          </button>
        </div>
      </div>
      {ouverte ? (
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          onBlur={enregistrerObservation}
          rows={2}
          placeholder="Observation : ce qui a été vu, le document consulté, ce qui manque…"
          aria-label={`Observation : ${libelle}`}
          className="w-full rounded-[5px] border border-gris/60 bg-papier px-3 py-2.5 text-meta text-encre outline-none focus:border-vert"
        />
      ) : null}
      {erreur ? <p role="alert" className="text-meta text-critique">{erreur}</p> : null}
    </li>
  );
};

const BlocSection = ({
  missionId,
  grille,
  cible,
  section,
  reponses,
}: {
  missionId: string;
  grille: CodeGrille;
  cible: string;
  section: Section;
  reponses: Record<string, Reponse>;
}) => {
  const [valeurs, setValeurs] = useState<Record<string, Valeur | null>>(() =>
    Object.fromEntries(section.items.map((i) => [i.code, reponses[`${grille}|${cible}|${i.code}`]?.reponse ?? null])),
  );
  const remplies = Object.values(valeurs).filter(Boolean).length;
  const defavorables = Object.values(valeurs).filter((v) => defavorable(v, section.alerte)).length;
  const aVerifier = Object.values(valeurs).filter((v) => v === "a_verifier").length;

  return (
    <details className="group rounded-[5px] border border-filet bg-papier">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-corps font-medium text-encre">{section.titre}</span>
          <span className="text-note text-gris">{section.source}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3 text-meta">
          {defavorables ? (
            <span className="font-medium text-critique">
              {defavorables} {section.alerte ? `constaté${defavorables > 1 ? "s" : ""}` : "non"}
            </span>
          ) : null}
          {aVerifier ? <span className="text-majeur">{aVerifier} à vérifier</span> : null}
          <span className={`tabular-nums ${remplies === section.items.length ? "text-mineur" : "text-gris"}`}>
            {remplies}&nbsp;/&nbsp;{section.items.length}
          </span>
          <CaretDown size={18} className="text-gris transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <div className="border-t border-filet px-5 pb-2">
        {section.intro ? <p className="pt-4 text-meta text-encre-2">{section.intro}</p> : null}
        <ul>
          {section.items.map((i) => (
            <Question
              key={i.code}
              missionId={missionId}
              grille={grille}
              cible={cible}
              code={i.code}
              libelle={i.libelle}
              alerte={section.alerte}
              initiale={reponses[`${grille}|${cible}|${i.code}`]}
              surChange={(v) => setValeurs((x) => ({ ...x, [i.code]: v }))}
            />
          ))}
        </ul>
      </div>
    </details>
  );
};

const GrilleSaisie = ({ missionId, grille, cible, sections, reponses }: Props) => (
  <div className="flex flex-col gap-3">
    {sections.map((s) => (
      <BlocSection key={s.code} missionId={missionId} grille={grille} cible={cible} section={s} reponses={reponses} />
    ))}
  </div>
);

export default GrilleSaisie;
