import Link from "next/link";
import { EDITEUR } from "@/content/legal";
import { Conteneur } from "./SectionHead";

const colonnes = [
  {
    titre: "Offres",
    liens: [
      { href: "/audit", label: "Audit & diagnostic 360°" },
      { href: "/audit#tarifs", label: "Grille tarifaire" },
      { href: "/abonnement", label: "Suivi conformité" },
      { href: "/formation", label: "Centre de formation" },
    ],
  },
  {
    titre: "Ressources",
    liens: [
      { href: "/#checklist", label: "Checklists : CNAPS, URSSAF, Inspection, DGFiP" },
      { href: "/audit#methode", label: "La méthode en 15 étapes" },
      { href: "/a-propos#ligne-de-crete", label: "Ce que nous ne faisons pas" },
      { href: "/connexion", label: "Espace client" },
    ],
  },
  {
    titre: "Contact",
    liens: [
      { href: "/contact", label: "Prendre rendez-vous" },
      { href: "/contact?situation=prescripteur", label: "Avocats & experts-comptables" },
      { href: "/a-propos", label: "À propos" },
    ],
  },
];

const legal = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
];

export function Footer() {
  return (
    <footer className="bg-encre text-papier">
      <Conteneur large className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.3fr_repeat(3,1fr)] md:gap-8">
          <div className="space-y-5">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="font-display text-t3 leading-none">ANM</span>
              <span className="font-mono text-etiquette uppercase tracking-[0.28em] text-brume">Consulting</span>
            </Link>
            <p className="max-w-xs text-corps text-brume-2">
              Audit, préparation aux contrôles et formation pour les entreprises de sécurité privée. Vingt et un ans de
              direction dans le secteur.
            </p>
            <p className="text-meta text-brume">
              Aucune promesse de garantie contre un contrôle ou un redressement. Des faits, une méthode, un plan.
            </p>
          </div>
          {colonnes.map((c) => (
            <div key={c.titre} className="space-y-4">
              <p className="etiquette text-brume">{c.titre}</p>
              <ul className="space-y-2.5">
                {c.liens.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="souligne pb-0.5 text-corps text-brume-2 hover:text-papier">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 h-px w-full bg-nuit" aria-hidden />

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-etiquette tracking-wide text-brume">
            © {new Date().getFullYear()} ANM Consulting · {EDITEUR.denomination} · SIREN {EDITEUR.siren}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="souligne pb-0.5 text-note text-brume hover:text-papier">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Conteneur>
    </footer>
  );
}
