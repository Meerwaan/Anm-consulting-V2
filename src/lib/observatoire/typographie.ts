/**
 * Typographie française appliquée à l’affichage, jamais en base : Sofia tape au clavier, la page
 * publie des apostrophes courbes et des espaces insécables. Ne s’applique qu’au texte, jamais à une
 * adresse (les liens sont extraits avant).
 */
const FINE = "\u202f"; // espace fine insécable : avant ; ! ? et dans les milliers
const INSECABLE = "\u00a0"; // espace insécable : avant :, dans « », entre nombre et unité

const UNITES = "€|%|h|heures?|jours?|mois|ans?|salariés?|agents?|sites?|euros?|km|°C";

export const typographie = (texte: string): string =>
  texte
    // Apostrophe droite → courbe (l'entreprise → l’entreprise).
    .replace(/(\p{L})'(?=\p{L})/gu, "$1’")
    .replace(/'/g, "’")
    // Guillemets droits appariés → chevrons français.
    .replace(/"([^"\n]+)"/g, "«$1»")
    // Espaces dans les chevrons.
    .replace(/«\s*/g, `«${INSECABLE}`)
    .replace(/\s*»/g, `${INSECABLE}»`)
    // Ponctuation haute : ; ! ? précédés d'une fine insécable, : d'une insécable (pas « https: » ni « 14:30 »).
    .replace(/(\S)[ \u00a0\u202f]?([;!?])(?=\s|$|[»)!?])/g, (_m, avant: string, signe: string) =>
      avant === "!" || avant === "?" ? `${avant}${signe}` : `${avant}${FINE}${signe}`,
    )
    .replace(/(\S)[ \u00a0\u202f]?:(?=\s|$)/g, `$1${INSECABLE}:`)
    // Milliers : 18 000 → 18 000 (fine insécable).
    .replace(/(\d) (?=\d{3}\b)/g, `$1${FINE}`)
    // Nombre et unité.
    .replace(new RegExp(`(\\d) (?=(?:${UNITES})(?![\\p{L}]))`, "gu"), `$1${INSECABLE}`)
    // n° 1234
    .replace(/\b(n°|N°|art\.|p\.) (?=\S)/g, `$1${INSECABLE}`);
