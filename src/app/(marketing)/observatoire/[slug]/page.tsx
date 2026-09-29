import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/vitrine/Reveal";
import { Conteneur } from "@/components/vitrine/SectionHead";
import { CtaFinal } from "@/components/vitrine/Sections";
import { ArticleVue } from "@/components/observatoire/ArticleVue";
import { EtatVide } from "@/components/observatoire/EtatVide";
import { EtrePrevenu } from "@/components/observatoire/EtrePrevenu";
import { FiltreTerritoires, ListeArticles } from "@/components/observatoire/Listes";
import { OBSERVATOIRE, TERRITOIRES, ctaPour, territoireParId, territoireParSlug, type Territoire } from "@/content/observatoire";
import { lireArticlePublie, lireArticlesPublies, lireSlugsPublies } from "@/lib/observatoire/donnees";
import { descriptionSeo, titreSeo } from "@/lib/observatoire/article";
import {
  absolue,
  alternatesObservatoire,
  articleJsonLd,
  blog,
  cheminArticle,
  filAriane,
  jsonLd,
  listeArticles,
} from "@/lib/observatoire/seo";
import { typographie } from "@/lib/observatoire/typographie";

/**
 * /observatoire/{slug} sert deux choses : les cinq pages de territoire (/observatoire/cnaps…) et
 * les articles. Les slugs de territoire sont réservés en base (migration 0043) : pas de collision.
 * Statique, régénérée à la publication (revalidatePath) ; un article publié après le build est
 * rendu à la première visite puis mis en cache (dynamicParams).
 */
export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await lireSlugsPublies();
  return [...TERRITOIRES.map((t) => ({ slug: t.slug })), ...articles.map((a) => ({ slug: a.slug }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const territoire = territoireParSlug(slug);
  if (territoire) {
    const articles = await lireArticlesPublies(territoire.id);
    const long = `${territoire.nomLong} : décisions et contrôles — ${OBSERVATOIRE.nom}`;
    const titre = long.length <= 60 ? long : `${territoire.nomLong} — ${OBSERVATOIRE.nom}`;
    const description = `${territoire.angle} Les décisions ${territoire.libelle} décryptées pour les dirigeants de sécurité privée.`;
    return {
      title: { absolute: titre },
      description,
      alternates: alternatesObservatoire(`/observatoire/${territoire.slug}`),
      // Une page de territoire sans publication est une page mince : suivie, pas indexée, jusqu'au premier article.
      robots: articles.length ? undefined : { index: false, follow: true },
      openGraph: { type: "website", url: `/observatoire/${territoire.slug}`, title: titre, description, siteName: "ANM Consulting", locale: "fr_FR" },
      twitter: { card: "summary_large_image", title: titre, description },
    };
  }

  const article = await lireArticlePublie(slug);
  if (!article) return { title: "Publication introuvable", robots: { index: false } };
  const titre = titreSeo(article);
  const description = descriptionSeo(article);
  const chemin = cheminArticle(article.slug);
  return {
    title: { absolute: titre },
    description,
    alternates: alternatesObservatoire(chemin),
    authors: [{ name: "Sofia Aoun", url: "/a-propos" }],
    openGraph: {
      type: "article",
      url: chemin,
      title: titre,
      description,
      siteName: "ANM Consulting",
      locale: "fr_FR",
      publishedTime: article.publie_le ?? undefined,
      modifiedTime: article.mis_a_jour_le ?? article.publie_le ?? undefined,
      section: territoireParId(article.territoire).nomLong,
      authors: [absolue("/a-propos")],
    },
    twitter: { card: "summary_large_image", title: titre, description },
  };
}

export default async function PageObservatoire({ params }: Props) {
  const { slug } = await params;
  const territoire = territoireParSlug(slug);
  if (territoire) return <PageTerritoire territoire={territoire} />;

  const article = await lireArticlePublie(slug);
  if (!article) notFound();

  const territoireArticle = territoireParId(article.territoire);
  const connexes = (await lireArticlesPublies(article.territoire)).filter((a) => a.id !== article.id).slice(0, 3);
  const cta = ctaPour(article.slug);

  const donnees = jsonLd([
    articleJsonLd(article),
    filAriane([
      { nom: "Accueil", chemin: "/" },
      { nom: OBSERVATOIRE.nom, chemin: "/observatoire" },
      { nom: territoireArticle.nomLong, chemin: `/observatoire/${territoireArticle.slug}` },
      { nom: article.titre, chemin: cheminArticle(article.slug) },
    ]),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: donnees }} />
      <ArticleVue article={article} connexes={connexes} />
      <CtaFinal titre={typographie(cta.titre)} cta={cta.cta} href={cta.href} />
    </>
  );
}

async function PageTerritoire({ territoire }: { territoire: Territoire }) {
  const articles = await lireArticlesPublies(territoire.id);
  const chemin = `/observatoire/${territoire.slug}`;
  const donnees = jsonLd([
    {
      "@type": "CollectionPage",
      "@id": `${absolue(chemin)}#page`,
      url: absolue(chemin),
      name: `${territoire.nomLong} — ${OBSERVATOIRE.nom}`,
      description: territoire.angle,
      inLanguage: "fr-FR",
      isPartOf: { "@id": blog()["@id"] },
      mainEntity: listeArticles(articles),
    },
    blog(),
    filAriane([
      { nom: "Accueil", chemin: "/" },
      { nom: OBSERVATOIRE.nom, chemin: "/observatoire" },
      { nom: territoire.nomLong, chemin },
    ]),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: donnees }} />
      <section>
        <Conteneur className="pb-14 pt-12 md:pb-20 md:pt-20">
          <div className="flex max-w-4xl flex-col gap-7">
            <Reveal y={16}>
              <p className="etiquette">{OBSERVATOIRE.nom} · Territoire</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-t1 text-encre md:text-t1-lg">{typographie(territoire.nomLong)}</h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-display text-t3 italic text-vert">{typographie(territoire.angle)}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="max-w-2xl text-corps text-encre-2">{typographie(territoire.thematiques)}</p>
            </Reveal>
          </div>
        </Conteneur>
      </section>

      <section aria-labelledby="publications" className="bg-papier">
        <Conteneur className="py-20 md:py-28">
          <div className="mb-10 flex flex-col gap-6">
            <h2 id="publications" className="font-display text-t2 text-encre md:text-t2-lg">
              Les publications {territoire.libelle}
            </h2>
            <FiltreTerritoires actif={territoire.id} />
          </div>
          {articles.length ? (
            <>
              <ListeArticles articles={articles} />
              <EtrePrevenu />
            </>
          ) : (
            <EtatVide territoire={territoire} />
          )}
        </Conteneur>
      </section>

      <CtaFinal titre={typographie(OBSERVATOIRE.frontiere)} />
    </>
  );
}
