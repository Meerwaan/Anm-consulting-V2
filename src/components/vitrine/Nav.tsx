"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { Bouton } from "./Bouton";

const LIENS = [
  { href: "/audit", label: "Audit 360°" },
  { href: "/formation", label: "Formation" },
  { href: "/abonnement", label: "Abonnement" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * En-tête collant + menu mobile.
 *
 * Le panneau mobile est un FRÈRE de l'en-tête, pas un enfant : un ancêtre avec
 * `backdrop-filter` ou `transform` devient le bloc conteneur d'un élément `fixed`,
 * et le panneau se retrouvait limité à la hauteur de l'en-tête (fond invisible sur
 * iOS). Pour la même raison, l'en-tête collant n'utilise pas de flou : WebKit
 * décale un `position: sticky` qui porte un `backdrop-filter` pendant le défilement.
 * Pas de verrouillage `overflow: hidden` sur le body non plus, iOS l'ignore et
 * dérègle le viewport : le panneau couvre tout et contient son propre défilement.
 *
 * L'en-tête est `fixed` et non `sticky` : Safari iOS laisse un `sticky` traîner
 * derrière le défilement quand sa barre d'adresse se replie, et le contenu passe
 * au-dessus. Sa hauteur (77 px mobile, 85 px desktop) est réservée par le `main`
 * du layout. Elle se range quand on descend et revient dès qu'on remonte : avec la
 * barre d'adresse Safari en haut, une barre de site toujours visible se retrouve
 * sous la pastille d'adresse, avec la page floutée au-dessus — c'est Safari qui
 * dessine ça, pas le site, et la seule parade est de ne pas afficher deux barres.
 */
export function Nav() {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const [defile, setDefile] = useState(false);
  const [cache, setCache] = useState(false);
  const { scrollY } = useScroll();

  // On descend : la barre se range. On remonte, même d'un rien : elle revient.
  useMotionValueEvent(scrollY, "change", (y) => {
    const precedent = scrollY.getPrevious() ?? 0;
    setDefile(y > 24);
    setCache(y > 120 && y > precedent);
  });

  useEffect(() => {
    setOuvert(false);
  }, [chemin]);

  useEffect(() => {
    if (!ouvert) return;
    const fermer = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    window.addEventListener("keydown", fermer);
    return () => window.removeEventListener("keydown", fermer);
  }, [ouvert]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-30 transition-[background-color,border-color,transform] duration-500 ease-expo ${
          defile ? "border-b border-filet bg-fond" : "border-b border-transparent bg-transparent"
        } ${cache && !ouvert ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 md:px-10 md:py-5">
          <Logo />

          <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
            {LIENS.map((l) => {
              const actif = chemin === l.href || chemin.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={actif ? "page" : undefined}
                  className={`souligne pb-0.5 text-corps font-medium transition-colors duration-300 ${actif ? "text-vert" : "text-encre hover:text-vert"}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-6 md:flex">
            <Link href="/connexion" className="souligne pb-0.5 text-corps text-gris hover:text-encre">
              Espace client
            </Link>
            <Bouton href="/contact" taille="sm">
              Prendre rendez-vous
            </Bouton>
          </div>

          <BoutonMenu ouvert={false} onClick={() => setOuvert(true)} />
        </div>
      </header>

      <AnimatePresence>
        {ouvert ? (
          <motion.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EXPO }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-fond md:hidden"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <Logo onClick={() => setOuvert(false)} />
              <BoutonMenu ouvert onClick={() => setOuvert(false)} />
            </div>

            <nav className="flex flex-col px-5 pt-6" aria-label="Navigation mobile">
              {LIENS.map((l, i) => {
                const actif = chemin === l.href || chemin.startsWith(`${l.href}/`);
                return (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.6, ease: EXPO, delay: 0.05 + i * 0.05 }}
                  >
                    <Link
                      href={l.href}
                      aria-current={actif ? "page" : undefined}
                      onClick={() => setOuvert(false)}
                      className={`block border-b border-filet py-4 font-display text-t2 ${actif ? "text-vert" : "text-encre"}`}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EXPO, delay: 0.35 }}
              className="mt-auto flex flex-col gap-4 px-5 pb-10 pt-10"
            >
              <Bouton href="/contact" taille="lg" className="justify-between">
                Prendre rendez-vous
              </Bouton>
              <Link href="/connexion" onClick={() => setOuvert(false)} className="text-center text-corps text-gris">
                Espace client
              </Link>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-baseline gap-2" aria-label="ANM Consulting, accueil">
      <span className="font-display text-t3 leading-none text-encre">ANM</span>
      <span className="font-mono text-etiquette uppercase tracking-[0.28em] text-gris">Consulting</span>
    </Link>
  );
}

/** Le bouton hamburger ; ses deux traits pivotent en croix quand le menu est ouvert. */
function BoutonMenu({ ouvert, onClick }: { ouvert: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ouvert}
      aria-controls="menu-mobile"
      aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
      className="relative flex size-11 items-center justify-center md:hidden"
    >
      <span className={`absolute h-px w-6 bg-encre transition-transform duration-500 ease-expo ${ouvert ? "rotate-45" : "-translate-y-[4px]"}`} />
      <span className={`absolute h-px w-6 bg-encre transition-transform duration-500 ease-expo ${ouvert ? "-rotate-45" : "translate-y-[4px]"}`} />
    </button>
  );
}
