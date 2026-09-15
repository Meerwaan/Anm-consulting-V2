import { Footer } from "@/components/vitrine/Footer";
import { Nav } from "@/components/vitrine/Nav";

/**
 * Gabarit de la vitrine. Les CGV ne sont pas encore rédigées (Backlog phase 1,
 * relecture pro requise) : le lien est volontairement absent du pied de page.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="pt-[77px] md:pt-[85px]">{children}</main>
      <Footer />
    </>
  );
}
