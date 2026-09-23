import Link from "next/link";
import { exigerRole } from "@/lib/supabase/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await exigerRole("consultant");

  return (
    <div className="min-h-dvh bg-fond">
      <header className="border-b border-filet bg-papier">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/admin" className="flex min-h-12 items-baseline gap-3 py-3">
            <span className="font-display text-t4 text-encre">ANM Consulting</span>
            <span className="hidden text-meta text-gris sm:inline">Espace de travail</span>
          </Link>
          <nav className="flex items-center gap-1 text-meta">
            {[
              ["/admin", "Missions"],
              ["/admin/factures", "Factures"],
              ["/admin/cabinet", "Cabinet"],
            ].map(([href, libelle]) => (
              <Link key={href} href={href} className="hidden min-h-12 items-center px-3 text-encre-2 underline-offset-4 hover:text-vert hover:underline md:flex">
                {libelle}
              </Link>
            ))}
            <Link href="/admin/compte" className="flex min-h-12 items-center px-3 text-encre-2 underline-offset-4 hover:text-vert hover:underline">
              {session.profil?.full_name ?? "Mon compte"}
            </Link>
            <form action="/auth/deconnexion" method="post">
              <button type="submit" className="flex min-h-12 items-center px-3 text-encre-2 underline-offset-4 hover:text-vert hover:underline">
                Déconnexion
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-4 lg:px-8">{children}</main>
    </div>
  );
}
