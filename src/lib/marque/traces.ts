import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Les tracés du logo pour les rendus qui ne passent pas par le navigateur : les PDF
 * (@react-pdf/renderer) et les images de partage (next/og). Ils sont lus dans les fichiers du kit
 * (src/lib/marque/logos), les mêmes que ceux du site : un seul dessin, jamais recopié à la main.
 *
 * Serveur uniquement. next.config.ts embarque ces fichiers avec les routes qui les lisent
 * (outputFileTracingIncludes), comme les polices.
 */
export interface TracesLogo {
  viewBox: string;
  /** Largeur ÷ hauteur du dessin. */
  ratio: number;
  traces: { couleur: string; d: string }[];
}

export type FichierLogo = "ANM-Consulting_1_horizontal_couleur.svg" | "ANM-Consulting_1_horizontal_negatif.svg";

const dossier = path.join(process.cwd(), "src/lib/marque/logos");
const lus = new Map<FichierLogo, TracesLogo>();

/** Les SVG du kit ont tous la même forme : un `viewBox`, puis une suite de `<path fill d>`. */
export const lireLogo = (fichier: FichierLogo): TracesLogo => {
  const connu = lus.get(fichier);
  if (connu) return connu;

  const svg = readFileSync(path.join(dossier, fichier), "utf8");
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  const traces = [...svg.matchAll(/<path fill="([^"]+)" d="([^"]+)"\/>/g)].map(([, couleur, d]) => ({ couleur, d }));
  // Un fichier d'une autre forme doit se voir tout de suite, pas donner un logo vide ou partiel.
  if (!viewBox || traces.length === 0 || traces.length !== (svg.match(/<path\b/g) ?? []).length) {
    throw new Error(`Logo illisible : ${fichier}`);
  }

  const [, , largeur, hauteur] = viewBox.split(/\s+/).map(Number);
  const logo = { viewBox, ratio: largeur / hauteur, traces };
  lus.set(fichier, logo);
  return logo;
};
