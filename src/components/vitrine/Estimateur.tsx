"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { OFFRES, chiffrer, majorationEffectif, majorationSites } from "@/content/offres";
import { Bouton } from "./Bouton";

const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} € HT`;

/** Repères sous le curseur d’effectif, placés à leur position réelle (curseur linéaire de 1 à 250). */
const REPERES_EFFECTIF = [20, 50, 100, 250] as const;

const OFFRES_CHIFFRABLES = OFFRES.filter((o) => o.baseHT !== null && o.id !== "suivi_conformite");

/**
 * Estimateur de devis — les règles de 11_Pilotage_Commercial_Tarifs.xlsx > CHIFFRAGE,
 * via `chiffrer()`. Le montant est indicatif : la proposition écrite fait foi.
 */
export function Estimateur({ compact = false }: { compact?: boolean }) {
  const [offreId, setOffreId] = useState<string>("audit_360");
  const [effectif, setEffectif] = useState(35);
  const [sites, setSites] = useState(2);
  const [urgence, setUrgence] = useState(false);

  const offre = OFFRES_CHIFFRABLES.find((o) => o.id === offreId) ?? OFFRES_CHIFFRABLES[0];
  const devis = useMemo(() => chiffrer({ baseHT: offre.baseHT ?? 0, effectif, sites, urgence }), [offre, effectif, sites, urgence]);

  const lignes = [
    { l: offre.nom, v: devis.base },
    {
      l: `Effectif ${effectif} salarié${effectif > 1 ? "s" : ""}`,
      v: majorationEffectif(effectif),
    },
    {
      l: `${sites} site${sites > 1 ? "s" : ""}${sites > 2 ? " (au-delà de 2)" : ""}`,
      v: majorationSites(sites),
    },
    { l: "Urgence sous 7 jours (+20 %)", v: devis.urgence },
  ];

  const lienContact = `/contact?offre=${offre.id}&effectif=${effectif}&sites=${sites}${urgence ? "&urgence=1" : ""}`;

  return (
    <div className="grid gap-px overflow-hidden rounded-[5px] border border-encre bg-encre shadow-flottant md:grid-cols-[1.15fr_1fr]">
      {/* Paramètres */}
      <div className="space-y-7 bg-papier p-6 md:p-8">
        <div className="space-y-3">
          <label className="etiquette block" htmlFor="estim-offre">
            Mission
          </label>
          <div className="grid gap-2 sm:grid-cols-2" id="estim-offre" role="radiogroup" aria-label="Mission">
            {OFFRES_CHIFFRABLES.map((o) => {
              const actif = o.id === offre.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={actif}
                  onClick={() => setOffreId(o.id)}
                  className={`rounded-[3px] border px-3.5 py-2.5 text-left transition-[background-color,border-color,color] duration-300 ease-expo ${
                    actif ? "border-vert bg-vert text-papier" : "border-filet bg-papier text-encre hover:border-encre"
                  }`}
                >
                  <span className="block text-meta font-medium">{o.nom}</span>
                  <span className={`mt-0.5 block font-mono text-etiquette ${actif ? "text-papier/70" : "text-gris"}`}>{o.fourchette}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <label className="etiquette" htmlFor="estim-effectif">
              Effectif
            </label>
            <span className="font-display text-t3 leading-none text-encre">
              {effectif} <span className="font-sans text-note text-gris">salariés</span>
            </span>
          </div>
          <input id="estim-effectif" type="range" min={1} max={250} step={1} value={effectif} onChange={(e) => setEffectif(Number(e.target.value))} className="curseur-plage" />
          <div className="relative h-4 font-mono text-etiquette text-gris" aria-hidden>
            {REPERES_EFFECTIF.map((r) => (
              <span key={r} className="absolute top-0 -translate-x-1/2 whitespace-nowrap last:-translate-x-full" style={{ left: `${((r - 1) / 249) * 100}%` }}>
                {r === 250 ? "200+" : r}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:gap-10">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <label className="etiquette" htmlFor="estim-sites">
                Sites
              </label>
              <span className="font-display text-t3 leading-none text-encre">{sites}</span>
            </div>
            <input id="estim-sites" type="range" min={1} max={12} step={1} value={sites} onChange={(e) => setSites(Number(e.target.value))} className="curseur-plage" />
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-3 border-b border-encre pb-2 sm:self-end">
            <span className="whitespace-nowrap text-meta text-encre">Contrôle sous 7 jours</span>
            <button
              type="button"
              role="switch"
              aria-checked={urgence}
              onClick={() => setUrgence((u) => !u)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-300 ease-expo ${urgence ? "bg-vert" : "bg-filet"}`}
            >
              <span className={`absolute top-0.5 size-5 rounded-full bg-papier shadow-carte transition-transform duration-300 ease-expo ${urgence ? "translate-x-[22px]" : "translate-x-0.5"}`} />
            </button>
          </label>
        </div>
      </div>

      {/* Résultat */}
      <div className="flex flex-col bg-encre p-6 text-papier md:p-8">
        <p className="etiquette text-brume">Estimation indicative</p>
        <div className="mt-3 flex items-baseline gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={devis.totalHT}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-chiffre-lg leading-none tabular-nums"
            >
              {Math.round(devis.totalHT).toLocaleString("fr-FR")} €
            </motion.span>
          </AnimatePresence>
          <span className="font-mono text-note text-brume">HT</span>
        </div>

        <dl className="mt-6 space-y-2.5 border-t border-nuit pt-5 text-meta">
          {lignes.map((li) => (
            <div key={li.l} className="flex items-baseline justify-between gap-4">
              <dt className={li.v === 0 ? "text-brume" : "text-brume-2"}>{li.l}</dt>
              <dd className={`shrink-0 whitespace-nowrap font-mono tabular-nums ${li.v === 0 ? "text-brume" : "text-papier"}`}>{li.v === 0 ? "—" : `+ ${euros(li.v)}`}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 text-note text-brume">
          Hors frais de déplacement et journées complémentaires (850 € HT). Le montant ferme figure dans la proposition écrite, envoyée sous 48 h après l’appel de cadrage.
        </p>

        {!compact ? (
          <div className="mt-auto pt-6">
            <Bouton href={lienContact} taille="lg" className="w-full justify-between">
              Recevoir une proposition
            </Bouton>
          </div>
        ) : (
          <div className="mt-auto pt-6">
            <Bouton href={lienContact} variante="clair" taille="md">
              Recevoir une proposition
            </Bouton>
          </div>
        )}
      </div>
    </div>
  );
}
