/**
 * L’article de l’Observatoire tel qu’il est stocké (table `observatoire_articles`, migration 0043),
 * et les règles partagées entre le formulaire (client), l’action serveur et les pages publiques.
 * Aucune dépendance serveur ici : le module est importé par le formulaire.
 */
import { BLOCS_FICHE, QUESTIONS_DIFFUSION, type CleQuestion, type StadeId, type TerritoireId } from "@/content/observatoire";

export type TypeArticle = "fiche" | "dossier";
export type StatutArticle = "brouillon" | "publie";

export interface Article {
  id: string;
  slug: string;
  statut: StatutArticle;
  type: TypeArticle;
  territoire: TerritoireId;
  titre: string;
  titre_seo: string | null;
  meta_description: string | null;
  accroche: string | null;
  faits: string | null;
  reproches: string | null;
  defense: string | null;
  decision: string | null;
  point_anm: string | null;
  question: string | null;
  juridiction: string | null;
  decision_date: string | null;
  decision_numero: string | null;
  decision_url: string | null;
  stade_procedure: StadeId | null;
  stade_precision: string | null;
  corps: string | null;
  sources: string | null;
  q_concerne_dirigeant: boolean;
  q_source_verifiable: boolean;
  q_analyse: boolean;
  q_sans_methode: boolean;
  q_utilite_anm: boolean;
  publie_le: string | null;
  mis_a_jour_le: string | null;
  created_at: string;
  updated_at: string;
}

export const COLONNES_ARTICLE =
  "id, slug, statut, type, territoire, titre, titre_seo, meta_description, accroche, faits, reproches, defense, decision, point_anm, question, juridiction, decision_date, decision_numero, decision_url, stade_procedure, stade_precision, corps, sources, q_concerne_dirigeant, q_source_verifiable, q_analyse, q_sans_methode, q_utilite_anm, publie_le, mis_a_jour_le, created_at, updated_at";

/** Ce qu’une liste d’articles affiche : pas les blocs de texte. */
export type ArticleResume = Pick<
  Article,
  "id" | "slug" | "type" | "territoire" | "titre" | "accroche" | "publie_le" | "mis_a_jour_le" | "updated_at" | "juridiction" | "decision_date" | "decision_numero" | "stade_procedure"
>;
export const COLONNES_RESUME =
  "id, slug, type, territoire, titre, accroche, publie_le, mis_a_jour_le, updated_at, juridiction, decision_date, decision_numero, stade_procedure";

/** Adresses réservées sous /observatoire (miroir de la contrainte de la migration 0043). */
export const SLUGS_RESERVES = [
  "cnaps",
  "urssaf",
  "dgfip",
  "inspection-du-travail",
  "economie-de-la-securite",
  "note-methodologique",
  "rss",
  "rss-xml",
  "opengraph-image",
];

export const LIMITE_TITRE_SEO = 60;
export const LIMITE_DESCRIPTION = 155;

/** Slug sans accents, en minuscules, mots séparés par des tirets. */
export const slugifier = (texte: string): string =>
  texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");

export const slugValide = (slug: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length <= 90 && !SLUGS_RESERVES.includes(slug);

const rempli = (v: string | null | undefined) => Boolean(v && v.trim());

/** Titre affiché par Google : le titre SEO, à défaut le titre. */
export const titreSeo = (a: Pick<Article, "titre" | "titre_seo">) => (a.titre_seo?.trim() || a.titre.trim());

/** Description affichée par Google : la meta description, à défaut l’accroche (coupée proprement). */
export const descriptionSeo = (a: Pick<Article, "meta_description" | "accroche">) => {
  const brute = (a.meta_description?.trim() || a.accroche?.trim() || "").replace(/\s+/g, " ");
  if (brute.length <= LIMITE_DESCRIPTION) return brute;
  const coupe = brute.slice(0, LIMITE_DESCRIPTION - 1);
  return `${coupe.slice(0, Math.max(coupe.lastIndexOf(" "), 80)).replace(/[\s,;:.–-]+$/, "")}…`;
};

export type ChampsPublication = Pick<
  Article,
  | "type"
  | "titre"
  | "slug"
  | "accroche"
  | "juridiction"
  | "decision_date"
  | "decision_numero"
  | "decision_url"
  | "stade_procedure"
  | "corps"
  | "faits"
  | "reproches"
  | "defense"
  | "decision"
  | "point_anm"
  | "question"
> &
  Record<CleQuestion, boolean>;

/**
 * Ce qui empêche encore la publication, dans l’ordre du formulaire. Liste vide : publiable.
 * Mêmes règles que la contrainte `observatoire_publication_complete` en base.
 */
export const bloquantsPublication = (a: ChampsPublication): string[] => {
  const manques: string[] = [];
  if (!rempli(a.titre)) manques.push("le titre");
  if (!slugValide(a.slug)) manques.push("une adresse (slug) valide");
  if (!rempli(a.accroche)) manques.push("l’accroche");
  if (a.type === "fiche") {
    for (const b of BLOCS_FICHE) if (b.obligatoire && !rempli(a[b.cle])) manques.push(`le bloc « ${b.libelle} »`);
    if (!rempli(a.juridiction)) manques.push("la juridiction");
    if (!rempli(a.decision_date)) manques.push("la date de la décision");
    if (!rempli(a.decision_numero)) manques.push("le numéro de la décision");
    if (!a.stade_procedure) manques.push("le stade de la procédure");
  } else if (!rempli(a.corps)) {
    manques.push("le corps du dossier");
  }
  const nonCochees = QUESTIONS_DIFFUSION.filter((q) => !a[q.cle]).length;
  if (nonCochees) manques.push(nonCochees === 1 ? "une question avant diffusion" : `${nonCochees} questions avant diffusion`);
  return manques;
};

/** Date lisible, en français, sans décalage de fuseau pour les dates seules (AAAA-MM-JJ). */
export const dateLongue = (iso: string) => {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00Z`) : new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
};

/** Référence d’une décision en une ligne : « Conseil d’État, 12 mars 2026, n° 481234 ». */
export const referenceCourte = (a: Pick<Article, "juridiction" | "decision_date" | "decision_numero">) =>
  [a.juridiction, a.decision_date ? dateLongue(a.decision_date) : null, a.decision_numero ? `n°\u00a0${a.decision_numero.replace(/^n°\s*/i, "")}` : null]
    .filter(Boolean)
    .join(", ");
