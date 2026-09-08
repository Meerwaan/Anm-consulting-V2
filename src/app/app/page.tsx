import type { Metadata } from "next";
import { exigerRole } from "@/lib/supabase/session";

export const metadata: Metadata = { title: "Mon audit — ANM Consulting", robots: { index: false } };

export default async function EspaceClientPage() {
  const session = await exigerRole("client");
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl">Bonjour {session.profil?.full_name ?? ""}</h1>
      <p className="mt-3 text-sm text-[var(--anm-muted)]">
        Votre espace de suivi ouvrira ici : avancement de l&apos;audit, pièces à déposer et échanges avec
        votre consultante.
      </p>
      <form action="/auth/deconnexion" method="post" className="mt-8">
        <button type="submit" className="text-sm underline hover:text-[var(--anm-green)]">
          Déconnexion
        </button>
      </form>
    </main>
  );
}
