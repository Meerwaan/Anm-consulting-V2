"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Nombre qui compte jusqu'à sa valeur à l'entrée dans le viewport. */
export function Compteur({
  valeur,
  suffixe = "",
  prefixe = "",
  duree = 1.6,
  className = "",
}: {
  valeur: number;
  suffixe?: string;
  prefixe?: string;
  duree?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduit = useReducedMotion();
  const [affiche, setAffiche] = useState(reduit ? valeur : 0);

  useEffect(() => {
    if (!visible || reduit) return;
    const controle = animate(0, valeur, {
      duration: duree,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setAffiche(Math.round(v)),
    });
    return () => controle.stop();
  }, [visible, valeur, duree, reduit]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefixe}
      {affiche.toLocaleString("fr-FR")}
      {suffixe}
    </span>
  );
}
