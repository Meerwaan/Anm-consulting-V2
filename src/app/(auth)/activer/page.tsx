import type { Metadata } from "next";
import Link from "next/link";
import FormulaireActivation from "./formulaire";

export const metadata: Metadata = {
  title: "Choisir votre mot de passe — ANM Consulting",
  robots: { index: false, follow: false },
  // Le jeton est dans l'adresse : il ne doit partir vers aucun autre site.
  referrer: "no-referrer",
};

/**
 * Arrivée depuis le lien transmis par la consultante. La page ne touche pas au jeton :
 * il n'est vérifié qu'à l'envoi du formulaire (voir actions.ts).
 */
export default async function ActiverPage({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton } = await searchParams;

  return (
    <>
      <p className="etiquette">ANM Consulting · Espace client</p>
      <h1 className="mt-4 font-display text-t2 text-encre">Choisissez votre mot de passe</h1>
      {jeton ? (
        <>
          <p className="mt-3 text-corps text-encre-2">
            Avec votre adresse e-mail, il vous permettra de suivre votre mission, de déposer les pièces demandées et de retrouver le rapport.
          </p>
          <FormulaireActivation jeton={jeton} />
        </>
      ) : (
        <p className="mt-3 text-corps text-encre-2">
          Ce lien est incomplet. Vérifiez qu’il a été copié en entier, ou demandez-en un nouveau à votre consultante.
        </p>
      )}
      <p className="mt-10 text-meta text-encre-2">
        Vous avez déjà un mot de passe ?{" "}
        <Link href="/connexion" className="text-vert underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </>
  );
}
