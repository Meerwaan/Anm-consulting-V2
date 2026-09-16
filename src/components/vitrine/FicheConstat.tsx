"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { FICHES_EXEMPLE } from "@/content/vitrine";

const EXPO = [0.16, 1, 0.3, 1] as const;

type Fiche = (typeof FICHES_EXEMPLE)[number];

const COULEURS: Record<string, { texte: string; fond: string }> = {
  Critique: { texte: "text-critique", fond: "bg-critique-l" },
  Majeur: { texte: "text-majeur", fond: "bg-majeur-l" },
  Modéré: { texte: "text-modere", fond: "bg-modere-l" },
  Mineur: { texte: "text-mineur", fond: "bg-mineur-l" },
};

export function Criticite({ niveau, petit = false }: { niveau: string; petit?: boolean }) {
  const c = COULEURS[niveau] ?? { texte: "text-gris", fond: "bg-filet-2" };
  return (
    <span className={`inline-flex items-center rounded-full ${c.fond} ${c.texte} ${petit ? "px-2 py-0.5 text-etiquette" : "px-2.5 py-1 text-note"} font-medium`}>
      {niveau}
    </span>
  );
}

/**
 * La fiche de constat, objet signature de la DA. Dans le hero, elle « s'écrit » ligne par
 * ligne puis passe à l'exemple suivant. Ailleurs (`statique`), elle s'affiche d'un bloc.
 */
export function FicheConstat({
  fiches = FICHES_EXEMPLE,
  statique = false,
  intervalle = 7500,
  className = "",
}: {
  fiches?: readonly Fiche[];
  statique?: boolean;
  intervalle?: number;
  className?: string;
}) {
  const reduit = useReducedMotion();
  const [index, setIndex] = useState(0);
  const anime = !statique && !reduit && fiches.length > 1;

  useEffect(() => {
    if (!anime) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % fiches.length), intervalle);
    return () => clearInterval(t);
  }, [anime, fiches.length, intervalle]);

  const fiche = fiches[index];

  return (
    <div className={`relative ${className}`}>
      {/* Doublure : la fiche repose sur un plateau, comme une pièce dans un dossier. */}
      <div className="absolute -inset-2 -z-10 rounded-[8px] bg-encre/[0.035]" aria-hidden />
      <div className="overflow-hidden rounded-[3px] border border-encre bg-papier shadow-flottant">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="etiquette font-medium !text-encre">Fiche de constat</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={fiche.domaine}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="etiquette"
              >
                · {fiche.domaine}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="etiquette">
            N° {fiche.numero} / {fiche.total}
          </span>
        </div>
        <div className="h-[1.5px] bg-encre" />

        <AnimatePresence mode="wait" initial={!statique}>
          <motion.dl
            key={fiche.numero}
            initial={anime ? "cache" : false}
            animate="visible"
            exit="sortie"
            variants={{
              visible: { transition: { staggerChildren: 0.55, delayChildren: 0.2 } },
              sortie: { opacity: 0, transition: { duration: 0.35 } },
            }}
          >
            {fiche.lignes.map((l, i) => (
              <motion.div
                key={l.cle}
                className="border-b border-filet px-5 py-3.5"
                variants={{
                  cache: { opacity: 0, y: 8 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EXPO } },
                }}
              >
                <dt className="etiquette mb-1.5">{l.cle}</dt>
                <dd className={`font-display text-chapo leading-[1.4] text-encre ${l.cle === "Action" ? "italic" : ""}`}>
                  <Ligne texte={l.valeur} anime={anime} delai={0.2 + i * 0.55} />
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </AnimatePresence>

        <div className="flex items-center justify-between px-5 py-3">
          <span className={`etiquette font-medium ${COULEURS[fiche.criticite]?.texte ?? ""}`}>Priorité {fiche.priorite}</span>
          <Criticite niveau={fiche.criticite} />
        </div>
      </div>

      {anime ? (
        <div className="mt-4 flex justify-center gap-2" aria-hidden>
          {fiches.map((f, i) => (
            <button
              key={f.numero}
              type="button"
              tabIndex={-1}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-[width,background-color] duration-500 ease-expo ${i === index ? "w-8 bg-vert" : "w-3 bg-filet"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Une ligne qui se révèle mot à mot, comme si elle était en train d'être rédigée. */
function Ligne({ texte, anime, delai }: { texte: string; anime: boolean; delai: number }) {
  if (!anime) return <>{texte}</>;
  const mots = texte.split(" ");
  return (
    <motion.span
      initial="cache"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.028, delayChildren: delai } } }}
    >
      {mots.map((m, i) => (
        <motion.span
          key={`${m}-${i}`}
          className="inline-block"
          variants={{ cache: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.15 } } }}
        >
          {m}
          {i < mots.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
