import type { Metadata } from "next";
import DevisClient, { DevisIndisponible } from "@/components/facturation/DevisClient";
import { lireDevisPublic } from "@/lib/facturation/devis-public";
import { donnerAccord } from "./actions";

export const metadata: Metadata = {
  title: "Votre devis",
  robots: { index: false, follow: false },
  // Le jeton est dans l'adresse : il ne doit partir vers aucun autre site.
  referrer: "no-referrer",
};

/**
 * Le devis tel que le client le reçoit par son lien personnel : il le relit, télécharge le PDF et
 * donne son « Bon pour accord ». Aucun compte : le jeton de l'adresse fait foi (migration 0047).
 */
export default async function DevisClientPage({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  const d = await lireDevisPublic(jeton);
  if (!d) {
    return (
      <DevisIndisponible
        titre="Ce lien n’ouvre aucun devis."
        texte="Vérifiez qu’il a été copié en entier depuis l’email reçu. S’il ne fonctionne toujours pas, écrivez-nous : nous vous renvoyons le devis."
      />
    );
  }
  if (d === "retire") {
    return (
      <DevisIndisponible
        titre="Ce devis n’est plus disponible en ligne."
        texte="Il est en cours de mise à jour, ou n’est plus proposé. Écrivez-nous : nous vous disons où il en est."
      />
    );
  }
  return <DevisClient d={d} jeton={jeton} accorder={donnerAccord.bind(null, jeton)} />;
}
