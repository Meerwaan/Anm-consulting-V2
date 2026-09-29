import { Bouton } from "@/components/vitrine/Bouton";
import { LeadMagnet } from "@/components/vitrine/LeadMagnet";
import { Filet } from "@/components/vitrine/SectionHead";
import { NOTE_OBSERVATOIRE } from "./EtrePrevenu";
import type { Territoire } from "@/content/observatoire";
import { typographie } from "@/lib/observatoire/typographie";

/**
 * Aucun article publié : pas d’exemple inventé, pas de faux article. Le lecteur sait pourquoi la
 * page est vide, peut être prévenu de la première parution, ou poser directement sa question.
 */
export function EtatVide({ territoire }: { territoire?: Territoire }) {
  return (
    <div>
      <Filet epais />
      <div className="grid gap-10 py-10 md:grid-cols-[11rem_1fr] md:gap-8 md:py-12">
        <p className="etiquette md:pt-1.5">Premières fiches</p>
        <div className="flex max-w-2xl flex-col gap-6">
          <h3 className="font-display text-t3 text-encre">
            {territoire ? `Aucune publication ${territoire.libelle} pour l’instant.` : "Aucune publication pour l’instant."}
          </h3>
          <p className="text-corps text-encre-2">
            {typographie(
              "Chaque fiche part d’une décision lue en entier et vérifiée à sa source officielle, avec sa juridiction, sa date, son numéro et le stade de la procédure. Les premières sont en cours de rédaction : plutôt que d’afficher des exemples, nous attendons qu’elles soient prêtes.",
            )}
          </p>
          <div className="max-w-xl">
            <LeadMagnet
              source="observatoire"
              cta="Être prévenu"
              note={NOTE_OBSERVATOIRE}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-filet pt-6">
            <p className="text-corps text-encre-2">{typographie("Une situation vous préoccupe déjà ?")}</p>
            <Bouton href="/contact" variante="lien">
              En parler avec nous
            </Bouton>
          </div>
        </div>
      </div>
    </div>
  );
}
