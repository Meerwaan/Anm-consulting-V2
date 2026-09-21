"use client";

import { useState } from "react";
import { CaretDown, Check, Plus, Trash, WarningCircle } from "@phosphor-icons/react";
import { NATURES_NC } from "@/content/grilles";
import type { NonConformite } from "@/lib/grilles/lecture";
import { enregistrerNonConformite, supprimerNonConformite } from "@/app/admin/missions/[id]/(outil)/grilles-actions";

/**
 * Le tableau de suivi des anomalies et des actions correctives.
 *
 * Chaque anomalie suit la chaîne de Sofia : constat → risque → action corrective →
 * justificatif à produire → responsable → échéance → contrôle de régularisation.
 * C'est aussi l'outil que l'entreprise garde après l'audit (export dans l'onglet Rapport).
 */

const STATUTS = [
  { v: "a_faire", libelle: "À faire", classe: "border-critique bg-critique text-papier" },
  { v: "en_cours", libelle: "En cours", classe: "border-majeur bg-majeur-l text-majeur" },
  { v: "regularise", libelle: "Régularisé", classe: "border-vert bg-vert text-papier" },
] as const;

type Champ = keyof Omit<NonConformite, "id">;

const champ = "w-full rounded-[5px] border border-gris/60 bg-papier px-3 text-corps text-encre outline-none focus:border-vert";

