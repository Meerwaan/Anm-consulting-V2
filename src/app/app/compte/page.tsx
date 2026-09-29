import type { Metadata } from "next";
import Link from "next/link";
import { exigerRole } from "@/lib/supabase/session";
import FormulaireMotDePasseClient from "./formulaire";

export const metadata: Metadata = { title: "Mon compte — ANM Consulting", robots: { index: false, follow: false } };

export default async function CompteClientPage() {
  const session = await exigerRole("client");

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <div className="space-y-3">
        <Link href="/app" className="flex min-h-11 w-fit items-center text-meta text-encre-2 underline-offset-4 hover:text-vert hover:underline">
          ← Retour à votre espace
        </Link>
        <p className="etiquette">Mon compte</p>
        <h1 className="font-display text-t2 text-encre">{session.profil?.full_name ?? "Mon compte"}</h1>
        <p className="text-corps text-encre-2">{session.email}</p>
      </div>
      <section className="space-y-6 rounded-[5px] border border-filet bg-papier p-6 md:p-8">
        <h2 className="font-display text-t4 text-encre">Changer le mot de passe</h2>
        <FormulaireMotDePasseClient />
      </section>
      <p className="text-meta text-encre-2">
        Mot de passe oublié ? Demandez un nouveau lien à votre consultante : il vous permettra d’en choisir un autre.
      </p>
    </div>
  );
}
