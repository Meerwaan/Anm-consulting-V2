import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { accueilDuRole, lireSession } from "@/lib/supabase/session";
import FormulaireConnexion from "./formulaire";

export const metadata: Metadata = {
  title: "Connexion — ANM Consulting",
  robots: { index: false, follow: false },
};

export default async function ConnexionPage() {
  const session = await lireSession();
  if (session?.profil) redirect(accueilDuRole(session.profil.role));

  return (
    <>
      <p className="etiquette">ANM Consulting</p>
      <h1 className="mt-4 font-display text-t2 text-encre">Connexion</h1>
      <p className="mt-3 text-corps text-encre-2">L’espace de travail des missions d’audit.</p>
      <FormulaireConnexion />
    </>
  );
}
