"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Bell, ChatCircleText, FileArrowUp, CheckCircle } from "@phosphor-icons/react";
import { Compteur } from "./Compteur";
import { Criticite } from "./FicheConstat";

const EXPO = [0.16, 1, 0.3, 1] as const;

const ETAPES_FAITES = 10;

/**
 * Aperçu du portail client : ce que le client voit pendant la mission (avancement, pièces,
 * échanges — décision 04 : aucune note avant le rapport) puis après (plan d'actions à cocher).
 * Données fictives.
 */
export function PortailApercu() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduit = useReducedMotion();
  const anime = visible && !reduit;

  return (
    <div ref={ref} className="relative">
      <div className="absolute -inset-2 -z-10 rounded-[8px] bg-encre/[0.035]" aria-hidden />
      <div className="overflow-hidden rounded-[5px] border border-filet bg-papier shadow-flottant">
        {/* En-tête de mission */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
          <span className="etiquette !text-encre">Mission 2026-014 · Audit 360° · Votre société</span>
          <span className="rounded-full bg-menthe px-2.5 py-1 text-note font-medium text-mineur">En cours</span>
        </div>
        <div className="h-[1.5px] bg-encre" />

        {/* Avancement des 15 étapes */}
        <div className="space-y-3 px-5 py-4">
          <div className="flex gap-[3px]" aria-hidden>
            {Array.from({ length: 15 }, (_, i) => (
              <motion.span
                key={i}
                className={`h-2 flex-1 rounded-[1px] ${i < ETAPES_FAITES ? "bg-vert" : i === ETAPES_FAITES ? "bg-menthe" : "bg-filet-2"}`}
                initial={reduit ? false : { scaleX: 0, opacity: 0.4 }}
                animate={anime ? { scaleX: 1, opacity: 1 } : undefined}
                style={{ originX: 0 }}
                transition={{ duration: 0.5, ease: EXPO, delay: 0.2 + i * 0.06 }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 text-meta">
            <span className="font-medium text-encre">Étape 10 / 15 — Rapprochement planning → pointage → paie → facturation</span>
            <span className="font-mono text-etiquette text-gris">J+1</span>
          </div>
        </div>
        <div className="h-px bg-filet" />

        {/* Indicateurs */}
        <div className="grid grid-cols-2 divide-x divide-filet md:grid-cols-4">
          {[
            { v: 27, s: " / 31", l: "pièces reçues", c: "text-encre" },
            { v: 2, s: "", l: "demandes ouvertes", c: "text-majeur" },
            { v: 3, s: "", l: "relances automatiques", c: "text-encre" },
            { v: 8, s: "", l: "échanges", c: "text-encre" },
          ].map((k) => (
            <div key={k.l} className="px-5 py-4">
              <p className={`font-display text-t3 leading-none ${k.c}`}>
                <Compteur valeur={k.v} suffixe={k.s} duree={1.2} />
              </p>
              <p className="mt-1.5 text-note text-gris">{k.l}</p>
            </div>
          ))}
        </div>
        <div className="h-px bg-filet" />

        {/* Deux colonnes : pièces demandées / fil d'échange */}
        <div className="grid divide-y divide-filet md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="px-5 py-4">
            <p className="etiquette mb-3">Pièces demandées</p>
            <ul className="space-y-2.5 text-meta">
              {[
                { t: "Export Dracar du mois en cours", s: "reçue", i: 0 },
                { t: "Attestations de vigilance sous-traitants", s: "relancée J+3", i: 1 },
                { t: "Plannings semaines 33 à 36", s: "reçue", i: 2 },
                { t: "DUERP et plan de prévention site B", s: "ouverte", i: 3 },
              ].map((p) => (
                <motion.li
                  key={p.t}
                  className="flex items-center justify-between gap-3"
                  initial={reduit ? false : { opacity: 0, x: -8 }}
                  animate={anime ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.6, ease: EXPO, delay: 0.9 + p.i * 0.1 }}
                >
                  <span className="flex items-center gap-2 text-encre">
                    {p.s === "reçue" ? (
                      <CheckCircle size={16} weight="fill" className="text-mineur" />
                    ) : p.s.startsWith("relancée") ? (
                      <Bell size={16} weight="regular" className="text-majeur" />
                    ) : (
                      <FileArrowUp size={16} weight="regular" className="text-gris" />
                    )}
                    {p.t}
                  </span>
                  <span className={`font-mono text-etiquette ${p.s === "reçue" ? "text-mineur" : p.s.startsWith("relancée") ? "text-majeur" : "text-gris"}`}>
                    {p.s}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="px-5 py-4">
            <p className="etiquette mb-3">Fil d’échange</p>
            <ul className="space-y-3 text-meta">
              {[
                { qui: "ANM Consulting", t: "Les attestations de vigilance de votre sous-traitant datent de février. Il nous en faut une de moins de six mois.", i: 0 },
                { qui: "Vous", t: "Demandée ce matin, je la dépose dès réception.", i: 1 },
                { qui: "Système", t: "Relance automatique envoyée au sous-traitant · J+3", i: 2 },
              ].map((m) => (
                <motion.li
                  key={m.t}
                  className={`flex gap-2.5 ${m.qui === "Système" ? "font-mono text-etiquette text-gris" : ""}`}
                  initial={reduit ? false : { opacity: 0, y: 6 }}
                  animate={anime ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.6, ease: EXPO, delay: 1.2 + m.i * 0.15 }}
                >
                  {m.qui !== "Système" ? <ChatCircleText size={16} weight="regular" className="mt-0.5 shrink-0 text-vert" /> : <span className="w-4" />}
                  <span>
                    {m.qui !== "Système" ? <span className="mr-1.5 font-medium text-encre">{m.qui}</span> : null}
                    <span className={m.qui === "Système" ? "" : "text-encre-2"}>{m.t}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
        <div className="h-px bg-filet" />

        {/* Après le rapport : plan d'actions à cocher */}
        <div className="px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="etiquette">Plan d’actions · après le rapport</p>
            <span className="font-mono text-etiquette text-gris">vous cochez, nous sommes notifiés</span>
          </div>
          <ul className="divide-y divide-filet-2">
            {[
              { p: "P1", t: "Retirer des postes les 3 agents dont la carte est expirée", s: "Non conforme", fait: true },
              { p: "P1", t: "Obtenir l’attestation de vigilance du sous-traitant", s: "Partiel", fait: false },
              { p: "P2", t: "Rapprocher paniers et plannings avant chaque paie", s: "Partiel", fait: false },
            ].map((a, i) => (
              <motion.li
                key={a.t}
                className="flex items-center gap-3 py-2.5 text-meta"
                initial={reduit ? false : { opacity: 0 }}
                animate={anime ? { opacity: 1 } : undefined}
                transition={{ duration: 0.5, delay: 1.6 + i * 0.12 }}
              >
                <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-[3px] border ${a.fait ? "border-vert bg-vert text-papier" : "border-filet bg-papier"}`}>
                  {a.fait ? <CheckCircle size={14} weight="bold" /> : null}
                </span>
                <span className={`font-display text-corps ${a.p === "P1" ? "text-critique" : "text-majeur"}`}>{a.p}</span>
                <span className={`flex-1 ${a.fait ? "text-gris line-through decoration-filet" : "text-encre"}`}>{a.t}</span>
                <Criticite niveau={a.s === "Non conforme" ? "Critique" : "Majeur"} petit />
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
