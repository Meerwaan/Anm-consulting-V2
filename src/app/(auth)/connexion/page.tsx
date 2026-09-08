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
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--anm-muted)]">
        ANM Consulting
      </p>
      <h1 className="mt-3 text-3xl">Connexion</h1>
      <p className="mt-3 text-sm text-[var(--anm-muted)]">
        Pas de mot de passe à retenir : indique ton adresse, tu reçois un lien qui te connecte.
      </p>
      <FormulaireConnexion />
    </>
  );
}
