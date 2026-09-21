"use client";

import { useState, useTransition } from "react";
import type { ParametresST } from "@/lib/sous-traitance/types";
import { enregistrerParametres } from "@/app/admin/missions/[id]/(outil)/sous-traitance/actions";

const champ =
  "h-12 w-full rounded-[5px] border border-gris/60 bg-papier px-3 text-corps text-encre outline-none focus:border-vert";

/** Période contrôlée, taux horaire vendu et base d'un temps plein. */
const FormulaireParametres = ({ missionId, parametres }: { missionId: string; parametres: ParametresST }) => {
  const [valeurs, setValeurs] = useState({
    periode_debut: parametres.periode_debut?.slice(0, 7) ?? "",
    periode_fin: parametres.periode_fin?.slice(0, 7) ?? "",
    taux_horaire_vendu: parametres.taux_horaire_vendu !== null ? String(parametres.taux_horaire_vendu).replace(".", ",") : "",
    heures_mensuelles_etp: String(parametres.heures_mensuelles_etp).replace(".", ","),
  });
  const [retour, setRetour] = useState<{ ok: boolean; texte: string } | null>(null);
  const [enCours, demarrer] = useTransition();
  const maj = (k: keyof typeof valeurs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValeurs((v) => ({ ...v, [k]: e.target.value }));
    setRetour(null);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        demarrer(async () => {
          const r = await enregistrerParametres({ missionId, ...valeurs });
          setRetour(r.ok ? { ok: true, texte: "Repères enregistrés, les calculs sont à jour." } : { ok: false, texte: r.erreur });
        });
      }}
      className="flex flex-col gap-5"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Période contrôlée : début</span>
          <input type="month" value={valeurs.periode_debut} onChange={maj("periode_debut")} className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Période contrôlée : fin</span>
          <input type="month" value={valeurs.periode_fin} onChange={maj("periode_fin")} className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Taux horaire vendu (€ HT)</span>
          <input inputMode="decimal" value={valeurs.taux_horaire_vendu} onChange={maj("taux_horaire_vendu")} placeholder="Ex. 24,50" className={`${champ} text-right tabular-nums`} />
          <span className="text-note text-gris">Convertit en heures une facture client qui ne donne qu’un montant.</span>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Heures d’un temps plein, par mois</span>
          <input inputMode="decimal" value={valeurs.heures_mensuelles_etp} onChange={maj("heures_mensuelles_etp")} className={`${champ} text-right tabular-nums`} />
          <span className="text-note text-gris">151,67 h = 35 h × 52 semaines ÷ 12. Convertit l’effectif d’une attestation en heures.</span>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={enCours} className="min-h-12 rounded-[5px] bg-encre px-6 text-meta font-medium text-papier transition-colors hover:bg-vert disabled:opacity-60">
          {enCours ? "Enregistrement…" : "Enregistrer les repères"}
        </button>
        {retour ? (
          <p role={retour.ok ? "status" : "alert"} className={`text-meta ${retour.ok ? "text-vert" : "text-critique"}`}>
            {retour.texte}
          </p>
        ) : null}
      </div>
    </form>
  );
};

export default FormulaireParametres;
