import Link from "next/link";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";

/**
 * L'espace client. Le rôle est vérifié ici ; les données, elles, sont bornées par la RLS
 * (société du compte, rien de la méthode ni des notes de travail).
 */
export default async function EspaceClientLayout({ children }: { children: React.ReactNode }) {
  const session = await exigerRole("client");
  const supabase = await createClient();
  const { data: profil } = await supabase
    .from("profiles")
    .select("acces_retire_le")
    .eq("id", session.utilisateurId)
    .maybeSingle<{ acces_retire_le: string | null }>();
  const retire = Boolean(profil?.acces_retire_le);

  return (
    <div className="min-h-dvh bg-fond">
      <header className="border-b border-filet bg-papier">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/app" className="flex min-h-12 items-baseline gap-3 py-3">
            <span className="font-display text-t4 text-encre">ANM Consulting</span>
            <span className="hidden text-meta text-gris sm:inline">Espace client</span>
          </Link>
          <nav className="flex items-center text-meta" aria-label="Compte">
            {!retire ? (
              <Link href="/app/compte" className="flex min-h-12 items-center px-2 text-encre-2 underline-offset-4 hover:text-vert hover:underline md:px-3">
                Mon compte
              </Link>
            ) : null}
            <form action="/auth/deconnexion" method="post">
              <button type="submit" className="flex min-h-12 items-center px-2 text-encre-2 underline-offset-4 hover:text-vert hover:underline md:px-3">
                Déconnexion
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 md:px-8 md:pt-12">
        {retire ? (
          <div className="max-w-xl space-y-3">
            <h1 className="font-display text-t2 text-encre">Accès fermé</h1>
            <p className="text-corps text-encre-2">
              L’accès de ce compte à l’espace client a été retiré. Les documents que vous avez transmis restent dans votre dossier. Pour le rouvrir, contactez ANM Consulting.
            </p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
