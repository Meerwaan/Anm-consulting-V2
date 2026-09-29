/**
 * Données structurées (schema.org, JSON-LD) et adresses absolues de la vitrine.
 * Aucune coordonnée inventée : adresse, téléphone, email et SIREN restent absents tant que
 * src/content/legal.ts les marque « À COMPLÉTER ».
 */
import { CONSULTANTE } from "@/content/vitrine";
import { OBSERVATOIRE, territoireParId, stadeParId } from "@/content/observatoire";
import { descriptionSeo, referenceCourte, titreSeo, type Article, type ArticleResume } from "./article";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const absolue = (chemin: string) => `${SITE_URL}${chemin.startsWith("/") ? chemin : `/${chemin}`}`;

export const ID_ORGANISATION = `${SITE_URL}/#organisation`;
export const ID_SITE = `${SITE_URL}/#site`;
export const ID_FONDATRICE = `${SITE_URL}/a-propos#sofia-aoun`;
export const ID_BLOG = `${SITE_URL}/observatoire#blog`;

export const RSS = { url: "/observatoire/rss.xml", title: OBSERVATOIRE.nom } as const;
/** À reprendre dans `alternates` de chaque page de l’Observatoire (un `alternates` enfant remplace celui du parent). */
export const alternatesObservatoire = (canonical: string) => ({
  canonical,
  types: { "application/rss+xml": [RSS] },
});

export const cheminArticle = (slug: string) => `/observatoire/${slug}`;

export const fondatrice = () => ({
  "@type": "Person",
  "@id": ID_FONDATRICE,
  name: CONSULTANTE.prenomNom,
  jobTitle: "Fondatrice d’ANM Consulting",
  description: CONSULTANTE.accroche,
  url: absolue("/a-propos"),
  worksFor: { "@id": ID_ORGANISATION },
});

/** L’organisation, telle qu’elle est déclarée dans le gabarit de la vitrine. */
export const organisation = () => ({
  "@type": "Organization",
  "@id": ID_ORGANISATION,
  name: "ANM Consulting",
  url: absolue("/"),
  logo: { "@type": "ImageObject", url: absolue("/icon.svg") },
  description:
    "Audit et préparation aux contrôles CNAPS, URSSAF, DGFiP et Inspection du travail pour les dirigeants d’entreprises de sécurité privée.",
  slogan: "Repérez vos écarts avant qu’un contrôleur ne les trouve.",
  areaServed: { "@type": "Country", name: "France" },
  knowsAbout: ["Sécurité privée", "CNAPS", "URSSAF", "DGFiP", "TVA", "Inspection du travail", "Sous-traitance", "Travail dissimulé", "Devoir de vigilance"],
  founder: { "@id": ID_FONDATRICE },
});

export const siteWeb = () => ({
  "@type": "WebSite",
  "@id": ID_SITE,
  url: absolue("/"),
  name: "ANM Consulting",
  inLanguage: "fr-FR",
  publisher: { "@id": ID_ORGANISATION },
});

export const blog = () => ({
  "@type": "Blog",
  "@id": ID_BLOG,
  name: OBSERVATOIRE.nomLong,
  alternateName: OBSERVATOIRE.nom,
  description: OBSERVATOIRE.description,
  url: absolue("/observatoire"),
  inLanguage: "fr-FR",
  isPartOf: { "@id": ID_SITE },
  publisher: { "@id": ID_ORGANISATION },
  author: { "@id": ID_ORGANISATION },
});

export const filAriane = (etapes: { nom: string; chemin: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: etapes.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.nom, item: absolue(e.chemin) })),
});

export const listeArticles = (articles: ArticleResume[]) => ({
  "@type": "ItemList",
  numberOfItems: articles.length,
  itemListElement: articles.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: absolue(cheminArticle(a.slug)), name: a.titre })),
});

/**
 * L’article. Une fiche décrypte une décision datée : `NewsArticle`. Un dossier est un contenu
 * permanent : `Article`. La décision citée est une `CreativeWork` (schema.org n’a pas de type
 * « décision de justice » ; `Legislation` désigne les textes normatifs, pas les jugements), créée
 * par la juridiction (`GovernmentOrganization`), reliée par `citation` et `isBasedOn`.
 */
export const articleJsonLd = (a: Article) => {
  const url = absolue(cheminArticle(a.slug));
  const territoire = territoireParId(a.territoire);
  const stade = stadeParId(a.stade_procedure);
  const decision =
    a.type === "fiche" && a.juridiction
      ? {
          "@type": "CreativeWork",
          name: referenceCourte(a),
          ...(a.decision_url ? { url: a.decision_url } : {}),
          ...(a.decision_date ? { dateCreated: a.decision_date } : {}),
          ...(a.decision_numero ? { identifier: a.decision_numero } : {}),
          ...(stade ? { genre: stade.libelle } : {}),
          creator: { "@type": "GovernmentOrganization", name: a.juridiction },
          inLanguage: "fr-FR",
        }
      : null;
  return {
    "@type": a.type === "fiche" ? "NewsArticle" : "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: titreSeo(a).slice(0, 110),
    name: a.titre,
    description: descriptionSeo(a),
    ...(a.accroche ? { abstract: a.accroche } : {}),
    image: [absolue(`${cheminArticle(a.slug)}/opengraph-image`)],
    datePublished: a.publie_le ?? a.created_at,
    // Les dates visibles sur la page : Google demande la cohérence entre les deux.
    dateModified: a.mis_a_jour_le ?? a.publie_le ?? a.updated_at,
    inLanguage: "fr-FR",
    articleSection: territoire.nomLong,
    keywords: ["sécurité privée", territoire.libelle, a.type === "fiche" ? "décision" : "dossier"].join(", "),
    author: fondatrice(),
    publisher: { "@id": ID_ORGANISATION },
    isPartOf: { "@id": ID_BLOG },
    isAccessibleForFree: true,
    about: { "@type": "Thing", name: territoire.nomLong },
    ...(decision ? { citation: decision, isBasedOn: decision } : {}),
  };
};

/** Balise JSON-LD, avec échappement du « < » pour qu’un texte saisi ne puisse pas fermer le script. */
export const jsonLd = (graphe: object[]) =>
  JSON.stringify({ "@context": "https://schema.org", "@graph": graphe }).replace(/</g, "\\u003c");
