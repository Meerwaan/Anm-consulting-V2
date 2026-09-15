"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * Apparition à l'entrée dans le viewport : une seule fois, translation courte,
 * uniquement opacity + transform (rien qui déclenche un reflow).
 * Désactivée si l'utilisateur préfère réduire les animations.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduit = useReducedMotion();
  if (reduit) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Groupe d'enfants qui apparaissent en cascade. */
export function Cascade({
  children,
  className,
  pas = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  pas?: number;
  delay?: number;
}) {
  const reduit = useReducedMotion();
  if (reduit) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="cache"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ visible: { transition: { staggerChildren: pas, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function Element({ children, className, y = 24 }: { children: ReactNode; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      variants={{
        cache: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EXPO } },
      }}
    >
      {children}
    </motion.div>
  );
}
