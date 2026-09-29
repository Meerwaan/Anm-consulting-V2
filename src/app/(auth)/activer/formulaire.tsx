"use client";

import { useActionState } from "react";
import { activerCompte, type EtatActivation } from "./actions";

const initial: EtatActivation = { erreur: null, verifie: false };

const CHAMPS = [
  { nom: "nouveau", libelle: "Mot de passe", aide: "10 caractères au minimum. Une phrase courte est plus sûre qu’un mot compliqué." },
  { nom: "confirmation", libelle: "Mot de passe, une seconde fois" },
] as const;

const FormulaireActivation = ({ jeton }: { jeton: string }) => {
  const [etat, action, enCours] = useActionState(activerCompte, initial);

  return (
    <form action={action} className="mt-10 flex flex-col gap-6" noValidate>
      <input type="hidden" name="jeton" value={jeton} />
      {CHAMPS.map((c) => (
        <div key={c.nom} className="flex flex-col gap-2">
          <label htmlFor={c.nom} className="text-meta font-medium text-encre">
            {c.libelle}
          </label>
          <input
            id={c.nom}
            name={c.nom}
            type="password"
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            minLength={10}
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

      <button
        type="submit"
        disabled={enCours}
        className="h-12 whitespace-nowrap rounded-[5px] bg-encre px-6 text-corps font-medium text-papier transition-colors hover:bg-vert disabled:opacity-60"
      >
        {enCours ? "Enregistrement…" : "Enregistrer et ouvrir mon espace"}
      </button>
    </form>
  );
};

export default FormulaireActivation;
