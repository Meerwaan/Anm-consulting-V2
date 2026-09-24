"use client";

import { useActionState, useState } from "react";
import { FilePdf } from "@phosphor-icons/react";
import { OFFRES } from "@/content/offres";
import { LIVRABLES, LIVRABLES_PAR_PRESTATION } from "@/content/contrat";
import { calculerDevis } from "@/lib/facturation/calcul-devis";
import type { EtatFormulaire } from "@/app/admin/missions/[id]/(outil)/contrat/actions";
import { Message, boutonPrincipal, boutonSecondaire, champ, zone } from "./FicheClient";

type Action = (etat: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;

export interface ValeursDevis {
  prestation: string;
  intitule: string;
  description: string | null;
  base_ht: number;
  effectif: number | null;
  sites: number | null;
  urgence: boolean;
  jours_comp: number;
  frais_ht: number;
  ajustement_ht: number;
  ajustement_libelle: string | null;
  acompte_pct: number;
  calendrier: string | null;
  livrables: string[];
  valable_jusquau: string;
  controle_organisme: string | null;
  controle_echeance: string | null;
}

const ORGANISMES = ["URSSAF", "DGFiP", "Inspection du travail", "CNAPS"];
const enChamp = (n: number | null) => (n === null || n === 0 ? "" : String(n).replace(".", ","));
const lire = (v: string) => Number(v.replace(/\s/g, "").replace(",", ".")) || 0;
const eur = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

/**
 * Le chiffrage d'un devis : la grille tarifaire du site (base, effectif, sites, urgence), les
 * journées et frais en plus, une remise éventuelle. Les lignes et le total suivent la saisie.
 */
const FormDevis = ({ valeurs: v, franchise, fige, pdf, enregistrer, signalControle }: { valeurs: ValeursDevis; franchise: boolean; fige: boolean; pdf: string; enregistrer: Action; signalControle: boolean }) => {
  const [etat, action, enCours] = useActionState(enregistrer, { ok: false, message: null });
  const [prestation, setPrestation] = useState(v.prestation);
  const [intitule, setIntitule] = useState(v.intitule);
  const [description, setDescription] = useState(v.description ?? "");
  const [base, setBase] = useState(enChamp(v.base_ht));
  const [effectif, setEffectif] = useState(enChamp(v.effectif));
  const [sites, setSites] = useState(enChamp(v.sites));
  const [urgence, setUrgence] = useState(v.urgence);
  const [jours, setJours] = useState(enChamp(v.jours_comp));
  const [frais, setFrais] = useState(enChamp(v.frais_ht));
  const [ajustement, setAjustement] = useState(enChamp(v.ajustement_ht));
  const [libelle, setLibelle] = useState(v.ajustement_libelle ?? "");
  const [livrables, setLivrables] = useState<string[]>(v.livrables);
  const [organisme, setOrganisme] = useState(v.controle_organisme ?? "");
  const [echeance, setEcheance] = useState(v.controle_echeance ?? "");
  const [calendrier, setCalendrier] = useState(v.calendrier ?? "");

  /** Le contrôle précisé remplace « contrôle annoncé » dans l'intitulé et le calendrier proposés. */
  const preciserControle = (org: string, date: string) => {
    setOrganisme(org);
    setEcheance(date);
    if (!org) return;
    setIntitule((t) => t.replace(/contrôle (annoncé|URSSAF|DGFiP|Inspection du travail|CNAPS)/, `contrôle ${org}`));
    const jour = date ? new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" }) : null;
    setCalendrier((c) =>
      !c || /^Avant l’échéance du contrôle/.test(c) || /^Calendrier arrêté/.test(c)
        ? `Avant l’échéance du contrôle ${org}${jour ? ` du ${jour}` : ""}, calendrier précis arrêté lors du cadrage.`
        : c,
    );
  };

  const calcul = calculerDevis(
    { prestation, intitule, base_ht: lire(base), effectif: lire(effectif) || null, sites: lire(sites) || null, urgence, jours_comp: lire(jours), frais_ht: lire(frais), ajustement_ht: lire(ajustement), ajustement_libelle: libelle || null },
    franchise,
  );
  const autres = livrables.filter((l) => !(LIVRABLES as readonly string[]).includes(l));

  /** Changer de prestation reprend son prix de base, son intitulé, sa description et ses livrables. */
  const choisir = (id: string) => {
    const o = OFFRES.find((x) => x.id === id);
    setPrestation(id);
    if (!o) return;
    setIntitule(o.nom);
    setDescription(`${o.contenu} Format : ${o.format.replace(/\s*\(à confirmer\)/, "")}.`);
    setBase(enChamp(o.baseHT));
    setLivrables([...(LIVRABLES_PAR_PRESTATION[id] ?? LIVRABLES_PAR_PRESTATION.audit)]);
  };

  return (
    <form action={action} className="flex flex-col gap-8">
      <fieldset disabled={fige} className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Prestation</span>
          <select name="prestation" value={prestation} onChange={(e) => choisir(e.target.value)} className={champ}>
            {OFFRES.map((o) => (
              <option key={o.id} value={o.id}>{o.nom} · {o.fourchette}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Valable jusqu’au</span>
          <input name="valable_jusquau" type="date" defaultValue={v.valable_jusquau} className={champ} />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-meta font-medium text-encre">Intitulé</span>
          <input name="intitule" required value={intitule} onChange={(e) => setIntitule(e.target.value)} className={champ} />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-meta font-medium text-encre">Description</span>
          <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} className={zone} />
        </label>
      </fieldset>

      <fieldset disabled={fige} className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-3 font-display text-t4 text-encre">Le chiffrage</legend>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">{prestation === "suivi_conformite" ? "Forfait mensuel HT (€)" : "Prix de base HT (€)"}</span>
          <input name="base_ht" inputMode="decimal" value={base} onChange={(e) => setBase(e.target.value)} placeholder="Sur devis : à saisir" className={`${champ} tabular-nums`} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Effectif</span>
          <input name="effectif" inputMode="numeric" value={effectif} onChange={(e) => setEffectif(e.target.value)} className={`${champ} tabular-nums`} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Sites</span>
          <input name="sites" inputMode="numeric" value={sites} onChange={(e) => setSites(e.target.value)} className={`${champ} tabular-nums`} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Journées complémentaires</span>
          <input name="jours_comp" inputMode="decimal" value={jours} onChange={(e) => setJours(e.target.value)} placeholder="0" className={`${champ} tabular-nums`} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Frais de déplacement HT (€)</span>
          <input name="frais_ht" inputMode="decimal" value={frais} onChange={(e) => setFrais(e.target.value)} placeholder="0" className={`${champ} tabular-nums`} />
        </label>
        <label className="flex min-h-12 items-center gap-3 self-end text-corps text-encre">
          <input type="checkbox" name="urgence" checked={urgence} onChange={(e) => setUrgence(e.target.checked)} className="size-5 accent-vert" />
          Urgence, sous 7 jours (+20 %)
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-meta font-medium text-encre">Remise ou ajustement : libellé</span>
          <input name="ajustement_libelle" value={libelle} onChange={(e) => setLibelle(e.target.value)} placeholder="ex. Remise premier client" className={champ} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Montant HT (€)</span>
          <input name="ajustement_ht" inputMode="decimal" value={ajustement} onChange={(e) => setAjustement(e.target.value)} placeholder="-200 pour une remise" className={`${champ} tabular-nums`} />
        </label>
      </fieldset>

      <div className="flex flex-col rounded-[5px] border border-filet bg-papier">
        <ul className="flex flex-col">
          {calcul.lignes.map((l, i) => (
            <li key={i} className="flex items-baseline justify-between gap-4 border-b border-filet px-4 py-2.5 text-corps">
              <span className={i === 0 ? "font-medium text-encre" : "text-encre-2"}>
                {l.designation}
                {l.quantite !== 1 ? <span className="text-gris"> · {l.quantite.toLocaleString("fr-FR")} × {eur(l.prix_unitaire_ht)}</span> : null}
              </span>
              <span className="shrink-0 tabular-nums text-encre">{eur(l.quantite * l.prix_unitaire_ht)}</span>
            </li>
          ))}
        </ul>
        <p className="flex items-baseline justify-between gap-4 px-4 py-3 text-corps">
          <span className="font-medium text-encre">Total{prestation === "suivi_conformite" ? " par mois" : ""}</span>
          <span className="tabular-nums">
            <span className="font-medium text-encre">{eur(calcul.total_ht)} HT</span>
            <span className="text-encre-2"> · {franchise ? "TVA non applicable" : `${eur(calcul.total_ttc)} TTC`}</span>
          </span>
        </p>
      </div>

      <fieldset disabled={fige} className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-display text-t4 text-encre">Les conditions, reprises au contrat</legend>
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Acompte à la commande (%)</span>
          <input name="acompte_pct" type="number" inputMode="numeric" min={0} max={100} defaultValue={v.acompte_pct} className={`${champ} tabular-nums`} />
        </label>
        <div className="hidden sm:block" />
        <label className="flex flex-col gap-2">
          <span className="text-meta font-medium text-encre">Contrôle en cours</span>
          <select name="controle_organisme" value={organisme} onChange={(e) => preciserControle(e.target.value, echeance)} className={champ}>
            <option value="">Aucun, audit préventif</option>
            {ORGANISMES.map((o) => (
              <option key={o} value={o}>Contrôle {o}</option>
            ))}
          </select>
          {signalControle && !organisme ? <span className="text-note text-majeur">La demande signale un contrôle annoncé : précise l’organisme.</span> : null}
        </label>
        <label className={`flex flex-col gap-2 ${organisme ? "" : "invisible"}`} aria-hidden={!organisme}>
          <span className="text-meta font-medium text-encre">Échéance du contrôle</span>
          <input name="controle_echeance" type="date" value={echeance} onChange={(e) => preciserControle(organisme, e.target.value)} disabled={!organisme} className={champ} />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-meta font-medium text-encre">Calendrier</span>
          <textarea name="calendrier" value={calendrier} onChange={(e) => setCalendrier(e.target.value)} className={zone} />
        </label>
        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="mb-2 text-meta font-medium text-encre">Livrables</legend>
          <div className="grid gap-x-6 sm:grid-cols-2">
            {LIVRABLES.map((l) => (
              <label key={l} className="flex min-h-11 items-center gap-3 text-corps text-encre">
                <input
                  type="checkbox"
                  name="livrables"
                  value={l}
                  checked={livrables.includes(l)}
                  onChange={(e) => setLivrables((x) => (e.target.checked ? [...x, l] : x.filter((y) => y !== l)))}
                  className="size-5 accent-vert"
                />
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </label>
            ))}
          </div>
          <input name="livrable_autre" defaultValue={autres.join(" ; ")} placeholder="Autre livrable prévu (facultatif)" className={champ} />
        </fieldset>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {!fige ? (
          <button type="submit" disabled={enCours} className={boutonPrincipal}>
            {enCours ? "Enregistrement…" : "Enregistrer le devis"}
          </button>
        ) : null}
        <a href={pdf} target="_blank" rel="noopener" className={boutonSecondaire}>
          <FilePdf size={18} aria-hidden /> Ouvrir le devis (PDF)
        </a>
        <Message etat={etat} />
      </div>
    </form>
  );
};

export default FormDevis;
