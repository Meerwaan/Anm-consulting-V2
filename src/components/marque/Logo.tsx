import Image from "next/image";
import horizontalCouleur from "@/lib/marque/logos/ANM-Consulting_1_horizontal_couleur.svg";
import horizontalNegatif from "@/lib/marque/logos/ANM-Consulting_1_horizontal_negatif.svg";
import symboleCouleur from "@/lib/marque/logos/ANM-Consulting_3_symbole_couleur.svg";

/**
 * Le logo d'ANM Consulting. Les fichiers de src/lib/marque/logos sont des copies conformes du kit
 * (ANM-Consulting_Kit-Logo/1_SVG, version 1.0, octobre 2026) : on ne les retouche pas, on les remplace.
 *
 * Règles du kit (LISEZ-MOI.txt), à tenir à chaque emplacement :
 * - « horizontal » partout où il tient, jamais sous 140 px de large ; « symbole » dans les petits
 *   espaces, jamais sous 32 px (en dessous, ce sont les icônes d'onglet de src/app) ;
 * - « couleur » sur fond clair, « negatif » sur fond vert ou foncé ;
 * - autour du logo, un vide d'au moins un quart de sa hauteur ;
 * - ni déformation, ni recoloration, ni nom retapé dans une autre police.
 *
 * Pour une autre version du kit (vertical, logotype, noir, blanc…), copier son SVG dans
 * src/lib/marque/logos et l'ajouter ici. Les PDF et les images de partage lisent les mêmes fichiers
 * (src/lib/marque/traces.ts) ; les emails ont leur PNG (scripts/logo-email.mjs).
 */
const LOGOS = {
  "horizontal-couleur": { src: horizontalCouleur, ratio: 241.144 / 100.022 },
  "horizontal-negatif": { src: horizontalNegatif, ratio: 241.144 / 100.022 },
  "symbole-couleur": { src: symboleCouleur, ratio: 104 / 100.022 },
} as const;

export function Logo({
  variante = "horizontal-couleur",
  largeur,
  prioritaire = false,
}: {
  variante?: keyof typeof LOGOS;
  /** En pixels. La hauteur suit, sans jamais déformer le dessin. */
  largeur: number;
  /** Pour le logo visible dès l'ouverture de la page : chargé avant le reste. */
  prioritaire?: boolean;
}) {
  const { src, ratio } = LOGOS[variante];
  const hauteur = Math.round(largeur / ratio);
  return (
    <Image
      src={src}
      alt="ANM Consulting"
      width={largeur}
      height={hauteur}
      priority={prioritaire}
      // Dimensions figées : le logo ne rétrécit pas dans une ligne trop étroite, et sa place est réservée avant son chargement.
      className="block max-w-none shrink-0"
      style={{ width: largeur, height: hauteur }}
    />
  );
}
