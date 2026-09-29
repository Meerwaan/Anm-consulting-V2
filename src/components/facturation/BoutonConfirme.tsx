"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { boutonPrincipal, boutonSecondaire } from "./styles";

/** Délai avant que « Confirmer » réponde : un double toucher sur l'iPad ne doit pas valider d'un coup. */
const ARMEMENT_MS = 600;

const Valider = ({ libelle, classe, pret }: { libelle: string; classe: string; pret: boolean }) => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={!pret || pending} aria-disabled={!pret || pending} className={classe}>
      {pending ? "Un instant…" : libelle}
    </button>
  );
};

/**
 * Un bouton en deux temps pour les actions qu'on ne défait pas depuis l'outil. Premier toucher : le
 * bouton laisse place à ce qui va se passer, à « Confirmer : … » et à « Annuler ». Le second soumet
 * l'action serveur existante, sans `window.confirm` (peu fiable sur iPad).
 */
const BoutonConfirme = ({
  action,
  children,
  confirmer,
  consequence,
  classe = boutonSecondaire,
  classeConfirmer = boutonPrincipal,
  champs,
}: {
  /** L'action serveur, telle qu'on la passerait à `<form action>`. */
  action: (fd: FormData) => void | Promise<void>;
  /** Le contenu du bouton au repos. */
  children: ReactNode;
  /** Le libellé du bouton de confirmation, ex. « Confirmer : créer la mission ». */
  confirmer: string;
  /** Ce qui va se passer, dit en clair. */
  consequence: ReactNode;
  classe?: string;
  classeConfirmer?: string;
  /** Champs cachés transmis à l'action. */
  champs?: Record<string, string>;
}) => {
  const [ouvert, setOuvert] = useState(false);
  const [pret, setPret] = useState(false);
  const declencheur = useRef<HTMLButtonElement>(null);
  const annuler = useRef<HTMLButtonElement>(null);
  const revenir = useRef(false);
  const id = useId();

  useEffect(() => {
    if (!ouvert) {
      setPret(false);
      if (revenir.current) declencheur.current?.focus();
      revenir.current = false;
      return;
    }
    // Le focus va sur « Annuler » : une touche Entrée répétée ne confirme pas par mégarde.
    annuler.current?.focus();
    const t = window.setTimeout(() => setPret(true), ARMEMENT_MS);
    return () => window.clearTimeout(t);
  }, [ouvert]);

  const fermer = () => {
    revenir.current = true;
    setOuvert(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {ouvert ? null : (
        <button ref={declencheur} type="button" onClick={() => setOuvert(true)} aria-expanded={false} className={classe}>
          {children}
        </button>
      )}
      <div aria-live="polite">
        {ouvert ? (
          <form
            action={action}
            role="group"
            aria-labelledby={id}
            onKeyDown={(e) => {
              if (e.key === "Escape") fermer();
            }}
            className="flex max-w-xl flex-col gap-3 rounded-[5px] border border-critique/40 bg-papier p-4"
          >
            {champs ? Object.entries(champs).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />) : null}
            <p id={id} className="text-meta text-encre">
              {consequence}
            </p>
            <div className="flex flex-wrap gap-2">
              <Valider libelle={confirmer} classe={classeConfirmer} pret={pret} />
              <button ref={annuler} type="button" onClick={fermer} className={boutonSecondaire}>
                Annuler
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
};

export default BoutonConfirme;
