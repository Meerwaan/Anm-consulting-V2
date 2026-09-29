import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Bouton } from "@/components/vitrine/Bouton";
import { Reveal } from "@/components/vitrine/Reveal";
import { Conteneur, Filet } from "@/components/vitrine/SectionHead";
import { BLOCS_FICHE, OBSERVATOIRE, stadeParId, territoireParId } from "@/content/observatoire";
import { CONSULTANTE } from "@/content/vitrine";
import { dateLongue, type Article, type ArticleResume } from "@/lib/observatoire/article";
import { typographie } from "@/lib/observatoire/typographie";
import { ListeArticles } from "./Listes";
import { Inline, Sources, Texte, intertitres } from "./Texte";

/**
 * Une publication de l’Observatoire, fiche ou dossier. Sert la page publique et l’aperçu de l’admin.
 * Colonne de lecture limitée à ~65 caractères (max-w-prose) ; la référence de la décision et son
 * stade de procédure sont à côté du texte sur grand écran, avant lui sur téléphone.
 */
export function ArticleVue({ article: a, connexes = [] }: { article: Article; connexes?: ArticleResume[] }) {
  const territoire = territoireParId(a.territoire);
  const cheminTerritoire = `/observatoire/${territoire.slug}`;

  return (
    <article>
      {/* EN-TÊTE */}
      <header>
        <Conteneur className="pb-12 pt-10 md:pb-16 md:pt-16">
          <nav aria-label="Fil d’Ariane" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-note text-gris">
              <li>
                <Link href="/" className="souligne pb-0.5 hover:text-encre">Accueil</Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/observatoire" className="souligne pb-0.5 hover:text-encre">L’Observatoire</Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={cheminTerritoire} className="souligne pb-0.5 hover:text-encre">{territoire.libelle}</Link>
              </li>
            </ol>
          </nav>
          <div className="flex max-w-4xl flex-col gap-6">
            <p className="etiquette">
              {a.type === "fiche" ? "Fiche" : "Dossier"} · {territoire.nomLong}
            </p>
            <h1 className="font-display text-t2 text-encre md:text-t2-lg">{typographie(a.titre)}</h1>
            {a.accroche ? <p className="max-w-prose text-chapo text-encre-2">{typographie(a.accroche)}</p> : null}
            <p className="flex flex-wrap gap-x-2 text-meta text-gris">
              <span>
                Par{" "}
                <Link href="/a-propos" rel="author" className="souligne pb-0.5 font-medium text-encre hover:text-vert">
                  {CONSULTANTE.prenomNom}
                </Link>
                , fondatrice d’ANM Consulting
              </span>
              {a.publie_le ? (
                <span>
                  · Publié le <time dateTime={a.publie_le}>{dateLongue(a.publie_le)}</time>
                </span>
              ) : (
                <span>· Brouillon, non publié</span>
              )}
              {a.mis_a_jour_le ? (
                <span>
                  · Mis à jour le <time dateTime={a.mis_a_jour_le}>{dateLongue(a.mis_a_jour_le)}</time>
                </span>
              ) : null}
            </p>
          </div>
        </Conteneur>
        <Conteneur>
          <Filet epais />
        </Conteneur>
      </header>

      {/* CORPS */}
      <Conteneur className="py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
          <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:order-last lg:self-start">
            {a.type === "fiche" ? <EncartDecision article={a} /> : <Sommaire corps={a.corps ?? ""} />}
          </aside>
          <div className="flex min-w-0 max-w-prose flex-col gap-14">
            {a.type === "fiche" ? <CorpsFiche article={a} /> : <Texte source={a.corps ?? ""} />}
            {a.sources?.trim() ? (
              <section aria-labelledby="sources" className="flex flex-col gap-4">
                <h2 id="sources" className="etiquette !font-mono !text-encre">Sources</h2>
                <Sources source={a.sources} />
              </section>
            ) : null}
            <Avertissement />
          </div>
        </div>
      </Conteneur>

      {/* DU MÊME TERRITOIRE */}
      {connexes.length ? (
        <section aria-labelledby="connexes" className="bg-papier">
          <Conteneur className="py-20 md:py-24">
            <Reveal>
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                  <p className="etiquette">Du même territoire</p>
                  <h2 id="connexes" className="font-display text-t2 text-encre">{territoire.nomLong}</h2>
                </div>
                <Bouton href={cheminTerritoire} variante="lien">
                  Toutes les publications {territoire.libelle}
                </Bouton>
              </div>
            </Reveal>
            <ListeArticles articles={connexes} />
          </Conteneur>
        </section>
      ) : null}
    </article>
  );
}

function Section({ id, n, titre, children }: { id: string; n: string; titre: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-note text-gris">{n}</span>
        <h2 id={id} className="font-display text-t3 text-encre">{titre}</h2>
      </div>
      {children}
    </section>
  );
}

