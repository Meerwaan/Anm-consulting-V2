import Link from "next/link";
import { exigerRole } from "@/lib/supabase/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await exigerRole("consultant");

  return (
    <>
      <header className="border-b border-[var(--anm-hairline)] bg-[var(--anm-paper)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin" className="font-semibold">
            ANM Consulting <span className="font-mono text-xs text-[var(--anm-muted)]">espace de travail</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--anm-muted)]">{session.profil?.full_name ?? session.email}</span>
            <form action="/auth/deconnexion" method="post">
              <button type="submit" className="underline hover:text-[var(--anm-green)]">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </>
  );
}
