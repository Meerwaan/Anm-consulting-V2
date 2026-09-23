"use client";

import { useActionState, useState } from "react";
import { FilePdf, LockSimple } from "@phosphor-icons/react";
import { LIVRABLES } from "@/content/contrat";
import type { EtatFormulaire } from "@/app/admin/missions/[id]/(outil)/contrat/actions";
import { Message, boutonPrincipal, boutonSecondaire, champ, zone } from "./FicheClient";

type Action = (etat: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;

export interface ValeursContrat {
  intitule: string;
  description: string | null;
  montant_ht: number | null;
  frais_ht: number;
  acompte_pct: number;
  calendrier: string | null;
  livrables: string[];
  lieu_signature: string | null;
  date_contrat: string;
}

const enChamp = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));

/**
 * Les conditions de la mission, pré-remplies par l'outil (offre, grille tarifaire, dates) :
 * Sofia relit, corrige, enregistre. Une fois signé, le contrat est figé jusqu'à ce qu'elle le rouvre.
 */
const FormContrat = ({
  valeurs,
  propose,
  prixDetail,
  tauxTva,
  signeLe,
  pdf,
  enregistrer,
  signer,
  rouvrir,
}: {
  valeurs: ValeursContrat;
  propose: boolean;
  prixDetail: string | null;
  tauxTva: number;
  signeLe: string | null;
  pdf: string;
  enregistrer: Action;
  signer: Action;
  rouvrir: () => Promise<void>;
}) => {
  const [etat, action, enCours] = useActionState(enregistrer, { ok: false, message: null });
  const [etatSigne, actionSigne, signature] = useActionState(signer, { ok: false, message: null });
  const [ht, setHt] = useState(enChamp(valeurs.montant_ht));
  const [frais, setFrais] = useState(enChamp(valeurs.frais_ht || null));
  const fige = Boolean(signeLe);
  const autres = valeurs.livrables.filter((l) => !(LIVRABLES as readonly string[]).includes(l));

  const nombre = (v: string) => Number(v.replace(/\s/g, "").replace(",", ".")) || 0;
  const totalHT = nombre(ht) + nombre(frais);
  const eur = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  return (
    <div className="flex flex-col gap-6">
      {fige ? (
        <div className="flex flex-col gap-3 rounded-[5px] border border-filet bg-menthe p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-corps text-vert">
            <LockSimple size={18} aria-hidden />
            Signé le {new Date(`${signeLe}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" })}. La version signée est archivée ; le contrat ne se modifie plus.
          </p>
          <form action={rouvrir}>
            <button type="submit" className={boutonSecondaire}>Rouvrir pour le modifier</button>
          </form>
        </div>
      ) : propose ? (
        <p className="rounded-[5px] border border-filet bg-menthe p-4 text-meta text-encre-2">
          Tout ce qui suit est proposé par l’outil d’après la mission : l’offre, le prix de la grille, les dates, les livrables habituels. Relis, corrige si besoin, puis enregistre.
        </p>
      ) : null}

      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <fieldset disabled={fige} className="contents">
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-meta font-medium text-encre">Prestation souscrite</span>
            <input name="intitule" required defaultValue={valeurs.intitule} className={champ} />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-meta font-medium text-encre">Description</span>
            <textarea name="description" defaultValue={valeurs.description ?? ""} className={zone} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-meta font-medium text-encre">Prix de la prestation, HT (€)</span>
            <input name="montant_ht" inputMode="decimal" value={ht} onChange={(e) => setHt(e.target.value)} placeholder="Sur devis : à saisir" className={`${champ} tabular-nums`} />
            {prixDetail ? <span className="text-note text-gris">Grille : {prixDetail}</span> : null}
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-meta font-medium text-encre">Frais de déplacement, HT (€)</span>
            <input name="frais_ht" inputMode="decimal" value={frais} onChange={(e) => setFrais(e.target.value)} placeholder="0" className={`${champ} tabular-nums`} />
          </label>
          <p className="text-meta text-encre-2 sm:col-span-2">
            Total : <span className="font-medium text-encre tabular-nums">{eur(totalHT)} HT</span>
            {tauxTva ? <> · <span className="tabular-nums">{eur(Math.round(totalHT * (100 + tauxTva)) / 100)} TTC</span> (TVA {tauxTva} %)</> : " · TVA non applicable (art. 293 B du CGI)"}
          </p>
          <label className="flex flex-col gap-2">
            <span className="text-meta font-medium text-encre">Acompte à la commande (%)</span>
            <input name="acompte_pct" type="number" inputMode="numeric" min={0} max={100} defaultValue={valeurs.acompte_pct} className={`${champ} tabular-nums`} />
            <span className="text-note text-gris">0 : tout à la remise des livrables. 100 : tout à la commande.</span>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-meta font-medium text-encre">Date du contrat</span>
            <input name="date_contrat" type="date" defaultValue={valeurs.date_contrat} className={champ} />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-meta font-medium text-encre">Calendrier</span>
            <textarea name="calendrier" defaultValue={valeurs.calendrier ?? ""} className={zone} />
          </label>
          <fieldset className="flex flex-col gap-2 sm:col-span-2">
            <legend className="mb-2 text-meta font-medium text-encre">Livrables remis au client</legend>
            <div className="grid gap-x-6 sm:grid-cols-2">
              {LIVRABLES.map((l) => (
                <label key={l} className="flex min-h-11 items-center gap-3 text-corps text-encre">
                  <input type="checkbox" name="livrables" value={l} defaultChecked={valeurs.livrables.includes(l)} className="size-5 accent-vert" />
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </label>
              ))}
            </div>
            <input name="livrable_autre" defaultValue={autres.join(" ; ")} placeholder="Autre livrable prévu (facultatif)" className={champ} />
          </fieldset>
          <label className="flex flex-col gap-2">
            <span className="text-meta font-medium text-encre">Fait à</span>
            <input name="lieu_signature" defaultValue={valeurs.lieu_signature ?? ""} className={champ} />
          </label>
        </fieldset>
        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
          {!fige ? (
            <button type="submit" disabled={enCours} className={boutonPrincipal}>
              {enCours ? "Enregistrement…" : propose ? "Enregistrer le contrat" : "Enregistrer les modifications"}
            </button>
          ) : null}
          <a href={pdf} target="_blank" rel="noopener" className={boutonSecondaire}>
            <FilePdf size={18} aria-hidden />
            {fige ? "Ouvrir le contrat signé" : propose ? "Aperçu du contrat (PDF)" : "Ouvrir le contrat (PDF)"}
          </a>
          <Message etat={etat} />
        </div>
      </form>

      {!fige && !propose ? (
        <form action={actionSigne} className="flex flex-col gap-3 border-t border-filet pt-5">
          <p className="text-meta text-encre-2">
            Quand le client a signé, indique la date : la version signée est archivée dans la mission et le contrat ne bouge plus.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-col gap-2">
              <span className="text-meta font-medium text-encre">Signé le</span>
              <input name="signe_le" type="date" defaultValue={new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" })} className={`${champ} sm:w-52`} />
            </label>
            <button type="submit" disabled={signature} className={boutonSecondaire}>
              <LockSimple size={18} aria-hidden />
              {signature ? "Archivage…" : "Marquer comme signé"}
            </button>
          </div>
          <Message etat={etatSigne} />
        </form>
      ) : null}
    </div>
  );
};

export default FormContrat;
