import { OBSERVATOIRE, stadeParId, territoireParId, territoireParSlug } from "@/content/observatoire";
import { lireArticlePublie } from "@/lib/observatoire/donnees";
import { referenceCourte } from "@/lib/observatoire/article";
import { TAILLE_OG, imageObservatoire } from "@/lib/observatoire/og";

export const alt = OBSERVATOIRE.nomLong;
export const size = TAILLE_OG;
export const contentType = "image/png";
export const revalidate = 3600;

/** L'image de partage d'un territoire ou d'un article : titre, territoire, et pour une fiche sa référence et son stade. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const territoire = territoireParSlug(slug);
  if (territoire) {
    return imageObservatoire({ etiquette: `L’Observatoire · ${territoire.libelle}`, titre: territoire.angle, detail: territoire.nomLong });
  }
  const article = await lireArticlePublie(slug);
  if (!article) return imageObservatoire({ etiquette: "L’Observatoire ANM", titre: OBSERVATOIRE.promesse });
  const stade = stadeParId(article.stade_procedure);
  return imageObservatoire({
    etiquette: `${article.type === "fiche" ? "Fiche" : "Dossier"} · ${territoireParId(article.territoire).libelle}`,
    titre: article.titre,
    detail: article.type === "fiche" ? [referenceCourte(article), stade?.libelle].filter(Boolean).join(" · ") : null,
  });
}
