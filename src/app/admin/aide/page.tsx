import Link from "next/link";
import type { Metadata } from "next";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { Inline } from "@/components/observatoire/Texte";
import RechercheAide from "@/components/aide/RechercheAide";
import { typographie } from "@/lib/observatoire/typographie";
import { SECTIONS_AIDE, texteBrut, type BlocAide, type FicheAide, type SectionAide } from "@/content/aide";

export const metadata: Metadata = { title: "Aide — ANM Consulting", robots: { index: false, follow: false } };

/**
 * Le mode d’emploi de l’espace de travail, écrit pour Sofia (contenu : src/content/aide.ts).
 * Rendu par le serveur ; seule la recherche est un composant client, qui masque ce qui ne
 * correspond pas. Les liens « mission:… » ouvrent l’écran dans la mission de démo.
 */
export default async function AidePage() {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { data } = await supabase.from("missions").select("id, organisation:organizations (name)");
  const demo = ((data ?? []) as unknown as { id: string; organisation: { name: string } | null }[]).find((m) =>
    m.organisation?.name?.startsWith("Démo"),
  );
  const racineMission = demo ? `/admin/missions/${demo.id}` : null;
  const resoudre = (texte: string) =>
    texte.replace(/\]\(mission:([^)]*)\)/g, (_m, chemin: string) => `](${racineMission ? `${racineMission}/${chemin}` : "/admin"})`);
  const T = ({ texte }: { texte: string }) => <Inline texte={resoudre(texte)} />;

  const Bloc = ({ b }: { b: BlocAide }) => {
    switch (b.type) {
      case "p":
        return (
          <p className="text-corps text-encre-2">
            <T texte={b.texte} />
          </p>
        );
      case "etapes":
        return (
          <ol className="flex flex-col gap-3">
            {b.items.map((item, i) => (
              <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <span className="flex size-7 items-center justify-center rounded-full border border-filet bg-papier font-mono text-note tabular-nums text-encre" aria-hidden>
                  {i + 1}
                </span>
                <span className="pt-0.5 text-corps text-encre-2">
                  <span className="sr-only">{`Étape ${i + 1}\u00a0: `}</span>
                  <T texte={item} />
                </span>
              </li>
            ))}
          </ol>
        );
      case "liste":
        return (
          <ul className="flex flex-col gap-2">
            {b.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-corps text-encre-2">
                <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-vert" aria-hidden />
                <span>
                  <T texte={item} />
                </span>
              </li>
            ))}
          </ul>
        );
      case "encadre":
        return (
          <div
            className={`flex flex-col gap-2 rounded-[5px] border px-5 py-4 ${
              b.ton === "attention" ? "border-majeur/40 bg-majeur-l/50" : "border-vert/25 bg-menthe-2"
            }`}
          >
            <p className={`text-corps font-medium ${b.ton === "attention" ? "text-majeur" : "text-vert"}`}>{typographie(b.titre)}</p>
            {b.texte ? (
              <p className="text-corps text-encre">
                <T texte={b.texte} />
              </p>
            ) : null}
            {b.items ? (
              <ul className="flex flex-col gap-2">
                {b.items.map((item, i) => (
                  <li key={i} className="flex gap-3 text-corps text-encre">
                    <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-encre/50" aria-hidden />
                    <span>
                      <T texte={item} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      case "tableau":
        return (
          <div className="flex flex-col gap-2">
            {/* Écran large : le tableau. */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full border-collapse text-left text-meta">
                <caption className="pb-2 text-left text-meta font-medium text-encre">{typographie(b.legende)}</caption>
                <thead>
                  <tr className="border-b-[1.5px] border-encre text-note text-encre-2">
                    {b.colonnes.map((c) => (
                      <th key={c} scope="col" className="py-2 pr-4 align-bottom font-medium">
                        {typographie(c)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.lignes.map((ligne, i) => (
                    <tr key={i} className="border-b border-filet align-top">
                      {ligne.map((cellule, j) =>
                        j === 0 ? (
                          <th key={j} scope="row" className="py-3 pr-4 font-medium text-encre">
                            <T texte={cellule} />
                          </th>
                        ) : (
                          <td key={j} className="py-3 pr-4 text-encre-2">
                            <T texte={cellule} />
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Téléphone : une fiche par ligne, lisible sans défilement de côté. */}
            <div className="flex flex-col gap-3 sm:hidden">
              <p className="text-meta font-medium text-encre">{typographie(b.legende)}</p>
              {b.lignes.map((ligne, i) => (
                <dl key={i} className="flex flex-col gap-2 rounded-[5px] border border-filet bg-papier p-4">
                  {ligne.map((cellule, j) => (
                    <div key={j} className="flex flex-col gap-0.5">
                      <dt className="text-note text-gris">{typographie(b.colonnes[j] || "N°")}</dt>
                      <dd className={`text-meta ${j === 0 ? "font-medium text-encre" : "text-encre-2"}`}>
                        <T texte={cellule} />
                      </dd>
                    </div>
                  ))}
                </dl>
              ))}
            </div>
          </div>
        );
      case "partage":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { ...b.gauche, classe: "border-filet bg-papier", puce: "bg-gris" },
              { ...b.droite, classe: "border-vert/30 bg-menthe-2", puce: "bg-vert" },
            ].map((colonne) => (
              <div key={colonne.titre} className={`flex flex-col gap-3 rounded-[5px] border p-5 ${colonne.classe}`}>
                <p className="font-display text-t4 text-encre">{typographie(colonne.titre)}</p>
                <ul className="flex flex-col gap-2">
                  {colonne.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-meta text-encre">
                      <span className={`mt-[0.65em] size-1.5 shrink-0 rounded-full ${colonne.puce}`} aria-hidden />
                      <span>
                        <T texte={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      case "syntaxe":
        return (
          <dl className="flex flex-col divide-y divide-filet border-y border-filet">
            {b.lignes.map((l) => (
              <div key={l.saisie} className="flex flex-col gap-1 py-3 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
                <dt>
                  <code className="break-all rounded-[4px] bg-fond px-2 py-1 font-mono text-note text-encre">{l.saisie}</code>
                </dt>
                <dd className="text-meta text-encre-2">{typographie(l.effet)}</dd>
              </div>
            ))}
          </dl>
        );
    }
  };

  const Fiche = ({ f, faq }: { f: FicheAide; faq: boolean }) => {
    const contenu = (
      <div className="flex flex-col gap-4">
        {f.blocs.map((b, i) => (
          <Bloc key={i} b={b} />
        ))}
      </div>
    );
    if (faq) {
      return (
        <details id={f.id} data-aide-fiche data-aide-texte={texteBrut(f)} className="group scroll-mt-6 border-b border-filet">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-corps font-medium text-encre [&::-webkit-details-marker]:hidden">
            <span>{typographie(f.titre)}</span>
            <CaretDown size={18} className="shrink-0 text-gris transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <div className="pb-5">{contenu}</div>
        </details>
      );
    }
    return (
      <article id={f.id} data-aide-fiche data-aide-texte={texteBrut(f)} aria-labelledby={`${f.id}-titre`} className="flex scroll-mt-6 flex-col gap-4">
        <h3 id={`${f.id}-titre`} className="font-display text-t4 text-encre">
          {typographie(f.titre)}
        </h3>
        {contenu}
      </article>
    );
  };

  const Section = ({ s, n }: { s: SectionAide; n: number }) => (
    <section id={s.id} data-aide-section aria-labelledby={`${s.id}-titre`} className="flex scroll-mt-6 flex-col gap-8">
      <div className="flex flex-col gap-2 border-t-[1.5px] border-encre pt-6">
        <p className="font-mono text-note text-gris">{String(n).padStart(2, "0")}</p>
        <h2 id={`${s.id}-titre`} className="font-display text-t3 text-encre">
          {typographie(s.titre)}
        </h2>
        <p className="text-corps text-encre-2">{typographie(s.resume)}</p>
      </div>
      {s.faq ? (
        <div className="flex flex-col border-t border-filet">
          {s.fiches.map((f) => (
            <Fiche key={f.id} f={f} faq />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {s.fiches.map((f) => (
            <Fiche key={f.id} f={f} faq={false} />
          ))}
        </div>
      )}
      {s.fin?.map((b, i) => <Bloc key={i} b={b} />)}
    </section>
  );

  return (
    <div className="flex flex-col gap-10">
      <header className="flex max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="etiquette">Espace de travail</p>
          <h1 className="font-display text-t2 text-encre">Aide</h1>
          <p className="text-chapo text-encre-2">
            {typographie(
              "Le mode d’emploi de votre espace. Cherchez un mot, ou suivez le sommaire. Chaque lien ouvre l’écran dont il parle ; ceux qui mènent dans une mission ouvrent la mission de démo.",
            )}
          </p>
        </div>
        <RechercheAide />
      </header>

      {/* Téléphone et iPad tenu droit : le sommaire se déplie. */}
      <details className="group rounded-[5px] border border-filet bg-papier lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 text-corps font-medium text-encre [&::-webkit-details-marker]:hidden">
          Sommaire
          <CaretDown size={18} className="text-gris transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <nav aria-label="Sommaire de l’aide" className="border-t border-filet px-2 py-2">
          <ol className="flex flex-col">
            {SECTIONS_AIDE.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex min-h-11 items-center gap-3 rounded-[5px] px-3 text-corps text-encre-2 hover:bg-fond hover:text-encre">
                  <span className="w-6 font-mono text-note text-gris">{String(i + 1).padStart(2, "0")}</span>
                  {typographie(s.titre)}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </details>

      <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
        {/* Grand écran : le sommaire suit la lecture. */}
        <aside className="hidden lg:block">
          <nav aria-label="Sommaire de l’aide" className="sticky top-6 flex max-h-[calc(100dvh-3rem)] flex-col gap-1 overflow-y-auto pr-2">
            <p className="etiquette px-2.5 pb-2">Sommaire</p>
            <ol className="flex flex-col gap-3">
              {SECTIONS_AIDE.map((s, i) => (
                <li key={s.id} className="flex flex-col">
                  <a href={`#${s.id}`} className="flex min-h-11 items-center gap-2.5 rounded-[5px] px-2.5 text-meta font-medium text-encre hover:bg-papier hover:text-vert">
                    <span className="w-5 shrink-0 font-mono text-note text-gris">{String(i + 1).padStart(2, "0")}</span>
                    {typographie(s.titre)}
                  </a>
                  {s.faq ? null : (
                    <ul className="ml-[1.4rem] flex flex-col border-l border-filet pl-1.5">
                      {s.fiches.map((f) => (
                        <li key={f.id}>
                          <a href={`#${f.id}`} className="flex min-h-11 items-center rounded-[5px] px-2.5 py-1 text-meta text-encre-2 hover:bg-papier hover:text-vert">
                            {typographie(f.titre)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="flex min-w-0 max-w-3xl flex-col gap-16">
          {SECTIONS_AIDE.map((s, i) => (
            <Section key={s.id} s={s} n={i + 1} />
          ))}
          <p className="border-t border-filet pt-6 text-meta text-gris">
            {typographie("Cette aide décrit l’outil tel qu’il est au 29 septembre 2026. Si un bouton ne correspond plus, dites-le à Merwan.")}{" "}
            <Link href="/admin" className="text-vert underline underline-offset-4 hover:text-encre">
              Retour aux missions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
