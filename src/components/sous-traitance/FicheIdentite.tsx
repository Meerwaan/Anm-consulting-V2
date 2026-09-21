"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, WarningCircle } from "@phosphor-icons/react";
import type { SousTraitant } from "@/lib/sous-traitance/types";
import { enregistrerIdentite, supprimerSousTraitant } from "@/app/admin/missions/[id]/(outil)/sous-traitance/actions";

const CHAMPS = [
  { cle: "raison_sociale", libelle: "Raison sociale", type: "text" },
  { cle: "siren", libelle: "SIREN / SIRET", type: "text", mode: "numeric" },
  { cle: "dirigeant", libelle: "Dirigeant", type: "text" },
  { cle: "activite", libelle: "Activité déclarée", type: "text" },
  { cle: "adresse", libelle: "Adresse", type: "text", large: true },
  { cle: "debut_relation", libelle: "Début de la relation", type: "date" },
  { cle: "contrat_ref", libelle: "Contrat n°", type: "text" },
  { cle: "date_conclusion_contrat", libelle: "Contrat conclu le", type: "date" },
  { cle: "date_fin_contrat", libelle: "Fin du contrat", type: "date" },
  { cle: "montant_contrat_ht", libelle: "Montant du contrat (€ HT)", type: "text", mode: "decimal" },
] as const;

type Cle = (typeof CHAMPS)[number]["cle"];

/**
 * Identification du sous-traitant (grille 05 §2). Chaque champ s'enregistre quand on le
 * quitte ; la coche confirme, le triangle signale un refus avec sa raison.
 */
const FicheIdentite = ({ missionId, st }: { missionId: string; st: SousTraitant }) => {
  const initial = Object.fromEntries(
    CHAMPS.map((c) => {
      const v = st[c.cle as keyof SousTraitant];
      return [c.cle, v === null || v === undefined ? "" : c.cle === "montant_contrat_ht" ? String(v).replace(".", ",") : String(v)];
    }),
  ) as Record<Cle, string>;
  const [valeurs, setValeurs] = useState(initial);
  const [enregistres, setEnregistres] = useState(initial);
  const [etat, setEtat] = useState<Partial<Record<Cle, "ok" | "erreur">>>({});
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmer, setConfirmer] = useState(false);
  const router = useRouter();

  const enregistrer = async (cle: Cle) => {
    if (valeurs[cle] === enregistres[cle]) return;
    const r = await enregistrerIdentite({ missionId, sousTraitantId: st.id, champs: { [cle]: valeurs[cle] } });
    if (!r.ok) {
      setEtat((e) => ({ ...e, [cle]: "erreur" }));
      setErreur(r.erreur);
      return;
    }
    setEnregistres((x) => ({ ...x, [cle]: valeurs[cle] }));
    setEtat((e) => ({ ...e, [cle]: "ok" }));
    setErreur(null);
  };

  const supprimer = async () => {
    const r = await supprimerSousTraitant({ missionId, sousTraitantId: st.id });
    if (!r.ok) return setErreur(r.erreur);
    router.push(`/admin/missions/${missionId}/sous-traitance`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {CHAMPS.map((c) => (
          <label key={c.cle} className={`flex flex-col gap-2 ${"large" in c ? "sm:col-span-2" : ""}`}>
            <span className="flex items-center gap-2 text-meta font-medium text-encre">
              {c.libelle}
              {etat[c.cle] === "ok" ? <Check size={14} className="text-mineur" aria-label="Enregistré" /> : null}
              {etat[c.cle] === "erreur" ? <WarningCircle size={16} className="text-critique" aria-label="Non enregistré" /> : null}
            </span>
            <input
              type={c.type}
              inputMode={"mode" in c ? c.mode : undefined}
              value={valeurs[c.cle]}
              onChange={(e) => setValeurs((v) => ({ ...v, [c.cle]: e.target.value }))}
              onBlur={() => enregistrer(c.cle)}
              className="h-12 w-full rounded-[5px] border border-gris/60 bg-papier px-3 text-corps text-encre outline-none focus:border-vert"
            />
          </label>
        ))}
      </div>
      {erreur ? <p role="alert" className="text-meta text-critique">{erreur}</p> : null}
      <div className="border-t border-filet pt-4">
        {confirmer ? (
          <p className="flex flex-wrap items-center gap-3 text-meta text-encre">
            Supprimer ce sous-traitant, ses attestations, factures et paiements ?
            <button type="button" onClick={supprimer} className="min-h-11 rounded-[5px] border border-critique px-4 font-medium text-critique">
              Oui, supprimer le dossier
            </button>
            <button type="button" onClick={() => setConfirmer(false)} className="min-h-11 px-3 text-encre-2 underline underline-offset-4">
              Annuler
            </button>
          </p>
        ) : (
          <button type="button" onClick={() => setConfirmer(true)} className="min-h-11 text-meta text-gris underline-offset-4 hover:text-critique hover:underline">
            Supprimer ce sous-traitant
          </button>
        )}
      </div>
    </div>
  );
};

export default FicheIdentite;
