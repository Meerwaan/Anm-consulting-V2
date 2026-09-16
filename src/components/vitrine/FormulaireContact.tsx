"use client";

import { useActionState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { envoyerLead } from "@/app/(marketing)/actions";
import { ETAT_LEAD_INITIAL } from "@/lib/vitrine/lead";
import { OFFRES } from "@/content/offres";
import { SITUATIONS_CONTACT } from "@/content/vitrine";
import { Bouton } from "./Bouton";

export interface PrefillContact {
  offre?: string;
  effectif?: string;
  sites?: string;
  urgence?: string;
  situation?: string;
}

export function FormulaireContact({ prefill = {} }: { prefill?: PrefillContact }) {
  const [etat, action, enCours] = useActionState(envoyerLead, ETAT_LEAD_INITIAL);
  const offre = OFFRES.find((o) => o.id === prefill.offre);
  const situationInitiale =
    prefill.situation && SITUATIONS_CONTACT.some((s) => s.valeur === prefill.situation)
      ? prefill.situation
      : prefill.urgence
        ? "controle_annonce"
        : "preventif";

  if (etat.ok) {
    return (
      <div className="rounded-[5px] border border-vert bg-menthe-2 p-8" role="status" aria-live="polite">
        <CheckCircle size={32} weight="fill" className="text-vert" />
        <p className="mt-4 font-display text-t3 text-encre">Merci, c’est bien reçu.</p>
        <p className="mt-2 text-corps text-encre-2">{etat.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-7" noValidate>
      <input type="hidden" name="source" value="contact" />
      {offre ? <input type="hidden" name="offre" value={offre.nom} /> : null}
      {prefill.urgence ? <input type="hidden" name="urgence" value="1" /> : null}
      {/* Pot de miel : invisible pour un humain, rempli par un robot. */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label>
          Votre site web <input type="text" name="site_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {offre ? (
        <p className="rounded-[3px] border border-vert/40 bg-menthe-2 px-4 py-3 text-corps text-encre">
          Demande pour <strong>{offre.nom}</strong> · {offre.fourchette}
          {prefill.effectif ? ` · ${prefill.effectif} salariés` : ""}
          {prefill.sites ? ` · ${prefill.sites} site${Number(prefill.sites) > 1 ? "s" : ""}` : ""}
          {prefill.urgence ? " · contrôle sous 7 jours" : ""}
        </p>
      ) : null}

      <div className="grid gap-7 sm:grid-cols-2">
        <Champ label="Nom et prénom" name="nom" autoComplete="name" required placeholder="Prénom Nom" />
        <Champ label="Société" name="societe" autoComplete="organization" placeholder="Nom de l’entreprise" />
        <Champ label="Email professionnel" name="email" type="email" autoComplete="email" required placeholder="vous@entreprise.fr" />
        <Champ label="Téléphone" name="telephone" type="tel" autoComplete="tel" placeholder="06 …" />
        <Champ label="Effectif" name="effectif" type="number" min={1} placeholder="ex. 45" defaultValue={prefill.effectif} />
        <Champ label="Nombre de sites" name="sites" type="number" min={1} placeholder="ex. 6" defaultValue={prefill.sites} />
      </div>

      <div className="space-y-2">
        <label className="etiquette block" htmlFor="situation">
          Votre situation
        </label>
        <select id="situation" name="situation" className="champ" defaultValue={situationInitiale}>
          {SITUATIONS_CONTACT.map((s) => (
            <option key={s.valeur} value={s.valeur}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="etiquette block" htmlFor="message">
          En quelques mots
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="champ resize-y"
          placeholder="Ce qui vous inquiète, un contrôle annoncé, une date, une question…"
        />
      </div>

      {etat.erreur ? (
        <p className="text-corps text-critique" role="alert">
          {etat.erreur}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Bouton type="submit" taille="lg" disabled={enCours}>
          {enCours ? "Envoi…" : "Demander un premier échange"}
        </Bouton>
        <p className="min-w-0 max-w-xs text-note text-gris">
          Vos données servent uniquement à vous répondre. Détail dans la{" "}
          <a href="/confidentialite" className="underline">
            politique de confidentialité
          </a>
          .
        </p>
      </div>
    </form>
  );
}

function Champ({
  label,
  name,
  type = "text",
  required,
  placeholder,
  autoComplete,
  min,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  min?: number;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="etiquette block" htmlFor={name}>
        {label}
        {required ? <span className="ml-1 text-critique">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        min={min}
        defaultValue={defaultValue}
        className="champ"
      />
    </div>
  );
}
