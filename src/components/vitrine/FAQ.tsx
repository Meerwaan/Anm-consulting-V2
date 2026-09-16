"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus } from "@phosphor-icons/react";

const EXPO = [0.16, 1, 0.3, 1] as const;

export function FAQ({ items }: { items: readonly { question: string; reponse: string }[] }) {
  const [ouvert, setOuvert] = useState<number | null>(0);

  return (
    <div className="border-t-[1.5px] border-encre">
      {items.map((it, i) => {
        const actif = ouvert === i;
        return (
          <div key={it.question} className="border-b border-filet">
            <h3 className="font-sans">
              <button
                type="button"
                onClick={() => setOuvert(actif ? null : i)}
                aria-expanded={actif}
                aria-controls={`faq-${i}`}
                className="group flex w-full items-start justify-between gap-6 py-5 text-left"
              >
                <span className="font-display text-t4 text-encre transition-colors duration-300 group-hover:text-vert md:text-t3">
                  {it.question}
                </span>
                <span
                  className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-filet text-encre transition-[transform,background-color,color,border-color] duration-500 ease-expo group-hover:border-encre ${
                    actif ? "rotate-45 border-encre bg-encre text-papier" : ""
                  }`}
                  aria-hidden
                >
                  <Plus size={14} weight="bold" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {actif ? (
                <motion.div
                  id={`faq-${i}`}
                  key="contenu"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EXPO }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 text-corps text-encre-2">{it.reponse}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
