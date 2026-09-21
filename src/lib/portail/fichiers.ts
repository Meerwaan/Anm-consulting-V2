/**
 * Règles partagées du dépôt de pièces, côté navigateur comme côté serveur.
 */

/** Plafond du bucket `pieces` (0028) : 50 Mo, la limite du plan Supabase actuel. */
export const TAILLE_MAX_OCTETS = 50 * 1024 * 1024;

/**
 * Nom de fichier utilisable dans un chemin de stockage.
 *
 * Supabase refuse les accents et plusieurs caractères spéciaux dans les clés d'objet :
 * « Bulletins décembre (2).pdf » ferait échouer le dépôt. Le nom d'origine est gardé
 * à part (file_name) pour l'affichage ; seul le chemin est nettoyé.
 */
export const nomDeStockage = (nom: string): string => {
  const point = nom.lastIndexOf(".");
  const base = point > 0 ? nom.slice(0, point) : nom;
  const ext = point > 0 ? nom.slice(point + 1) : "";
  const propre = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "");
  const b = propre(base).slice(0, 80) || "fichier";
  const e = propre(ext).slice(0, 10).toLowerCase();
  return e ? `${b}.${e}` : b;
};

/** Taille lisible, à la française : « 2,3 Mo », « 850 ko ». */
export const tailleLisible = (octets: number | null): string => {
  if (octets === null || Number.isNaN(octets)) return "";
  if (octets < 1024 * 1024) return `${Math.max(1, Math.round(octets / 1024))} ko`;
  return `${(octets / (1024 * 1024)).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
};