/** Les blocs 1 à 7 de la note méthodologique. La défense ne s’affiche que si la décision en fait état. */
function CorpsFiche({ article: a }: { article: Article }) {
  const blocs = BLOCS_FICHE.filter((b) => b.cle !== "question" && a[b.cle]?.trim());
  const question = a.question?.trim();
  let n = 0;
  const numero = () => String(++n).padStart(2, "0");
  return (
    <>
      {blocs.map((b) => (
        <Section key={b.cle} id={b.cle.replace("_", "-")} n={numero()} titre={b.titre}>
          <Texte source={a[b.cle] ?? ""} />
        </Section>
      ))}
      {question ? (
        <section aria-labelledby="et-chez-vous" className="flex flex-col gap-5 rounded-[5px] bg-encre p-6 text-papier md:p-10">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-note text-brume">{numero()}</span>
            <h2 id="et-chez-vous" className="etiquette !text-brume">{typographie("Et chez vous ?")}</h2>
          </div>
          <div className="flex flex-col gap-4">
            {question.split(/\n\s*\n/).map((p, i) => (
              <p key={i} className="font-display text-t3 text-papier">
                <Inline texte={p.replace(/\s*\n\s*/g, " ")} />
              </p>
            ))}
          </div>
        </section>
      ) : null}
      <Section id="reference" n={numero()} titre="Référence">
        <Reference article={a} />
      </Section>
    </>
  );
}

function Reference({ article: a }: { article: Article }) {
  const stade = stadeParId(a.stade_procedure);
  const lignes: [string, ReactNode][] = [
    ["Juridiction", a.juridiction ? typographie(a.juridiction) : "—"],
    ["Date", a.decision_date ? <time dateTime={a.decision_date}>{dateLongue(a.decision_date)}</time> : "—"],
    ["Numéro", a.decision_numero ? typographie(`n° ${a.decision_numero.replace(/^n°\s*/i, "")}`) : "—"],
    ["Stade", stade ? `${stade.libelle}${a.stade_precision ? ` — ${typographie(a.stade_precision)}` : ""}` : "—"],
  ];
  return (
    <div className="flex flex-col gap-5">
      <dl className="border-t border-filet">
        {lignes.map(([cle, valeur]) => (
          <div key={cle} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-filet py-3 text-corps">
            <dt className="text-meta text-gris">{cle}</dt>
            <dd className="text-encre">{valeur}</dd>
          </div>
        ))}
      </dl>
      {a.decision_url ? (
        <a
          href={a.decision_url}
          rel="noopener"
          target="_blank"
          className="group inline-flex items-center gap-2 self-start text-corps font-medium text-vert"
        >
          <span className="souligne pb-0.5">Lire la décision intégrale</span>
          <ArrowUpRight size={16} aria-hidden className="transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      ) : (
        <p className="text-meta text-gris">Le texte intégral n’est pas publié en ligne à la date de la fiche.</p>
      )}
    </div>
  );
}

/** Le stade de la procédure, visible avant même la lecture : un référé n’est pas une décision au fond. */
function EncartDecision({ article: a }: { article: Article }) {
  const stade = stadeParId(a.stade_procedure);
  return (
    <div className="flex flex-col gap-5 rounded-[5px] border border-encre bg-papier p-6">
      <div className="flex flex-col gap-2">
        <p className="etiquette">Stade de la procédure</p>
        <p className="font-display text-t3 text-encre">{stade?.libelle ?? "Non renseigné"}</p>
        {stade ? <p className="text-meta text-encre-2">{typographie(stade.portee)}</p> : null}
        {a.stade_precision ? <p className="text-meta font-medium text-encre">{typographie(a.stade_precision)}</p> : null}
      </div>
      <div className="flex flex-col gap-1 border-t border-filet pt-4 text-meta text-encre-2">
        {a.juridiction ? <p className="font-medium text-encre">{typographie(a.juridiction)}</p> : null}
        {a.decision_date ? <p>{dateLongue(a.decision_date)}</p> : null}
        {a.decision_numero ? <p className="font-mono text-note">{typographie(`n° ${a.decision_numero.replace(/^n°\s*/i, "")}`)}</p> : null}
      </div>
      {a.decision_url ? (
        <a href={a.decision_url} rel="noopener" target="_blank" className="group inline-flex items-center gap-2 text-meta font-medium text-vert">
          <span className="souligne pb-0.5">Texte intégral</span>
          <ArrowUpRight size={14} aria-hidden />
        </a>
      ) : null}
    </div>
  );
}

function Sommaire({ corps }: { corps: string }) {
  const titres = intertitres(corps);
  if (titres.length < 2) return null;
  return (
    <nav aria-labelledby="sommaire" className="flex flex-col gap-4 border-t-[1.5px] border-encre pt-5">
      <p id="sommaire" className="etiquette">Sommaire</p>
      <ol className="flex flex-col">
        {titres.map((t, i) => (
          <li key={t.id} className="border-b border-filet">
            <a href={`#${t.id}`} className="grid grid-cols-[2rem_1fr] gap-2 py-3 text-meta text-encre-2 hover:text-vert">
              <span className="font-mono text-note text-gris">{String(i + 1).padStart(2, "0")}</span>
              <span>{typographie(t.texte)}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Mention courte en bas de chaque publication, lien vers l’avertissement complet, puis la signature. */
function Avertissement() {
  return (
    <footer className="flex flex-col gap-8 border-t border-filet pt-8">
      <p className="text-meta text-gris">
        {typographie(OBSERVATOIRE.avertissementCourt)}{" "}
        <Link href="/observatoire/note-methodologique#avertissement" className="text-encre underline underline-offset-4 hover:text-vert">
          Lire l’avertissement juridique complet
        </Link>
        .
      </p>
      <p className="font-display text-t4 text-encre">
        {typographie(OBSERVATOIRE.signature[0])}
        <br />
        <em className="text-vert">{typographie(OBSERVATOIRE.signature[1])}</em>
      </p>
    </footer>
  );
}
