import type { Metadata } from "next";
import { exigerRole } from "@/lib/supabase/session";
import FormulaireMotDePasse from "./formulaire";

export const metadata: Metadata = { title: "Mon compte — ANM Consulting", robots: { index: false, follow: false } };

export default async function ComptePage() {
  const session = await exigerRole("consultant");

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <div className="space-y-3">
        <p className="etiquette">Mon compte</p>
        <h1 className="font-display text-t2 text-encre">{session.profil?.full_name ?? "Mon compte"}</h1>
        <p className="text-corps text-encre-2">{session.email}</p>
      </div>
      <section className="space-y-6 rounded-[5px] border border-filet bg-papier p-6 md:p-8">
        <h2 className="font-display text-t4 text-encre">Changer le mot de passe</h2>
        <FormulaireMotDePasse />
      </section>
    </div>
  );
}
