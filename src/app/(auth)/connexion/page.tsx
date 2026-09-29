import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { accueilDuRole, lireSession } from "@/lib/supabase/session";
import FormulaireConnexion from "./formulaire";

export const metadata: Metadata = {
  title: "Connexion — ANM Consulting",
  robots: { index: false, follow: false },
};

/**
 * Retour d'un lien reçu par email (`/auth/confirm`) qui n'a pas abouti. La cause technique
 * n'est jamais affichée : seulement ce qui s'est passé et quoi faire.
 */
const LIENS: Record<string, string> = {
  expire: "Ce lien a expiré.",
  lien: "Ce lien n’est pas valide, ou il a déjà servi.",
};

export default async function ConnexionPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const session = await lireSession();
  if (session?.profil) redirect(accueilDuRole(session.profil.role));
  const { erreur } = await searchParams;
  const lien = erreur ? LIENS[erreur] : undefined;

  return (
    <>
      <p className="etiquette">ANM Consulting</p>
      <h1 className="mt-4 font-display text-t2 text-encre">Connexion</h1>
      <p className="mt-3 text-corps text-encre-2">L’espace de travail des missions d’audit.</p>
      {lien ? (
        <div role="status" className="mt-8 rounded-[5px] border border-majeur/40 bg-majeur-l/60 px-4 py-3 text-meta text-encre">
          <p className="font-medium">{lien}</p>
          <p className="mt-1 text-encre-2">
            Connectez-vous ci-dessous avec votre adresse email et votre mot de passe. Si vous n’avez pas encore de mot de
            passe, demandez un nouvel accès à ANM Consulting.
          </p>
        </div>
      ) : null}
      <FormulaireConnexion />
    </>
  );
}
