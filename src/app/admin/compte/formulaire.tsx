"use client";

import { useActionState, useEffect, useRef } from "react";
import { changerMotDePasse, type EtatMotDePasse } from "./actions";

const initial: EtatMotDePasse = { erreur: null, ok: null };

const CHAMPS = [
  { nom: "actuel", libelle: "Mot de passe actuel", auto: "current-password" },
  { nom: "nouveau", libelle: "Nouveau mot de passe", auto: "new-password", aide: "10 caractères au minimum." },
  { nom: "confirmation", libelle: "Nouveau mot de passe, une seconde fois", auto: "new-password" },
] as const;

const FormulaireMotDePasse = () => {
  const [etat, action, enCours] = useActionState(changerMotDePasse, initial);
  const formulaire = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (etat.ok) formulaire.current?.reset();
  }, [etat.ok]);

  return (
    <form ref={formulaire} action={action} className="flex flex-col gap-6" noValidate>
      {CHAMPS.map((c) => (
        <div key={c.nom} className="flex flex-col gap-2">
          <label htmlFor={c.nom} className="text-meta font-medium text-encre">
            {c.libelle}
          </label>
          <input
            id={c.nom}
            name={c.nom}
            type="password"
            autoComplete={c.auto}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            aria-describedby={"aide" in c ? `${c.nom}-aide` : undefined}
            className="h-12 rounded-[5px] border border-gris/60 bg-papier px-4 text-base text-encre outline-none transition-colors focus-visible:border-vert"
          />
          {"aide" in c ? (
            <p id={`${c.nom}-aide`} className="text-note text-gris">
              {c.aide}
            </p>
          ) : null}
        </div>
      ))}

      {etat.erreur ? (
        <p role="alert" className="rounded-[5px] border border-critique/40 bg-critique-l/60 px-4 py-3 text-meta text-critique">
          {etat.erreur}
        </p>
      ) : null}
      {etat.ok ? (
        <p role="status" className="rounded-[5px] border border-vert/40 bg-menthe-2 px-4 py-3 text-meta text-vert">
          {etat.ok}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enCours}
        className="h-12 self-start rounded-[5px] bg-encre px-6 text-corps font-medium text-papier transition-colors hover:bg-vert disabled:opacity-60"
      >
        {enCours ? "Enregistrement…" : "Changer le mot de passe"}
      </button>
    </form>
  );
};

export default FormulaireMotDePasse;
