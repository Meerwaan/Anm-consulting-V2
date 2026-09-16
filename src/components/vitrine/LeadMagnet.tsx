"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { envoyerLead } from "@/app/(marketing)/actions";
import { ETAT_LEAD_INITIAL } from "@/lib/vitrine/lead";
import type { ChecklistId } from "@/content/vitrine";
import { Bouton } from "./Bouton";

/** Capture d'email en une ligne. `source` distingue checklist, formation, abonnement. */
export function LeadMagnet({
  source,
  cta,
  sombre = false,
  placeholder = "vous@entreprise.fr",
  note = "Un email, pas de relance commerciale. Désinscription en un clic.",
  onSucces,
}: {
  source: `checklist-${ChecklistId}` | "formation" | "abonnement";
  cta: string;
  sombre?: boolean;
  placeholder?: string;
  note?: string;
  /** Appelé une fois l'envoi confirmé — permet au parent de mémoriser la demande. */
  onSucces?: () => void;
}) {
  const [etat, action, enCours] = useActionState(envoyerLead, ETAT_LEAD_INITIAL);

  useEffect(() => {
    if (etat.ok) onSucces?.();
  }, [etat.ok, onSucces]);

  if (etat.ok) {
    return (
      <p className={`flex items-start gap-3 text-corps ${sombre ? "text-papier" : "text-encre"}`} role="status" aria-live="polite">
        <CheckCircle size={22} weight="fill" className={`mt-0.5 shrink-0 ${sombre ? "text-menthe" : "text-vert"}`} />
        {etat.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="source" value={source} />
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label>
          Votre site web <input type="text" name="site_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className={`etiquette block ${sombre ? "text-brume" : ""}`} htmlFor={`email-${source}`}>
            Email professionnel
          </label>
          <input
            id={`email-${source}`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={placeholder}
            className={`champ ${sombre ? "!border-papier/60 !text-papier placeholder:!text-brume focus:!border-papier focus:!shadow-[0_1px_0_0_var(--color-papier)]" : ""}`}
          />
        </div>
        <Bouton type="submit" variante={sombre ? "clair" : "primaire"} taille="md" disabled={enCours}>
          {enCours ? "Envoi…" : cta}
        </Bouton>
      </div>
      {etat.erreur ? (
        <p className="text-meta text-critique" role="alert">
          {etat.erreur}
        </p>
      ) : (
        <p className={`text-note ${sombre ? "text-brume" : "text-gris"}`}>{note}</p>
      )}
    </form>
  );
}
