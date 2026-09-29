import type { Metadata } from "next";
import { Bouton } from "@/components/vitrine/Bouton";
import { Conteneur } from "@/components/vitrine/SectionHead";
import { jetonValide } from "@/lib/email/desinscription";
import { confirmerDesinscription } from "./actions";

export const metadata: Metadata = {
  title: "Désinscription — ANM Consulting",
  description: "Ne plus recevoir les avis de parution de l’Observatoire ANM.",
  robots: { index: false, follow: false },
};

/**
 * Page de désinscription, sans compte. Le lien de chaque email y mène ; la désinscription se fait sur
 * confirmation (un bouton), pour qu’un antivirus qui ouvre les liens ne désinscrive pas à la place du
 * lecteur. Le message affiché dit ce que la base a réellement fait.
 */
export default async function DesinscriptionPage({ searchParams }: { searchParams: Promise<{ jeton?: string; etat?: string }> }) {
  const { jeton, etat } = await searchParams;
  const valide = jetonValide(jeton);

  let titre: string;
  let texte: string;
  if (etat === "ok") {
    titre = "Vous êtes désinscrit.";
    texte = "Vous ne recevrez plus les avis de parution de l’Observatoire ANM. Vous pouvez vous réinscrire à tout moment depuis la page de l’Observatoire.";
  } else if (etat === "erreur") {
    titre = "La désinscription n’a pas pu aboutir.";
    texte = "Réessayez dans un instant, ou écrivez-nous à contact@anm-consulting.fr : nous vous retirons de la liste à la main.";
  } else if (etat === "inconnu" || !valide) {
    titre = "Ce lien n’est pas reconnu.";
    texte = "Il est peut-être incomplet. Écrivez-nous à contact@anm-consulting.fr : nous vous retirons de la liste à la main.";
  } else {
    titre = "Ne plus recevoir les avis de parution ?";
    texte = "Vous ne recevrez plus d’email à la parution des publications de l’Observatoire ANM. Vos autres échanges avec nous ne sont pas concernés.";
  }

  return (
    <section>
      <Conteneur className="pb-24 pt-12 md:pb-32 md:pt-20">
        <div className="flex max-w-2xl flex-col gap-6">
          <p className="etiquette">Désinscription</p>
          <h1 className="font-display text-t2 text-encre md:text-t2-lg">{titre}</h1>
          <p className="text-chapo text-encre-2">{texte}</p>
          <div className="pt-2">
            {valide && !etat ? (
              <form action={confirmerDesinscription}>
                <input type="hidden" name="jeton" value={jeton} />
                <Bouton type="submit" taille="lg">
                  Confirmer la désinscription
                </Bouton>
              </form>
            ) : (
              <Bouton href="/observatoire" variante="lien">
                Retour à l’Observatoire
              </Bouton>
            )}
          </div>
        </div>
      </Conteneur>
    </section>
  );
}
