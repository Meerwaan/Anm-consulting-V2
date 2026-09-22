"use client";

import { useActionState, useState } from "react";
import { seConnecter, type EtatConnexion } from "./actions";

const initial: EtatConnexion = { erreur: null, email: "" };

/**
 * Champs en 16 px et cibles de 48 px : l'outil est utilisé au doigt sur iPad.
 * `autoComplete="username"` + `"current-password"` : le trousseau iCloud propose
 * l'identifiant enregistré, et Face ID remplit le reste.
 */
const FormulaireConnexion = () => {
  const [etat, action, enCours] = useActionState(seConnecter, initial);
  const [visible, setVisible] = useState(false);

  return (
    <form action={action} className="mt-10 flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-meta font-medium text-encre">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          defaultValue={etat.email}
          className="h-12 rounded-[5px] border border-gris/60 bg-papier px-4 text-base text-encre outline-none transition-colors focus-visible:border-vert"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="mot_de_passe" className="text-meta font-medium text-encre">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="mot_de_passe"
            name="mot_de_passe"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            className="h-12 w-full rounded-[5px] border border-gris/60 bg-papier pl-4 pr-28 text-base text-encre outline-none transition-colors focus-visible:border-vert"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex min-w-[6.5rem] items-center justify-center text-meta text-encre-2 underline-offset-4 hover:underline"
          >
            {visible ? "Masquer" : "Afficher"}
          </button>
        </div>
      </div>

      {etat.erreur ? (
        <p role="alert" className="rounded-[5px] border border-critique/40 bg-critique-l/60 px-4 py-3 text-meta text-critique">
          {etat.erreur}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enCours}
        className="h-12 rounded-[5px] bg-encre px-6 text-corps font-medium text-papier transition-colors hover:bg-vert disabled:opacity-60"
      >
        {enCours ? "Connexion…" : "Se connecter"}
      </button>

      <p className="text-meta text-gris">
        Mot de passe oublié : demande à Merwan de le réinitialiser. Tu pourras ensuite le changer
        depuis « Mon compte ».
      </p>
    </form>
  );
};

export default FormulaireConnexion;
