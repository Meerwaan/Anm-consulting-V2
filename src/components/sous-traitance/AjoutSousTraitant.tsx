"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { creerSousTraitant } from "@/app/admin/missions/[id]/(outil)/sous-traitance/actions";

const champ = "h-12 w-full rounded-[5px] border border-gris/60 bg-papier px-3 text-corps text-encre outline-none focus:border-vert";

/** Ajoute un sous-traitant et ouvre directement son dossier. */
const AjoutSousTraitant = ({ missionId, rang1 }: { missionId: string; rang1: { id: string; nom: string }[] }) => {
  const [raison, setRaison] = useState("");
  const [siren, setSiren] = useState("");
  const [rang, setRang] = useState<"1" | "2">("1");
  const [donneur, setDonneur] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setErreur(null);
        demarrer(async () => {
          const r = await creerSousTraitant({ missionId, raison_sociale: raison, siren, rang, donneur_id: donneur });
          if (!r.ok) return setErreur(r.erreur);
          router.push(`/admin/missions/${missionId}/sous-traitance/${r.valeur}`);
        });
      }}
      className="flex flex-col gap-5 rounded-[5px] border border-filet bg-papier p-5 md:p-6"
    >
      <h3 className="font-display text-t4 text-encre">Ajouter un sous-traitant</h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Raison sociale</span>
          <input value={raison} onChange={(e) => setRaison(e.target.value)} required className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">SIREN</span>
          <input value={siren} onChange={(e) => setSiren(e.target.value)} inputMode="numeric" className={`${champ} tabular-nums`} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Rang</span>
          <select value={rang} onChange={(e) => setRang(e.target.value as "1" | "2")} className={champ}>
            <option value="1">Rang 1 : travaille directement pour le client</option>
            <option value="2" disabled={rang1.length === 0}>Rang 2 : sous-traitant d’un sous-traitant (cascade)</option>
          </select>
        </label>
        {rang === "2" ? (
          <label className="flex flex-col gap-2">
            <span className="text-meta font-medium text-encre">Travaille pour</span>
            <select value={donneur} onChange={(e) => setDonneur(e.target.value)} className={champ}>
              <option value="">Choisir le sous-traitant de rang 1</option>
              {rang1.map((s) => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      {erreur ? <p role="alert" className="text-meta text-critique">{erreur}</p> : null}
      <div>
        <button type="submit" disabled={enCours} className="min-h-12 rounded-[5px] bg-encre px-6 text-meta font-medium text-papier transition-colors hover:bg-vert disabled:opacity-60">
          {enCours ? "Création…" : "Créer et ouvrir son dossier"}
        </button>
      </div>
    </form>
  );
};

export default AjoutSousTraitant;
