import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Filet } from "@/components/vitrine/SectionHead";
import { TERRITOIRES, territoireParId, stadeParId, type TerritoireId } from "@/content/observatoire";
import { dateLongue, referenceCourte, type ArticleResume } from "@/lib/observatoire/article";
import { cheminArticle } from "@/lib/observatoire/seo";
import { typographie } from "@/lib/observatoire/typographie";

/** Les territoires en liens indexables : /observatoire, /observatoire/cnaps… */
export function FiltreTerritoires({ actif }: { actif?: TerritoireId }) {
  const liens = [{ href: "/observatoire", libelle: "Tout", id: undefined as TerritoireId | undefined }, ...TERRITOIRES.map((t) => ({ href: `/observatoire/${t.slug}`, libelle: t.libelle, id: t.id }))];
  return (
    <nav aria-label="Territoires de l’Observatoire">
      <ul className="flex flex-wrap gap-2">
        {liens.map((l) => {
          const courant = l.id === actif;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={courant ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-meta font-medium transition-colors duration-300 ${
                  courant ? "border-encre bg-encre text-papier" : "border-filet bg-papier text-encre hover:border-encre"
                }`}
              >
                {l.libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Un registre d’articles : une ligne par publication, date et territoire à gauche. */
export function ListeArticles({ articles, titreNiveau = "h3" }: { articles: ArticleResume[]; titreNiveau?: "h2" | "h3" }) {
  const Titre = titreNiveau;
  return (
    <div>
      <Filet epais />
      <ol>
        {articles.map((a) => {
          const territoire = territoireParId(a.territoire);
          const stade = stadeParId(a.stade_procedure);
          return (
            <li key={a.id} className="border-b border-filet">
              <Link
                href={cheminArticle(a.slug)}
                className="group grid gap-3 py-7 md:grid-cols-[11rem_1fr_auto] md:gap-8"
              >
                <span className="flex flex-col gap-1 md:pt-1.5">
                  <span className="etiquette !text-encre">{territoire.libelle}</span>
                  {a.publie_le ? (
                    <time dateTime={a.publie_le} className="font-mono text-note text-gris">
                      {dateLongue(a.publie_le)}
                    </time>
                  ) : null}
                </span>
                <span className="flex min-w-0 flex-col gap-2">
                  <Titre className="font-display text-t3 text-encre transition-colors duration-300 group-hover:text-vert">{typographie(a.titre)}</Titre>
                  {a.accroche ? <span className="max-w-prose text-corps text-encre-2">{typographie(a.accroche)}</span> : null}
                  <span className="text-meta text-gris">
                    {a.type === "fiche" ? (
                      <>
                        Fiche · {typographie(referenceCourte(a))}
                        {stade ? <> · <span className="font-medium text-encre">{stade.libelle}</span></> : null}
                      </>
                    ) : (
                      "Dossier"
                    )}
                  </span>
                </span>
                <ArrowUpRight
                  size={20}
                  aria-hidden
                  className="hidden text-gris transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-vert md:mt-2 md:block"
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
