"use client";

import { useActionState } from "react";
import { envoyerLienMagique, type EtatConnexion } from "./actions";

const initial: EtatConnexion = { message: null, erreur: null };

const FormulaireConnexion = () => {
  const [etat, action, enCours] = useActionState(envoyerLienMagique, initial);

  return (
    <form action={action} className="mt-8 flex flex-col gap-3">
      <label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-[var(--anm-muted)]">
        Adresse email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="prenom.nom@exemple.fr"
        className="rounded border border-[var(--anm-hairline)] bg-[var(--anm-paper)] px-3 py-2 outline-none focus-visible:border-[var(--anm-green)]"
      />
      <button
        type="submit"
        disabled={enCours}
        className="rounded bg-[var(--anm-green)] px-4 py-2 font-medium text-[var(--anm-paper)] disabled:opacity-60"
      >
        {enCours ? "Envoi…" : "Recevoir mon lien de connexion"}
      </button>

      {etat.message ? (
        <p aria-live="polite" className="rounded border border-[var(--anm-green)] bg-[var(--anm-mint)] px-3 py-2 text-sm">
          {etat.message}
        </p>
      ) : null}
      {etat.erreur ? (
        <p aria-live="polite" className="text-sm text-[var(--anm-critique)]">
          {etat.erreur}
        </p>
      ) : null}
    </form>
  );
};

export default FormulaireConnexion;
