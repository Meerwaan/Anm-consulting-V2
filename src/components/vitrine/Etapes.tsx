"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { ETAPES_METHODE, PHASES_MISSION } from "@/content/methode";

const TEMPS = [
  { nom: "Cadrage", etapes: [1, 2, 3], texte: "Vous savez ce qui sera regardé avant qu’on commence." },
  { nom: "Collecte", etapes: [4, 5], texte: "Travail sur copies, jamais sur originaux." },
  { nom: "Tests", etapes: [6, 7, 8, 9, 10], texte: "Le contrôle croisé : planning, pointage, paie, facturation." },
  { nom: "Restitution", etapes: [11, 12, 13, 14, 15], texte: "Des constats qualifiés, un plan daté, une réunion d’une heure." },
] as const;

/**
 * Les 15 étapes de la méthode, groupées en quatre temps. La ligne verticale se trace
 * au rythme du défilement ; chaque étape porte le moment habituel de la mission (06 §2).
 */
export function Etapes({ sombre = true }: { sombre?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduit = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progression = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 });

  const texte = sombre ? "text-papier" : "text-encre";
  const doux = sombre ? "text-brume-2" : "text-encre-2";
  const muet = sombre ? "text-brume" : "text-gris";
  const filet = sombre ? "border-nuit" : "border-filet";
  const rail = sombre ? "bg-nuit" : "bg-filet";

  return (
    <div ref={ref} className="relative">
      {/* Rail + trait qui se dessine */}
      <div className={`absolute bottom-0 left-[15px] top-0 w-px md:left-[calc(25%-0.5px)] ${rail}`} aria-hidden />
      <motion.div
        className="absolute left-[15px] top-0 w-px origin-top bg-vert-2 md:left-[calc(25%-0.5px)]"
        style={{ height: "100%", scaleY: reduit ? 1 : progression }}
        aria-hidden
      />

      <ol className="space-y-14 md:space-y-20">
        {TEMPS.map((t, ti) => (
          <li key={t.nom} className="grid gap-6 md:grid-cols-[25%_1fr]">
            <div className="relative pl-10 md:pl-0 md:pr-12 md:text-right">
              <span
                className={`absolute left-[10px] top-[0.55em] size-[11px] rounded-full border-2 ${sombre ? "border-vert-2 bg-encre" : "border-vert bg-fond"} md:left-auto md:right-[-6px]`}
                aria-hidden
              />
              <p className={`font-display text-chiffre leading-none ${muet}`}>{["I", "II", "III", "IV"][ti]}</p>
              <h3 className={`mt-2 font-display text-t3 ${texte}`}>{t.nom}</h3>
              <p className={`mt-2 text-corps ${doux}`}>{t.texte}</p>
            </div>
            <ol className={`ml-10 divide-y md:ml-12 ${filet}`}>
              {t.etapes.map((n) => {
                const e = ETAPES_METHODE[n - 1];
                const phase = PHASES_MISSION[e.phase - 1];
                return (
                  <li key={n} className="grid gap-1 py-4 md:grid-cols-[3.5rem_1fr_auto] md:items-baseline md:gap-6">
                    <span className={`font-mono text-note ${muet}`}>{String(n).padStart(2, "0")}</span>
                    <span className={`font-display text-t4 ${texte}`}>{e.nom}</span>
                    <span className={`font-mono text-etiquette uppercase tracking-[0.14em] ${muet}`}>{phase.moment}</span>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}
