import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { accueilDuRole, lireSession } from "@/lib/supabase/session";
import FormulaireConnexion from "./formulaire";

export const metadata: Metadata = {
  title: "Connexion — ANM Consulting",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  lien: "Ce lien n'a pas pu être utilisé. Un lien magique ne sert qu'une fois, et il doit être "
      + "ouvert dans le navigateur qui l'a demandé. Demande-en un nouveau ci-dessous.",
  expire: "Ce lien a expiré. Demande-en un nouveau ci-dessous.",
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const session = await lireSession();
  if (session?.profil) redirect(accueilDuRole(session.profil.role));
  const { erreur } = await searchParams;

  return (
    <>
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--anm-muted)]">
        ANM Consulting
      </p>
      <h1 className="mt-3 text-3xl">Connexion</h1>
      <p className="mt-3 text-sm text-[var(--anm-muted)]">
        Pas de mot de passe à retenir : indique ton adresse, tu reçois un lien qui te connecte.
      </p>
      {erreur ? (
        <p
          role="alert"
          className="mt-4 border-l-2 border-[var(--anm-critique)] px-3 py-2 text-sm"
          style={{ color: "var(--anm-critique)" }}
        >
          {MESSAGES[erreur] ?? "La connexion n'a pas abouti. Demande un nouveau lien ci-dessous."}
        </p>
      ) : null}
      <FormulaireConnexion />
    </>
  );
}
