"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { normaliserRecherche } from "@/lib/aide/recherche";

const SUGGESTIONS = ["mot de passe", "publier", "facture", "devis", "PDF", "pièces", "email"];

/**
 * Filtre la page Aide pendant la frappe. La page est rendue par le serveur : ce composant ne fait
 * que masquer les fiches (data-aide-fiche) dont le texte (data-aide-texte) ne contient pas tous les
 * mots cherchés, puis les parties qui n’en ont plus aucune. Les questions trouvées s’ouvrent.
 */
export default function RechercheAide() {
  const [terme, setTerme] = useState("");
  const [trouvees, setTrouvees] = useState<number | null>(null);
  const ouvertesParLaRecherche = useRef(new Set<HTMLDetailsElement>());
  const champ = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mots = normaliserRecherche(terme).trim().split(/\s+/).filter(Boolean);
    const fiches = document.querySelectorAll<HTMLElement>("[data-aide-fiche]");
    const sections = document.querySelectorAll<HTMLElement>("[data-aide-section]");

    // On referme ce que la recherche précédente avait ouvert, jamais ce que Sofia a ouvert elle-même.
    for (const d of ouvertesParLaRecherche.current) d.open = false;
    ouvertesParLaRecherche.current.clear();

    if (mots.length === 0) {
      fiches.forEach((f) => (f.style.display = ""));
      sections.forEach((s) => (s.style.display = ""));
      setTrouvees(null);
      return;
    }

    let n = 0;
    fiches.forEach((f) => {
      const texte = f.dataset.aideTexte ?? "";
      const correspond = mots.every((m) => texte.includes(m));
      f.style.display = correspond ? "" : "none";
      if (!correspond) return;
      n += 1;
      if (f instanceof HTMLDetailsElement && !f.open) {
        f.open = true;
        ouvertesParLaRecherche.current.add(f);
      }
    });
    sections.forEach((s) => {
      const visible = Array.from(s.querySelectorAll<HTMLElement>("[data-aide-fiche]")).some((f) => f.style.display !== "none");
      s.style.display = visible ? "" : "none";
    });
    setTrouvees(n);
  }, [terme]);

  return (
    <div role="search" className="flex flex-col gap-3">
      <label htmlFor="recherche-aide" className="text-meta font-medium text-encre">
        Chercher dans l’aide
      </label>
      <div className="relative">
        <MagnifyingGlass size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gris" aria-hidden />
        <input
          ref={champ}
          id="recherche-aide"
          type="search"
          value={terme}
          onChange={(e) => setTerme(e.target.value)}
          placeholder="Un mot : facture, publier, mot de passe…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-describedby="recherche-aide-resultat"
          className="h-14 w-full rounded-[5px] border border-gris/60 bg-papier pl-12 pr-14 text-chapo text-encre outline-none transition-colors placeholder:text-gris focus-visible:border-vert [&::-webkit-search-cancel-button]:hidden"
        />
        {terme ? (
          <button
            type="button"
            onClick={() => {
              setTerme("");
              champ.current?.focus();
            }}
            aria-label="Effacer la recherche"
            className="absolute right-1 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center text-gris hover:text-encre"
          >
            <X size={20} aria-hidden />
          </button>
        ) : null}
      </div>
      <p id="recherche-aide-resultat" role="status" className="min-h-6 text-meta text-encre-2">
        {trouvees === null
          ? null
          : trouvees === 0
            ? `Aucune réponse pour «\u00a0${terme.trim()}\u00a0». Essayez un autre mot, ou parcourez le sommaire.`
            : `${trouvees}\u00a0réponse${trouvees > 1 ? "s" : ""} pour «\u00a0${terme.trim()}\u00a0».`}
      </p>
      {terme ? null : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-note text-gris">Souvent cherché :</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTerme(s)}
              className="min-h-11 rounded-full border border-filet bg-papier px-4 text-meta text-encre-2 transition-colors hover:border-vert hover:text-vert"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
