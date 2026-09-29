import { LeadMagnet } from "@/components/vitrine/LeadMagnet";
import { typographie } from "@/lib/observatoire/typographie";

export const NOTE_OBSERVATOIRE = "Un email à chaque nouvelle publication, rien d’autre. Désinscription en un clic depuis chaque email.";

/**
 * « Être prévenu » sous la liste des publications : proposé aussi quand des articles existent,
 * pas seulement dans l’état vide. Même grille que la liste (colonne d’étiquette de 11rem).
 */
export function EtrePrevenu() {
  return (
    <div className="grid gap-6 pt-10 md:grid-cols-[11rem_1fr] md:gap-8 md:pt-12">
      <p className="etiquette md:pt-1.5">Être prévenu</p>
      <div className="flex max-w-xl flex-col gap-5">
        <p className="text-corps text-encre-2">
          {typographie("Recevez chaque nouvelle publication par email, le jour de sa parution.")}
        </p>
        <LeadMagnet source="observatoire" cta="Être prévenu" note={NOTE_OBSERVATOIRE} />
      </div>
    </div>
  );
}
