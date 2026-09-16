"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { CHECKLISTS, type ChecklistId } from "@/content/vitrine";
import { LeadMagnet } from "./LeadMagnet";
import { Reveal } from "./Reveal";

const EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * Les quatre checklists gratuites, une par contrôleur, dans un seul bloc à onglets.
 * L'onglet actif change le titre, la liste et la checklist demandée (source du lead).
 * Section sombre : les couleurs sont celles du fond encre.
 */
export function Checklists() {
  const [actif, setActif] = useState<ChecklistId>("cnaps");
  /** Checklists déjà demandées pendant la visite : l'onglet s'en souvient. */
  const [demandees, setDemandees] = useState<ChecklistId[]>([]);
  const reduit = useReducedMotion();
  const checklist = CHECKLISTS.find((c) => c.id === actif) ?? CHECKLISTS[0];
  const memoriser = useCallback((id: ChecklistId) => setDemandees((d) => (d.includes(id) ? d : [...d, id])), []);

  return (
    <div className="space-y-12">
      {/* Onglets */}
      <Reveal>
        <div className="space-y-5">
          <p className="etiquette text-brume">
            <span className="mr-3">11</span>Ressources gratuites · quatre checklists, une par contrôleur
          </p>
          <div role="tablist" aria-label="Choisir une checklist" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
            {CHECKLISTS.map((c) => {
              const estActif = c.id === actif;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={estActif}
                  aria-controls={`checklist-${c.id}`}
                  onClick={() => setActif(c.id)}
                  className={`relative isolate shrink-0 rounded-full border px-4 py-2 font-mono text-note uppercase tracking-[0.14em] transition-[color,border-color] duration-500 ease-expo ${
                    estActif ? "border-papier text-encre" : "border-nuit text-brume hover:border-brume hover:text-papier"
                  }`}
                >
                  {estActif ? (
                    <motion.span
                      layoutId="onglet-checklist"
                      className="absolute inset-0 -z-10 rounded-full bg-papier"
                      transition={{ duration: 0.5, ease: EXPO }}
                    />
                  ) : null}
                  {c.organisme}
                  {demandees.includes(c.id) ? <span className="ml-2" aria-label="déjà demandée">✓</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        {/* Texte + formulaire */}
        <div className="space-y-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={checklist.id}
              initial={reduit ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduit ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: EXPO }}
              className="space-y-4"
            >
              <h2 className="font-display text-t2 text-papier md:text-t2-lg">{checklist.titre}</h2>
              <p className="max-w-xl text-chapo text-brume-2">{checklist.texte}</p>
            </motion.div>
          </AnimatePresence>

          <div className="max-w-md">
            {demandees.includes(checklist.id) ? (
              <p className="flex items-start gap-3 text-corps text-papier" role="status">
                <CheckCircle size={22} weight="fill" className="mt-0.5 shrink-0 text-menthe" />
                Checklist {checklist.organisme} demandée. Elle vous sera envoyée par email.
              </p>
            ) : (
              <LeadMagnet
                key={checklist.id}
                source={`checklist-${checklist.id}`}
                cta={`Recevoir la checklist ${checklist.organisme === "Inspection du travail" ? "Inspection" : checklist.organisme}`}
                note={`Un seul email, avec la checklist ${checklist.organisme}. Pas de relance commerciale, désinscription en un clic.`}
                onSucces={() => memoriser(checklist.id)}
                sombre
              />
            )}
          </div>

          <div className="space-y-3 pt-2">
            <p className="etiquette text-brume">À venir · {checklist.organisme}</p>
            <ul className="space-y-2">
              {checklist.aVenir.map((r) => (
                <li key={r.titre} className="flex items-baseline justify-between gap-4 border-b border-nuit pb-2 text-corps text-brume-2">
                  {r.titre}
                  <span className="shrink-0 font-mono text-etiquette uppercase tracking-[0.14em] text-brume">{r.type}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Les dix points : quatre lisibles, six voilés */}
        <Reveal delay={0.1} y={32}>
          <div className="relative">
            <div className="absolute -inset-2 -z-10 rounded-[8px] bg-papier/[0.03]" aria-hidden />
            <AnimatePresence mode="wait" initial={false}>
              <motion.ol
                key={checklist.id}
                id={`checklist-${checklist.id}`}
                role="tabpanel"
                initial={reduit ? false : "cache"}
                animate="visible"
                exit={reduit ? undefined : { opacity: 0, transition: { duration: 0.25 } }}
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="rounded-[5px] border border-nuit bg-encre/60 p-6 md:p-8"
              >
                <li className="mb-3 flex items-center justify-between border-b border-nuit pb-3">
                  <span className="etiquette text-brume">Checklist · {checklist.organisme}</span>
                  <span className="font-mono text-etiquette text-brume">10 points</span>
                </li>
                {checklist.points.map((pt, i) => (
                  <motion.li
                    key={pt}
                    variants={{ cache: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EXPO } } }}
                    className="flex gap-4 border-b border-nuit py-3 text-corps text-brume-2 last:border-0"
                  >
                    <span className="font-mono text-note text-brume">{String(i + 1).padStart(2, "0")}</span>
                    <span className={i > 3 ? "select-none blur-[3px]" : ""} aria-hidden={i > 3}>
                      {pt}
                    </span>
                  </motion.li>
                ))}
                <li className="pt-4 text-center font-mono text-etiquette uppercase tracking-[0.14em] text-brume">
                  Les dix points, dans votre boîte mail
                </li>
              </motion.ol>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
