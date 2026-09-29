import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/vitrine/Reveal";
import { Conteneur, Filet } from "@/components/vitrine/SectionHead";
import { CtaFinal } from "@/components/vitrine/Sections";
import { NOTE_METHODOLOGIQUE, OBSERVATOIRE } from "@/content/observatoire";
import { absolue, alternatesObservatoire, blog, filAriane, fondatrice, jsonLd, ID_ORGANISATION } from "@/lib/observatoire/seo";
import { typographie } from "@/lib/observatoire/typographie";

/**
 * La note méthodologique de Sofia, publiée telle quelle : sources, structure des fiches,
 * identification des entreprises, avertissement juridique complet. Les fiches y renvoient
 * (#avertissement). Page entièrement statique.
 */
const CHEMIN = "/observatoire/note-methodologique";
const TITRE = `${NOTE_METHODOLOGIQUE.titre} — ${OBSERVATOIRE.nom}`;

export const metadata: Metadata = {
  title: { absolute: TITRE },
  description: NOTE_METHODOLOGIQUE.description,
  alternates: alternatesObservatoire(CHEMIN),
  openGraph: { type: "website", url: CHEMIN, title: TITRE, description: NOTE_METHODOLOGIQUE.description, siteName: "ANM Consulting", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title: TITRE, description: NOTE_METHODOLOGIQUE.description },
};

const T = typographie;

/** Un paragraphe de Sofia peut contenir des retours à la ligne voulus (vers courts). */
const Lignes = ({ texte }: { texte: string }) => (
  <>
    {texte.split("\n").map((l, i, tout) => (
      <span key={i}>
        {T(l)}
        {i < tout.length - 1 ? <br /> : null}
      </span>
    ))}
  </>
);

export default function NoteMethodologiquePage() {
  const donnees = jsonLd([
    {
      "@type": "WebPage",
      "@id": `${absolue(CHEMIN)}#page`,
      url: absolue(CHEMIN),
      name: TITRE,
      description: NOTE_METHODOLOGIQUE.description,
      inLanguage: "fr-FR",
      isPartOf: { "@id": blog()["@id"] },
      author: fondatrice(),
      publisher: { "@id": ID_ORGANISATION },
    },
    blog(),
    filAriane([
      { nom: "Accueil", chemin: "/" },
      { nom: OBSERVATOIRE.nom, chemin: "/observatoire" },
      { nom: NOTE_METHODOLOGIQUE.titre, chemin: CHEMIN },
    ]),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: donnees }} />
      <section>
        <Conteneur className="pb-12 pt-10 md:pb-16 md:pt-16">
          <nav aria-label="Fil d’Ariane" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 text-note text-gris">
              <li>
                <Link href="/" className="souligne pb-0.5 hover:text-encre">Accueil</Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/observatoire" className="souligne pb-0.5 hover:text-encre">L’Observatoire</Link>
              </li>
            </ol>
          </nav>
          <div className="flex max-w-4xl flex-col gap-6">
            <Reveal y={16}>
              <p className="etiquette">{OBSERVATOIRE.nomLong}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-t1 text-encre md:text-t1-lg">
                Note <em className="text-vert">méthodologique.</em>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-prose text-chapo text-encre-2">{T(NOTE_METHODOLOGIQUE.description)}</p>
            </Reveal>
          </div>
        </Conteneur>
        <Conteneur>
          <Filet epais />
        </Conteneur>
      </section>

      <Conteneur className="py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
          <nav aria-labelledby="sommaire" className="flex flex-col gap-4 lg:sticky lg:top-28 lg:order-last lg:self-start">
            <p id="sommaire" className="etiquette">Sommaire</p>
            <ol className="flex flex-col border-t border-filet">
              {NOTE_METHODOLOGIQUE.sections.map((s, i) => (
                <li key={s.id} className="border-b border-filet">
                  <a href={`#${s.id}`} className="grid grid-cols-[2rem_1fr] gap-2 py-3 text-meta text-encre-2 hover:text-vert">
                    <span className="font-mono text-note text-gris">{String(i + 1).padStart(2, "0")}</span>
                    <span>{T(s.titre)}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex min-w-0 max-w-prose flex-col gap-14">
            {NOTE_METHODOLOGIQUE.sections.map((s, i) => {
              const Liste = s.listeNumerotee ? "ol" : "ul";
              return (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-titre`} className="flex scroll-mt-28 flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-note text-gris">{String(i + 1).padStart(2, "0")}</span>
                    <h2 id={`${s.id}-titre`} className="font-display text-t3 text-encre">{T(s.titre)}</h2>
                  </div>
                  <div className="flex flex-col gap-4 text-corps text-encre-2 md:text-chapo">
                    {s.paragraphes?.map((p) => (
                      <p key={p}>
                        <Lignes texte={p} />
                      </p>
                    ))}
                    {s.liste ? (
                      <Liste className={`flex flex-col gap-2 pl-5 ${s.listeNumerotee ? "[list-style:decimal] marker:font-mono" : "[list-style:disc]"} marker:text-gris`}>
                        {s.liste.map((l) => (
                          <li key={l} className="pl-1">{T(l)}</li>
                        ))}
                      </Liste>
                    ) : null}
                    {s.paragraphesApres?.map((p) => (
                      <p key={p}>
                        <Lignes texte={p} />
                      </p>
                    ))}
                  </div>
                </section>
              );
            })}

            <footer className="flex flex-col gap-2 border-t border-filet pt-8">
              <p className="etiquette">Signature</p>
              <p className="font-display text-t4 text-encre">
                {T(OBSERVATOIRE.signature[0])}
                <br />
                <em className="text-vert">{T(OBSERVATOIRE.signature[1])}</em>
              </p>
              <p className="text-meta text-gris">{T(OBSERVATOIRE.signatureAnm)}</p>
            </footer>
          </div>
        </div>
      </Conteneur>

      <CtaFinal titre={T(OBSERVATOIRE.audit.intro[0])} />
    </>
  );
}