const FicheAction = ({
  missionId,
  n,
  numero,
  sousTraitants,
  ouverteParDefaut,
}: {
  missionId: string;
  n: NonConformite;
  numero: number;
  sousTraitants: { id: string; nom: string }[];
  ouverteParDefaut: boolean;
}) => {
  const [v, setV] = useState<NonConformite>(n);
  const [enregistre, setEnregistre] = useState<NonConformite>(n);
  const [etat, setEtat] = useState<"ok" | "erreur" | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [supprimee, setSupprimee] = useState(false);
  const [confirmer, setConfirmer] = useState(false);

  const enregistrer = async (k: Champ, valeur?: string) => {
    const val = valeur ?? String(v[k] ?? "");
    if (valeur === undefined && val === String(enregistre[k] ?? "")) return;
    const r = await enregistrerNonConformite({ missionId, id: n.id, champs: { [k]: val } });
    if (!r.ok) {
      setEtat("erreur");
      setErreur(r.erreur);
      return;
    }
    setEnregistre((x) => ({ ...x, [k]: val }));
    setEtat("ok");
    setErreur(null);
  };
  const maj = (k: Champ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((x) => ({ ...x, [k]: e.target.value }));
  const immediat = (k: Champ) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setV((x) => ({ ...x, [k]: e.target.value }));
    enregistrer(k, e.target.value);
  };

  if (supprimee) return null;
  const statut = STATUTS.find((s) => s.v === v.statut) ?? STATUTS[0];
  const echeance = v.echeance ? new Date(`${v.echeance}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" }) : null;
  const enRetard = v.echeance && v.statut !== "regularise" && v.echeance < new Date().toISOString().slice(0, 10);

  // Fonction de rendu, pas un composant : défini dans le rendu, un composant serait recréé à
  // chaque frappe et le champ perdrait le focus.
  const texte = (k: Champ, libelle: string, lignes = 2, aide?: string) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-meta font-medium text-encre">{libelle}</span>
      {aide ? <span className="text-note text-gris">{aide}</span> : null}
      <textarea value={String(v[k] ?? "")} onChange={maj(k)} onBlur={() => enregistrer(k)} rows={lignes} className={`${champ} py-2.5`} />
    </label>
  );

  return (
    <details className="group rounded-[5px] border border-filet bg-papier" open={ouverteParDefaut}>
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-note text-gris">
            Action n°&nbsp;{numero} · {NATURES_NC[v.nature] ?? v.nature}
            {v.sous_traitant_id ? ` · ${sousTraitants.find((s) => s.id === v.sous_traitant_id)?.nom ?? ""}` : " · Entreprise"}
          </span>
          <span className="line-clamp-2 text-corps text-encre">{v.constat || "Constat à rédiger"}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {echeance ? <span className={`text-meta tabular-nums ${enRetard ? "font-medium text-critique" : "text-gris"}`}>{enRetard ? "En retard · " : ""}{echeance}</span> : null}
          <span className={`rounded-[4px] border px-2 py-1 text-note font-medium ${statut.classe}`}>{statut.libelle}</span>
          <CaretDown size={18} className="text-gris transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>

      <div className="flex flex-col gap-5 border-t border-filet px-5 py-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-meta font-medium text-encre">Concerne</span>
            <select value={v.sous_traitant_id ?? ""} onChange={immediat("sous_traitant_id")} className={`${champ} h-12`}>
              <option value="">L’entreprise</option>
              {sousTraitants.map((s) => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-meta font-medium text-encre">Nature</span>
            <select value={v.nature} onChange={immediat("nature")} className={`${champ} h-12`}>
              {Object.entries(NATURES_NC).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </label>
        </div>

        {texte("constat", "1 · Constat objectif", 3)}
        {texte("element_verifie", "Document ou élément vérifié", 1)}
        {texte("risque", "2 · Risque", 2, "Ce que la situation expose, sous réserve de la qualification par l’avocat ou l’expert-comptable.")}
        {texte("action", "3 · Action corrective", 3)}
        {texte("justificatif", "4 · Justificatif à produire", 1)}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-meta font-medium text-encre">5 · Responsable</span>
            <input value={v.responsable ?? ""} onChange={maj("responsable")} onBlur={() => enregistrer("responsable")} className={`${champ} h-12`} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-meta font-medium text-encre">6 · Échéance</span>
            <input type="date" value={v.echeance ?? ""} onChange={maj("echeance")} onBlur={() => enregistrer("echeance")} className={`${champ} h-12`} />
          </label>
        </div>

        <fieldset className="flex flex-col gap-3 rounded-[5px] border border-filet p-4">
          <legend className="px-1 text-meta font-medium text-encre">7 · Contrôle de régularisation</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Statut">
            {STATUTS.map((s) => (
              <button
                key={s.v}
                type="button"
                role="radio"
                aria-checked={v.statut === s.v}
                onClick={() => {
                  setV((x) => ({ ...x, statut: s.v }));
                  enregistrer("statut", s.v);
                }}
                className={`min-h-11 rounded-[5px] border px-4 text-meta font-medium transition-colors ${v.statut === s.v ? s.classe : "border-filet bg-papier text-encre-2 hover:border-gris"}`}
              >
                {s.libelle}
              </button>
            ))}
          </div>
          {v.statut === "regularise" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-meta text-encre">Régularisé le</span>
                <input type="date" value={v.date_regularisation ?? ""} onChange={maj("date_regularisation")} onBlur={() => enregistrer("date_regularisation")} className={`${champ} h-12`} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-meta text-encre">Preuve de la régularisation</span>
                <input value={v.preuve_regularisation ?? ""} onChange={maj("preuve_regularisation")} onBlur={() => enregistrer("preuve_regularisation")} className={`${champ} h-12`} />
              </label>
            </div>
          ) : null}
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-filet pt-4">
          <p className="flex items-center gap-2 text-meta" aria-live="polite">
            {etat === "ok" ? <><Check size={14} className="text-mineur" aria-hidden /> <span className="text-gris">Enregistré</span></> : null}
            {etat === "erreur" ? <><WarningCircle size={16} className="text-critique" aria-hidden /> <span className="text-critique">{erreur}</span></> : null}
          </p>
          {confirmer ? (
            <span className="flex items-center gap-2 text-meta">
              <button
                type="button"
                onClick={async () => {
                  const r = await supprimerNonConformite({ missionId, id: n.id });
                  if (r.ok) setSupprimee(true);
                  else {
                    setEtat("erreur");
                    setErreur(r.erreur);
                  }
                }}
                className="min-h-11 rounded-[5px] border border-critique px-3 font-medium text-critique"
              >
                Supprimer l’action
              </button>
              <button type="button" onClick={() => setConfirmer(false)} className="min-h-11 px-2 text-encre-2 underline underline-offset-4">
                Annuler
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmer(true)} className="flex min-h-11 items-center gap-1 text-meta text-gris hover:text-critique">
              <Trash size={16} aria-hidden /> Supprimer
            </button>
          )}
        </div>
      </div>
    </details>
  );
};

const SuiviActions = ({
  missionId,
  actions,
  sousTraitants,
}: {
  missionId: string;
  actions: NonConformite[];
  sousTraitants: { id: string; nom: string }[];
}) => {
  const [liste, setListe] = useState(actions);
  const [nouvelle, setNouvelle] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const ajouter = async () => {
    const r = await enregistrerNonConformite({ missionId, champs: { nature: "autre" } });
    if (!r.ok) return setErreur(r.erreur);
    setListe((l) => [
      ...l,
      { id: r.valeur, sous_traitant_id: null, nature: "autre", nature_autre: null, constat: null, element_verifie: null, action: null, delai: null, justificatif: null, risque: null, responsable: null, echeance: null, statut: "a_faire", date_regularisation: null, preuve_regularisation: null },
    ]);
    setNouvelle(r.valeur);
  };

  return (
    <div className="flex flex-col gap-3">
      {liste.length === 0 ? (
        <p className="rounded-[5px] border border-dashed border-filet-2 bg-papier px-4 py-5 text-meta text-gris">
          Aucune action pour l’instant. Crée-les depuis les alertes (« Créer une action ») ou ici.
        </p>
      ) : (
        liste.map((n, i) => (
          <FicheAction key={n.id} missionId={missionId} n={n} numero={i + 1} sousTraitants={sousTraitants} ouverteParDefaut={n.id === nouvelle} />
        ))
      )}
      <div>
        <button
          type="button"
          onClick={ajouter}
          className="flex min-h-11 items-center gap-2 rounded-[5px] border border-encre px-4 text-meta font-medium text-encre transition-colors hover:bg-encre hover:text-papier"
        >
          <Plus size={16} aria-hidden /> Nouvelle action
        </button>
      </div>
      {erreur ? <p role="alert" className="text-meta text-critique">{erreur}</p> : null}
    </div>
  );
};

export default SuiviActions;
