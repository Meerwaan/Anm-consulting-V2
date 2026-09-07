import Link from "next/link";

const nav = [
  { href: "/audit", label: "Audit 360°" },
  { href: "/formation", label: "Formation" },
  { href: "/abonnement", label: "Abonnement" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-[var(--anm-navy)]">
            ANM Consulting
          </Link>
          <nav className="flex gap-6 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-[var(--anm-blue)]">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-12">{children}</main>
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ANM Consulting ·{" "}
        <Link href="/mentions-legales">Mentions légales</Link> · <Link href="/cgv">CGV</Link> ·{" "}
        <Link href="/confidentialite">Confidentialité</Link>
      </footer>
    </>
  );
}
