import Link from "next/link";

const nav = [
  { href: "/audit", label: "Audit 360°" },
  { href: "/formation", label: "Formation" },
  { href: "/abonnement", label: "Abonnement" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

/**
 * Les CGV ne sont pas encore rédigées (Backlog phase 1, relecture pro requise) :
 * le lien est volontairement absent tant que la page n'existe pas — un lien mort
 * en pied de page est pire qu'un lien manquant.
 */
const legal = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-[var(--anm-hairline)] bg-[var(--anm-paper)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-[var(--anm-ink)]">
            ANM Consulting
          </Link>
          <nav className="flex gap-6 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-[var(--anm-green)]">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-12">{children}</main>
      <footer className="border-t border-[var(--anm-hairline)] py-8 text-center text-sm text-[var(--anm-muted)]">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>© {new Date().getFullYear()} ANM Consulting</span>
          {legal.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[var(--anm-green)]">
              {l.label}
            </Link>
          ))}
        </div>
      </footer>
    </>
  );
}
