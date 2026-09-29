import type { Metadata } from "next";
import { Bouton } from "@/components/vitrine/Bouton";
import { Reveal } from "@/components/vitrine/Reveal";
import { Conteneur, SectionHead } from "@/components/vitrine/SectionHead";
import { CtaFinal } from "@/components/vitrine/Sections";
import { EtatVide } from "@/components/observatoire/EtatVide";
import { FiltreTerritoires, ListeArticles } from "@/components/observatoire/Listes";
import { OBSERVATOIRE } from "@/content/observatoire";
import { lireArticlesPublies } from "@/lib/observatoire/donnees";
import { absolue, alternatesObservatoire, blog, filAriane, jsonLd, listeArticles, siteWeb } from "@/lib/observatoire/seo";
import { typographie } from "@/lib/observatoire/typographie";

/** Statique, régénérée à chaque publication (revalidatePath) et au plus tard toutes les heures. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: `${OBSERVATOIRE.nomLong} — ANM Consulting` },
  description: OBSERVATOIRE.description,
  alternates: alternatesObservatoire("/observatoire"),
  openGraph: {
    type: "website",
    url: "/observatoire",
    title: OBSERVATOIRE.nomLong,
    description: OBSERVATOIRE.description,
    siteName: "ANM Consulting",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title: OBSERVATOIRE.nomLong, description: OBSERVATOIRE.description },
};

const T = typographie;

export default async function ObservatoirePage() {
  const articles = await lireArticlesPublies();

  const donnees = jsonLd([
    {
      "@type": "CollectionPage",
      "@id": `${absolue("/observatoire")}#page`,
      url: absolue("/observatoire"),
      name: OBSERVATOIRE.nomLong,
      description: OBSERVATOIRE.description,
      inLanguage: "fr-FR",
      isPartOf: { "@id": siteWeb()["@id"] },
      about: { "@id": blog()["@id"] },
      mainEntity: listeArticles(articles),
    },
    blog(),
    filAriane([
      { nom: "Accueil", chemin: "/" },
      { nom: OBSERVATOIRE.nom, chemin: "/observatoire" },
    ]),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: donnees }} />

      {/* HERO */}
      <section>
        <Conteneur className="pb-16 pt-12 md:pb-24 md:pt-20">
          <div className="flex max-w-4xl flex-col gap-7">
            <Reveal y={16}>
              <p className="etiquette">{OBSERVATOIRE.nom}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-t1 text-encre md:text-t1-lg">
                {T("L’Observatoire ANM")} <em className="text-vert">{T("de la sécurité privée.")}</em>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-display text-t3 text-encre">{T(OBSERVATOIRE.promesse)}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex max-w-2xl flex-col gap-4 text-chapo text-encre-2">
                <p>{T(OBSERVATOIRE.chapeau)}</p>
                <p className="text-corps text-gris">{T(OBSERVATOIRE.sujets)}</p>
                <p className="font-medium text-encre">{T(OBSERVATOIRE.frontiere)}</p>
              </div>
            </Reveal>
          </div>
        </Conteneur>
      </section>

      {/* LES PUBLICATIONS */}
      <section aria-labelledby="publications" className="bg-papier">
        <Conteneur className="py-20 md:py-28">
          <div className="mb-10 flex flex-col gap-6">
            <h2 id="publications" className="font-display text-t2 text-encre md:text-t2-lg">
              {articles.length ? "Les dernières publications" : "Les publications"}
            </h2>
            <FiltreTerritoires />
          </div>
          {articles.length ? <ListeArticles articles={articles} /> : <EtatVide />}
        </Conteneur>
      </section>

      {/* COMPRENDRE / L'AUDIT */}
      <section>
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="01"
            eyebrow="La frontière"
            titre={
              <>
                {T("L’Observatoire montre le risque.")} <em className="text-vert">{T("L’audit ANM recherche ce risque dans l’entreprise.")}</em>
              </>
            }
          />
          <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="flex flex-col gap-5 border-t-[1.5px] border-encre pt-6">
                <h3 className="font-display text-t3 text-encre">{T(OBSERVATOIRE.comprendre.titre)}</h3>
                {OBSERVATOIRE.comprendre.intro.map((p) => (
                  <p key={p} className="text-corps text-encre-2">{T(p)}</p>
                ))}
                <ul className="flex flex-col border-t border-filet">
                  {OBSERVATOIRE.comprendre.points.map((p) => (
                    <li key={p} className="border-b border-filet py-3 text-corps text-encre">{T(p)}</li>
                  ))}
                </ul>
                <p className="text-corps font-medium text-encre">{T(OBSERVATOIRE.comprendre.promesse)}</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="flex flex-col gap-5 border-t-[1.5px] border-encre pt-6">
                <h3 className="font-display text-t3 text-encre">{T(OBSERVATOIRE.audit.titre)}</h3>
                {OBSERVATOIRE.audit.intro.map((p) => (
                  <p key={p} className="text-corps text-encre-2">{T(p)}</p>
                ))}
                <ul className="flex flex-col border-t border-filet">
                  {OBSERVATOIRE.audit.points.map((p) => (
                    <li key={p} className="border-b border-filet py-3 text-corps text-encre">{T(p)}</li>
                  ))}
                </ul>
                <div className="pt-2">
                  <Bouton href="/audit" taille="lg">
                    Découvrir l’audit 360°
                  </Bouton>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-20 grid gap-8 border-t border-filet pt-10 md:grid-cols-[1.3fr_1fr] md:gap-16">
              <p className="font-display text-t3 text-encre">
                {T(OBSERVATOIRE.conclusion[0])}
                <br />
                <em className="text-vert">{T(OBSERVATOIRE.conclusion[1])}</em>
              </p>
              <div className="flex flex-col gap-4">
                <p className="text-meta text-encre-2">{T(OBSERVATOIRE.pasAvocat)}</p>
                <Bouton href="/observatoire/note-methodologique" variante="lien">
                  Lire la note méthodologique
                </Bouton>
              </div>
            </div>
          </Reveal>
        </Conteneur>
      </section>

      <CtaFinal titre={T(OBSERVATOIRE.baseline)} texte={T(OBSERVATOIRE.signatureAnm)} />
    </>
  );
}
