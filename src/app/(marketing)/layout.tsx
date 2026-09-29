import { Footer } from "@/components/vitrine/Footer";
import { Nav } from "@/components/vitrine/Nav";
import { fondatrice, jsonLd, organisation, siteWeb } from "@/lib/observatoire/seo";

/**
 * Gabarit de la vitrine. Les CGV ne sont pas encore rédigées (Backlog phase 1,
 * relecture pro requise) : le lien est volontairement absent du pied de page.
 *
 * Données structurées de l'entreprise sur toutes les pages : `Organization` et non
 * `ProfessionalService` (sous-type de LocalBusiness, pour lequel Google attend une adresse et un
 * téléphone). Adresse, téléphone, email et SIREN restent absents tant qu'ils sont « À COMPLÉTER »
 * dans src/content/legal.ts.
 */
const DONNEES = jsonLd([organisation(), siteWeb(), fondatrice()]);

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: DONNEES }} />
      <Nav />
      <main className="pt-[77px] md:pt-[85px]">{children}</main>
      <Footer />
    </>
  );
}
